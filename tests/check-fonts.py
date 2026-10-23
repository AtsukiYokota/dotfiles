"""Verify the pinned real font, registration, and glyphs in a temporary HOME."""
import argparse
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
from deploy import Backup, restore
from fonts import FAMILY, FONT_FILES, font_directory, install_fonts
from runtime import Runner


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive', type=Path, help='Use an already downloaded archive, still verify its SHA-256.')
    args = parser.parse_args()
    for name in ('fc-cache', 'fc-match', 'fc-query'):
        if not shutil.which(name):
            raise RuntimeError(f'This integration check requires fontconfig: {name}')
    with tempfile.TemporaryDirectory(prefix='dotfiles-font-check-') as temporary:
        home = Path(temporary)
        os.environ.update(HOME=str(home), XDG_DATA_HOME=str(home / '.local/share'),
                          XDG_CACHE_HOME=str(home / '.cache'), XDG_CONFIG_HOME=str(home / '.config'))
        versions = json.loads((ROOT / 'installer/versions.json').read_text(encoding='utf-8'))
        backup = Backup(home / 'backup', home)
        runner = Runner(home / 'check.log')
        if args.archive:
            archive = args.archive.resolve(strict=True)

            def download(url, destination, expected):
                import hashlib
                if hashlib.sha256(archive.read_bytes()).hexdigest() != expected:
                    raise RuntimeError('Existing archive SHA-256 mismatch.')
                shutil.copyfile(archive, destination)
            runner.download = download
        ctx = SimpleNamespace(home=home, data=home / '.local/share/dotfiles', temp=home / 'temp',
                              versions=versions, runner=runner, backup=backup)
        ctx.temp.mkdir()
        install_fonts(ctx)
        install_fonts(ctx)
        for name in FONT_FILES:
            font = font_directory(ctx) / name
            family = runner.capture(['fc-query', '--format', '%{family}', str(font)])
            if FAMILY not in family.split(','):
                raise RuntimeError(f'Unexpected family: {family}')
            charset = runner.capture(['fc-query', '--format', '%{charset}', str(font)])
            ranges = []
            for span in charset.split():
                start, _, end = span.partition('-')
                ranges.append((int(start, 16), int(end or start, 16)))
            # Powerline separator, Linux distribution logo, Lazy icon, Material
            # Design icon; the latter catches old fonts without plane-15 glyphs.
            for point in (0xE0B0, 0xF17C, 0xF067, 0xF0001):
                if not any(start <= point <= end for start, end in ranges):
                    raise RuntimeError(f'{name} is missing U+{point:X}')
        restore(backup.directory, home)
        assert not (home / '.local/share/fonts/dotfiles-nerd-font').exists()
    print('Pinned Nerd Font: family, four styles, icon glyphs, cache, and restoration OK.')


if __name__ == '__main__':
    main()
