"""Verified Nerd Fonts and reversible native/WSL terminal font selection."""
from __future__ import annotations

import ast
from dataclasses import dataclass, field
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tarfile
import uuid

FAMILY = 'JetBrainsMono Nerd Font Mono'
WINDOWS_FAMILY = 'JetBrainsMono NFM'
FONT_FILES = tuple(f'JetBrainsMonoNerdFontMono-{style}.ttf'
                   for style in ('Regular', 'Bold', 'Italic', 'BoldItalic'))


def font_directory(ctx):
    return ctx.data / 'tools/nerd-font' / ctx.versions['nerd_font']['version']


def font_target(ctx):
    return ctx.data.parent / 'fonts/dotfiles-nerd-font'


def install_fonts(ctx):
    version = ctx.versions['nerd_font']
    directory = font_directory(ctx)
    marker = directory / '.dotfiles-sha256'
    if directory.is_symlink() or not directory.resolve().is_relative_to(ctx.home.resolve()):
        raise ValueError(f'Font installation must stay inside home: {directory}')
    if directory.exists():
        if not marker.is_file() or marker.read_text(encoding='ascii') != version['sha256']:
            raise RuntimeError(f'Unrecognized existing font installation: {directory}')
    else:
        archive = ctx.temp / 'nerd-font.tar.xz'
        ctx.runner.download(version['url'], archive, version['sha256'])
        extracted = ctx.temp / ('nerd-font-' + uuid.uuid4().hex)
        extracted.mkdir()
        with tarfile.open(archive) as bundle:
            # Retain the font license, but install only the four terminal faces.
            names = (*FONT_FILES, 'OFL.txt')
            members = [bundle.getmember(name) for name in names]
            if any(not member.isfile() for member in members):
                raise RuntimeError('Unexpected link or directory in Nerd Font archive.')
            bundle.extractall(extracted, members=members, filter='data')
        directory.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(extracted), str(directory))
        marker.write_text(version['sha256'], encoding='ascii')
    for name in (*FONT_FILES, 'OFL.txt'):
        source = directory / name
        if not source.is_file() or source.is_symlink():
            raise RuntimeError(f'Incomplete font installation: {source}')
    # Context.data is XDG_DATA_HOME/dotfiles. Respect the same XDG font search
    # directory used by fontconfig, including non-default data locations.
    target = font_target(ctx)
    ctx.backup.link(directory, target)
    ctx.runner.run(['fc-cache', '-f', str(target)])
    matched = ctx.runner.capture(['fc-match', '--format', '%{family}', FAMILY])
    if FAMILY not in matched.split(','):
        raise RuntimeError(f'fontconfig did not resolve {FAMILY}: {matched}')


def configure_fonts(ctx):
    directory = font_directory(ctx)
    if not all((directory / name).is_file() for name in FONT_FILES):
        print('  Nerd Font is not installed yet; rerun fonts without --configs-only.')
        return
    if directory.is_symlink() or not directory.resolve().is_relative_to(ctx.home.resolve()):
        raise ValueError(f'Font installation must stay inside home: {directory}')
    marker = directory / '.dotfiles-sha256'
    if not marker.is_file() or marker.read_text(encoding='ascii') != ctx.versions['nerd_font']['sha256']:
        raise RuntimeError(f'Unrecognized existing font installation: {directory}')
    target = font_target(ctx)
    if not target.is_symlink() or target.resolve() != directory.resolve():
        # --restore retains the downloaded tool but removes its fontconfig
        # link. Reuse that verified cache during --configs-only, without a
        # download. A normal full install already made the link/cache.
        install_fonts(ctx)
    if ctx.platform == 'wsl':
        configure_windows_terminal(ctx, directory)
        return
    if ('GNOME' not in os.environ.get('XDG_CURRENT_DESKTOP', '').upper()
            or not os.environ.get('DBUS_SESSION_BUS_ADDRESS') or not shutil.which('gsettings')):
        print(f'  Font installed. Select "{FAMILY}" in your terminal; GNOME session unavailable.')
        return
    schemas = set(ctx.runner.capture(['gsettings', 'list-schemas']).splitlines())
    if 'org.gnome.desktop.interface' in schemas:
        ctx.backup.set_setting('org.gnome.desktop.interface', 'monospace-font-name',
                               repr(FAMILY + ' 11'), ctx.runner)
    if 'org.gnome.Terminal.ProfilesList' not in schemas:
        return
    raw = ctx.runner.capture(['gsettings', 'get', 'org.gnome.Terminal.ProfilesList', 'list'])
    profiles = ast.literal_eval(raw.removeprefix('@as '))
    if not isinstance(profiles, list) or any(not isinstance(item, str) for item in profiles):
        raise RuntimeError('Unexpected GNOME Terminal profile list.')
    for profile in profiles:
        # Only UUIDs can enter the relocatable schema path.
        identifier = str(uuid.UUID(profile))
        schema = f'org.gnome.Terminal.Legacy.Profile:/org/gnome/terminal/legacy/profiles:/:{identifier}/'
        ctx.backup.set_setting(schema, 'use-system-font', 'false', ctx.runner)
        ctx.backup.set_setting(schema, 'font', repr(FAMILY + ' 11'), ctx.runner)


@dataclass
class JsonNode:
    value: object
    start: int
    end: int
    children: object = field(default_factory=dict)
    trailing_comma: bool = False


class JsonComments:
    """Small JSONC parser retaining spans for edits without losing comments.

    Windows Terminal permits comments and trailing commas. Duplicate object
    keys are rejected instead of guessing which setting the application uses.
    """
    def __init__(self, text):
        self.text = text
        self.position = 0

    def skip(self):
        while self.position < len(self.text):
            match = re.match(r'\s+|//[^\r\n]*|/\*[\s\S]*?\*/', self.text[self.position:])
            if not match:
                break
            self.position += len(match[0])

    def parse(self):
        node = self.node()
        self.skip()
        if self.position != len(self.text):
            raise ValueError('Unexpected trailing content in Windows Terminal settings.')
        return node

    def node(self):
        self.skip()
        start = self.position
        if self.position >= len(self.text):
            raise ValueError('Incomplete JSONC settings.')
        opening = self.text[self.position]
        if opening not in '{[':
            value, consumed = json.JSONDecoder().raw_decode(self.text[self.position:])
            if isinstance(value, (float,)) and str(value) in ('nan', 'inf', '-inf'):
                raise ValueError('Non-finite JSON value.')
            self.position += consumed
            return JsonNode(value, start, self.position)
        self.position += 1
        close = '}' if opening == '{' else ']'
        children = {} if opening == '{' else []
        trailing = False
        while True:
            self.skip()
            if self.position >= len(self.text):
                raise ValueError('Unterminated JSONC object or array.')
            if self.text[self.position] == close:
                self.position += 1
                values = ({key: child.value for key, child in children.items()}
                          if isinstance(children, dict) else [child.value for child in children])
                return JsonNode(values, start, self.position, children, trailing)
            if opening == '{':
                key = self.node().value
                if not isinstance(key, str) or key in children:
                    raise ValueError('Invalid or duplicate JSONC object key.')
                self.skip()
                if self.position >= len(self.text) or self.text[self.position] != ':':
                    raise ValueError('Missing JSONC object colon.')
                self.position += 1
                children[key] = self.node()
            else:
                children.append(self.node())
            self.skip()
            if self.position < len(self.text) and self.text[self.position] == ',':
                self.position += 1
                trailing = True
            elif self.position < len(self.text) and self.text[self.position] == close:
                trailing = False
            else:
                raise ValueError('Missing JSONC separator.')
            # A following member consumes the comma; only a comma immediately
            # before the closing token is remembered as trailing.


def _insert_property(text, node, key, value):
    prefix = ',' if node.children and not node.trailing_comma else ''
    content = prefix + '\n' + json.dumps(key) + ': ' + json.dumps(value) + '\n'
    return text[:node.end - 1] + content + text[node.end - 1:]


def patch_windows_terminal(text, profile_id, distro):
    """Change only the current WSL profile; leave other profiles and comments."""
    root = JsonComments(text).parse()
    if not isinstance(root.value, dict):
        raise ValueError('Windows Terminal settings root must be an object.')
    profiles = root.children.get('profiles')
    if profiles and isinstance(profiles.value, dict):
        profiles = profiles.children.get('list')
    if not profiles or not isinstance(profiles.value, list):
        return text, False
    matches = []
    for profile in profiles.children:
        if not isinstance(profile.value, dict):
            continue
        value = profile.value
        if profile_id:
            match = str(value.get('guid', '')).casefold() == profile_id.casefold()
        else:
            match = (value.get('name') == distro and value.get('source') == 'Windows.Terminal.Wsl')
        if match:
            matches.append(profile)
    if len(matches) > 1:
        raise ValueError('Ambiguous Windows Terminal profile; font settings left unchanged.')
    if not matches:
        return text, False
    profile = matches[0]
    font = profile.children.get('font')
    if font is None:
        updated = _insert_property(text, profile, 'font', {'face': WINDOWS_FAMILY})
    elif font.value is None:
        updated = text[:font.start] + json.dumps({'face': WINDOWS_FAMILY}) + text[font.end:]
    elif not isinstance(font.value, dict):
        raise ValueError('Unexpected Windows Terminal font object.')
    elif 'face' in font.children:
        face = font.children['face']
        updated = text[:face.start] + json.dumps(WINDOWS_FAMILY) + text[face.end:]
    else:
        updated = _insert_property(text, font, 'face', WINDOWS_FAMILY)
    JsonComments(updated).parse()
    return updated, True


def configure_windows_terminal(ctx, directory):
    powershell = shutil.which('powershell.exe')
    if not powershell or not shutil.which('wslpath'):
        print(f'  Windows interop unavailable. Install/select "{FAMILY}" on the Windows terminal host.')
        return
    windows_path = lambda path: ctx.runner.capture(['wslpath', '-w', str(path)])
    script = windows_path(ctx.repo / 'scripts/setup-windows-fonts.ps1')
    command = [powershell, '-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script]
    info = json.loads(ctx.runner.capture(command + ['-Action', 'Inspect']))
    ctx.runner.run(command + ['-Action', 'InstallFonts', '-FontDirectory', windows_path(directory)])
    matched = False
    for path in info.get('settings', []):
        local = Path(ctx.runner.capture(['wslpath', '-u', path]))
        original = local.read_bytes()
        text = original.decode('utf-8-sig')
        updated, found = patch_windows_terminal(text, os.environ.get('WT_PROFILE_ID', ''),
                                                os.environ.get('WSL_DISTRO_NAME', ''))
        matched |= found
        if updated == text:
            continue
        content = ctx.temp / ('windows-terminal-' + uuid.uuid4().hex + '.json')
        # Retain the original BOM when present.
        content.write_bytes((b'\xef\xbb\xbf' if original.startswith(b'\xef\xbb\xbf') else b'') + updated.encode('utf-8'))
        result = ctx.runner.capture(command + ['-Action', 'WriteSettings', '-SettingsPath', path,
                                    '-ContentPath', windows_path(content),
                                    '-ExpectedSha256', hashlib.sha256(original).hexdigest()])
        print('  Windows Terminal configuration backup: ' + result)
        record = ctx.backup.directory / 'windows-terminal-backups.txt'
        with record.open('a', encoding='utf-8') as output:
            output.write(result + '\n')
    if not matched:
        print(f'  Windows font installed. Current WSL Windows Terminal profile not found; select "{WINDOWS_FAMILY}" in its Appearance settings.')
    else:
        print('  Windows Terminal font selected. Close all Windows Terminal windows and reopen to load the new font.')
