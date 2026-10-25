#!/usr/bin/env python3
"""Private, explicitly configured Google Drive bisync; never log OAuth output."""
from __future__ import annotations

import argparse
import configparser
from contextlib import contextmanager
from datetime import datetime, timezone
import getpass
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
import tempfile
import uuid


SERVICE = 'dotfiles-google-drive.service'
TIMER = 'dotfiles-google-drive.timer'
REMOTE = 'google-drive'
BACKUP = '.dotfiles-drive-backup'
FILTERS = '- /.dotfiles-drive-backup/**\n- .git/**\n'
DOCS = 'https://rclone.org/drive/#making-your-own-client-id'


class DriveError(Exception):
    """A deliberately generic, safe-to-display error."""


def overlaps(first: Path, second: Path) -> bool:
    return first == second or first in second.parents or second in first.parents


def clean_environment(home: Path, state: Path) -> dict:
    # RCLONE_LOG_FILE, CONFIG_*, RC_*, DUMP and backend options can redirect
    # credentials or enable logging. No inherited rclone settings are accepted.
    env = {key: value for key, value in os.environ.items() if not key.startswith('RCLONE_')}
    env['HOME'] = str(home)
    env['XDG_CACHE_HOME'] = str(state / 'cache')
    return env


class Drive:
    def __init__(self, home=None, repo=None, binary=None):
        self.home = Path(home or Path.home()).absolute()
        self.repo = Path(repo or Path(__file__).resolve().parents[1]).resolve()
        self.config = self.home / '.config/dotfiles-services/google-drive'
        self.state = self.home / '.local/state/dotfiles-services/google-drive'
        self.auth = self.config / 'rclone.conf'
        self.profile = self.config / 'profile.json'
        self.result = self.state / 'status.json'
        self.filters = self.config / 'filters.txt'
        self.units = self.home / '.config/systemd/user'
        self.binary = Path(binary or self.home / '.local/bin/rclone')

    def validate_path(self, path: Path, *, private=False):
        path = Path(path)
        if any(ord(character) < 32 or ord(character) == 127 for character in str(path)):
            raise DriveError('Control characters are not allowed in configuration or synchronization paths.')
        if not path.is_absolute() or '..' in path.parts or path == self.home or self.home not in path.parents:
            raise DriveError('Choose an ordinary directory beneath your home directory.')
        if overlaps(path, self.repo):
            raise DriveError('Configuration and synchronization directories must not overlap the dotfiles repository.')
        for parent in [path, *path.parents]:
            if parent.is_symlink():
                raise DriveError('Symbolic links are not allowed in private or synchronization paths.')
            if parent.exists():
                info = parent.stat()
                if hasattr(os, 'getuid') and parent != Path('/') and self.home in [parent, *parent.parents]:
                    if info.st_uid != os.getuid():
                        raise DriveError('Directories must be owned by the current user.')
                if parent.is_file() and (info.st_nlink != 1 or not stat.S_ISREG(info.st_mode)):
                    raise DriveError('Private files must be ordinary files with one link.')
            if (parent / '.git').exists():
                raise DriveError('Private configuration and synchronization roots cannot be inside a Git checkout.')
        if private and path.exists() and not (path.is_file() or path.is_dir()):
            raise DriveError('Private storage is not an ordinary file or directory.')

    def directory(self, path):
        self.validate_path(path, private=True)
        path.mkdir(parents=True, exist_ok=True, mode=0o700)
        if not path.is_dir():
            raise DriveError('Private storage is not a directory.')
        path.chmod(0o700)

    def prepare(self):
        for path in (self.config, self.state, self.state / 'bisync', self.state / 'cache', self.state / 'backups'):
            self.directory(path)
        for path in (self.auth, self.profile, self.result, self.filters, self.state / 'run.lock'):
            self.validate_path(path, private=True)
            if path.exists():
                if not path.is_file():
                    raise DriveError('Private storage is not an ordinary file.')
                path.chmod(0o600)

    def write(self, path, value):
        self.validate_path(path, private=True)
        descriptor, temporary = tempfile.mkstemp(prefix='.private-', dir=path.parent)
        try:
            with os.fdopen(descriptor, 'w', encoding='utf-8') as stream:
                stream.write(value)
            os.replace(temporary, path)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)

    def status_write(self, status):
        self.write(self.result, json.dumps({'status': status, 'time': datetime.now(timezone.utc).isoformat()}) + '\n')

    @contextmanager
    def lock(self):
        import fcntl
        self.prepare()
        descriptor = os.open(self.state / 'run.lock', os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
        try:
            try:
                fcntl.flock(descriptor, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                raise DriveError('Another Google Drive setup or synchronization is running.') from None
            yield
        finally:
            os.close(descriptor)

    def base(self):
        if not self.binary.is_file():
            raise DriveError('Install the google-drive module first; rclone is missing.')
        return [str(self.binary), '--config', str(self.auth), '--cache-dir', str(self.state / 'cache'),
                '--log-file', os.devnull, '--log-level', 'ERROR']

    def execute(self, arguments, *, terminal=False):
        env = clean_environment(self.home, self.state)
        if terminal:
            require_terminal()
            # Reconnect runs the OAuth dialog without the config command's
            # final token/secret summary. It is never captured by a logger.
            with open('/dev/tty', 'r+b', buffering=0) as terminal_io:
                return subprocess.run(self.base() + arguments, stdin=terminal_io, stdout=terminal_io,
                                      stderr=terminal_io, env=env, cwd=self.home).returncode
        return subprocess.run(self.base() + arguments, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                              stderr=subprocess.DEVNULL, env=env, cwd=self.home).returncode

    def systemctl(self, *arguments):
        return subprocess.run(['/usr/bin/systemctl', '--user', *arguments], stdin=subprocess.DEVNULL,
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode

    def authenticated(self):
        self.validate_path(self.auth, private=True)
        try:
            parser = configparser.RawConfigParser()
            parser.read(self.auth, encoding='utf-8')
            return parser.get(REMOTE, 'type') == 'drive' and bool(parser.get(REMOTE, 'token'))
        except (configparser.Error, OSError):
            return False

    def authenticate(self):
        print('Google Drive authentication opens in your browser. No login output is saved.')
        print('Create a Google OAuth Desktop app client first: ' + DOCS)
        print('The shared rclone client is being retired in 2026. These inputs are hidden.')
        client_id = getpass.getpass('Your Google OAuth client ID: ').strip()
        secret = getpass.getpass('Your Google OAuth client secret: ').strip()
        if not re.fullmatch(r'[A-Za-z0-9._-]+\.apps\.googleusercontent\.com', client_id) or not secret or any(c in secret for c in '\r\n\x00'):
            raise DriveError('A valid Desktop app OAuth client ID and secret are required.')
        self.write(self.auth, f'[{REMOTE}]\ntype = drive\nscope = drive\nclient_id = {client_id}\nclient_secret = {secret}\n')
        del client_id, secret
        try:
            # Auto-confirm selects the upstream local-browser OAuth default.
            # Headless authorization can print encoded client credentials and
            # ask users to paste token JSON; that path is deliberately disabled.
            result = self.execute(['config', 'reconnect', REMOTE + ':', '--auto-confirm'], terminal=True)
        finally:
            self.validate_path(self.auth, private=True)
            self.auth.chmod(0o600)
        if result or not self.authenticated():
            raise DriveError('Authentication was not completed. Run setup again when ready.')

    def validate_selection(self, profile, *, empty=False):
        if not isinstance(profile, dict) or profile.get('schema') != 1:
            raise DriveError('The private synchronization profile is invalid.')
        if not isinstance(profile.get('local'), str):
            raise DriveError('The private synchronization folder is invalid.')
        local = Path(profile.get('local', ''))
        self.validate_path(local)
        if any(part.startswith('.') for part in local.relative_to(self.home).parts):
            raise DriveError('Choose a normal data folder, not a hidden application settings directory.')
        for protected in (self.home / '.config', self.home / '.local', self.home / '.cache', self.home / '.ssh',
                          self.home / '.gnupg', self.home / '.aws', self.home / '.dropbox', self.home / '.dropbox-dist',
                          self.home / 'Dropbox', self.home / 'OneDrive'):
            if overlaps(local, protected):
                raise DriveError('Choose a data folder separate from private settings and other cloud synchronization folders.')
        other_profile = self.home / '.config/dotfiles-services/onedrive/profile.json'
        self.validate_path(other_profile, private=True)
        if other_profile.exists():
            try:
                other = json.loads(other_profile.read_text(encoding='utf-8'))
                folder = other.get('folder') if isinstance(other, dict) else None
                if not isinstance(folder, str) or not Path(folder).is_absolute():
                    raise ValueError('invalid profile')
            except (OSError, ValueError):
                raise DriveError('The existing OneDrive profile needs attention before selecting a Google Drive folder.') from None
            if overlaps(local, Path(folder)):
                raise DriveError('Google Drive and OneDrive must use separate synchronization folders.')
        remote = profile.get('remote_path')
        if not isinstance(remote, str) or any(ord(c) < 32 for c in remote) or ':' in remote or '\\' in remote:
            raise DriveError('Choose a relative Google Drive folder path, or leave it empty for My Drive.')
        if remote.startswith('/') or any(part in ('.', '..', BACKUP) for part in remote.split('/')):
            raise DriveError('The Google Drive folder path is invalid.')
        marker = profile.get('marker', '')
        if not isinstance(marker, str) or not re.fullmatch(r'\.dotfiles-drive-access-[0-9a-f]{32}', marker):
            raise DriveError('The access-check marker is invalid.')
        if not local.is_dir():
            if empty and not local.exists():
                local.mkdir(parents=True, mode=0o700)
            else:
                raise DriveError('The synchronization folder is unavailable; no remote files were changed.')
        if empty and any(local.iterdir()):
            raise DriveError('Initial setup requires a new or empty local folder. Add existing files after the first synchronization.')
        return local, REMOTE + ':' + remote

    def read_profile(self):
        self.validate_path(self.profile, private=True)
        try:
            profile = json.loads(self.profile.read_text(encoding='utf-8'))
        except (OSError, ValueError):
            raise DriveError('Run dotfiles-drive setup first.') from None
        self.validate_selection(profile)
        return profile

    def command(self, profile, *, initial=False, dry_run=False):
        local, remote = self.validate_selection(profile)
        stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S') + '-' + uuid.uuid4().hex[:8]
        remote_backup = remote.rstrip('/') + '/' + BACKUP + '/' + stamp
        arguments = ['bisync', str(local), remote, '--workdir', str(self.state / 'bisync'),
                     '--filters-file', str(self.filters), '--drive-skip-gdocs', '--drive-use-trash=true',
                     '--conflict-resolve', 'none', '--conflict-loser', 'num', '--conflict-suffix', 'local-conflict,drive-conflict',
                     '--max-delete', '10', '--backup-dir1', str(self.state / 'backups' / stamp),
                     '--backup-dir2', remote_backup, '--create-empty-src-dirs', '--retries', '1',
                     '--check-sync', 'true', '--disable', 'ListR']
        if not dry_run:
            arguments += ['--check-access', '--check-filename', profile['marker']]
        if initial:
            arguments += ['--resync', '--resync-mode', 'path2']
        if dry_run:
            arguments += ['--dry-run']
        return arguments

    def remote_summary(self, remote):
        # A listing must succeed before bisync: a misspelled/nonexistent remote
        # folder must not silently become a new synchronization root.
        if self.execute(['lsf', remote, '--max-depth', '1']):
            raise DriveError('The selected Google Drive folder is unavailable. Choose an existing folder and check authorization/network access.')
        result = subprocess.run(self.base() + ['size', remote, '--json', '--drive-skip-gdocs',
                                '--filter-from', str(self.filters)], stdin=subprocess.DEVNULL,
                                stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                                env=clean_environment(self.home, self.state), cwd=self.home, text=True)
        try:
            summary = json.loads(result.stdout)
            count, size = summary['count'], summary['bytes']
            if result.returncode or type(count) is not int or type(size) is not int or count < 0 or size < 0:
                raise ValueError('invalid summary')
        except (ValueError, TypeError, KeyError):
            raise DriveError('Could not calculate the initial synchronization size; no Google Drive files were changed.') from None
        return count, size

    def install_timer(self):
        self.validate_path(self.units)
        self.units.mkdir(parents=True, exist_ok=True)
        executable = self.home / '.local/bin/dotfiles-drive'
        self.validate_path(executable)
        if not executable.is_file():
            raise DriveError('The dotfiles-drive launcher is missing; reinstall the google-drive module.')
        quoted = str(executable).replace('\\', '\\\\').replace('"', '\\"').replace('%', '%%').replace('$', '$$')
        self.write(self.units / SERVICE, '[Unit]\nDescription=Private Google Drive synchronization\n\n[Service]\n'
                   f'Type=oneshot\nExecStart="{quoted}" run\nUMask=0077\nLimitCORE=0\nStandardOutput=null\nStandardError=null\n'
                   'KillSignal=SIGINT\nTimeoutStopSec=120\n')
        self.write(self.units / TIMER, '[Unit]\nDescription=Google Drive synchronization every five minutes\n\n'
                   '[Timer]\nOnStartupSec=2min\nOnUnitInactiveSec=5min\nAccuracySec=30s\n\n[Install]\nWantedBy=timers.target\n')
        if self.systemctl('daemon-reload') or self.systemctl('enable', '--now', TIMER):
            raise DriveError('Initial synchronization succeeded, but the user timer could not start. Run dotfiles-drive resume after logging in.')

    def setup(self):
        require_terminal()
        with self.lock():
            if self.profile.exists():
                raise DriveError('A synchronization pair already exists. Use status, stop, or resume; setup never resets an existing pair.')
            if not self.authenticated():
                self.authenticate()
            remote = input('Google Drive subfolder (existing folder; blank = My Drive): ').strip().strip('/')
            local_text = input('New/empty local folder [~/GoogleDrive]: ').strip() or str(self.home / 'GoogleDrive')
            if local_text == '~' or local_text.startswith('~/'):
                local_text = str(self.home) + local_text[1:]
            profile = {'schema': 1, 'local': local_text, 'remote_path': remote,
                       'marker': '.dotfiles-drive-access-' + uuid.uuid4().hex}
            local, remote_target = self.validate_selection(profile, empty=True)
            self.write(self.filters, FILTERS)
            print('Checking the selected folders without changing Google Drive files...')
            count, size = self.remote_summary(remote_target)
            if self.execute(self.command(profile, initial=True, dry_run=True)):
                raise DriveError('The read-only preflight failed. Check the selected existing folder, authorization, and network, then retry setup.')
            print(f'Local folder: {local}\nGoogle Drive folder: {remote or "My Drive"}')
            print(f'Initial download: {count} regular files, approximately {size / (1024 ** 2):.1f} MiB.')
            print('Regular files synchronize in BOTH directions every five minutes while logged in.')
            print('Later deletions propagate to the other side. Changed/deleted files are retained in backup folders; review their storage use.')
            print('Conflicts keep both versions. Google Docs/Sheets/Slides are excluded; edit them on the web.')
            print('An access-check marker and a .dotfiles-drive-backup folder will be created in the selected Drive folder.')
            if input('Type SYNC to initialize this pair and enable automatic synchronization: ').strip() != 'SYNC':
                print('Cancelled. Authentication remains private; automatic synchronization is disabled.')
                return
            # Recheck after user interaction: do not overwrite newly added data.
            self.validate_selection(profile, empty=True)
            marker = local / profile['marker']
            marker.write_text('dotfiles Google Drive access check\n', encoding='utf-8')
            if self.execute(['copyto', str(marker), remote_target.rstrip('/') + '/' + profile['marker']]):
                raise DriveError('Could not create the access-check marker. Automatic synchronization remains disabled.')
            if self.execute(self.command(profile, initial=True)):
                self.status_write('initialization-failed')
                raise DriveError('Initial synchronization failed. Automatic synchronization is disabled. Preserve the downloaded files and inspect both folders before attempting recovery.')
            self.write(self.profile, json.dumps(profile, ensure_ascii=False) + '\n')
            self.status_write('ready')
            self.install_timer()
            print('Google Drive synchronization is enabled. Run dotfiles-drive status to check it.')

    def run(self):
        with self.lock():
            profile = self.read_profile()
            if not self.authenticated():
                raise DriveError('Google Drive credentials are unavailable. Synchronization was not started.')
            if self.result.exists():
                result = json.loads(self.result.read_text(encoding='utf-8'))
                state = result.get('status') if isinstance(result, dict) else None
                if state not in ('ready', 'ok'):
                    raise DriveError('Synchronization is paused. Inspect the folders and run dotfiles-drive resume.')
            self.status_write('running')
            if self.execute(self.command(profile)):
                self.status_write('paused-after-error')
                raise DriveError('Synchronization stopped after an error; no automatic resync is attempted. Check connectivity and both folders, then run dotfiles-drive resume to retry safely.')
            self.status_write('ok')

    def stop(self):
        self.systemctl('disable', '--now', TIMER)
        self.systemctl('stop', SERVICE)
        with self.lock():
            self.status_write('stopped')
        print('Automatic Google Drive synchronization is stopped. Files and private credentials are retained.')

    def resume(self):
        require_terminal()
        with self.lock():
            self.read_profile()
            print('This retries ordinary synchronization. It never forces a resync or bypasses access/deletion checks.')
            if input('Type RESUME after checking both folders: ').strip() != 'RESUME':
                return
            self.status_write('ready')
            self.install_timer()
        print('Automatic synchronization is enabled. If the bisync state needs repair, the next run will pause again.')

    def status(self):
        for path in (self.profile, self.result):
            self.validate_path(path, private=True)
        print('Google Drive: ' + ('configured' if self.profile.is_file() else 'setup required'))
        if self.result.is_file():
            try:
                result = json.loads(self.result.read_text(encoding='utf-8'))
                allowed = {'ready', 'ok', 'running', 'stopped', 'paused-after-error', 'initialization-failed'}
                status = result.get('status') if isinstance(result, dict) else None
                print('Last result: ' + (status if isinstance(status, str) and status in allowed else 'unknown'))
            except (OSError, ValueError):
                print('Last result: unavailable')
        print('Timer: ' + ('active' if self.systemctl('is-active', '--quiet', TIMER) == 0 else 'inactive'))


def require_terminal():
    if not sys.stdin.isatty() or not sys.stdout.isatty() or not sys.stderr.isatty():
        raise DriveError('Run this command directly in an interactive terminal, without piping or recording its output.')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path)
    parser.add_argument('action', choices=('setup', 'run', 'status', 'stop', 'resume'))
    args = parser.parse_args(argv)
    if sys.platform != 'linux' or (hasattr(os, 'geteuid') and os.geteuid() == 0):
        parser.error('Run as your normal Linux desktop user.')
    os.umask(0o077)
    import resource
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    try:
        getattr(Drive(repo=args.repo), args.action)()
        return 0
    except DriveError as error:
        print(str(error), file=sys.stderr)
    except (OSError, ValueError, configparser.Error):
        # Never include a subprocess command, environment, token, config
        # contents or raw exception in a log or terminal diagnostic.
        print('Google Drive setup/synchronization could not complete. Private details were not logged.', file=sys.stderr)
    except (EOFError, KeyboardInterrupt):
        print('Cancelled. Run dotfiles-drive status to check synchronization.', file=sys.stderr)
    return 1


if __name__ == '__main__':
    raise SystemExit(main())
