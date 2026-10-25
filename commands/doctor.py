#!/usr/bin/env python3
"""Read-only dotfiles installation diagnostics; never source shell/project files."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys


# Only version-only invocations are allowed here. LSP/ROS/GUI startup can load
# project code or open services, so those checks inspect executable files only.
TOOLS = {
    'file-tools': [('fd', '--version', 'fd'), ('bat', '--version', 'bat')],
    'shell': [('tmux', '-V', None), ('starship', '--version', 'starship')],
    'node': [('node', '--version', 'node'), ('bash-language-server', None, None),
             ('typescript-language-server', None, None), ('vscode-json-language-server', None, None),
             ('yaml-language-server', None, None)],
    'cpp': [('clangd', '--version', None), ('cmake', '--version', None), ('clang-format', '--version', None)],
    'python': [('uv', '--version', 'uv'), ('basedpyright-langserver', None, None),
               ('basedpyright', '--version', 'basedpyright'), ('ruff', '--version', None),
               ('autopep8', None, None), ('cmake-language-server', None, None)],
    'neovim': [('nvim', '--version', 'neovim')],
    'rust': [('rustc', '--version', None), ('cargo', '--version', None), ('rust-analyzer', None, None)],
    'latex': [('latexmk', None, None), ('lualatex', None, None), ('uplatex', None, None),
              ('texlab', '--version', 'texlab'), ('zathura', None, None)],
    'diagrams': [('plantuml', None, None), ('dot', None, None), ('feh', None, None),
                 ('dotfiles-plantuml-render', None, None)],
    'zoxide': [('zoxide', '--version', 'zoxide')],
    'atuin': [('atuin', '--version', 'atuin')],
    'just': [('just', '--version', 'just')],
    'git-tools': [('lazygit', '--version', 'lazygit'), ('delta', '--version', 'delta')],
    'direnv': [('direnv', 'version', 'direnv')],
    'japanese-input': [('fcitx5', None, None)],
    'vscode': [('code', None, None)],
    'chrome': [('google-chrome', None, None)],
    'ibis-office': [('ibis-office', None, None)],
    'desktop': [('inkscape', None, None), ('vlc', None, None)],
    'launcher': [('albert', None, None)],
    'screen-capture': [('flatpak', '--version', None)],
}
DEPENDENCIES = {
    'file-tools': ('shell',),
    'shell': ('fonts',), 'python': ('node',), 'node': ('shell',),
    'neovim': ('shell', 'cpp', 'python', 'node'), 'ros2': ('shell', 'cpp', 'python'),
    'ros-desktop': ('ros2',), 'rust': ('shell', 'cpp'), 'latex': ('shell',),
    'diagrams': ('shell',), 'zoxide': ('shell',), 'atuin': ('shell',),
    'direnv': ('shell',), 'just': ('shell',), 'git-tools': ('shell',),
}
MODULES = set(TOOLS) | {'fonts', 'ros2', 'ros-desktop', 'keyboard', 'macos-theme', 'ssh-server'}


def read_json(path, limit=4 * 1024 * 1024):
    with path.open('rb') as stream:
        data = stream.read(limit + 1)
    if len(data) > limit:
        raise ValueError('JSON file exceeds diagnostic size limit')
    return json.loads(data)


def expanded(modules):
    result = set(modules)
    for module in tuple(result):
        result.update(expanded(DEPENDENCIES.get(module, ())))
    return result


class Doctor:
    def __init__(self, repo, *, home=None, env=None, system=Path('/'), run=subprocess.run):
        self.repo = Path(repo)
        self.home = Path(home or Path.home())
        self.env = dict(os.environ if env is None else env)
        self.system = Path(system)
        self.run = run
        self.config = Path(self.env.get('XDG_CONFIG_HOME') or self.home / '.config')
        self.data = Path(self.env.get('XDG_DATA_HOME') or self.home / '.local/share')
        self.state = Path(self.env.get('XDG_STATE_HOME') or self.home / '.local/state')
        self.checks = []
        self.versions = {}
        self.selection_known = False
        # Ignore current-directory/relative PATH entries; a diagnostic must not
        # accidentally run a program supplied by the current project.
        self.path = os.pathsep.join(p for p in self.env.get('PATH', '').split(os.pathsep)
                                    if p and Path(p).is_absolute())
        self.wsl = bool(self.env.get('WSL_DISTRO_NAME') or self.env.get('WSL_INTEROP'))
        try:
            self.wsl |= 'microsoft' in (self.system / 'proc/sys/kernel/osrelease').read_text().lower()
        except OSError:
            pass

    def add(self, identifier, status, detail, repair=None):
        if status == 'FAIL' and not self.selection_known:
            status = 'WARN'
        item = {'id': identifier, 'status': status, 'detail': detail}
        if repair:
            item['repair'] = repair
        self.checks.append(item)

    def fix(self, module):
        return 'From your dotfiles checkout: bash setup_all.sh --modules ' + module

    def locate(self, name):
        return shutil.which(name, path=self.path)

    def invoke(self, argv):
        # Version checks need no inherited loader, Python/Node startup, ROS,
        # Git, shell or Java options. Do not execute a shell or load rc files.
        env = {'HOME': str(self.home), 'PATH': self.path, 'LC_ALL': 'C', 'LANG': 'C',
               'RUSTUP_AUTO_INSTALL': '0'}
        return self.run(argv, cwd=str(self.system), env=env, stdin=subprocess.DEVNULL,
                        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                        timeout=5, check=False)

    def tool(self, module, name, argument, version_key):
        visible = self.locate(name)
        found = visible
        if not found:
            for directory in (self.home / '.local/bin', self.home / '.cargo/bin'):
                candidate = directory / name
                if candidate.is_file() and os.access(candidate, os.X_OK):
                    found = str(candidate)
                    break
        if not found:
            self.add(name, 'FAIL', 'Executable is missing.', self.fix(module))
            return
        status = 'PASS' if visible else 'WARN'
        detail = 'Executable is available on PATH.' if visible else 'Installed, but absent from this shell PATH.'
        repair = None if visible else 'Open a new login terminal, then run doctor again.'
        if argument:
            try:
                result = self.invoke([found, argument])
                if result.returncode:
                    raise ValueError('version command failed')
                match = re.search(r'(?<!\d)(?:v)?(\d+\.\d+(?:\.\d+)?)(?!\d)', result.stdout)
                if not match:
                    raise ValueError('version could not be identified')
                version = match[1]
                detail += ' Version ' + version + '.'
                spec = self.versions.get(version_key, {})
                expected = spec if isinstance(spec, str) else spec.get('version') if isinstance(spec, dict) else None
                if not isinstance(expected, str) or not re.fullmatch(r'\d+(?:\.\d+){1,3}', expected):
                    expected = None
                if expected and version != expected:
                    status, repair = 'WARN', self.fix(module)
                    detail += ' Reviewed installer version: ' + expected + '.'
            except (OSError, ValueError, subprocess.TimeoutExpired):
                status, repair = 'WARN', self.fix(module)
                detail += ' Version check failed or timed out (5 seconds).'
        self.add(name, status, detail, repair)

    def exists(self, identifier, path, module, *, detail='Configuration is present.'):
        ok = path.is_file()
        self.add(identifier, 'PASS' if ok else 'FAIL', detail if ok else 'Required file is missing.',
                 None if ok else self.fix(module))

    def selection(self, modules):
        if modules is not None:
            unknown = set(modules) - MODULES
            if unknown:
                raise ValueError('Unknown modules: ' + ', '.join(sorted(unknown)))
            self.selection_known = True
            self.add('selection', 'PASS', 'Checking the explicitly selected modules and their dependencies.')
            return expanded(modules)
        try:
            saved = read_json(self.state / 'dotfiles/installed.json')
            values = saved['modules']
            if not isinstance(values, list) or not values or any(not isinstance(x, str) for x in values):
                raise ValueError('Invalid modules')
            unknown = set(values) - MODULES
            self.selection_known = True
            self.add('selection', 'WARN' if unknown else 'PASS',
                     'Using successful installation state.' + (' Some module IDs are not supported by this doctor.' if unknown else ''))
            return expanded(set(values) & MODULES)
        except (OSError, ValueError, KeyError, TypeError):
            # Old backups do not have a reliable success marker. Never infer
            # successful installation from a selection saved before installation.
            detected = {module for module, tools in TOOLS.items() if self.locate(tools[0][0])}
            self.add('selection', 'WARN', 'Successful module selection is unknown; checking detected components, with missing items reported as warnings.',
                     'Use doctor --modules shell,neovim,ros2 (choose your installed modules), or rerun the installer.')
            return detected

    def preview(self):
        try:
            spec = self.versions['markdown_preview']
            manifest = read_json(self.data / 'dotfiles/preview-assets.json')
            expected = self.data / 'dotfiles/preview-assets' / spec['version']
            if (manifest.get('version') != spec['version'] or Path(manifest['root']).resolve() != expected.resolve()
                    or manifest.get('sources_sha256') != hashlib.sha256(json.dumps(spec, sort_keys=True).encode()).hexdigest()):
                raise ValueError('Unexpected manifest')
            files = manifest['files']
            required = {target for package in spec['packages'].values() for target in package['files'].values()}
            required.add('static/mermaid/mermaid.min.js')
            if not isinstance(files, dict) or not required.issubset(files) or len(files) > 512:
                raise ValueError('Missing asset')
            total = 0
            for relative, item in files.items():
                parts = PurePosixPath(relative).parts
                path = expected / relative
                if (not parts or parts[0] not in ('static', 'licenses') or any(p.startswith('.') for p in parts)
                        or '\\' in relative or path.is_symlink() or not path.is_file()
                        or not path.resolve().is_relative_to(expected.resolve()) or item['path'] != str(path)):
                    raise ValueError('Unexpected asset path')
                size = path.stat().st_size
                total += size
                if size > 16 * 1024 * 1024 or total > 64 * 1024 * 1024:
                    raise ValueError('Unexpected asset size')
                if hashlib.sha256(path.read_bytes()).hexdigest() != item['sha256']:
                    raise ValueError('Checksum mismatch')
            self.add('markdown-assets', 'PASS', 'Reviewed preview asset manifest and file checksums match.')
        except (OSError, ValueError, KeyError, TypeError, AttributeError):
            self.add('markdown-assets', 'FAIL', 'Preview assets are missing, outdated, redirected or modified.', self.fix('neovim'))

    def ros(self, desktop=False):
        # Read the branch default as data. Never source a ROS/workspace setup.
        try:
            match = re.search(r'DOTFILES_ROS_DISTRO:-([a-z][a-z0-9]*)', (self.repo / '.rosrc').read_text())
            distro = match[1] if match else None
        except OSError:
            distro = None
        if not distro:
            self.add('ros-distribution', 'WARN', 'Cannot identify this checkout ROS distribution.', self.fix('ros2'))
            return
        directory = self.system / 'opt/ros' / distro
        self.exists('ros-setup', directory / 'setup.bash', 'ros2', detail='ROS 2 ' + distro + ' setup is present.')
        self.exists('ros-cli', directory / 'bin/ros2', 'ros2', detail='ROS 2 CLI is installed; project code was not executed.')
        if desktop:
            self.exists('rviz2', directory / 'bin/rviz2', 'ros-desktop', detail='RViz executable is installed; no display connection was opened.')
        active = self.env.get('ROS_DISTRO')
        if active == distro and self.env.get('ROS_VERSION', '2') == '2':
            self.add('ros-shell', 'PASS', 'This shell advertises the expected ROS 2 distribution.')
        else:
            self.add('ros-shell', 'WARN', 'This shell has no ROS environment or a different ROS distribution.',
                     'Open a fresh terminal and run ros_env, then doctor again.')
        for name in ('colcon', 'rosdep', 'vcs'):
            self.tool('ros2', name, None, None)
        self.add('ros-runtime', 'SKIP', 'Nodes, DDS communication and project overlays require the manual verification steps; no ROS processes were started.')

    def desktop(self, modules):
        graphical = bool(self.env.get('DISPLAY') or self.env.get('WAYLAND_DISPLAY'))
        needs_display = bool(modules & {'neovim', 'latex', 'diagrams', 'ros-desktop', 'desktop', 'macos-theme', 'japanese-input', 'keyboard', 'vscode', 'chrome', 'ibis-office', 'launcher', 'screen-capture'})
        self.add('display', 'PASS' if graphical else ('WARN' if needs_display else 'SKIP'),
                 ('A display variable is present; server connectivity was not tested.' if graphical else 'No GUI display is advertised in this shell.'),
                 None if graphical or not needs_display else ('For GUI previews use WSLg; open a fresh WSL terminal.' if self.wsl else 'Run GUI previews from your desktop session. Headless/SSH use is valid.'))
        if self.wsl:
            self.add('wslg', 'PASS' if graphical and (self.system / 'mnt/wslg').is_dir() else 'WARN',
                     'WSL detected; native GNOME settings do not apply. WSLg availability is inferred from its mount and display variables.')
        else:
            gnome = 'GNOME' in self.env.get('XDG_CURRENT_DESKTOP', '').upper() and bool(self.env.get('DBUS_SESSION_BUS_ADDRESS'))
            needs_gnome = bool(modules & {'keyboard', 'macos-theme', 'japanese-input', 'launcher', 'screen-capture'})
            self.add('desktop-session', 'PASS' if gnome else ('WARN' if needs_gnome else 'SKIP'),
                     'GNOME session metadata is present.' if gnome else 'No active GNOME session detected; desktop settings were not queried.',
                     'Run the relevant module from a GNOME terminal.' if needs_gnome and not gnome else None)
        if 'shell' in modules or 'neovim' in modules:
            copy = ((bool(self.env.get('WAYLAND_DISPLAY')) and self.locate('wl-copy') and self.locate('wl-paste'))
                    or (bool(self.env.get('DISPLAY')) and (self.locate('xsel') or self.locate('xclip')))
                    or (self.wsl and self.locate('powershell.exe')))
            self.add('clipboard', 'PASS' if copy else 'WARN',
                     'A copy/paste backend is discoverable; clipboard contents were neither read nor changed.' if copy
                     else 'No complete system clipboard backend detected. Terminal/OSC 52 copy may still work.',
                     None if copy else self.fix('shell'))

    def diagnose(self, modules=None):
        try:
            self.versions = read_json(self.repo / 'installer/versions.json')
            if not isinstance(self.versions, dict):
                self.versions = {}
                raise ValueError('Invalid version manifest')
        except (OSError, ValueError):
            self.add('manifest', 'WARN', 'Installer version manifest is unavailable; version comparisons are skipped.')
        selected = self.selection(modules)
        for module in sorted(selected):
            for name, argument, version_key in TOOLS.get(module, ()):
                self.tool(module, name, argument, version_key)
        if 'shell' in selected:
            self.exists('tmux-config', self.home / '.tmux.conf', 'shell')
            self.exists('shell-clipboard-helper', self.home / '.local/bin/dotfiles-clipboard', 'shell')
        if 'neovim' in selected:
            self.exists('nvim-config', self.config / 'nvim/init.lua', 'neovim')
            self.exists('lazy.nvim', self.data / 'nvim/lazy/lazy.nvim/lua/lazy/init.lua', 'neovim')
            self.preview()
            self.add('editor-runtime', 'SKIP', 'LSP attachment/completion and preview rendering need an editor session; run :DotfilesLsp and follow docs/verification.md.')
        if 'ros2' in selected:
            self.ros('ros-desktop' in selected)
        if 'launcher' in selected:
            self.exists('albert-config', self.config / 'albert/config', 'launcher')
            self.exists('albert-autostart', self.config / 'autostart/albert.desktop', 'launcher')
        if 'screen-capture' in selected:
            flatpak_data = Path(self.env.get('FLATPAK_USER_DIR') or self.data / 'flatpak')
            self.exists('kooha', flatpak_data / 'app/io.github.seadve.Kooha/current/active/metadata',
                        'screen-capture', detail='Kooha user installation metadata is present; the application was not launched.')
        if 'fonts' in selected:
            # Do not run fontconfig here: it can refresh caches on a first
            # invocation. Respect custom XDG data directories without touching
            # font caches or a desktop/Windows session.
            directory = self.data / 'fonts/dotfiles-nerd-font'
            ok = all((directory / f'JetBrainsMonoNerdFontMono-{style}.ttf').is_file()
                     for style in ('Regular', 'Bold', 'Italic', 'BoldItalic'))
            self.add('nerd-font', 'PASS' if ok else 'WARN',
                     'Managed Nerd Font files are present; font registration and terminal selection need a visual check.' if ok else 'The managed Nerd Font files are incomplete or missing.',
                     None if ok else self.fix('fonts'))
        self.desktop(selected)
        for module in sorted(selected & {'ssh-server', 'keyboard', 'macos-theme', 'launcher', 'screen-capture'}):
            self.add(module + '-runtime', 'SKIP', 'Service/desktop behavior is not actively tested by this read-only check; use docs/verification.md.')
        self.add('security-scope', 'SKIP', 'This is an installation check, not a vulnerability scan. For the dated Node/Brotli inventory: python3 scripts/check-security.py')
        return {'platform': 'wsl' if self.wsl else 'native', 'modules': sorted(selected),
                'summary': {status: sum(c['status'] == status for c in self.checks) for status in ('PASS', 'WARN', 'FAIL', 'SKIP')},
                'checks': self.checks}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1], help=argparse.SUPPRESS)
    parser.add_argument('--modules', help='Comma-separated installed module IDs; otherwise use successful installation state.')
    parser.add_argument('--json', action='store_true', help='Print machine-readable results without host/user identifiers.')
    args = parser.parse_args(argv)
    modules = [part.strip() for part in args.modules.split(',') if part.strip()] if args.modules is not None else None
    if modules == []:
        parser.error('--modules must contain at least one module')
    try:
        result = Doctor(args.repo).diagnose(modules)
    except ValueError as exc:
        parser.error(str(exc))
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print('dotfiles doctor (' + result['platform'] + ') — read-only; no network or repairs')
        for item in result['checks']:
            print(f"[{item['status']}] {item['id']}: {item['detail']}")
            if item.get('repair'):
                print('       ' + item['repair'])
        print('\n' + ', '.join(f'{count} {status}' for status, count in result['summary'].items()))
    return 1 if result['summary']['FAIL'] else 0


if __name__ == '__main__':
    sys.exit(main())
