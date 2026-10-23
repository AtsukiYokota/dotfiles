"""Build pinned WhiteSur assets as a user, then deploy backed-up links/settings.

Upstream scripts run with a disposable HOME and a sudo blocker. They never
receive the real user's HOME. Libadwaita overrides, GDM and extension downloads
are intentionally outside this module's installation scope.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import shlex
import shutil
import sys
import tarfile
import uuid


SOURCES = {
    'gtk': {
        'repo': 'WhiteSur-gtk-theme',
        # 2026-09-10 includes the upstream GNOME 50 compatibility fixes.
        'commit': '99247ecd219bdc1c7409baff062b4aafcf1102a7',
        'sha256': '5c450592ff55bcae98b19d6408d1462288d81e8787b5ef3a96b445a1a35429d2',
    },
    'icons': {
        'repo': 'WhiteSur-icon-theme',
        'commit': '73d8040da51a9ed74e47c7366e7e9ff437601a5c',
        'sha256': '96661649071d8a9664b40d42abea75286175234473106156e9a4b25f54e6cb0c',
    },
    'cursors': {
        'repo': 'WhiteSur-cursors',
        'commit': 'e190baf618ed95ee217d2fd45589bd309b37672b',
        'sha256': '35c817c2c26bc4d2c06801cfe6c924a068ad771d3846c5203b04d1c893dd5664',
    },
}

BUILD_ID = 'whitesur-' + '-'.join(item['commit'][:12] for item in SOURCES.values())
THEME_NAME = 'WhiteSur-Dark'
ICON_NAMES = ('WhiteSur', 'WhiteSur-light', 'WhiteSur-dark', 'WhiteSur-cursors')

# The WhiteSur theme defaults to Big Sur styling. Use the matching, MIT-licensed
# artwork from its author's wallpaper project, without running its sudo installer.
# Keep this separate from BUILD_ID so adding wallpapers reuses installed GTK assets.
WALLPAPER_COMMIT = '5c1d7ca20b8de0a7efe443792c19e49277262e02'
WALLPAPER_FILES = {
    'WhiteSur-light.jpg': {
        'path': '4k/WhiteSur-light.jpg',
        'sha256': 'a7e5fe92826140c08d54876b9eaedc17cd811db383f857b8e2ef99ace925a7ae',
    },
    'WhiteSur.jpg': {
        'path': '4k/WhiteSur.jpg',
        'sha256': 'c8b852095f962614bb2296c5511b283405b8d0b2bfe290021109864cce89b450',
    },
    'LICENSE': {
        'path': 'LICENSE',
        'sha256': '5a9518c6e0636dee418520a999426422aa33a2c5a0d8dedf62cadceec8d1b3c6',
    },
}


def _require_session(ctx, *, build=True):
    if ctx.platform != 'native' or not sys.platform.startswith('linux'):
        raise RuntimeError('macos-theme requires native Ubuntu; WSL is unsupported.')
    if os.geteuid() == 0:
        raise RuntimeError('Run macos-theme as your desktop user, without sudo.')
    if 'gnome' not in os.environ.get('XDG_CURRENT_DESKTOP', '').lower():
        raise RuntimeError('macos-theme requires a logged-in GNOME desktop session.')
    if not os.environ.get('DBUS_SESSION_BUS_ADDRESS'):
        raise RuntimeError('macos-theme requires the GNOME user session D-Bus address.')
    commands = ['gnome-shell', 'gsettings']
    if build:
        commands += ['bash', 'sassc', 'glib-compile-resources', 'xmllint', 'gtk-update-icon-cache']
    for command in commands:
        if not shutil.which(command):
            raise RuntimeError(f'macos-theme prerequisite is missing: {command}')


def _extract(archive: Path, destination: Path, source: dict) -> Path:
    destination.mkdir(parents=True, exist_ok=False)
    # Python's data filter rejects absolute paths,
    # traversal, special files, and symlinks that would escape this destination.
    with tarfile.open(archive, 'r:gz') as stream:
        stream.extractall(destination, filter='data')
    expected = destination / f"{source['repo']}-{source['commit']}"
    if not expected.is_dir() or set(destination.iterdir()) != {expected}:
        raise RuntimeError(f'Unexpected archive layout: {archive.name}')
    return expected


def _isolate_gtk_source(source: Path, work: Path):
    core = source / 'libs/lib-core.sh'
    content = core.read_text(encoding='utf-8')
    substitutions = {
        'export WHITESUR_TMP_DIR="/tmp/WhiteSur.lock"':
            'export WHITESUR_TMP_DIR=' + shlex.quote(str(work)),
        'MY_HOME=$(getent passwd "${MY_USERNAME}" | cut -d: -f6)':
            'MY_HOME="${HOME}"',
    }
    # Only patch build isolation variables in the verified, disposable source.
    # Refuse a changed upstream layout instead of silently weakening isolation.
    for old, new in substitutions.items():
        if content.count(old) != 1:
            raise RuntimeError('Pinned WhiteSur source does not match the build adapter.')
        content = content.replace(old, new, 1)
    core.write_text(content, encoding='utf-8', newline='\n')


def _validate_artifacts(directory: Path):
    required = [directory / 'themes' / THEME_NAME / 'gtk-3.0/gtk.css']
    required += [directory / 'icons' / name / 'index.theme' for name in ICON_NAMES]
    for path in required:
        if not path.is_file() or not path.resolve().is_relative_to(directory.resolve()):
            raise RuntimeError(f'Theme installation is incomplete: {path}')
    for path in directory.rglob('*'):
        if path.is_symlink() and not path.resolve().is_relative_to(directory.resolve()):
            raise RuntimeError(f'Theme contains a link outside its artifact directory: {path}')


def _build(ctx, destination: Path):
    stage = ctx.temp / ('whitesur-' + uuid.uuid4().hex)
    stage.mkdir(parents=True, exist_ok=False)
    # The upstream icon installer has several unquoted internal paths. Keep its
    # build directories whitespace-free; deployment itself accepts spaced HOME.
    if any(character.isspace() for character in str(stage)):
        raise RuntimeError('WhiteSur build needs a temporary directory without spaces.')
    stage_home = stage / 'home'
    stage_home.mkdir()
    themes = stage_home / '.themes'
    icons = stage_home / '.local/share/icons'
    themes.mkdir()
    icons.mkdir(parents=True)
    deny = stage / 'deny-privilege'
    deny.mkdir()
    sudo = deny / 'sudo'
    sudo.write_text('#!/bin/sh\nprintf "%s\\n" "Theme scripts cannot run sudo." >&2\nexit 125\n',
                    encoding='utf-8', newline='\n')
    sudo.chmod(0o755)
    environment = {
        'HOME': str(stage_home),
        'XDG_CONFIG_HOME': str(stage_home / '.config'),
        'XDG_DATA_HOME': str(stage_home / '.local/share'),
        'XDG_CACHE_HOME': str(stage_home / '.cache'),
        'DBUS_SESSION_BUS_ADDRESS': '',
        'GSETTINGS_BACKEND': 'memory',
        'PATH': str(deny) + os.pathsep + os.environ.get('PATH', ''),
        'TERM': os.environ.get('TERM') or 'xterm',
    }
    sources = {}
    for name, source in SOURCES.items():
        archive = stage / f'{name}.tar.gz'
        url = f"https://codeload.github.com/vinceliuice/{source['repo']}/tar.gz/{source['commit']}"
        ctx.runner.download(url, archive, source['sha256'])
        sources[name] = _extract(archive, stage / name, source)
    _isolate_gtk_source(sources['gtk'], stage / 'gtk-work')
    # --silent-mode requires root upstream; do not pass it. Without --libadwaita
    # or tweaks.sh, only staging themes and the staging helper app are written.
    ctx.runner.run(['bash', str(sources['gtk'] / 'install.sh'),
                    '-d', str(themes), '-c', 'dark', '-o', 'normal'], env=environment)
    ctx.runner.run(['bash', str(sources['icons'] / 'install.sh'),
                    '-d', str(icons), '-t', 'default'], env=environment)
    # Upstream cursor install.sh is only a copy with unquoted paths. Copy its
    # already-built dist directly and preserve the internal cursor aliases.
    shutil.copytree(sources['cursors'] / 'dist', icons / 'WhiteSur-cursors', symlinks=True)

    assembled = stage / 'assembled'
    (assembled / 'themes').mkdir(parents=True)
    (assembled / 'icons').mkdir()
    shutil.copytree(themes / THEME_NAME, assembled / 'themes' / THEME_NAME, symlinks=True)
    for name in ICON_NAMES:
        shutil.copytree(icons / name, assembled / 'icons' / name, symlinks=True)
    _validate_artifacts(assembled)
    (assembled / 'sources.json').write_text(json.dumps(SOURCES, indent=2) + '\n', encoding='utf-8')

    if not destination.parent.resolve().is_relative_to(ctx.home.resolve()):
        raise RuntimeError('Theme artifact directory must resolve inside the user home.')
    destination.parent.mkdir(parents=True, exist_ok=True)
    publishing = destination.with_name('.staging-' + uuid.uuid4().hex)
    shutil.copytree(assembled, publishing, symlinks=True)
    # Publish only complete builds, on the same filesystem. Existing builds are
    # never recursively removed by this module.
    publishing.rename(destination)


def _wallpaper_directory(ctx):
    destination = ctx.data / 'wallpapers' / ('whitesur-' + WALLPAPER_COMMIT[:12])
    if destination.is_symlink() or not destination.resolve().is_relative_to(ctx.home.resolve()):
        raise RuntimeError('Wallpaper directory must be a directory inside the user home.')
    return destination


def _validate_wallpapers(directory):
    for name, source in WALLPAPER_FILES.items():
        path = directory / name
        if (path.is_symlink() or not path.is_file()
                or hashlib.sha256(path.read_bytes()).hexdigest() != source['sha256']):
            raise RuntimeError(f'Wallpaper is missing or has changed: {path}. '
                               'Run macos-theme without --configs-only to install missing assets.')


def _install_wallpapers(ctx):
    destination = _wallpaper_directory(ctx)
    if destination.exists():
        _validate_wallpapers(destination)
        return destination
    stage = ctx.temp / ('wallpapers-' + uuid.uuid4().hex)
    stage.mkdir(parents=True, exist_ok=False)
    base = f'https://raw.githubusercontent.com/vinceliuice/WhiteSur-wallpapers/{WALLPAPER_COMMIT}/'
    for name, source in WALLPAPER_FILES.items():
        ctx.runner.download(base + source['path'], stage / name, source['sha256'])
    _validate_wallpapers(stage)
    destination.parent.mkdir(parents=True, exist_ok=True)
    publishing = destination.with_name('.staging-' + uuid.uuid4().hex)
    shutil.copytree(stage, publishing)
    publishing.rename(destination)
    return destination


def _apply_settings(ctx, wallpapers):
    schemas = set(ctx.runner.capture(['gsettings', 'list-schemas']).splitlines())
    settings = {
        'org.gnome.desktop.interface': {
            'gtk-theme': "'WhiteSur-Dark'",
            'icon-theme': "'WhiteSur-dark'",
            'cursor-theme': "'WhiteSur-cursors'",
            'color-scheme': "'prefer-dark'",
        },
        'org.gnome.desktop.wm.preferences': {
            'button-layout': "'close,minimize,maximize:'",
        },
        'org.gnome.shell.extensions.dash-to-dock': {
            'dock-position': "'BOTTOM'",
            'extend-height': 'false',
            'dash-max-icon-size': '48',
            'dock-fixed': 'false',
            'intellihide': 'false',
            'autohide': 'true',
            'manualhide': 'false',
            'require-pressure-to-show': 'false',
            'show-dock-urgent-notify': 'false',
            'hotkeys-show-dock': 'false',
        },
        'org.gnome.desktop.background': {
            'picture-uri': repr((wallpapers / 'WhiteSur-light.jpg').as_uri()),
            # WhiteSur.jpg is the colorful evening version; -dark is grayscale.
            'picture-uri-dark': repr((wallpapers / 'WhiteSur.jpg').as_uri()),
            'picture-options': "'zoom'",
        },
    }
    for schema, values in settings.items():
        if schema not in schemas:
            continue
        keys = set(ctx.runner.capture(['gsettings', 'list-keys', schema]).splitlines())
        for key, value in values.items():
            if key in keys:
                ctx.backup.set_setting(schema, key, value, ctx.runner)


def _theme_directory(ctx):
    destination = ctx.data / 'themes' / BUILD_ID
    if destination.is_symlink() or not destination.resolve().is_relative_to(ctx.home.resolve()):
        raise RuntimeError('Theme artifact directory must be a directory inside the user home.')
    return destination


def _validate_installed_theme(destination):
    marker = destination / 'sources.json'
    if not marker.is_file() or json.loads(marker.read_text(encoding='utf-8')) != SOURCES:
        raise RuntimeError(f'Unrecognized existing theme directory: {destination}')
    _validate_artifacts(destination)


def _deploy_theme(ctx, destination, wallpapers):
    ctx.backup.link(destination / 'themes' / THEME_NAME, ctx.home / '.themes' / THEME_NAME)
    for name in ICON_NAMES:
        ctx.backup.link(destination / 'icons' / name, ctx.home / '.local/share/icons' / name)
    _apply_settings(ctx, wallpapers)


def configure_theme(ctx):
    """Reapply installed theme, hover-only Dock and wallpaper settings offline."""
    _require_session(ctx, build=False)
    destination = _theme_directory(ctx)
    if not destination.exists():
        raise RuntimeError('WhiteSur is not installed. Run macos-theme without --configs-only first.')
    _validate_installed_theme(destination)
    wallpapers = _wallpaper_directory(ctx)
    _validate_wallpapers(wallpapers)
    _deploy_theme(ctx, destination, wallpapers)


def install_theme(ctx):
    """Install WhiteSur assets, matching wallpapers and hover-only Ubuntu Dock."""
    _require_session(ctx)
    destination = _theme_directory(ctx)
    if destination.exists():
        _validate_installed_theme(destination)
    else:
        _build(ctx, destination)
    wallpapers = _install_wallpapers(ctx)
    _deploy_theme(ctx, destination, wallpapers)
