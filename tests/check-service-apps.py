#!/usr/bin/env python3
"""Real service-client artifacts; account-free package installs on hosted CI only.

Without --system-packages this downloads rclone into a disposable HOME, tests
local/local bisync, and checks public Snap metadata. No host package changes.
"""
import argparse
import json
import os
from pathlib import Path
import platform
import subprocess
import sys
import tempfile
from types import SimpleNamespace

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
from deploy import Backup
from runtime import Runner
import service_apps as service


def checked(arguments, *, env=None, timeout=120):
    result = subprocess.run([str(argument) for argument in arguments], env=env,
                            text=True, capture_output=True, timeout=timeout)
    if result.returncode:
        raise RuntimeError(f'{arguments}: exit {result.returncode}\n{result.stdout}\n{result.stderr}')
    return result.stdout


def verify_snap_metadata(arch):
    available = []
    for name, (snap_id, publisher, _) in service.SNAPS.items():
        metadata = service.snap_metadata(name)
        snap = metadata.get('snap', {})
        if snap.get('snap-id') != snap_id or snap.get('publisher', {}).get('username') != publisher:
            raise AssertionError(f'Unexpected publisher or package identity: {name}')
        releases = [entry for entry in metadata.get('channel-map', [])
                    if entry.get('channel', {}).get('architecture') == arch
                    and entry['channel'].get('track') == 'latest'
                    and entry['channel'].get('risk') == 'stable']
        if releases:
            available.append(name)
            print(f'{name}: verified publisher; {arch} stable {releases[0]["version"]}', flush=True)
        elif arch == 'amd64' or name == 'teams-for-linux':
            raise AssertionError(f'Missing supported stable architecture: {name}/{arch}')
        else:
            print(f'{name}: no {arch} Snap; excluded by the module catalog.', flush=True)
    return available


def verify_packages(ctx, snap_names, env):
    # This path is explicitly restricted to disposable GitHub-hosted machines.
    # User account setup and all graphical client launches remain excluded.
    service.install_service(ctx, 'onedrive')
    version = checked(['/usr/bin/onedrive', '--version'], env=env)
    if 'onedrive v2.' not in version:
        raise AssertionError('Unexpected OneDrive version output.')
    print(version.strip(), flush=True)
    help_text = checked(['/usr/bin/onedrive', '--help'], env=env)
    for option in ('--confdir', '--sync', '--monitor', '--dry-run'):
        if option not in help_text:
            raise AssertionError(f'Installed OneDrive lacks {option}.')
    if Path('/etc/systemd/user/default.target.wants/onedrive.service').exists():
        raise AssertionError('Fresh OneDrive package unexpectedly enabled background synchronization.')
    # Reinstall exercises existing signed source reuse, without duplicate entries.
    service.install_service(ctx, 'onedrive')
    if ctx.arch == 'amd64':
        service.install_service(ctx, 'dropbox')
        version = checked(['dpkg-query', '-W', '-f=${Version}', 'dropbox'])
        if version.strip() != ctx.versions['dropbox']['version']:
            raise AssertionError('Unexpected Dropbox launcher package version.')
        launcher = Path('/usr/share/applications/dropbox.desktop')
        if not launcher.is_file() or 'Exec=dropbox start -i' not in launcher.read_text():
            raise AssertionError('The official Dropbox application launcher was not installed.')
        # The daemon is deliberately downloaded only on the user's first launch.
        if (ctx.home / '.dropbox').exists() or (ctx.home / '.dropbox-dist').exists():
            raise AssertionError('Dropbox was unexpectedly started during installation.')
        print('Dropbox: official package and launcher installed; no daemon or login started.', flush=True)
    checked(['sudo', 'systemctl', 'start', 'snapd.socket'], timeout=60)
    checked(['sudo', 'snap', 'wait', 'system', 'seed.loaded'], timeout=240)
    for name in snap_names:
        service.install_service(ctx, name)
        service.install_service(ctx, name)  # Existing installs follow stable with snap refresh.
        installed = checked(['snap', 'list', name])
        if not any(line.startswith(name + ' ') for line in installed.splitlines()):
            raise AssertionError(f'The signed {name} Snap was not installed.')
        if not (Path('/snap/bin') / name).exists():
            raise AssertionError(f'The {name} Snap executable is missing.')
        launchers = list(Path('/var/lib/snapd/desktop/applications').glob(name + '_*.desktop'))
        if not launchers:
            raise AssertionError(f'The {name} application launcher is missing.')
        print(f'{name}: signed Snap and application launcher installed; application not started.', flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--system-packages', action='store_true',
                        help='Install OneDrive, Dropbox and signed Snaps on a disposable GitHub-hosted runner.')
    args = parser.parse_args()
    if sys.platform != 'linux':
        parser.error('This integration test requires Linux.')
    if args.system_packages and (os.environ.get('GITHUB_ACTIONS') != 'true'
                                 or os.environ.get('RUNNER_ENVIRONMENT') != 'github-hosted'):
        parser.error('--system-packages requires a disposable GitHub-hosted runner.')
    arch = {'x86_64': 'amd64', 'aarch64': 'arm64'}.get(platform.machine())
    if not arch:
        parser.error('Supported architectures: amd64 and arm64.')
    versions = json.loads((ROOT / 'installer/versions.json').read_text(encoding='utf-8'))
    with tempfile.TemporaryDirectory(prefix='dotfiles-service-check-') as temporary:
        home = Path(temporary) / 'home'
        home.mkdir()
        temporary_path = Path(temporary) / 'packages'
        temporary_path.mkdir()
        # apt's _apt sandbox needs to traverse the temporary .deb location.
        Path(temporary).chmod(0o755)
        ctx = SimpleNamespace(home=home, data=home / '.local/share/dotfiles', temp=temporary_path,
                              arch=arch, platform='native', versions=versions,
                              backup=Backup(home / '.local/state/test-backup', home),
                              runner=Runner(Path(temporary) / 'install.log'))
        env = {key: value for key, value in os.environ.items() if not key.startswith('RCLONE_')}
        env.update(HOME=str(home), XDG_CONFIG_HOME=str(home / '.config'),
                   XDG_DATA_HOME=str(home / '.local/share'), XDG_STATE_HOME=str(home / '.local/state'),
                   XDG_CACHE_HOME=str(home / '.cache'))
        binary_directory = service.install_rclone(ctx)
        binary = binary_directory / 'rclone'
        version = checked([binary, 'version'], env=env)
        if f'rclone v{versions["rclone"]["version"]}' not in version:
            raise AssertionError('Unexpected verified rclone version.')
        service.install_rclone(ctx)
        if ctx.runner.log.read_text().count('Download verified:') != 1:
            raise AssertionError('Repeated rclone installation downloaded or changed its release.')
        env['DOTFILES_RCLONE_TEST_BINARY'] = str(binary)
        result = subprocess.run([sys.executable, '-B', str(ROOT / 'tests/test-cloud-drive.py')], env=env, timeout=240)
        if result.returncode:
            raise RuntimeError('Real rclone bisync integration failed.')
        print('rclone: verified release, repeat installation and local/local bisync passed.', flush=True)
        snap_names = verify_snap_metadata(arch)
        if args.system_packages:
            verify_packages(ctx, snap_names, env)
        if (home / '.dropbox').exists() or (home / '.config/onedrive').exists():
            raise AssertionError('An installer unexpectedly accessed account configuration.')


if __name__ == '__main__':
    main()
