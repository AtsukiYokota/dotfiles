#!/usr/bin/env python3
"""Install and exercise real desktop packages on disposable native Ubuntu CI.

Run under dbus-run-session and xvfb-run. This test installs the pinned Albert
DEB with APT; Flatpak apps, GUI state and settings use a temporary home. It
checks X11 launcher RPC and the Kooha runtime, not native Wayland interaction
or real screen/audio recording through the desktop portal.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
import re
import shlex
import subprocess
import sys
import tempfile
import time
from types import SimpleNamespace

sys.dont_write_bytecode = True
REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / 'installer'))
from deploy import Backup, restore
import desktop_extras as desktop
from flatpak_apps import CAPTURE_ID, install_capture
from planning import apply_file_operations
from runtime import Runner, is_wsl


def checked(argv, *, timeout=60):
    result = subprocess.run([str(arg) for arg in argv], text=True, capture_output=True, timeout=timeout)
    if result.returncode:
        raise AssertionError(f'{argv}: exit {result.returncode}\n{result.stdout}\n{result.stderr}')
    return result.stdout.strip()


def settings_snapshot():
    return {(desktop.MEDIA_SCHEMA, 'custom-keybindings'):
                checked(['gsettings', 'get', desktop.MEDIA_SCHEMA, 'custom-keybindings']),
            **{(desktop.CUSTOM_TARGET, key): checked(['gsettings', 'get', desktop.CUSTOM_TARGET, key])
               for key in ('name', 'command', 'binding')}}


def exercise_launcher(ctx):
    # Preserve a pre-existing application preference and an unrelated shortcut.
    # These are fixtures in the temporary home, never the runner's real state.
    original_config = '# private fixture preferences\n[General]\ntelemetry=false\n[applications]\nenabled=false\n'
    config_file = ctx.config / 'albert/config'
    config_file.parent.mkdir(parents=True)
    config_file.write_text(original_config)
    other = '/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/fixture/'
    checked(['gsettings', 'set', desktop.CUSTOM_SCHEMA + ':' + other, 'binding', "'<Super>e'"])
    checked(['gsettings', 'set', desktop.MEDIA_SCHEMA, 'custom-keybindings', repr([other])])
    before = settings_snapshot()

    desktop.preflight_launcher(ctx.runner)
    desktop.install_launcher(ctx)
    apply_file_operations(ctx)
    desktop.configure_launcher(ctx)
    after = settings_snapshot()
    assert desktop._value(after[desktop.CUSTOM_TARGET, 'binding']) == desktop.SHORTCUT
    assert desktop._value(after[desktop.CUSTOM_TARGET, 'command']) == desktop.COMMAND
    assert desktop._value(after[desktop.MEDIA_SCHEMA, 'custom-keybindings']) == [other, desktop.CUSTOM_PATH]
    assert not config_file.is_symlink() and 'enabled=true' in config_file.read_text()
    assert 'telemetry=false' in config_file.read_text()
    autostart = ctx.config / 'autostart/albert.desktop'
    checked(['desktop-file-validate', autostart])
    first_backup = ctx.backup

    ctx.backup = Backup(ctx.home / 'backups/repeated', ctx.home)
    desktop.install_launcher(ctx)
    apply_file_operations(ctx)
    desktop.configure_launcher(ctx)
    assert ctx.backup.entries == [], 'Repeated configuration changed files or shortcuts'
    restore(first_backup.directory, ctx.home)
    assert settings_snapshot() == before
    assert config_file.read_text() == original_config
    assert not autostart.exists()
    ctx.backup = Backup(ctx.home / 'backups/final', ctx.home)
    apply_file_operations(ctx)
    desktop.configure_launcher(ctx)

    upstream_version = ctx.versions['albert']['version'].split('-', 1)[0]
    assert upstream_version in checked(['/usr/bin/albert', '--version'])
    # Suppress only the fixture's interactive welcome dialog. Production setup
    # deliberately leaves this app-owned state to Albert itself.
    state = ctx.data.parent / 'albert/state'
    state.parent.mkdir(parents=True)
    state.write_text('[General]\nlast_used_version=' + upstream_version + '\n')
    command = next(line.removeprefix('Exec=') for line in autostart.read_text().splitlines()
                   if line.startswith('Exec='))
    log = ctx.temp / 'albert-startup.log'
    with log.open('w') as output:
        process = subprocess.Popen(shlex.split(command), stdout=output, stderr=subprocess.STDOUT)
        try:
            deadline = time.monotonic() + 35
            report = ''
            while time.monotonic() < deadline:
                if process.poll() is not None:
                    raise AssertionError('Albert exited during startup.\n' + log.read_text())
                response = subprocess.run(['/usr/bin/albert', 'report'], text=True,
                                          capture_output=True, timeout=8)
                # The socket is created before the frontend and RPC handler.
                # A successful but empty response does not prove readiness.
                if response.returncode == 0 and 'Albert version:' in response.stdout:
                    report = response.stdout
                    break
                time.sleep(0.1)
            if not report:
                raise AssertionError('Albert did not finish initializing.\n' + log.read_text())
            # The report contains the process environment; never print it in CI
            # on failure. Its presence proves the frontend/RPC handler is ready.
            assert upstream_version in report, 'Albert reported an unexpected version'
            # Exercise the exact command installed for the GNOME shortcut.
            checked(shlex.split(desktop.COMMAND), timeout=10)
            checked(shlex.split(desktop.COMMAND), timeout=10)
            assert process.poll() is None, log.read_text()
            checked(['/usr/bin/albert', 'quit'], timeout=10)
            process.wait(timeout=15)
            assert process.returncode == 0, log.read_text()
        finally:
            if process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait(timeout=5)
    print('Albert: verified DEB, repeat install, local configuration, GNOME shortcut/restore and toggle/quit RPC passed.', flush=True)


def exercise_capture(ctx):
    first_origin = install_capture(ctx)
    first_commit = checked(['flatpak', 'info', '--user', '--show-commit', CAPTURE_ID + '//stable'])
    assert re.fullmatch(r'[0-9a-f]{64}', first_commit), first_commit
    assert checked(['flatpak', 'info', '--user', '--show-origin', CAPTURE_ID + '//stable']) == first_origin
    assert install_capture(ctx) == first_origin
    current_commit = checked(['flatpak', 'info', '--user', '--show-commit', CAPTURE_ID + '//stable'])
    # Flathub may publish a new stable commit between installs. Both executions
    # must finish with a valid commit and retain the verified origin.
    assert re.fullmatch(r'[0-9a-f]{64}', current_commit), current_commit
    assert checked(['flatpak', 'info', '--user', '--show-origin', CAPTURE_ID + '//stable']) == first_origin
    help_text = checked(['flatpak', 'run', '--user', '--command=kooha', CAPTURE_ID, '--help'], timeout=90)
    assert '--help' in help_text, help_text
    print('Kooha: signed Flathub stable install/update, origin retention and packaged executable startup passed.', flush=True)
    print('Native Wayland hotkey behavior and portal-approved screen/audio recording require a desktop check.', flush=True)


def main():
    if os.environ.get('GITHUB_ACTIONS') != 'true' or sys.platform != 'linux' or os.geteuid() == 0:
        raise SystemExit('Run this package-installing check only as a regular user in disposable GitHub Actions CI.')
    if is_wsl() or not os.environ.get('DISPLAY') or not os.environ.get('DBUS_SESSION_BUS_ADDRESS'):
        raise SystemExit('Run in native Ubuntu CI under dbus-run-session -- xvfb-run -a.')
    arch = checked(['dpkg', '--print-architecture'])
    versions = json.loads((REPO / 'installer/versions.json').read_text())
    release = dict(line.split('=', 1) for line in Path('/etc/os-release').read_text().splitlines() if '=' in line)
    version = release.get('VERSION_ID', '').strip('"')
    if release.get('ID', '').strip('"') != 'ubuntu' or f'xUbuntu_{version}/' not in versions['albert'][arch]['url']:
        raise SystemExit('The checked-out Albert package must match the CI Ubuntu release and architecture.')
    saved = dict(os.environ)
    try:
        with tempfile.TemporaryDirectory(prefix='dotfiles-desktop-extras-') as temporary:
            root = Path(temporary)
            root.chmod(0o755)  # APT's _apt user reads only the verified download.
            home = root / 'home with spaces'
            config, data = home / '.config', home / '.local/share/dotfiles'
            temp, runtime = root / 'downloads', home / 'runtime'
            for directory in (home, config, data, temp, runtime):
                directory.mkdir(parents=True, exist_ok=True)
            runtime.chmod(0o700)
            os.environ.update(HOME=str(home), XDG_CONFIG_HOME=str(config), XDG_DATA_HOME=str(data.parent),
                              XDG_CACHE_HOME=str(home / '.cache'), XDG_STATE_HOME=str(home / '.local/state'),
                              XDG_RUNTIME_DIR=str(runtime), FLATPAK_USER_DIR=str(data.parent / 'flatpak'),
                              XDG_CURRENT_DESKTOP='GNOME', XDG_SESSION_TYPE='x11', GSETTINGS_BACKEND='keyfile',
                              LANG='C.UTF-8', LC_ALL='C.UTF-8', QT_QPA_PLATFORM='xcb')
            os.environ.pop('WAYLAND_DISPLAY', None)
            # D-Bus is private to this CI invocation. Keep any activated helpers
            # in the same temporary home instead of the daemon's inherited home.
            checked(['dbus-update-activation-environment', 'HOME', 'XDG_CONFIG_HOME', 'XDG_DATA_HOME',
                     'XDG_CACHE_HOME', 'XDG_STATE_HOME', 'XDG_RUNTIME_DIR', 'GSETTINGS_BACKEND',
                     'XDG_CURRENT_DESKTOP', 'XDG_SESSION_TYPE', 'DISPLAY'])
            ctx = SimpleNamespace(repo=REPO, home=home, config=config, data=data, temp=temp,
                                  arch=arch, platform='native', versions=versions,
                                  modules=['launcher', 'screen-capture'],
                                  backup=Backup(home / 'backups/first', home), runner=Runner(root / 'installer.log'))
            exercise_launcher(ctx)
            exercise_capture(ctx)
    finally:
        os.environ.clear()
        os.environ.update(saved)


if __name__ == '__main__':
    main()
