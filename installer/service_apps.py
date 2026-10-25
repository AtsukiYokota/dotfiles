"""Install service clients without starting applications or reading account data."""
import hashlib
import json
from pathlib import Path
import platform
import re
import shutil
import stat
import subprocess
import tempfile
import urllib.request
import zipfile

SERVICE_MODULES = ('dropbox', 'onedrive', 'google-drive', 'slack', 'obsidian', 'teams-for-linux')
SNAPS = {
    'slack': ('JUJH91Ved74jd4ZgJCpzMBtYbPOzTlsD', 'slack', False),
    'obsidian': ('XSpRD8poWONFIT1z9TleS4XrS1u0MlfG', 'obsidianmd', True),
    'teams-for-linux': ('IIAJhVGfBhm393UTagoW5awtZlPDGqHd', 'ismaelmartinez', False),
}
ONEDRIVE_BASE = 'https://download.opensuse.org/repositories/home:/npreining:/debian-ubuntu-onedrive/'


def install_rclone(ctx):
    """Extract only the checked release executable; never open an rclone config."""
    version = ctx.versions['rclone']
    artifact = version[ctx.arch]
    directory = ctx.data / 'tools/rclone' / version['version']
    binary = directory / 'rclone'
    marker = directory / '.dotfiles-sha256'
    binary_marker = directory / '.binary-sha256'
    if directory.is_symlink() or not directory.resolve().is_relative_to(ctx.home.resolve()):
        raise ValueError('The rclone installation must stay inside home.')
    if directory.exists():
        if (not marker.is_file() or marker.read_text(encoding='ascii') != artifact['sha256']
                or binary.is_symlink() or not binary.is_file() or not binary_marker.is_file()
                or hashlib.sha256(binary.read_bytes()).hexdigest() != binary_marker.read_text(encoding='ascii')):
            raise RuntimeError('Unrecognized existing rclone installation; inspect it before retrying.')
    else:
        archive = ctx.temp / 'rclone.zip'
        ctx.runner.download(artifact['url'], archive, artifact['sha256'])
        member = f"rclone-v{version['version']}-linux-{ctx.arch}/rclone"
        directory.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='.rclone-', dir=directory.parent) as temporary:
            staging = Path(temporary) / 'release'
            staging.mkdir()
            with zipfile.ZipFile(archive) as bundle:
                info = bundle.getinfo(member)
                mode = info.external_attr >> 16
                if info.is_dir() or stat.S_ISLNK(mode) or info.file_size > 512 * 1024 * 1024:
                    raise RuntimeError('Unexpected rclone executable in release archive.')
                with bundle.open(info) as source, (staging / 'rclone').open('wb') as target:
                    shutil.copyfileobj(source, target)
            (staging / 'rclone').chmod(0o755)
            (staging / '.dotfiles-sha256').write_text(artifact['sha256'], encoding='ascii')
            (staging / '.binary-sha256').write_text(
                hashlib.sha256((staging / 'rclone').read_bytes()).hexdigest(), encoding='ascii')
            staging.rename(directory)
    ctx.backup.link(binary, ctx.home / '.local/bin/rclone')
    return directory


def install_dropbox(ctx):
    if ctx.arch != 'amd64':
        raise ValueError('The official Dropbox Linux client requires amd64.')
    artifact = ctx.versions['dropbox']['amd64']
    archive = ctx.temp / 'dropbox.deb'
    ctx.runner.download(artifact['url'], archive, artifact['sha256'])
    ctx.temp.chmod(0o755)
    archive.chmod(0o644)
    # The official package installs a launcher. It does not start Dropbox;
    # the user obtains the signed daemon and logs in through first launch.
    # python3-gpg enables verification of the daemon download on that launch.
    ctx.runner.run(['sudo', 'apt-get', 'install', '-y', '--no-remove', '--no-install-recommends',
                    'python3-gpg', str(archive)])


def existing_onedrive_source(directory, series):
    """Avoid duplicate Signed-By declarations when the user already added OBS."""
    expected = f'xUbuntu_{series}'
    found = None
    for path in sorted(Path(directory).glob('*')):
        if path.suffix not in ('.list', '.sources') or not path.is_file():
            continue
        text = '\n'.join(line for line in path.read_text(encoding='utf-8').splitlines()
                         if not line.lstrip().startswith('#'))
        blocks = re.split(r'\n\s*\n', text) if path.suffix == '.sources' else text.splitlines()
        for block in blocks:
            if path.suffix == '.sources':
                if re.search(r'^Enabled:\s*no\s*$', block, re.M | re.I):
                    continue
                active = bool(re.search(r'^Types:.*\bdeb\b', block, re.M))
            else:
                active = block.strip().startswith('deb ')
            if not active or 'download.opensuse.org/repositories/home:/npreining:/debian-ubuntu-onedrive/' not in block:
                continue
            if not re.search(r'/'+re.escape(expected)+r'/?(?:\s|$)', block):
                raise RuntimeError('An existing OneDrive repository targets a different Ubuntu release. Correct its source before retrying.')
            found = path
    return found


def install_onedrive(ctx):
    release = platform.freedesktop_os_release()
    series = release.get('VERSION_ID')
    if release.get('ID') != 'ubuntu' or series not in ('24.04', '26.04'):
        raise ValueError('The OneDrive repository supports Ubuntu 24.04 and 26.04.')
    existing = existing_onedrive_source(Path('/etc/apt/sources.list.d'), series)
    if not existing:
        key_info = ctx.versions['onedrive_repository']
        key = ctx.temp / 'onedrive.asc'
        ctx.runner.download(key_info['key_url'], key, key_info['sha256'])
        source = ctx.temp / 'dotfiles-onedrive.sources'
        source.write_text('Types: deb\n'
                          f'URIs: {ONEDRIVE_BASE}xUbuntu_{series}/\nSuites: ./\n'
                          f'Architectures: {ctx.arch}\n'
                          'Signed-By: /etc/apt/keyrings/dotfiles-onedrive.asc\n', encoding='utf-8')
        preferences = ctx.temp / 'dotfiles-onedrive.pref'
        origin = f'obs://build.opensuse.org/home:npreining:debian-ubuntu-onedrive/xUbuntu_{series}'
        preferences.write_text(
            f'Package: onedrive\nPin: release o={origin}\nPin-Priority: 700\n\n'
            f'Package: *\nPin: release o={origin}\nPin-Priority: -1\n', encoding='utf-8')
        ctx.runner.run(['sudo', 'install', '-d', '-m', '0755', '/etc/apt/keyrings'])
        ctx.runner.run(['sudo', 'install', '-m', '0644', str(key), '/etc/apt/keyrings/dotfiles-onedrive.asc'])
        ctx.runner.run(['sudo', 'install', '-m', '0644', str(source), '/etc/apt/sources.list.d/dotfiles-onedrive.sources'])
        ctx.runner.run(['sudo', 'install', '-m', '0644', str(preferences), '/etc/apt/preferences.d/dotfiles-onedrive'])
    ctx.runner.run(['sudo', 'apt-get', 'update'])
    ctx.runner.run(['sudo', 'apt-get', 'install', '-y', '--no-remove', '--no-install-recommends',
                    '--no-install-suggests', 'onedrive'])
    # The package preserves previously enabled units but does not enable a fresh
    # installation. Onboarding owns the user's authentication and service setup.


def snap_metadata(name):
    request = urllib.request.Request('https://api.snapcraft.io/v2/snaps/info/' + name,
                                     headers={'Snap-Device-Series': '16', 'User-Agent': 'dotfiles-installer/1'})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def install_snap(ctx, name):
    expected_id, publisher, classic = SNAPS[name]
    metadata = snap_metadata(name)
    snap = metadata.get('snap', {})
    if snap.get('snap-id') != expected_id or snap.get('publisher', {}).get('username') != publisher:
        raise RuntimeError(f'Unexpected Snap Store publisher or identifier for {name}.')
    stable = [entry for entry in metadata.get('channel-map', [])
              if entry.get('channel', {}).get('track') == 'latest'
              and entry['channel'].get('risk') == 'stable'
              and entry['channel'].get('architecture') == ctx.arch]
    if not stable:
        raise RuntimeError(f'No stable {name} Snap is available for {ctx.arch}.')
    try:
        ctx.runner.capture(['snap', 'list', name])
    except subprocess.CalledProcessError:
        ctx.runner.run(['sudo', 'snap', 'install', name, '--channel=latest/stable',
                        *(['--classic'] if classic else [])])
    else:
        ctx.runner.run(['sudo', 'snap', 'refresh', name, '--channel=latest/stable'])


def install_service(ctx, module):
    if ctx.platform != 'native':
        raise ValueError('Service app modules require native Ubuntu.')
    if module == 'dropbox':
        install_dropbox(ctx)
    elif module == 'onedrive':
        install_onedrive(ctx)
    elif module == 'google-drive':
        install_rclone(ctx)
    elif module in SNAPS:
        install_snap(ctx, module)
    else:
        raise ValueError(f'Unknown service module: {module}')
