"""Verified ibisOffice AppImage and a reversible per-user desktop launcher."""
import hashlib
from pathlib import Path
import shutil
import tempfile


def office_directory(ctx):
    return ctx.data / 'tools/ibis-office' / ctx.versions['ibis_office']['version']


def _require_target(ctx):
    if ctx.platform != 'native' or ctx.arch != 'amd64':
        raise ValueError('ibis-office requires native Ubuntu amd64.')


def _checked_directory(ctx):
    directory = office_directory(ctx)
    if directory.is_symlink() or not directory.resolve().is_relative_to(ctx.home.resolve()):
        raise ValueError(f'ibisOffice installation must stay inside home: {directory}')
    return directory


def _check_file(path, expected):
    if path.is_symlink() or not path.is_file():
        raise RuntimeError(f'Missing or unrecognized ibisOffice file: {path}')
    with path.open('rb') as source:
        digest = hashlib.file_digest(source, 'sha256').hexdigest()
    if digest != expected:
        raise RuntimeError(f'Unrecognized existing ibisOffice file; inspect it before retrying: {path}')


def _validate(ctx, directory):
    version = ctx.versions['ibis_office']
    _check_file(directory / 'ibisOffice.AppImage', version['amd64']['sha256'])
    _check_file(directory / 'ibisoffice.png', version['icon_sha256'])


def install_office(ctx):
    _require_target(ctx)
    directory = _checked_directory(ctx)
    version = ctx.versions['ibis_office']
    if directory.exists():
        _validate(ctx, directory)
        return
    downloaded = ctx.temp / 'ibisOffice.AppImage'
    artifact = version['amd64']
    ctx.runner.download(artifact['url'], downloaded, artifact['sha256'])
    downloaded.chmod(0o755)
    # The official runtime extracts without FUSE. Run only the verified image,
    # in a private directory, and request only the bundled application icon.
    with tempfile.TemporaryDirectory(prefix='ibis-office-extract-', dir=ctx.temp) as temporary:
        extracted = Path(temporary)
        ctx.runner.run(['/usr/bin/env', '--chdir=' + str(extracted), str(downloaded),
                        '--appimage-extract', 'ibisoffice.png'])
        icon = extracted / 'squashfs-root/ibisoffice.png'
        _check_file(icon, version['icon_sha256'])
        directory.parent.mkdir(parents=True, exist_ok=True)
        # Stage on the destination filesystem; an interrupted install must not
        # leave a partially populated version directory that blocks retrying.
        with tempfile.TemporaryDirectory(prefix='.ibis-office-', dir=directory.parent) as staging:
            staged = Path(staging) / 'release'
            staged.mkdir()
            shutil.copyfile(downloaded, staged / 'ibisOffice.AppImage')
            (staged / 'ibisOffice.AppImage').chmod(0o755)
            shutil.copyfile(icon, staged / 'ibisoffice.png')
            (staged / 'ibisoffice.png').chmod(0o644)
            _validate(ctx, staged)
            staged.rename(directory)


def _desktop_value(value):
    return str(value).replace('\\', '\\\\').replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')


def _desktop_exec(path):
    # Exec quoting and desktop-entry value escaping are separate layers.
    # Literal percent signs must also be protected against field expansion.
    value = ''.join('\\' + char if char in '\\"`$' else char for char in str(path))
    return _desktop_value('"' + value.replace('%', '%%') + '"')


def configure_office(ctx):
    _require_target(ctx)
    directory = _checked_directory(ctx)
    if not directory.exists():
        print('  ibisOffice is not installed yet; rerun ibis-office without --configs-only.')
        return
    _validate(ctx, directory)
    binary = ctx.home / '.local/bin/ibis-office'
    ctx.backup.link(directory / 'ibisOffice.AppImage', binary)
    applications = ctx.data.parent / 'applications'
    desktop = applications / 'ibisoffice.desktop'
    ctx.backup.write_text(desktop, '\n'.join([
        '[Desktop Entry]',
        'Type=Application',
        'Name=ibisOffice',
        'Comment=Open and edit Word, Excel and PowerPoint documents',
        # GLib checks the executable before expanding %% field codes. A fixed
        # executable also handles literal percent signs in the user's home.
        'Exec=/usr/bin/env -- ' + _desktop_exec(binary) + ' %f',
        'Icon=' + _desktop_value(directory / 'ibisoffice.png'),
        'Terminal=false',
        'Categories=Office;WordProcessor;Spreadsheet;Presentation;',
        'MimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document;'
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;'
        'application/vnd.openxmlformats-officedocument.presentationml.presentation;',
        'StartupWMClass=ibisoffice',
        'StartupNotify=true',
        '',
    ]))
    desktop.chmod(0o644)
    # Register "Open With" support without changing the user's default apps.
    ctx.runner.run(['update-desktop-database', str(applications)])
