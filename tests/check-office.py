#!/usr/bin/env python3
"""Check the pinned official ibisOffice runtime without opening its GUI or installing it."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys
import tempfile
from types import SimpleNamespace

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
from deploy import Backup, restore
from office import configure_office, install_office, office_directory
from runtime import Runner


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--appimage', type=Path, help='Reuse a local AppImage, still checking its pinned SHA-256.')
    parser.add_argument('--runtime-only', action='store_true',
                        help='Check only the standalone runtime/icon when GUI libraries or desktop tools are unavailable.')
    args = parser.parse_args()
    if sys.platform != 'linux' or platform.machine() != 'x86_64':
        raise RuntimeError('Run the real ibisOffice runtime check on Linux x86_64.')
    if not args.runtime_only:
        for command in ('desktop-file-validate', 'update-desktop-database'):
            if not shutil.which(command):
                raise RuntimeError(f'The full office integration check requires {command}.')
    versions = json.loads((ROOT / 'installer/versions.json').read_text(encoding='utf-8'))
    with tempfile.TemporaryDirectory(prefix='dotfiles-office-check-') as temporary:
        home = Path(temporary)
        environment = dict(os.environ, HOME=str(home), XDG_DATA_HOME=str(home / '.local/share'),
                           XDG_CONFIG_HOME=str(home / '.config'), XDG_CACHE_HOME=str(home / '.cache'))
        # install_office invokes only the runtime's extract-icon option. Keep its
        # subprocesses confined to the same temporary user environment.
        os.environ.update({key: environment[key] for key in
                           ('HOME', 'XDG_DATA_HOME', 'XDG_CONFIG_HOME', 'XDG_CACHE_HOME')})
        runner = Runner(home / 'check.log')
        if args.appimage:
            source = args.appimage.resolve(strict=True)

            def download(url, destination, expected):
                with source.open('rb') as stream:
                    actual = hashlib.file_digest(stream, 'sha256').hexdigest()
                if actual != expected:
                    raise RuntimeError('Local AppImage SHA-256 mismatch.')
                shutil.copyfile(source, destination)
            runner.download = download
        ctx = SimpleNamespace(home=home, data=home / '.local/share/dotfiles', temp=home / 'temp',
                              platform='native', arch='amd64', versions=versions, runner=runner,
                              backup=Backup(home / 'backup', home))
        ctx.temp.mkdir()
        install_office(ctx)
        install_office(ctx)
        directory = office_directory(ctx)
        app = directory / 'ibisOffice.AppImage'
        with app.open('rb') as stream:
            assert stream.read(4) == b'\x7fELF', 'Official artifact is not an ELF AppImage'
        result = subprocess.run([str(app), '--appimage-version'], env=environment, check=True,
                                capture_output=True, text=True, timeout=15)
        assert 'ibis-appimage' in result.stdout + result.stderr, 'Unexpected AppImage runtime identity'
        # Runtime version differs from the office-suite version; do not compare
        # it with the release tag or forward unsupported --version to the GUI.
        icon = (directory / 'ibisoffice.png').read_bytes()
        assert icon.startswith(b'\x89PNG\r\n\x1a\n'), 'Bundled application icon is not PNG'
        assert int.from_bytes(icon[16:20], 'big') == 256
        assert int.from_bytes(icon[20:24], 'big') == 256
        if not args.runtime_only:
            # Unsupported options are rejected before GUI initialization. Reaching
            # that parser proves that the real application and shared libraries load.
            argument = '--dotfiles-smoke-test'
            parsed = subprocess.run([str(app), argument], env=environment, capture_output=True,
                                    text=True, timeout=30)
            assert parsed.returncode == 2, (parsed.returncode, parsed.stdout, parsed.stderr)
            diagnostic = parsed.stdout + parsed.stderr
            assert argument in diagnostic and 'unknown option' in diagnostic.lower(), diagnostic
            configure_office(ctx)
            desktop = ctx.data.parent / 'applications/ibisoffice.desktop'
            subprocess.run(['desktop-file-validate', str(desktop)], env=environment, check=True, timeout=10)
            assert (ctx.home / '.local/bin/ibis-office').resolve() == app
            restore(ctx.backup.directory, ctx.home)
            assert not (ctx.home / '.local/bin/ibis-office').exists()
            assert not desktop.exists()
            assert app.exists(), 'Restoration must retain the downloaded application'
        else:
            assert not (home / '.local/bin').exists(), 'Runtime check unexpectedly registered a launcher'
            assert not (ctx.data.parent / 'applications').exists(), 'Runtime check modified app registration'
    scope = ('runtime and icon only' if args.runtime_only else
             'runtime, shared libraries, bundled icon, desktop validation and restoration')
    print(f'Official ibisOffice: pinned SHA-256 and {scope} passed; no GUI launched.')


if __name__ == '__main__':
    main()
