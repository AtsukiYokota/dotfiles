"""Native desktop apps from the signed, official Flathub user repository."""
import configparser
import os
from pathlib import Path
import re


CAPTURE_ID = 'io.github.seadve.Kooha'
CAPTURE_REF = CAPTURE_ID + '//stable'
REMOTE = 'dotfiles-flathub'
REPO_URL = 'https://dl.flathub.org/repo/flathub.flatpakrepo'
REPO_SHA256 = '3371dd250e61d9e1633630073fefda153cd4426f72f4afa0c3373ae2e8fea03a'
FLATHUB_URLS = {'https://dl.flathub.org/repo', 'https://flathub.org/repo'}


def user_directory(ctx):
    directory = Path(os.environ.get('FLATPAK_USER_DIR') or ctx.data.parent / 'flatpak')
    home = ctx.home.resolve()
    for path in (directory, directory / 'repo', directory / 'repo/config'):
        if not path.is_absolute() or not path.resolve().is_relative_to(home):
            raise ValueError('The Flatpak user installation must stay inside home.')
    if directory.exists() and not directory.is_dir():
        raise ValueError('The Flatpak user installation path must be a directory.')
    return directory


def _repository_config(directory):
    parser = configparser.ConfigParser(interpolation=None)
    path = directory / 'repo/config'
    if path.exists():
        try:
            with path.open(encoding='utf-8') as source:
                parser.read_file(source)
        except (OSError, configparser.Error) as error:
            raise RuntimeError('Cannot safely read the existing Flatpak repository configuration.') from error
    return parser


def _verify_remote(config, name):
    section = f'remote "{name}"'
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]*', name) or not config.has_section(section):
        raise RuntimeError('The installed Kooha origin is missing or unrecognized; inspect it with flatpak remotes --user.')
    remote = config[section]
    try:
        verified = (remote.get('url', '').rstrip('/') in FLATHUB_URLS
                    and remote.getboolean('gpg-verify', fallback=False)
                    and remote.getboolean('gpg-verify-summary', fallback=True)
                    and not remote.getboolean('xa.disable', fallback=False)
                    and not remote.get('metalink', '')
                    and not remote.get('mirrorlist', ''))
    except ValueError:
        verified = False
    if not verified:
        raise RuntimeError(f'Flatpak remote {name!r} must use the official Flathub URL and GPG verification; no settings were changed.')


def _installed_origin(ctx, directory):
    # A captured (non-TTY) Flatpak list uses tab-separated fields without a
    # translated header. Inspect metadata only; never launch the application.
    output = ctx.runner.capture(['/usr/bin/env', 'FLATPAK_USER_DIR=' + str(directory),
                                 'flatpak', 'list', '--user', '--app',
                                 '--columns=application,origin,branch,arch'])
    arch = {'amd64': 'x86_64', 'arm64': 'aarch64'}[ctx.arch]
    origins = set()
    for line in output.splitlines():
        fields = line.split('\t')
        if fields and fields[0] == CAPTURE_ID:
            if len(fields) != 4:
                raise RuntimeError('Cannot safely identify the installed Kooha origin.')
            if fields[2:] == ['stable', arch]:
                origins.add(fields[1])
    if len(origins) > 1:
        raise RuntimeError('Multiple Kooha origins were reported; inspect the existing installation.')
    return next(iter(origins), None)


def install_capture(ctx):
    """Install/update Kooha stable for this user; return its trusted origin."""
    if ctx.platform != 'native':
        raise ValueError('screen-capture requires a native Ubuntu desktop.')
    if getattr(ctx, 'configs_only', False):
        print('  Kooha installation/update is skipped in --configs-only mode.')
        return None
    directory = user_directory(ctx)
    config = _repository_config(directory)
    if config.has_section(f'remote "{REMOTE}"'):
        _verify_remote(config, REMOTE)
    origin = _installed_origin(ctx, directory)
    env = {'FLATPAK_USER_DIR': str(directory)}
    if origin:
        _verify_remote(config, origin)
    else:
        origin = REMOTE
        if not config.has_section(f'remote "{REMOTE}"'):
            descriptor = ctx.temp / 'flathub.flatpakrepo'
            ctx.runner.download(REPO_URL, descriptor, REPO_SHA256)
            ctx.runner.run(['flatpak', 'remote-add', '--user', '--if-not-exists',
                            '--from', REMOTE, descriptor], env=env)
            _verify_remote(_repository_config(directory), REMOTE)
    # --or-update also refreshes an existing installation and its runtime.
    # An explicit stable ref never switches to a beta/development branch.
    ctx.runner.run(['flatpak', 'install', '--user', '--noninteractive', '--assumeyes',
                    '--or-update', origin, CAPTURE_REF], env=env)
    print('  Kooha is installed. Open it from the application menu; screen sharing is approved in the desktop portal.')
    return origin
