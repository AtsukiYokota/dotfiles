#!/usr/bin/env python3
"""Drive real Ubuntu Fcitx5/Mozc hotkeys using a private D-Bus and temporary HOME.

No desktop/display is used. --portable-deps downloads/extracts packages without
installing them; that mode checks the real engine and hotkeys but skips Mozc
conversion because its server launcher uses /usr/lib/mozc/mozc_server.
"""
from __future__ import annotations

import argparse
import hashlib
import os
from pathlib import Path
import platform
import re
import shlex
import shutil
import signal
import subprocess
import sys
import sysconfig
import tempfile
import time
from types import SimpleNamespace

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
from japanese_input import GROUP, _start_fcitx, configure_global, configure_profile, parse_ini, profile_values
from runtime import Runner

PACKAGES = ('fcitx5', 'fcitx5-data', 'fcitx5-modules', 'libfcitx5config6',
            'libfcitx5core7', 'libfcitx5utils2', 'fcitx5-mozc', 'fcitx-mozc-data')


def dependencies(work):
    download = work / 'debs'
    download.mkdir()
    # These ABI package names change across Ubuntu releases. Resolve them from
    # the host's authenticated APT metadata instead of pinning Noble libraries.
    metadata = subprocess.check_output(['apt-cache', 'depends', 'fcitx5-mozc'], text=True)
    libraries = re.findall(r'Depends:\s+(lib(?:absl|protobuf)[A-Za-z0-9.+-]*)', metadata)
    codename = platform.freedesktop_os_release()['VERSION_CODENAME']
    specs = []
    for name in (*PACKAGES, *sorted(set(libraries))):
        rows = subprocess.check_output(['apt-cache', 'madison', name], text=True).splitlines()
        versions = [row.split('|')[1].strip() for row in rows
                    if len(row.split('|')) == 3 and f' {codename}/' in row.split('|')[2]]
        if not versions:
            raise RuntimeError(f'No {codename} release metadata for {name}.')
        specs.append(name + '=' + versions[0])
    subprocess.run(['apt-get', 'download', *specs], cwd=download, check=True, timeout=180)
    prefix = work / 'dependencies'
    for archive in sorted(download.glob('*.deb')):
        subprocess.run(['dpkg-deb', '--extract', str(archive), str(prefix)], check=True, timeout=60)
    return prefix


def inner(work, executable, portable):
    import dbus

    # The parent invokes us under dbus-run-session with every display unset.
    if os.environ.get('DOTFILES_PRIVATE_IME_CHECK') != str(work):
        raise RuntimeError('This check must run in its private session.')
    originals = {name: (Path.home() / '.config/fcitx5' / name).read_text(encoding='utf-8')
                 for name in ('config', 'profile')}
    log = work / 'fcitx.log'
    with log.open('w', encoding='utf-8') as output:
        process = subprocess.Popen([str(executable), '--disable=all',
                                    '--enable=keyboard,dbus,dbusfrontend,mozc'],
                                   stdout=output, stderr=subprocess.STDOUT,
                                   start_new_session=True)
        try:
            bus = dbus.SessionBus()
            deadline = time.monotonic() + 12
            while not bus.name_has_owner('org.fcitx.Fcitx5'):
                if process.poll() is not None or time.monotonic() >= deadline:
                    raise RuntimeError('Private Fcitx5 failed to start.\n' + log.read_text())
                time.sleep(0.05)
            control = dbus.Interface(bus.get_object('org.fcitx.Fcitx5', '/controller'),
                                     'org.fcitx.Fcitx.Controller1')
            available = control.AvailableInputMethods()
            assert any(str(item[0]) == 'mozc' for item in available), 'Mozc was not discovered'
            frontend = dbus.Interface(bus.get_object('org.fcitx.Fcitx5',
                                       '/org/freedesktop/portal/inputmethod'),
                                      'org.fcitx.Fcitx.InputMethod1')
            path, _ = frontend.CreateInputContext(dbus.Array(
                [('program', 'dotfiles-ime-check')], signature='(ss)'))
            context = dbus.Interface(bus.get_object('org.fcitx.Fcitx5', path),
                                    'org.fcitx.Fcitx.InputContext1')
            context.FocusIn()
            started = {name: (Path.home() / '.config/fcitx5' / name).read_text(encoding='utf-8')
                       for name in originals}

            def state(expected, note):
                actual = str(control.CurrentInputMethod())
                assert actual == expected, f'{note}: {actual!r}, expected {expected!r}'

            def key(symbol, modifiers=0, release=False):
                return bool(context.ProcessKeyEvent(dbus.UInt32(symbol), dbus.UInt32(0),
                            dbus.UInt32(modifiers), dbus.Boolean(release), dbus.UInt32(0)))

            def tap(symbol, modifier=0):
                key(symbol)
                key(symbol, modifier, True)

            right_alt, left_alt, alt = 0xFFEA, 0xFFE9, 8
            henkan, muhenkan, right, shift = 0xFF23, 0xFF22, 0xFF53, 0xFFE1
            state('keyboard-us', 'English login default')
            tap(shift, 1)
            state('keyboard-us', 'Shift alone must not toggle')
            key(right_alt)
            state('keyboard-us', 'Right Alt press waits for release')
            key(right_alt, alt, True)
            state('mozc', 'Right Alt tap activates Mozc')
            tap(right_alt, alt)
            state('mozc', 'Repeated activation is directional')
            key(left_alt)
            state('mozc', 'Left Alt press waits for release')
            key(left_alt, alt, True)
            state('keyboard-us', 'Left Alt tap deactivates Mozc')
            tap(left_alt, alt)
            state('keyboard-us', 'Repeated deactivation is directional')
            for symbol, expected in ((henkan, 'mozc'), (henkan, 'mozc'),
                                     (muhenkan, 'keyboard-us'), (muhenkan, 'keyboard-us')):
                tap(symbol)
                state(expected, 'JIS directional key')
            key(right_alt)
            assert not key(right, alt), 'Inactive Alt+Right must reach the application'
            key(right, alt, True)
            key(right_alt, alt, True)
            state('keyboard-us', 'Alt+Right must cancel the pending activation')
            tap(henkan)
            key(left_alt)
            key(right, alt)
            key(right, alt, True)
            key(left_alt, alt, True)
            state('mozc', 'Alt+Right must cancel the pending deactivation')
            if not portable:
                committed = []
                for symbol in [*map(ord, 'nihon'), 0x20, 0xFF0D]:
                    events, _ = context.ProcessKeyEventBatch(dbus.UInt32(symbol), dbus.UInt32(0),
                                         dbus.UInt32(0), dbus.Boolean(False), dbus.UInt32(0))
                    committed.extend(str(value) for kind, value in events if int(kind) == 0)
                    key(symbol, 0, True)
                assert ''.join(committed) == '日本', f'Mozc conversion failed: {committed!r}'
            context.DestroyIC()
            control.Exit()
            process.wait(timeout=5)
            for name, previous in originals.items():
                current = (Path.home() / '.config/fcitx5' / name).read_text(encoding='utf-8')
                if name == 'profile':
                    assert profile_values(previous) == profile_values(current), 'Fcitx changed profile semantics on shutdown'
                    reapplied = configure_profile(current, 'us')
                    assert profile_values(reapplied) == profile_values(current), 'Reconfiguration changed normalized profile semantics'
                    groups = [values['Name'] for section, values in parse_ini(reapplied).items()
                              if section.startswith('Groups/') and section.count('/') == 1]
                    assert groups.count(GROUP) == 1, 'Reconfiguration duplicated the Japanese group'
                if previous != current:
                    old_values, new_values = parse_ini(previous), parse_ini(current)
                    changed = [(f'{section}/{key}', value, new_values.get(section, {}).get(key))
                               for section, values in old_values.items()
                               for key, value in values.items()
                               if new_values.get(section, {}).get(key) != value]
                    print(f'Fcitx normalized {name} on exit; configured values changed: {changed!r}.')
                    print(f'Already rewritten on startup: {started[name] != previous}.')
                    if os.environ.get('DOTFILES_IME_SHOW_NORMALIZATION'):
                        import difflib
                        print(''.join(difflib.unified_diff(previous.splitlines(True), current.splitlines(True))))
            # Exercise the production restart helper with the real daemon.
            # Restrict addons in a wrapper so no display/IBus frontend can reach
            # the user's desktop, even if the machine has those addons installed.
            tools = work / 'bin'
            tools.mkdir()
            wrapper = tools / 'fcitx5'
            wrapper.write_text('#!/bin/sh\nexec ' + shlex.quote(str(executable))
                               + ' --disable=all --enable=keyboard,dbus,dbusfrontend,mozc "$@"\n',
                               encoding='utf-8')
            wrapper.chmod(0o755)
            previous_path = os.environ['PATH']
            try:
                os.environ['PATH'] = str(tools) + os.pathsep + previous_path
                start = time.monotonic()
                _start_fcitx(SimpleNamespace(runner=Runner(work / 'restart.log')))
                assert time.monotonic() - start < 10, 'Detached daemon startup waited for retained output pipes'
                restarted_control = dbus.Interface(bus.get_object('org.fcitx.Fcitx5', '/controller'),
                                                    'org.fcitx.Fcitx.Controller1')
                restarted_control.Exit()
                deadline = time.monotonic() + 5
                while bus.name_has_owner('org.fcitx.Fcitx5'):
                    if time.monotonic() >= deadline:
                        raise RuntimeError('Restarted private daemon did not exit cleanly.')
                    time.sleep(0.05)
            finally:
                os.environ['PATH'] = previous_path
        except BaseException:
            print(log.read_text(encoding='utf-8'), file=sys.stderr)
            raise
        finally:
            # Kill only this test-created process group, never a user IME.
            try:
                os.killpg(process.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            if process.poll() is None:
                process.wait(timeout=5)
            # Mozc may daemonize out of the original process group. Identify
            # only a server inheriting this unique test marker, never a user's
            # normal IME process, and terminate it before deleting its HOME.
            marker = b'DOTFILES_PRIVATE_IME_CHECK=' + str(work).encode() + b'\0'
            for candidate in Path('/proc').glob('[0-9]*'):
                try:
                    if ((candidate / 'comm').read_text().strip() in ('mozc_server', 'fcitx5')
                            and marker in (candidate / 'environ').read_bytes()):
                        os.kill(int(candidate.name), signal.SIGTERM)
                except (OSError, ProcessLookupError):
                    pass
    print('Real Fcitx5/Mozc: config, default state, US/JIS keys, Alt chords, normalized profile reuse, and detached restart OK.'
          + (' Portable mode: conversion is checked in CI with the installed Mozc server.' if portable
             else ' Japanese conversion: nihon -> 日本 OK.'))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--portable-deps', action='store_true')
    parser.add_argument('--inner', type=Path, help=argparse.SUPPRESS)
    parser.add_argument('--executable', type=Path, help=argparse.SUPPRESS)
    args = parser.parse_args()
    if args.inner:
        inner(args.inner, args.executable, args.portable_deps)
        return
    if sys.platform != 'linux' or os.geteuid() == 0:
        raise RuntimeError('Run as a regular Ubuntu user, without sudo.')
    release = platform.freedesktop_os_release()
    if release.get('ID') != 'ubuntu' or release.get('VERSION_ID') not in ('24.04', '26.04'):
        raise RuntimeError('This real-package check targets Ubuntu 26.04 or 24.04.')
    if not shutil.which('dbus-run-session'):
        raise RuntimeError('Install dbus-daemon for this test.')
    import dbus  # Fail before downloads when python3-dbus is unavailable.
    status = Path('/var/lib/dpkg/status')
    initial_status = hashlib.sha256(status.read_bytes()).hexdigest()
    try:
        with tempfile.TemporaryDirectory(prefix='dotfiles-ime-check-') as temporary:
            work = Path(temporary)
            home, runtime = work / 'home', work / 'runtime'
            home.mkdir()
            runtime.mkdir(mode=0o700)
            config = home / '.config/fcitx5'
            config.mkdir(parents=True)
            (config / 'config').write_text(configure_global(''), encoding='utf-8')
            (config / 'profile').write_text(configure_profile('', 'us'), encoding='utf-8')
            environment = os.environ.copy()
            for name in ('DISPLAY', 'WAYLAND_DISPLAY', 'DBUS_SESSION_BUS_ADDRESS', 'DBUS_SESSION_BUS_PID',
                         'IBUS_ADDRESS', 'FCITX_ADDON_DIRS', 'FCITX_DATA_DIRS', 'FCITX_CONFIG_HOME',
                         'FCITX_CONFIG_DIRS', 'FCITX_DATA_HOME'):
                environment.pop(name, None)
            environment.update(HOME=str(home), XDG_CONFIG_HOME=str(home / '.config'),
                               XDG_DATA_HOME=str(home / '.local/share'), XDG_CACHE_HOME=str(home / '.cache'),
                               XDG_RUNTIME_DIR=str(runtime), XDG_CURRENT_DESKTOP='', XDG_SESSION_TYPE='',
                               DOTFILES_PRIVATE_IME_CHECK=str(work), PYTHONDONTWRITEBYTECODE='1',
                               LC_ALL='C.UTF-8', LANG='C.UTF-8')
            if args.portable_deps:
                prefix = dependencies(work)
                lib = prefix / 'usr/lib' / sysconfig.get_config_var('MULTIARCH')
                environment.update(LD_LIBRARY_PATH=str(lib), FCITX_ADDON_DIRS=str(lib / 'fcitx5'),
                                   FCITX_DATA_DIRS=str(prefix / 'usr/share/fcitx5'))
                executable = prefix / 'usr/bin/fcitx5'
            else:
                executable = Path(shutil.which('fcitx5') or '/missing/fcitx5')
                if not executable.is_file() or not Path('/usr/lib/mozc/mozc_server').is_file():
                    raise RuntimeError('Install fcitx5 fcitx5-mozc, or use --portable-deps.')
            command = ['dbus-run-session', '--', sys.executable, '-B', str(Path(__file__).resolve()),
                       '--inner', str(work), '--executable', str(executable)]
            if args.portable_deps:
                command.append('--portable-deps')
            subprocess.run(command, env=environment, check=True, timeout=90)
    finally:
        assert hashlib.sha256(status.read_bytes()).hexdigest() == initial_status, 'OS package state changed'


if __name__ == '__main__':
    main()
