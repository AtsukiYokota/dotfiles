#!/usr/bin/env python3
"""Verify isolated wallpaper deployment and backed-up GNOME appearance settings."""
from __future__ import annotations

import hashlib
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest import mock

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from installer import theme
from installer.deploy import Backup, restore


DOCK = 'org.gnome.shell.extensions.dash-to-dock'
BACKGROUND = 'org.gnome.desktop.background'
INTERFACE = 'org.gnome.desktop.interface'


class MemoryRunner:
    def __init__(self):
        self.downloads = []
        self.values = {
            (DOCK, 'dock-position'): "'LEFT'",
            (DOCK, 'extend-height'): 'true',
            (DOCK, 'dash-max-icon-size'): '32',
            (DOCK, 'dock-fixed'): 'true',
            (DOCK, 'intellihide'): 'true',
            (DOCK, 'autohide'): 'false',
            (DOCK, 'manualhide'): 'true',
            (DOCK, 'require-pressure-to-show'): 'true',
            (DOCK, 'show-dock-urgent-notify'): 'true',
            (DOCK, 'hotkeys-show-dock'): 'true',
            (BACKGROUND, 'picture-uri'): "'file:///user/light.jpg'",
            (BACKGROUND, 'picture-uri-dark'): "'file:///user/dark.jpg'",
            (BACKGROUND, 'picture-options'): "'scaled'",
            (INTERFACE, 'color-scheme'): "'default'",
        }

    def capture(self, argv, **kwargs):
        if argv[1] == 'list-schemas':
            return '\n'.join(sorted({schema for schema, _ in self.values}))
        if argv[1] == 'list-keys':
            return '\n'.join(key for schema, key in self.values if schema == argv[2])
        if argv[1] == 'get':
            return self.values[tuple(argv[2:4])]
        raise AssertionError(argv)

    def run(self, argv, **kwargs):
        assert argv[:2] == ['gsettings', 'set'], argv
        self.values[tuple(argv[2:4])] = argv[4]

    def download(self, url, destination, checksum):
        self.downloads.append((url, checksum))
        content = ('test file: ' + destination.name).encode()
        assert hashlib.sha256(content).hexdigest() == checksum
        destination.write_bytes(content)


class ThemeSettingsTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='dotfiles-theme-settings-')
        self.addCleanup(self.temporary.cleanup)
        root = Path(self.temporary.name)
        home = root / "desktop user's home"
        home.mkdir()
        self.ctx = SimpleNamespace(home=home, platform='native', data=home / 'data',
                                   temp=root / 'work', runner=MemoryRunner())
        self.ctx.backup = Backup(home / 'backup', home)
        self.fixture_files = {
            name: dict(source, sha256=hashlib.sha256(('test file: ' + name).encode()).hexdigest())
            for name, source in theme.WALLPAPER_FILES.items()
        }
        patcher = mock.patch.dict(theme.WALLPAPER_FILES, self.fixture_files, clear=True)
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_wallpapers_are_pinned_complete_and_reused_without_download(self):
        destination = theme._install_wallpapers(self.ctx)
        self.assertEqual(len(self.ctx.runner.downloads), 3)
        self.assertEqual(set(path.name for path in destination.iterdir()), set(self.fixture_files))
        for url, _ in self.ctx.runner.downloads:
            self.assertIn('/' + theme.WALLPAPER_COMMIT + '/', url)
        self.assertEqual(theme._install_wallpapers(self.ctx), destination)
        self.assertEqual(len(self.ctx.runner.downloads), 3)
        (destination / 'WhiteSur.jpg').write_bytes(b'changed user artwork')
        with self.assertRaisesRegex(RuntimeError, 'has changed'):
            theme._install_wallpapers(self.ctx)
        self.assertEqual((destination / 'WhiteSur.jpg').read_bytes(), b'changed user artwork')

    def test_failed_download_never_publishes_incomplete_wallpapers(self):
        original = self.ctx.runner.download

        def fail_second(url, destination, checksum):
            if self.ctx.runner.downloads:
                raise RuntimeError('network unavailable')
            original(url, destination, checksum)

        with mock.patch.object(self.ctx.runner, 'download', side_effect=fail_second):
            with self.assertRaisesRegex(RuntimeError, 'network unavailable'):
                theme._install_wallpapers(self.ctx)
        self.assertFalse(theme._wallpaper_directory(self.ctx).exists())
        self.assertFalse(self.ctx.backup.entries)

    def test_dock_and_wallpaper_changes_are_idempotent_and_restore_original(self):
        original = dict(self.ctx.runner.values)
        wallpapers = theme._install_wallpapers(self.ctx)
        theme._apply_settings(self.ctx, wallpapers)
        values = self.ctx.runner.values
        self.assertEqual(values[DOCK, 'dock-fixed'], 'false')
        self.assertEqual(values[DOCK, 'autohide'], 'true')
        self.assertEqual(values[DOCK, 'intellihide'], 'false')
        self.assertEqual(values[DOCK, 'require-pressure-to-show'], 'false')
        self.assertEqual(values[DOCK, 'show-dock-urgent-notify'], 'false')
        self.assertEqual(values[DOCK, 'hotkeys-show-dock'], 'false')
        self.assertEqual(values[BACKGROUND, 'picture-uri'], repr((wallpapers / 'WhiteSur-light.jpg').as_uri()))
        self.assertEqual(values[BACKGROUND, 'picture-uri-dark'], repr((wallpapers / 'WhiteSur.jpg').as_uri()))
        count = len(self.ctx.backup.entries)
        theme._apply_settings(self.ctx, wallpapers)
        self.assertEqual(len(self.ctx.backup.entries), count)
        with mock.patch('installer.deploy.subprocess.check_output', side_effect=self.ctx.runner.capture), \
                mock.patch('installer.deploy.subprocess.run', side_effect=self.ctx.runner.run):
            restore(self.ctx.backup.directory, self.ctx.home)
        self.assertEqual(self.ctx.runner.values, original)

    def test_offline_configuration_requires_assets_before_changing_desktop(self):
        destination = theme._theme_directory(self.ctx)
        destination.mkdir(parents=True)
        with mock.patch.object(theme, '_require_session'), \
                mock.patch.object(theme, '_validate_installed_theme'):
            with self.assertRaisesRegex(RuntimeError, 'without --configs-only'):
                theme.configure_theme(self.ctx)
        self.assertFalse(self.ctx.backup.entries)
        self.assertFalse(self.ctx.runner.downloads)

    def test_offline_configuration_reuses_downloads_and_reapplies(self):
        wallpapers = theme._install_wallpapers(self.ctx)
        destination = theme._theme_directory(self.ctx)
        destination.mkdir(parents=True)
        with mock.patch.object(theme, '_require_session'), \
                mock.patch.object(theme, '_validate_installed_theme'), \
                mock.patch.object(self.ctx.backup, 'link'):
            theme.configure_theme(self.ctx)
        self.assertEqual(len(self.ctx.runner.downloads), 3)
        self.assertEqual(self.ctx.runner.values[BACKGROUND, 'picture-uri-dark'],
                         repr((wallpapers / 'WhiteSur.jpg').as_uri()))

    @unittest.skipUnless(sys.platform.startswith('linux'), 'Linux symlinks')
    def test_wallpaper_parent_cannot_redirect_outside_home(self):
        outside = Path(self.temporary.name) / 'outside'
        outside.mkdir()
        self.ctx.data.mkdir()
        (self.ctx.data / 'wallpapers').symlink_to(outside, target_is_directory=True)
        with self.assertRaisesRegex(RuntimeError, 'inside the user home'):
            theme._install_wallpapers(self.ctx)
        self.assertFalse(list(outside.iterdir()))


if __name__ == '__main__':
    unittest.main(verbosity=2)
