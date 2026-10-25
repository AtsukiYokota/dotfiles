"""Native GNOME launcher installation and reversible, user-local setup."""
from __future__ import annotations

import ast
import os
from pathlib import Path
import re
import shutil
import subprocess

from runtime import is_wsl

MEDIA_SCHEMA = 'org.gnome.settings-daemon.plugins.media-keys'
CUSTOM_SCHEMA = MEDIA_SCHEMA + '.custom-keybinding'
CUSTOM_PATH = '/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/dotfiles-launcher/'
CUSTOM_TARGET = CUSTOM_SCHEMA + ':' + CUSTOM_PATH
SHORTCUT = '<Primary>space'
COMMAND = '/usr/bin/albert toggle'
SHORTCUT_SCHEMAS = ('org.gnome.desktop.wm.keybindings', 'org.gnome.shell.keybindings', MEDIA_SCHEMA)


def require_session():
    if is_wsl():
        raise ValueError('The launcher requires native GNOME; WSL is unsupported.')
    if ('gnome' not in os.environ.get('XDG_CURRENT_DESKTOP', '').lower()
            or not os.environ.get('DBUS_SESSION_BUS_ADDRESS')):
        raise ValueError('Run launcher inside your native GNOME desktop session.')
    if not shutil.which('gsettings'):
        raise ValueError('The launcher requires gsettings (libglib2.0-bin).')


def _capture(runner, argv):
    if runner is not None:
        return runner.capture(argv)
    return subprocess.check_output(argv, text=True, encoding='utf-8').strip()


def _value(raw):
    raw = raw.strip()
    if raw.startswith('@as '):
        raw = raw[4:]
    try:
        return ast.literal_eval(raw)
    except (SyntaxError, ValueError) as exc:
        raise ValueError('Unexpected GNOME shortcut setting; leave it unchanged.') from exc


def _uses_shortcut(binding):
    if not isinstance(binding, str):
        return False
    # GNOME accepts these spellings for the same physical shortcut.
    return bool(re.fullmatch(r'<(?:primary|control|ctrl)>space', binding.lower()))


def check_launcher_shortcut(runner=None):
    """Read settings before changes; never take another application's hotkey."""
    raw = _capture(runner, ['gsettings', 'get', MEDIA_SCHEMA, 'custom-keybindings'])
    paths = _value(raw)
    if (not isinstance(paths, list) or any(not isinstance(path, str)
            or not re.fullmatch(r'/(?:[A-Za-z0-9_-]+/)+', path) for path in paths)
            or len(paths) != len(set(paths))):
        raise ValueError('Unexpected GNOME custom shortcut paths; leave them unchanged.')
    for path in paths:
        target = CUSTOM_SCHEMA + ':' + path
        binding = _value(_capture(runner, ['gsettings', 'get', target, 'binding']))
        if path != CUSTOM_PATH and _uses_shortcut(binding):
            raise ValueError('Ctrl+Space already belongs to another GNOME custom shortcut. '
                             'Change that shortcut in Settings > Keyboard, or deselect launcher.')
    current_command = _value(_capture(runner, ['gsettings', 'get', CUSTOM_TARGET, 'command']))
    if current_command not in ('', COMMAND):
        raise ValueError('The dotfiles launcher shortcut path is already used by another command. '
                         'Inspect it in GNOME Keyboard settings before retrying.')
    schemas = set(_capture(runner, ['gsettings', 'list-schemas']).splitlines())
    for schema in SHORTCUT_SCHEMAS:
        if schema not in schemas:
            continue
        settings = _capture(runner, ['gsettings', 'list-recursively', schema])
        for line in settings.splitlines():
            parts = line.split(None, 2)
            if len(parts) != 3 or parts[0] != schema:
                continue
            try:
                value = _value(parts[2])
            except ValueError:
                continue  # Non-shortcut settings can use other GVariant types.
            bindings = value if isinstance(value, list) else [value]
            if any(_uses_shortcut(binding) for binding in bindings):
                raise ValueError(f'Ctrl+Space already belongs to GNOME setting {schema} {parts[1]}. '
                                 'Change it in Settings > Keyboard, or deselect launcher.')
    return paths


def _launcher_running():
    """Inspect this user's processes without opening Albert or its IPC socket."""
    if not hasattr(os, 'getuid'):
        return False
    uid = str(os.getuid())
    for status in Path('/proc').glob('[0-9]*/status'):
        try:
            fields = dict(line.split(':', 1) for line in status.read_text().splitlines() if ':' in line)
        except (OSError, UnicodeError):
            continue  # Processes may exit between enumeration and reading.
        if fields.get('Name', '').strip() == 'albert' and fields.get('Uid', '').split()[:1] == [uid]:
            return True
    return False


def require_installed_launcher():
    executable = Path('/usr/bin/albert')
    if not executable.is_file() or not os.access(executable, os.X_OK):
        raise ValueError('Albert is not installed. Rerun launcher without --configs-only first.')


def require_launcher_stopped():
    if _launcher_running():
        raise ValueError('Quit Albert from its menu before setup or restore, '
                         'so its running process cannot overwrite the settings on exit.')


def preflight_launcher(runner=None, *, configs_only=False):
    require_session()
    require_launcher_stopped()
    if configs_only:
        require_installed_launcher()
    return check_launcher_shortcut(runner)


def launcher_config(text):
    """Change only launcher keys while retaining comments and other Qt settings."""
    lines = text.splitlines(keepends=True)
    section = None
    sections = {}
    values = {}
    for index, line in enumerate(lines):
        stripped = line.strip()
        if not stripped or stripped.startswith(('#', ';')):
            continue
        header = re.fullmatch(r'\[([^\]\r\n]+)\]', stripped)
        if header:
            section = header[1]
            if section in sections:
                raise ValueError('Duplicate Albert configuration section; leave it unchanged.')
            sections[section] = index
        elif '=' in line and section is not None:
            key = line.split('=', 1)[0].strip()
            if (section, key) in values:
                raise ValueError('Duplicate Albert configuration key; leave it unchanged.')
            values[section, key] = index
        else:
            raise ValueError('Unexpected Albert configuration line; leave it unchanged.')
    desired = {'General': {'hotkey': ''}, 'applications': {'enabled': 'true'}}
    # Keep a prior telemetry choice. New installations start without telemetry.
    if ('General', 'telemetry') not in values:
        desired['General']['telemetry'] = 'false'
    for group, entries in desired.items():
        additions = []
        for key, value in entries.items():
            if (group, key) in values:
                lines[values[group, key]] = f'{key}={value}\n'
            else:
                additions.append(f'{key}={value}\n')
        # Insertions are staged separately so earlier replacements retain indices.
        entries['_additions'] = additions
    for group in sorted(desired, key=lambda name: sections.get(name, len(lines)), reverse=True):
        additions = desired[group]['_additions']
        if not additions:
            continue
        if group in sections:
            lines[sections[group] + 1:sections[group] + 1] = additions
        else:
            if lines and not lines[-1].endswith('\n'):
                lines[-1] += '\n'
            if lines and lines[-1].strip():
                lines.append('\n')
            lines.extend([f'[{group}]\n', *additions])
    return ''.join(lines)


def launcher_file_operations(repo, home, config, modules):
    """Share the same recipe with dry-run and deployment; never symlink app state."""
    if 'launcher' not in modules:
        return []
    from planning import FileOperation
    target = config / 'albert/config'
    if target.exists() and not target.is_file():
        raise ValueError(f'Albert configuration is not a regular file: {target}')
    text = target.read_text(encoding='utf-8') if target.exists() else ''
    autostart = ('[Desktop Entry]\nType=Application\nName=Albert\n'
                 'Comment=Search and open applications\nExec=/usr/bin/albert --platform xcb\n'
                 'TryExec=/usr/bin/albert\nIcon=albert\nTerminal=false\n'
                 'OnlyShowIn=GNOME;\nX-GNOME-Autostart-enabled=true\nX-GNOME-Autostart-Delay=3\n')
    return [FileOperation('write', target, content=launcher_config(text)),
            FileOperation('write', config / 'autostart/albert.desktop', content=autostart)]


def install_launcher(ctx):
    if ctx.platform != 'native':
        raise ValueError('The launcher requires native GNOME; WSL is unsupported.')
    version = ctx.versions['albert']
    artifact = version[ctx.arch]
    try:
        installed = ctx.runner.capture(['dpkg-query', '-W', '-f=${Status}\t${Version}', f'albert:{ctx.arch}'])
    except subprocess.CalledProcessError:
        installed = ''
    if installed == 'install ok installed\t' + version['version']:
        return
    archive = ctx.temp / 'albert.deb'
    ctx.runner.download(artifact['url'], archive, artifact['sha256'])
    for field, expected in (('Package', 'albert'), ('Version', version['version']), ('Architecture', ctx.arch)):
        if ctx.runner.capture(['dpkg-deb', '--field', str(archive), field]) != expected:
            raise RuntimeError(f'Unexpected Albert package {field}; installation was not started.')
    # Allow APT's _apt sandbox to read the verified local package.
    ctx.temp.chmod(0o755)
    archive.chmod(0o644)
    ctx.runner.run(['sudo', 'apt-get', 'install', '-y', '--no-remove', '--no-install-recommends', str(archive)])


def configure_launcher(ctx):
    if ctx.platform != 'native':
        raise ValueError('The launcher requires native GNOME; WSL is unsupported.')
    paths = preflight_launcher(ctx.runner, configs_only=True)
    for key, value in (('name', 'Dotfiles application search'), ('command', COMMAND), ('binding', SHORTCUT)):
        ctx.backup.set_setting(CUSTOM_TARGET, key, repr(value), ctx.runner)
    if CUSTOM_PATH not in paths:
        ctx.backup.set_setting(MEDIA_SCHEMA, 'custom-keybindings', repr([*paths, CUSTOM_PATH]), ctx.runner)
