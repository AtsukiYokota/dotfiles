#!/usr/bin/env python3
"""User-driven service onboarding. Never called by the installer or its logger."""
from __future__ import annotations

import argparse
from contextlib import contextmanager
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import tempfile


SERVICES = {
    'dropbox': ('Dropbox', 'Choose the account and local sync folder in the Dropbox setup window.'),
    'onedrive': ('OneDrive', 'Sign in, choose an empty local folder and review the first synchronization.'),
    'google-drive': ('Google Drive', 'Sign in with rclone, choose a local folder and review bidirectional synchronization.'),
    'slack': ('Slack', 'Sign in to your workspaces in the Slack application.'),
    'obsidian': ('Obsidian', 'Choose or create a local vault; sign in only if you use Obsidian Sync.'),
    'teams-for-linux': ('Teams for Linux', 'Sign in in the community Teams for Linux application.'),
    'notion-electron': ('Notion Electron', 'Sign in in the community Notion Electron application.'),
}
GUI_COMMANDS = {
    'dropbox': ('/usr/bin/dropbox', 'start', '-i'),
    'slack': ('/snap/bin/slack', '--disable-logging'),
    'obsidian': ('/snap/bin/obsidian', '--disable-logging'),
    'teams-for-linux': ('/snap/bin/teams-for-linux', '--disable-logging', '--logConfig',
                        '{"transports":{"console":{"level":false},"file":{"level":false}}}'),
    'notion-electron': ('/usr/bin/notion-electron', '--disable-logging', '--disable-update-functionality'),
}
UNIT = 'dotfiles-onedrive.service'
MARKER = '.dotfiles-onedrive-access'
MARKER_TEXT = 'dotfiles OneDrive local synchronization root\n'


def safe_path(path, home, repo):
    """Refuse credential/state paths that traverse symlinks or any Git checkout."""
    path = Path(os.path.abspath(path))
    home, repo = home.resolve(), repo.resolve()
    if path == home or not path.is_relative_to(home) or path.is_relative_to(repo):
        raise ValueError('Service files must stay in your home directory, outside the repository.')
    current = path
    while True:
        if current.is_symlink():
            raise ValueError('Service paths must not contain symbolic links.')
        if (current / '.git').exists():
            raise ValueError('Service files must not be stored inside any Git checkout.')
        if current.exists() and current.stat().st_uid != os.getuid():
            raise ValueError('Service paths must be owned by the current user.')
        if current == home:
            break
        current = current.parent
    return path


def private_dir(path, home, repo):
    path = safe_path(path, home, repo)
    path.mkdir(parents=True, exist_ok=True, mode=0o700)
    if not path.is_dir():
        raise ValueError('The private service directory is not a directory.')
    path.chmod(0o700)
    return path


def private_write(path, text, home, repo):
    path = safe_path(path, home, repo)
    private_dir(path.parent, home, repo)
    if path.exists() and (not path.is_file() or path.stat().st_nlink != 1):
        raise ValueError('Refusing to overwrite an unusual service file.')
    with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=path.parent, delete=False) as output:
        temporary = Path(output.name)
        output.write(text)
    try:
        temporary.chmod(0o600)
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)


def read_private_json(path, home, repo):
    safe_path(path, home, repo)
    if not path.exists():
        return None
    if not path.is_file() or path.stat().st_size > 16384 or path.stat().st_nlink != 1:
        raise ValueError('Unrecognized service state; no authentication data was read.')
    result = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(result, dict):
        raise ValueError('Unrecognized service state.')
    return result


def require_terminal():
    # Refuse pipes/tee/installer logging before any OAuth program is started.
    if not all(stream.isatty() for stream in (sys.stdin, sys.stdout, sys.stderr)):
        raise ValueError('Run setup directly in an interactive terminal, without redirection or tee.')


@contextmanager
def hidden_terminal_input():
    """Callback URLs pasted into the client's prompt must not echo into scrollback."""
    import termios
    descriptor = sys.stdin.fileno()
    original = termios.tcgetattr(descriptor)
    hidden = original.copy()
    hidden[3] &= ~(termios.ECHO | termios.ECHONL)
    termios.tcsetattr(descriptor, termios.TCSANOW, hidden)
    try:
        yield
    finally:
        termios.tcsetattr(descriptor, termios.TCSANOW, original)


def quiet_run(argv, env=None):
    return subprocess.run(argv, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                          stderr=subprocess.DEVNULL, env=env, check=False).returncode


def systemd_quote(value):
    if any(ord(char) < 32 or ord(char) == 127 for char in str(value)):
        raise ValueError('Service command paths must not contain control characters.')
    return '"' + str(value).replace('\\', '\\\\').replace('"', '\\"').replace('%', '%%').replace('$', '$$') + '"'


class Onboarding:
    def __init__(self, repo, home=None, env=None):
        self.repo = Path(repo).resolve()
        self.home = Path(home or Path.home()).resolve()
        self.env = dict(os.environ if env is None else env)
        self.private = self.home / '.config/dotfiles-services/onedrive'
        self.profile = self.private / 'profile.json'
        self.unit = self.home / '.config/systemd/user' / UNIT

    def installed(self):
        state = Path(self.env.get('XDG_STATE_HOME', self.home / '.local/state')) / 'dotfiles/installed.json'
        try:
            result = read_private_json(state, self.home, self.repo) or {}
        except (OSError, ValueError):
            return set()
        modules = result.get('modules', [])
        return set(modules) & SERVICES.keys() if isinstance(modules, list) and all(isinstance(x, str) for x in modules) else set()

    def show_list(self):
        installed = self.installed()
        print('Optional services (installation status only; accounts are never inspected):')
        for name, (title, instructions) in SERVICES.items():
            status = 'installed' if name in installed else 'not selected'
            print(f'  {name:17} {status:12} {title}: {instructions}')
        print('\nStart initial setup: dotfiles-apps setup SERVICE')

    def command(self):
        executable = shutil.which('onedrive', path=self.env.get('PATH'))
        if not executable:
            raise ValueError('Install the onedrive module first.')
        return [executable, '--confdir', str(self.private)]

    def folder(self, value, *, allow_nonempty=False):
        path = Path(value).expanduser()
        if (not path.is_absolute() or any(char in str(path) for char in '"\\')
                or any(ord(char) < 32 or ord(char) == 127 for char in str(path))):
            raise ValueError('Choose an absolute local folder path without quotes or control characters.')
        path = safe_path(path, self.home, self.repo)
        relative = path.relative_to(self.home)
        if any(part.startswith('.') for part in relative.parts):
            raise ValueError('Choose a visible data folder, not a configuration directory.')
        if self.repo.is_relative_to(path):
            raise ValueError('The synchronization folder must not contain this repository.')
        for other_path in (self.home / 'Dropbox', self.home / 'GoogleDrive'):
            if path.is_relative_to(other_path) or other_path.is_relative_to(path):
                raise ValueError('Use separate, non-overlapping folders for each cloud service.')
        google_profile = self.home / '.config/dotfiles-services/google-drive/profile.json'
        if google_profile.exists():
            other = read_private_json(google_profile, self.home, self.repo) or {}
            other_local = other.get('local') or other.get('local_path') or other.get('local_dir')
            if isinstance(other_local, str):
                other_path = Path(other_local).resolve()
                if path.is_relative_to(other_path) or other_path.is_relative_to(path):
                    raise ValueError('Use separate, non-overlapping folders for each cloud service.')
        if path.exists() and (not path.is_dir() or (not allow_nonempty and any(path.iterdir()))):
            raise ValueError('Initial setup requires a new or empty local folder.')
        return path

    @staticmethod
    def config_text(folder):
        return ('# Managed by dotfiles-apps; authentication remains in this private directory.\n'
                f'sync_dir = "{folder}"\n'
                'enable_logging = "false"\ndebug_https = "false"\n'
                'display_running_config = "false"\ndisplay_transfer_metrics = "false"\n'
                'disable_notifications = "true"\nnotify_file_actions = "false"\n'
                'skip_symlinks = "true"\nskip_dotfiles = "true"\n'
                'bypass_data_preservation = "false"\npermanent_delete = "false"\n'
                'sync_dir_permissions = "700"\nsync_file_permissions = "600"\n'
                'monitor_interval = "300"\n')

    def load_onedrive(self):
        safe_path(self.private, self.home, self.repo)
        if self.private.exists() and stat.S_IMODE(self.private.stat().st_mode) & 0o077:
            raise ValueError('The private OneDrive directory must have mode 700.')
        profile = read_private_json(self.profile, self.home, self.repo)
        if not profile or set(profile) != {'version', 'folder', 'ready'} or profile['version'] != 1:
            raise ValueError('Run dotfiles-apps setup onedrive first.')
        if not isinstance(profile['folder'], str) or not isinstance(profile['ready'], bool):
            raise ValueError('Unrecognized OneDrive setup state.')
        folder = self.folder(profile['folder'], allow_nonempty=True)
        if profile['ready']:
            marker = safe_path(folder / MARKER, self.home, self.repo)
            if (not marker.is_file() or marker.stat().st_nlink != 1
                    or marker.stat().st_size != len(MARKER_TEXT) or marker.read_text() != MARKER_TEXT):
                raise ValueError('The OneDrive folder access marker is missing. Restore the original sync folder before resuming.')
        config = safe_path(self.private / 'config', self.home, self.repo)
        if not config.is_file() or config.stat().st_size > 16384 or config.read_text() != self.config_text(folder):
            raise ValueError('The managed OneDrive configuration changed; automatic synchronization is stopped.')
        # Never read refresh_token. Ensure no private file was redirected into a checkout.
        for path in self.private.iterdir():
            safe_path(path, self.home, self.repo)
            if path.is_file() and (path.stat().st_nlink != 1 or stat.S_IMODE(path.stat().st_mode) & 0o077):
                raise ValueError('OneDrive private files must be private regular files (mode 600).')
        return profile, folder

    def write_profile(self, folder, ready):
        if ready:
            private_write(folder / MARKER, MARKER_TEXT, self.home, self.repo)
        private_write(self.profile, json.dumps({'version': 1, 'folder': str(folder), 'ready': ready}) + '\n', self.home, self.repo)

    def setup_onedrive(self):
        require_terminal()
        command = self.command()
        if self.profile.exists():
            profile, folder = self.load_onedrive()
            if profile['ready']:
                print('OneDrive is configured. Use dotfiles-apps resume onedrive to enable automatic sync.')
                return 0
            print(f'Resume the unfinished setup for: {folder}')
        else:
            safe_path(self.private, self.home, self.repo)
            if self.private.exists() and any(self.private.iterdir()):
                raise ValueError('An unmanaged OneDrive directory already exists; it was left unchanged.')
            print('OneDrive will synchronize this account into a new or empty local folder.')
            print('Hidden files and symbolic links are excluded. Deletions propagate after setup.')
            default = self.home / 'OneDrive'
            folder = self.folder(input(f'Local folder [{default}]: ').strip() or str(default))
            if input(f'Use {folder}? Type YES: ').strip() != 'YES':
                print('Cancelled; no authentication or sync started.')
                return 0
            folder.mkdir(parents=True, mode=0o700, exist_ok=True)
            private_write(self.private / 'config', self.config_text(folder), self.home, self.repo)
            self.write_profile(folder, False)
        print('Follow the Microsoft sign-in instructions. Pasted callback text is hidden and not logged.')
        # Without --sync or --monitor, upstream only authenticates. It may return 1
        # after saving a token because no operational mode was requested.
        with hidden_terminal_input():
            subprocess.run(command, env=self.env, check=False)
        token = safe_path(self.private / 'refresh_token', self.home, self.repo)
        if not token.is_file() or token.stat().st_size == 0 or token.stat().st_nlink != 1:
            raise ValueError('Sign-in did not finish. Rerun setup when ready.')
        token.chmod(0o600)
        print('\nPreview the first synchronization (no file changes):')
        result = subprocess.run(command + ['--sync', '--dry-run'], env=self.env, check=False)
        if result.returncode:
            raise ValueError('The synchronization preview failed. Automatic sync was not enabled.')
        if input('Perform this initial sync and enable automatic sync? Type SYNC: ').strip() != 'SYNC':
            print('Saved sign-in locally; synchronization remains disabled.')
            return 0
        result = subprocess.run(command + ['--sync'], env=self.env, check=False)
        if result.returncode:
            raise ValueError('Initial synchronization failed. Automatic sync was not enabled; rerun setup.')
        self.write_profile(folder, True)
        return self.resume_onedrive()

    def resume_onedrive(self):
        profile, _ = self.load_onedrive()
        if not profile['ready']:
            raise ValueError('Complete the setup preview and first sync before enabling automatic sync.')
        script = self.repo / 'commands/service_setup.py'
        arguments = ['/usr/bin/python3', str(script), '--repo', str(self.repo), 'run', 'onedrive']
        contents = ('[Unit]\nDescription=Private OneDrive synchronization\nAfter=network-online.target\n'
                    '[Service]\nType=simple\nExecStart=' + ' '.join(systemd_quote(x) for x in arguments) + '\n'
                    'StandardInput=null\nStandardOutput=null\nStandardError=null\nUMask=0077\nLimitCORE=0\n'
                    'Restart=no\nTimeoutStopSec=90\n[Install]\nWantedBy=default.target\n')
        private_write(self.unit, contents, self.home, self.repo)
        if quiet_run(['systemctl', '--user', 'daemon-reload']) or quiet_run(['systemctl', '--user', 'enable', '--now', UNIT]):
            raise ValueError('The user service could not start. Check dotfiles-apps status onedrive.')
        print('OneDrive automatic synchronization is enabled for your user session.')
        return 0

    def run_onedrive(self):
        profile, folder = self.load_onedrive()
        if not profile['ready'] or not folder.is_dir():
            raise ValueError('OneDrive setup or local folder is unavailable; synchronization was not started.')
        # Neither stdout nor stderr may enter journald, including an unexpected
        # reauthentication prompt after an account administrator revokes access.
        return quiet_run(self.command() + ['--monitor'], self.env)

    def stop_onedrive(self):
        result = quiet_run(['systemctl', '--user', 'disable', '--now', UNIT])
        if result:
            raise ValueError('Could not stop the OneDrive user service.')
        print('OneDrive automatic synchronization is stopped. Local files and sign-in are retained.')
        return 0

    def status_onedrive(self):
        if not self.profile.exists():
            print('OneDrive: initial setup required.')
            return 0
        profile, _ = self.load_onedrive()
        active = quiet_run(['systemctl', '--user', 'is-active', '--quiet', UNIT]) == 0
        failed = not active and quiet_run(['systemctl', '--user', 'is-failed', '--quiet', UNIT]) == 0
        print('OneDrive: ' + ('automatic sync running' if active else 'automatic sync failed' if failed else 'automatic sync stopped') +
              ('; first sync completed.' if profile['ready'] else '; initial setup unfinished.'))
        return 0

    def launch_gui(self, name):
        require_terminal()
        if not (self.env.get('DISPLAY') or self.env.get('WAYLAND_DISPLAY')):
            raise ValueError('Open this command in your desktop session.')
        # Existing application profiles stay entirely in application-owned paths.
        # Refuse dotfile symlinks/Git homes rather than copying or backing them up.
        config = Path(self.env.get('XDG_CONFIG_HOME', self.home / '.config'))
        for variable, default in (('XDG_CONFIG_HOME', '.config'), ('XDG_DATA_HOME', '.local/share'),
                                  ('XDG_STATE_HOME', '.local/state'), ('XDG_CACHE_HOME', '.cache')):
            safe_path(Path(self.env.get(variable, self.home / default)), self.home, self.repo)
        for candidate in (self.home / '.dropbox', self.home / '.dropbox-dist') if name == 'dropbox' else (self.home / 'snap' / name, config / {'slack': 'Slack', 'obsidian': 'obsidian', 'teams-for-linux': 'teams-for-linux', 'notion-electron': 'notion-electron'}[name]):
            safe_path(candidate, self.home, self.repo)
        if name == 'notion-electron':
            # Electron packages can choose the package or product name for userData.
            safe_path(config / 'Notion Electron', self.home, self.repo)
        if name != 'dropbox':
            # Snap's current -> revision symlink is normal. Resolve that one
            # before checking the application's actual profile directories.
            for base in ('current', 'common'):
                candidate = self.home / 'snap' / name / base / '.config'
                if candidate.exists():
                    safe_path(candidate.resolve(), self.home, self.repo)
                    profile = candidate / ('Slack' if name == 'slack' else name)
                    safe_path(profile.resolve(), self.home, self.repo)
        command = list(GUI_COMMANDS[name])
        if not shutil.which(command[0], path=self.env.get('PATH')):
            raise ValueError(f'Install the {name} module first.')
        print(SERVICES[name][1])
        app_env = {key: value for key, value in self.env.items()
                   if key not in ('ELECTRON_ENABLE_LOGGING', 'ELECTRON_LOG_FILE', 'CHROME_LOG_FILE', 'DEBUG')}
        subprocess.Popen(command, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                         stderr=subprocess.DEVNULL, env=app_env, start_new_session=True,
                         close_fds=True)
        return 0

    def dispatch(self, action, service):
        if action == 'list':
            self.show_list()
            return 0
        # Background units use the completed private setup as their authority.
        # A graphical session may have a custom XDG_STATE_HOME that systemd does
        # not inherit, so the installer receipt must not control service startup.
        if action != 'run' and service not in self.installed():
            raise ValueError(f'Install the {service} module first; it is absent from the installation receipt.')
        if service == 'google-drive':
            command = ['/usr/bin/python3', str(self.repo / 'commands/cloud_drive.py'), '--repo', str(self.repo), action]
            return subprocess.run(command, check=False).returncode
        if service == 'onedrive':
            return getattr(self, action + '_onedrive')()
        if action == 'setup':
            return self.launch_gui(service)
        if action == 'status':
            print(f'{SERVICES[service][0]}: installed; manage sign-in and synchronization in the application.')
            return 0
        raise ValueError('Use the application settings to control this service.')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('action', nargs='?', choices=('list', 'setup', 'status', 'stop', 'resume', 'run'), default='list')
    parser.add_argument('service', nargs='?', choices=tuple(SERVICES))
    args = parser.parse_args(argv)
    if args.action != 'list' and not args.service:
        parser.error('Specify a service, for example: dotfiles-apps setup onedrive')
    try:
        if os.geteuid() == 0:
            raise ValueError('Run dotfiles-apps as your normal desktop user, without sudo.')
        import resource
        resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
        os.umask(0o077)
        return Onboarding(args.repo).dispatch(args.action, args.service)
    except (OSError, ValueError) as error:
        # Exceptions from the clients are never captured, serialized or echoed.
        print(f'dotfiles-apps: {error}', file=sys.stderr)
        return 1
    except (KeyboardInterrupt, EOFError):
        print('\nCancelled. Automatic sync is enabled only after successful setup.', file=sys.stderr)
        return 130


if __name__ == '__main__':
    raise SystemExit(main())
