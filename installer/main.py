#!/usr/bin/env python3
"""Ubuntu 24.04 dotfiles installer: select, review, confirm, install."""
import argparse
from dataclasses import dataclass
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import platform as host_platform
import shutil
import subprocess
import sys
import tempfile
sys.dont_write_bytecode = True
from actions import deploy_configs, install_modules
from catalog import defaults_for, MODULES, available, packages_for, resolve
from deploy import Backup, restore
from runtime import Runner
from ui import choose

REPO = Path(__file__).resolve().parent.parent


def detect_platform():
    info = {}
    release = Path('/etc/os-release')
    if release.exists():
        for line in release.read_text(encoding='utf-8').splitlines():
            if '=' in line:
                key, value = line.split('=', 1)
                info[key] = value.strip('"')
    kernel = Path('/proc/sys/kernel/osrelease')
    wsl = kernel.exists() and 'microsoft' in kernel.read_text(encoding='utf-8').lower()
    arch = {'x86_64': 'amd64', 'aarch64': 'arm64', 'AMD64': 'amd64'}.get(host_platform.machine(), host_platform.machine())
    return info, 'wsl' if wsl else 'native', arch


@dataclass
class Context:
    repo: Path
    home: Path
    config: Path
    data: Path
    temp: Path
    platform: str
    arch: str
    modules: list[str]
    versions: dict
    backup: Backup
    runner: Runner
    no_plugins: bool


def parser():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--modules', help='Comma-separated module IDs; omit to open the checklist.')
    p.add_argument('--list-modules', action='store_true')
    p.add_argument('--dry-run', action='store_true', help='Preview only: no files, network, sudo or installation.')
    p.add_argument('--yes', action='store_true', help='Accept the plan; requires --modules.')
    p.add_argument('--plain', action='store_true', help='Use a numbered checklist instead of the full-screen UI.')
    p.add_argument('--configs-only', action='store_true', help='Deploy configuration only; no packages or plugins.')
    p.add_argument('--no-plugins', action='store_true', help='Skip downloading Neovim plugins.')
    p.add_argument('--platform', choices=('auto', 'native', 'wsl'), default='auto', help='Target override for previews only.')
    p.add_argument('--arch', choices=('amd64', 'arm64'), help='CPU override for previews only.')
    p.add_argument('--restore', type=Path, metavar='BACKUP_DIR', help='Restore configuration; retain packages and tools.')
    return p


def check_platform(info, arch):
    if sys.version_info < (3, 12):
        raise ValueError('Python 3.12+ is required. Run bash setup_all.sh to use /usr/bin/python3.')
    if sys.platform != 'linux' or info.get('ID') != 'ubuntu' or info.get('VERSION_ID') != '24.04':
        raise ValueError('Installation supports Ubuntu 24.04 only. Use --dry-run for a preview on another OS.')
    if arch not in ('amd64', 'arm64'):
        raise ValueError(f'Unsupported CPU architecture: {arch}')
    if os.geteuid() == 0:
        raise ValueError('Run as your regular user, without sudo. OS changes request sudo separately.')


def preflight(modules, configs_only):
    if 'keyboard' in modules:
        from keyboard import require_session
        require_session()
    if configs_only:
        return
    for tool in ('sudo', 'apt-get', 'bash'):
        if not shutil.which(tool):
            raise ValueError(f'Required command is missing: {tool}')
    if 'macos-theme' in modules and ('GNOME' not in os.environ.get('XDG_CURRENT_DESKTOP', '').upper() or not os.environ.get('DBUS_SESSION_BUS_ADDRESS')):
        raise ValueError('Run macos-theme in a terminal inside your native GNOME desktop session.')
    if set(modules).intersection({'ssh-server', 'vscode'}):
        if Path('/proc/1/comm').read_text(encoding='utf-8').strip() != 'systemd':
            raise ValueError('SSH server / Snap require systemd. Enable it first, or deselect these modules.')
    if 'ros2' in modules:
        for name in ('ros-latest.list', 'ros2.list'):
            path = Path('/etc/apt/sources.list.d') / name
            if path.is_file() and any('packages.ros.org' in line and not line.lstrip().startswith('#') for line in path.read_text(encoding='utf-8').splitlines()):
                raise ValueError(f'Legacy ROS repository: {path}. Back it up and migrate it to ros2-apt-source before retrying.')


def show_plan(modules, requested, target, arch, args, versions, home):
    print(f'\nDOTFILES / Ubuntu 24.04 / {target} / {arch}')
    print('Mode: ' + ('configuration only' if args.configs_only else 'packages + configuration'))
    print(f'Home: {home}\nRepository: {REPO}\n')
    for name in modules:
        suffix = ' [dependency]' if name not in requested else ''
        print(f'  + {name:<14} {MODULES[name].title}{suffix}')
    if not args.configs_only:
        print('\nAPT packages (latest available Ubuntu Noble updates):\n  ' + ' '.join(packages_for(modules)))
        print('  Bootstrap: software-properties-common gnupg; enable Ubuntu universe')
        if 'ros2' in modules:
            ros = 'ros-jazzy-desktop' if 'ros-desktop' in modules else 'ros-jazzy-ros-base'
            print(f'  ROS official repository: ros2-apt-source {versions["ros_source"]["version"]}; {ros} ros-dev-tools')
            print('  rosdep init if needed; rosdep update --rosdistro jazzy')
        for module, tool in (('shell', 'starship'), ('python', 'uv'), ('neovim', 'neovim'), ('node', 'node'), ('rust', 'rustup'), ('latex', 'texlab')):
            if module in modules:
                print(f'  User tool: {tool} {versions[tool]["version"]} (HTTPS + pinned SHA-256)')
        if 'python' in modules:
            print('  Isolated Python CLI tools: basedpyright cmake-language-server autopep8 ruff')
        if 'node' in modules:
            print('  User npm language tools (~/.local): ' + ' '.join(
                f'{package}@{version}' for package, version in versions['npm_language_servers'].items()))
        if 'rust' in modules:
            print(f'  Rust {versions["rustup"]["toolchain"]}: rustfmt, Clippy, rust-analyzer')
        if 'diagrams' in modules:
            print(f'  PlantUML {versions["plantuml"]["version"]} official JAR (HTTPS + pinned SHA-256), Java 21')
        if 'chrome' in modules:
            print('  Google APT repository + scoped signing key; google-chrome-stable')
        if 'vscode' in modules:
            print('  Snap: code --classic')
        if 'macos-theme' in modules:
            print('  WhiteSur theme/icons/cursors; GNOME appearance and Ubuntu Dock with backup')
        if 'ssh-server' in modules:
            print('  openssh-server may start a listening SSH service.')
        if 'neovim' in modules and not args.no_plugins:
            print('  Neovim: explicit plugin bootstrap using the committed lazy lockfile')
    print('\nConfiguration: selected modules only; existing targets are backed up.')
    if 'shell' in modules:
        print('  shell: managed .bashrc/.profile blocks, Starship, tmux, readline, ROS/formatting helpers, clipboard')
    if 'keyboard' in modules:
        print('  keyboard: Caps Lock -> Ctrl in GNOME xkb-options; preserve unrelated options, back up original')
    if 'neovim' in modules:
        print('  neovim: XDG config/nvim and fallback ~/.vimrc')
    if 'latex' in modules:
        print('  latex: ~/.latexmkrc')
    print('No OS release upgrade or full-upgrade. No Git identity, NTP server, or fixed host addresses.')
    if target == 'wsl':
        print('WSL: use Windows VS Code + WSL extension. ROS GUI tools require WSLg or another display.')
    if str(REPO).startswith('/mnt/'):
        print('Recommended: clone inside the Linux home before deploying links.')


def main(argv=None):
    args = parser().parse_args(argv)
    info, detected, detected_arch = detect_platform()
    target = detected if args.platform == 'auto' else args.platform
    arch = args.arch or detected_arch
    home = Path.home().resolve()
    if (args.platform != 'auto' or args.arch) and not (args.dry_run or args.list_modules):
        raise ValueError('Target overrides are allowed only for previews.')
    if args.restore:
        if args.modules or args.configs_only:
            raise ValueError('--restore cannot be combined with installation options.')
        check_platform(info, detected_arch)
        print(f'Restore: {args.restore}\nOS packages and tools are retained.')
        if args.dry_run:
            return 0
        if not args.yes and input('Type RESTORE to continue: ').strip() != 'RESTORE':
            print('Cancelled. No changes made.')
            return 0
        restore(args.restore, home)
        print('Configuration restored.')
        return 0
    if args.list_modules:
        for name, module in MODULES.items():
            suffix = '' if available(name, target, arch) else ' [unavailable for this target]'
            print(f'{name:<14} {module.description}{suffix}')
        return 0
    if args.yes and args.modules is None:
        raise ValueError('--yes requires an explicit --modules list.')
    if args.modules is not None:
        requested = {item.strip() for item in args.modules.split(',') if item.strip()}
    elif args.dry_run:
        requested = defaults_for(target, arch)
    elif sys.stdin.isatty():
        check_platform(info, arch)
        requested = choose(target, arch, args.plain)
    else:
        raise ValueError('Use an interactive terminal, or specify --modules and --yes / --dry-run.')
    modules = resolve(requested, target, arch)
    versions = json.loads((REPO / 'installer/versions.json').read_text(encoding='utf-8'))
    show_plan(modules, requested, target, arch, args, versions, home)
    if args.dry_run:
        print('\nPreview complete. No changes made.')
        return 0
    check_platform(info, arch)
    preflight(modules, args.configs_only)
    if not args.yes and input('\nType INSTALL to start, or press Enter to cancel: ').strip() != 'INSTALL':
        print('Cancelled. No changes made.')
        return 0
    # The first write happens only after confirmation.
    state = Path(os.environ.get('XDG_STATE_HOME', str(home / '.local/state'))) / 'dotfiles'
    config = Path(os.environ.get('XDG_CONFIG_HOME', str(home / '.config')))
    data = Path(os.environ.get('XDG_DATA_HOME', str(home / '.local/share'))) / 'dotfiles'
    for directory in (state, config, data):
        if not directory.is_absolute() or not directory.resolve().is_relative_to(home):
            raise ValueError('XDG state/config/data must be absolute paths inside this home.')
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ')
    backup = Backup(state / 'backups' / stamp, home)
    runner = Runner(backup.directory / 'install.log')
    print(f'\nBackup and log: {backup.directory}', flush=True)
    os.environ['PATH'] = str(home / '.local/bin') + os.pathsep + str(home / '.cargo/bin') + os.pathsep + os.environ['PATH']
    os.environ['LANG'] = 'C.UTF-8'
    os.environ['LC_ALL'] = 'C.UTF-8'
    with tempfile.TemporaryDirectory(prefix='dotfiles-') as temporary:
        ctx = Context(REPO, home, config, data, Path(temporary), target, arch, modules, versions, backup, runner, args.no_plugins)
        (backup.directory / 'selection.json').write_text(json.dumps({'modules': modules, 'platform': target, 'arch': arch, 'configs_only': args.configs_only}, indent=2) + '\n', encoding='utf-8')
        try:
            if args.configs_only:
                deploy_configs(ctx)
            else:
                install_modules(ctx)
        except BaseException:
            print(f'\nStopped. Completed changes: {backup.directory}', file=sys.stderr)
            print('Fix the error and rerun the selection, or use --restore for configuration.', file=sys.stderr)
            raise
    print('\nInstallation complete. Open a new terminal to load the settings.')
    print(f'Configuration restore: bash setup_all.sh --restore {str(backup.directory)!r}')
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print('\nCancelled.', file=sys.stderr)
        raise SystemExit(130)
    except (ValueError, RuntimeError, OSError, subprocess.CalledProcessError) as error:
        print(f'Error: {error}', file=sys.stderr)
        raise SystemExit(1)
