"""Japanese input on native GNOME, using Ubuntu 24.04's Fcitx 5 + Mozc.

Fcitx 5.1.7 handles modifier-only bindings on release and cancels them when
another key is pressed. This preserves Alt shortcuts without an X11-only mapper.
Ubuntu im-config handles environment variables and startup on X11 and Wayland.
"""
from __future__ import annotations

import ast
import json
import os
from pathlib import Path
import re
import shlex
import shutil
import subprocess
import time
from types import SimpleNamespace
import uuid

SCHEMA = 'org.gnome.desktop.input-sources'
GROUP = 'Dotfiles Japanese'
DBUS = ['gdbus', 'call', '--session', '--dest', 'org.freedesktop.DBus',
        '--object-path', '/org/freedesktop/DBus', '--method']
FCITX_SERVICE = 'org.fcitx.Fcitx5'
HEADER = re.compile(r'^\[([^\]\r\n]+)\]\s*$')
ASSIGNMENT = re.compile(r'^\s*([^#;=][^=]*)=(.*)$')


def decode_value(value):
    # Fcitx stringutils::unescapeForValue supports backslash and newline escapes;
    # quotes wrap values containing whitespace. Never use shell evaluation.
    quoted = len(value) >= 2 and value.startswith('"') and value.endswith('"')
    value = value[1:-1] if quoted else value
    output = []
    index = 0
    while index < len(value):
        character = value[index]
        if character == '\\':
            index += 1
            if index >= len(value) or value[index] not in ('\\', 'n', '"'):
                raise ValueError('Unrecognized Fcitx string escape; leave the file unchanged.')
            character = '\n' if value[index] == 'n' else value[index]
        output.append(character)
        index += 1
    return ''.join(output)


def encode_value(value):
    escaped = value.replace('\\', '\\\\').replace('\n', '\\n').replace('"', '\\"')
    return '"' + escaped + '"' if any(character in value for character in '\f\r\t\v "') else escaped


def require_session():
    if ('GNOME' not in os.environ.get('XDG_CURRENT_DESKTOP', '').upper()
            or not os.environ.get('DBUS_SESSION_BUS_ADDRESS')):
        raise ValueError('Run japanese-input inside your native GNOME desktop session.')
    if not shutil.which('gsettings'):
        raise ValueError('Japanese input requires gsettings (libglib2.0-bin).')


def parse_ini(text):
    """Read Fcitx INI values without normalizing spelling or interpreting '%' ."""
    sections = {}
    current = None
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith(('#', ';')):
            continue
        header = HEADER.fullmatch(stripped)
        if header:
            current = header[1]
            if current in sections:
                raise ValueError(f'Duplicate Fcitx section: {current}')
            sections[current] = {}
            continue
        item = ASSIGNMENT.fullmatch(line)
        if item is None or current is None:
            raise ValueError('Unrecognized Fcitx configuration line; leave the file unchanged.')
        key = item[1].strip()
        if key in sections[current]:
            raise ValueError(f'Duplicate Fcitx option: {current}/{key}')
        sections[current][key] = decode_value(item[2])
    return sections


def merge_section(text, name, values, *, replace_list=False):
    """Edit selected keys, retaining unrelated settings, ordering and comments."""
    parse_ini(text)
    lines = text.splitlines(keepends=True)
    start = end = None
    for index, line in enumerate(lines):
        header = HEADER.fullmatch(line.strip())
        if header and start is not None:
            end = index
            break
        if header and header[1] == name:
            start = index + 1
    if start is None:
        prefix = text.rstrip('\n') + '\n\n' if text else ''
        return prefix + f'[{name}]\n' + ''.join(f'{key}={encode_value(value)}\n' for key, value in values.items())
    if end is None:
        end = len(lines)
    pending = dict(values)
    body = []
    for line in lines[start:end]:
        item = ASSIGNMENT.fullmatch(line.rstrip('\r\n'))
        key = item[1].strip() if item else None
        if key is not None and replace_list and key.isdecimal() and key not in pending:
            continue
        if key in pending:
            body.append(f'{key}={encode_value(pending.pop(key))}\n')
        else:
            body.append(line)
    if body and not body[-1].endswith('\n'):
        body[-1] += '\n'
    trailing = []
    while body and not body[-1].strip():
        trailing.insert(0, body.pop())
    body.extend(f'{key}={encode_value(value)}\n' for key, value in pending.items())
    body.extend(trailing)
    return ''.join(lines[:start] + body + lines[end:])


def input_sources(value, keyboard_defaults=None):
    """Preserve physical layouts; remove IBus engines replaced by Fcitx/Mozc."""
    text = value.strip()
    if text.startswith('@a(ss) '):
        text = text[7:]
    sources = ast.literal_eval(text)
    if (not isinstance(sources, list) or any(
            not isinstance(item, tuple) or len(item) != 2
            or not all(isinstance(part, str) for part in item) for item in sources)):
        raise ValueError('Unexpected GNOME input sources; leave them unchanged.')
    kept = [item for item in sources if item[0] != 'ibus']
    xkb = [name for kind, name in kept if kind == 'xkb']
    if not xkb:
        defaults = keyboard_defaults if keyboard_defaults is not None else Path('/etc/default/keyboard').read_text(encoding='utf-8')
        options = {}
        for line in defaults.splitlines():
            if line.startswith(('XKBLAYOUT=', 'XKBVARIANT=')):
                key, value = line.split('=', 1)
                parsed = shlex.split(value, comments=True)
                options[key] = parsed[0] if parsed else ''
        layout = options.get('XKBLAYOUT', '').split(',')[0]
        variant = options.get('XKBVARIANT', '').split(',')[0]
        if not layout:
            raise ValueError('No physical keyboard layout was found. Add an English or Japanese keyboard in GNOME Settings first.')
        xkb = [layout + ('+' + variant if variant else '')]
        kept.insert(0, ('xkb', xkb[0]))
    if not re.fullmatch(r'[A-Za-z0-9_-]+(?:\+[A-Za-z0-9_-]+)?', xkb[0]):
        raise ValueError(f'Unsupported keyboard layout notation: {xkb[0]}')
    return kept, xkb[0].replace('+', '-', 1)


def configure_global(text):
    for section, keys in {
        'Hotkey/TriggerKeys': ['Zenkaku_Hankaku'],
        'Hotkey/AltTriggerKeys': [],
        'Hotkey/ActivateKeys': ['Alt_R', 'Henkan_Mode'],
        'Hotkey/DeactivateKeys': ['Alt_L', 'Muhenkan'],
    }.items():
        text = merge_section(text, section, {str(i): value for i, value in enumerate(keys)}, replace_list=True)
    # Starting in the keyboard state makes English the predictable login default.
    return merge_section(text, 'Behavior', {'ActiveByDefault': 'False'})


def configure_profile(text, layout):
    sections = parse_ini(text)
    groups = {int(name.split('/')[1]): options.get('Name', '')
              for name, options in sections.items() if re.fullmatch(r'Groups/\d+', name)}
    matches = [index for index, name in groups.items() if name == GROUP]
    if len(matches) > 1:
        raise ValueError('Multiple Dotfiles Japanese input groups exist; leave the profile unchanged.')
    index = matches[0] if matches else max(groups, default=-1) + 1
    text = merge_section(text, f'Groups/{index}', {'Name': GROUP, 'Default Layout': layout, 'DefaultIM': 'mozc'})
    for item, name in enumerate(('keyboard-' + layout, 'mozc')):
        text = merge_section(text, f'Groups/{index}/Items/{item}', {'Name': name, 'Layout': ''})
    old_order = sections.get('GroupOrder', {})
    ordered = [old_order[key] for key in sorted(old_order, key=lambda value: int(value) if value.isdecimal() else -1)
               if key.isdecimal()]
    order = [GROUP]
    for name in ordered + list(groups.values()):
        if name and name not in order:
            order.append(name)
    return merge_section(text, 'GroupOrder', {str(i): name for i, name in enumerate(order)}, replace_list=True)


def _fcitx_running(ctx):
    value = ctx.runner.capture(DBUS + ['org.freedesktop.DBus.NameHasOwner', FCITX_SERVICE])
    if value not in ('(true,)', '(false,)'):
        raise RuntimeError('Unexpected Fcitx D-Bus status; configuration left unchanged.')
    return value == '(true,)'


def _stop_fcitx(ctx):
    if not _fcitx_running(ctx):
        return False
    # Ask only this desktop session's daemon to save and exit; never kill other
    # users' processes. Read its config only after its final save has completed.
    ctx.runner.run(['fcitx5-remote', '-e'])
    deadline = time.monotonic() + 5
    while _fcitx_running(ctx):
        if time.monotonic() >= deadline:
            raise RuntimeError('Fcitx did not finish exiting. Close its configuration window and retry.')
        time.sleep(0.1)
    return True


def _start_fcitx(ctx):
    # fcitx5 -d's child retains inherited file descriptors. Runner.run drains a
    # PIPE and would therefore wait forever; discard its detached daemon output.
    print('  Restarting the current desktop Fcitx 5 daemon.')
    subprocess.run(['fcitx5', '-d'], stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                   stderr=subprocess.DEVNULL, check=True, timeout=10)
    deadline = time.monotonic() + 5
    while not _fcitx_running(ctx):
        if time.monotonic() >= deadline:
            raise RuntimeError('Fcitx did not start. Log out of the desktop and log in again.')
        time.sleep(0.1)


def profile_values(text):
    """Normalize only Fcitx's profile serialization, keeping every setting.

    Fcitx saves generated comments/quotes and reassigns group indices from an
    unordered_map. Compare groups by their unique names, preserving item order,
    explicit group order, and unknown keys/sections so functional edits conflict.
    """
    sections = parse_ini(text)
    groups = {}
    extras = dict(sections)
    for section, values in sections.items():
        match = re.fullmatch(r'Groups/(\d+)', section)
        if not match:
            continue
        name = values.get('Name')
        if not name or name in groups:
            raise ValueError('Fcitx profile group names must be nonempty and unique.')
        extras.pop(section)
        prefix = section + '/Items/'
        items = []
        for candidate, item in sections.items():
            if candidate.startswith(prefix) and candidate[len(prefix):].isdecimal():
                items.append((int(candidate[len(prefix):]), item))
                extras.pop(candidate)
        groups[name] = {'options': values, 'items': [item for _, item in sorted(items)]}
    # Only numeric group/item identifiers are non-semantic. Every other section
    # and key remains in the snapshot, including any future Fcitx options.
    return {'groups': groups, 'sections': extras}


def restore_japanese_input(directory, home):
    """Stop this session's daemon, restore safely, and leave it stopped on success."""
    from deploy import fingerprint, restore
    from runtime import Runner

    directory = Path(directory).resolve(strict=True)
    home = Path(home).resolve()
    manifest_path = directory / 'manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    if manifest.get('version') != 1 or manifest.get('home') != str(home):
        raise ValueError('Backup does not belong to this home or has an unsupported format.')
    require_session()
    ctx = SimpleNamespace(runner=Runner(directory / 'restore.log'))
    restarted = _stop_fcitx(ctx)
    succeeded = False
    try:
        normalized = []
        for entry in manifest['entries']:
            if entry.get('restored') or 'fcitx_profile_values' not in entry:
                continue
            path = Path(entry['path'])
            if (entry.get('kind') != 'path' or not path.is_absolute()
                    or not path.parent.resolve().is_relative_to(home)
                    or path.name != 'profile' or path.parent.name != 'fcitx5'):
                raise ValueError('Invalid Fcitx profile backup target.')
            current = fingerprint(path)
            if current is None or current == entry.get('installed'):
                continue
            if current['kind'] != 'file' or profile_values(path.read_text(encoding='utf-8')) != entry['fcitx_profile_values']:
                raise ValueError(f'Fcitx profile changed since installation; preserve your changes before restoring: {path}')
            normalized.append((entry, path, current))
        for entry, path, current in normalized:
            saved = directory / ('.fcitx-profile-before-restore-' + uuid.uuid4().hex)
            shutil.copy2(path, saved)
            entry['installed'] = current
            entry['fcitx_normalized_copy'] = saved.name
        if normalized:
            temporary = directory / ('manifest-restore-' + uuid.uuid4().hex + '.tmp')
            temporary.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
            temporary.replace(manifest_path)
        restore(directory, home)
        succeeded = True
    finally:
        if restarted and not succeeded:
            _start_fcitx(ctx)
    print('  Input settings restored. Log out of the desktop and log in again before using the restored input method.')


def configure_japanese_input(ctx):
    if ctx.platform != 'native':
        raise ValueError('japanese-input requires native GNOME; use the Windows IME for WSL terminals.')
    require_session()
    for command in ('fcitx5', 'fcitx5-remote', 'gdbus', 'im-config'):
        if not shutil.which(command):
            raise ValueError(f'Japanese input requires {command}. Rerun without --configs-only first.')
    sources = ctx.runner.capture(['gsettings', 'get', SCHEMA, 'sources'])
    kept, layout = input_sources(sources)
    restarted = _stop_fcitx(ctx)
    try:
        targets = [ctx.config / 'fcitx5/config', ctx.config / 'fcitx5/profile']
        # Prepare/validate everything before any file or GNOME setting changes.
        original = [path.read_text(encoding='utf-8') if path.exists() else '' for path in targets]
        contents = [configure_global(original[0]), configure_profile(original[1], layout)]
        semantic_profile = profile_values(contents[1])
        for path, content in zip(targets, contents):
            ctx.backup.write_text(path, content)
        for entry in ctx.backup.entries:
            if entry.get('path') == str(targets[1].absolute()):
                entry['fcitx_profile_values'] = semantic_profile
        ctx.backup.save()
        ctx.backup.write_text(ctx.home / '.xinputrc',
                              '# Managed by dotfiles. Ubuntu im-config starts Fcitx 5 on X11 and Wayland.\nrun_im fcitx5\n')
        ctx.backup.set_setting(SCHEMA, 'sources', repr(kept), ctx.runner)
    finally:
        if restarted:
            _start_fcitx(ctx)
    print('  Japanese input configured: right Alt / Henkan = on; left Alt / Muhenkan = off.')
    print('  Log out of the desktop and log in again to apply the input method environment to every application.')
