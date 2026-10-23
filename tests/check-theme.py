#!/usr/bin/env python3
"""Build the pinned WhiteSur assets in temporary directories, without installing.

Run on Ubuntu 24.04, including WSL. Missing build tools can be downloaded as
.deb files and unpacked into the test directory with --portable-deps. No apt
install, sudo, real desktop session or persistent gsettings writes are used.
This validates compilation/artifacts, not native GNOME visual appearance.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import shutil
import stat
import subprocess
import sys
import sysconfig
import tempfile
from types import SimpleNamespace

sys.dont_write_bytecode = True
REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / 'installer'))
from runtime import Runner
import theme


def snapshot(root: Path):
    """Record metadata without following symlinks or printing private filenames."""
    result = {}
    if not root.exists() and not root.is_symlink():
        return result
    candidates = [root]
    if root.is_dir() and not root.is_symlink():
        for directory, folders, files in os.walk(root, followlinks=False):
            candidates.extend(Path(directory) / name for name in folders + files)
    for path in candidates:
        info = path.lstat()
        result[str(path)] = (info.st_mode, info.st_size, info.st_mtime_ns,
                             os.readlink(path) if stat.S_ISLNK(info.st_mode) else None)
    return result


def executable(path: Path, content: str):
    path.write_text(content, encoding='utf-8', newline='\n')
    path.chmod(0o755)


def prepare_tools(root: Path, portable: bool):
    needed = ('sassc', 'glib-compile-resources', 'xmllint', 'gtk-update-icon-cache')
    missing = [name for name in needed if not shutil.which(name)]
    prefix = root / 'dependencies'
    prefix.mkdir()
    if missing:
        if not portable:
            raise RuntimeError('Missing tools: ' + ', '.join(missing) + '. Rerun with --portable-deps.')
        packages = set()
        if 'sassc' in missing:
            packages.update(('sassc', 'libsass1'))
        if 'glib-compile-resources' in missing:
            packages.update(('libglib2.0-dev-bin', 'libglib2.0-0t64'))
        if 'xmllint' in missing:
            packages.update(('libxml2-utils', 'libxml2'))
        if 'gtk-update-icon-cache' in missing:
            packages.add('gtk-update-icon-cache')
        downloads = root / 'debs'
        downloads.mkdir()
        # apt-get download verifies packages against the configured APT metadata.
        # It writes to cwd; no system package lists or installation state change.
        # Use the immutable release pocket for test tools: an old local index
        # may refer to updates that mirrors have already replaced (HTTP 404).
        # This does not change the production installer's package selection.
        specifications = []
        for name in sorted(packages):
            rows = subprocess.check_output(['apt-cache', 'madison', name], text=True).splitlines()
            release = [row.split('|')[1].strip() for row in rows if len(row.split('|')) == 3 and ' noble/' in row.split('|')[2]]
            if not release:
                raise RuntimeError(f'The local APT index has no noble release entry for {name}.')
            specifications.append(name + '=' + release[0])
        command = ['apt-get', 'download', *specifications]
        print('Downloading temporary build dependencies:', ', '.join(sorted(packages)), flush=True)
        subprocess.run(command, cwd=downloads, check=True, timeout=180)
        for archive in sorted(downloads.glob('*.deb')):
            details = subprocess.check_output(['dpkg-deb', '--field', str(archive), 'Package', 'Version'], text=True)
            print(details.strip(), flush=True)
            subprocess.run(['dpkg-deb', '--extract', str(archive), str(prefix)], check=True, timeout=60)
    return prefix


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--portable-deps', action='store_true', help='download/unpack missing tools in the temporary directory')
    args = parser.parse_args()
    if sys.platform != 'linux' or os.geteuid() == 0:
        parser.error('Run as a regular Linux user, without sudo.')
    release = platform.freedesktop_os_release()
    if release.get('ID') != 'ubuntu' or release.get('VERSION_ID') != '24.04':
        parser.error('This dependency adapter targets Ubuntu 24.04.')

    actual_home = Path.home()
    protected = [actual_home / name for name in ('.themes', '.local/share/icons', '.config/gtk-4.0', '.config/dconf')]
    protected += [Path('/usr/share/themes'), Path('/usr/share/icons')]
    before = {str(path): snapshot(path) for path in protected}
    package_status = Path('/var/lib/dpkg/status')
    package_digest = hashlib.sha256(package_status.read_bytes()).hexdigest()
    original_env = dict(os.environ)
    try:
        with tempfile.TemporaryDirectory(prefix='dotfiles-theme-test-') as temp:
            root = Path(temp)
            home = root / 'home'
            home.mkdir()
            work = root / 'work'
            work.mkdir()
            prefix = prepare_tools(root, args.portable_deps)
            fakebin = root / 'fakebin'
            fakebin.mkdir()
            calls = root / 'desktop-calls.jsonl'
            executable(fakebin / 'gsettings', '''#!/usr/bin/python3
import json, os, sys
with open(os.environ['THEME_TEST_CALLS'], 'a', encoding='utf-8') as stream:
    stream.write(json.dumps(sys.argv[1:]) + '\\n')
if len(sys.argv) > 1 and sys.argv[1] == 'get':
    print("'Adwaita'")
''')
            executable(fakebin / 'gnome-shell', '#!/bin/sh\nprintf "GNOME Shell 46.0\\n"\n')
            for name in ('sudo', 'pkexec', 'dconf', 'apt', 'apt-get'):
                executable(fakebin / name, '#!/bin/sh\nprintf "Forbidden desktop/system command: %s\\n" "$0" >&2\nexit 125\n')
            libraries = prefix / 'usr/lib' / sysconfig.get_config_var('MULTIARCH')
            runtime = root / 'runtime'
            runtime.mkdir(mode=0o700)
            os.environ.update({
                'HOME': str(home), 'XDG_CONFIG_HOME': str(home / '.config'),
                'XDG_DATA_HOME': str(home / '.local/share'), 'XDG_STATE_HOME': str(home / '.local/state'),
                'XDG_CACHE_HOME': str(home / '.cache'), 'XDG_RUNTIME_DIR': str(runtime),
                'DBUS_SESSION_BUS_ADDRESS': '', 'DBUS_SYSTEM_BUS_ADDRESS': 'unix:path=/nonexistent',
                'GSETTINGS_BACKEND': 'memory', 'DISPLAY': '', 'WAYLAND_DISPLAY': '',
                'PATH': os.pathsep.join((str(fakebin), str(prefix / 'usr/bin'), '/usr/bin', '/bin')),
                'LD_LIBRARY_PATH': str(libraries), 'THEME_TEST_CALLS': str(calls), 'TERM': 'xterm',
            })
            for name in ('sassc', 'glib-compile-resources', 'xmllint', 'gtk-update-icon-cache'):
                if not shutil.which(name):
                    raise RuntimeError('Temporary tool setup is incomplete: ' + name)
                flag = '--help' if name == 'gtk-update-icon-cache' else '--version'
                subprocess.run([name, flag], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=15)
            log = root / 'build.log'
            ctx = SimpleNamespace(home=home, temp=work, runner=Runner(log))
            destination = home / '.local/share/dotfiles/themes' / theme.BUILD_ID
            # Deliberately bypass only the native desktop gate. This invokes the
            # real production archive checks, source adapter and upstream builds.
            theme._build(ctx, destination)
            theme._validate_artifacts(destination)
            assert json.loads((destination / 'sources.json').read_text()) == theme.SOURCES
            for relative in ('gtk-3.0/gtk.css', 'gtk-3.0/gtk-dark.css', 'gtk-4.0/gtk.css', 'gnome-shell/gnome-shell.css'):
                css = destination / 'themes' / theme.THEME_NAME / relative
                assert css.is_file() and css.stat().st_size > 1000, f'Compiled stylesheet missing or unexpectedly small: {relative}'
            for name in theme.ICON_NAMES:
                assert (destination / 'icons' / name / 'index.theme').is_file(), f'Icon manifest missing: {name}'
            desktop_calls = [json.loads(line) for line in calls.read_text().splitlines()] if calls.exists() else []
            assert not any(call and call[0] in ('set', 'reset', 'reset-recursively') for call in desktop_calls), 'Upstream build tried to change desktop settings'
            output = log.read_text()
            assert 'Theme scripts cannot run sudo' not in output and 'Forbidden desktop/system command:' not in output
            assert not (home / '.config/gtk-4.0').exists(), 'Build wrote a libadwaita override'
            print('WhiteSur real build passed: GTK3/GTK4/Shell CSS, icon variants, cursors and confined symlinks.', flush=True)
            print('Archive hashes verified; desktop settings, OS packages and native appearance were not changed.', flush=True)
    finally:
        os.environ.clear()
        os.environ.update(original_env)
        after = {str(path): snapshot(path) for path in protected}
        if after != before:
            raise AssertionError('A protected desktop asset directory changed during the test.')
        if hashlib.sha256(package_status.read_bytes()).hexdigest() != package_digest:
            raise AssertionError('System package installation state changed during the test.')


if __name__ == '__main__':
    main()
