"""WSL detection, unavailable module selection and desktop-setting isolation."""
import contextlib
import io
import os
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
import catalog
import fonts
import main as installer_main
import runtime
import ui

NATIVE_MODULES = {'desktop', 'keyboard', 'japanese-input', 'vscode', 'chrome', 'ibis-office', 'macos-theme', 'launcher', 'screen-capture'}


class DetectionTests(unittest.TestCase):
    def test_environment_detects_wsl_with_custom_kernel(self):
        for key, value in [('WSL_DISTRO_NAME', 'Ubuntu-24.04'), ('WSL_INTEROP', '/run/WSL/123_interop')]:
            with self.subTest(variable=key), patch.dict(os.environ, {key: value}, clear=True), \
                    patch.object(runtime.Path, 'read_text', return_value='6.6-custom-linux'):
                self.assertTrue(runtime.is_wsl())

    def test_kernel_detection_without_wsl_environment(self):
        for release, version in [('4.4.0-Microsoft', 'Linux version'),
                                 ('6.6.87.2-microsoft-standard-WSL2', 'Linux version'),
                                 ('custom', 'Linux version custom (Microsoft@Microsoft.com)')]:
            with self.subTest(release=release), patch.dict(os.environ, {}, clear=True), \
                    patch.object(runtime.Path, 'read_text', side_effect=[release, version]):
                self.assertTrue(runtime.is_wsl())

    def test_unreadable_kernel_source_uses_remaining_source(self):
        with patch.dict(os.environ, {}, clear=True), \
                patch.object(runtime.Path, 'read_text', side_effect=[PermissionError(), 'Linux version Microsoft']):
            self.assertTrue(runtime.is_wsl())
        with patch.dict(os.environ, {}, clear=True), \
                patch.object(runtime.Path, 'read_text', side_effect=FileNotFoundError()):
            self.assertFalse(runtime.is_wsl())

    def test_display_and_gnome_environment_do_not_imply_wsl(self):
        environment = {'DISPLAY': ':0', 'WAYLAND_DISPLAY': 'wayland-0',
                       'XDG_CURRENT_DESKTOP': 'ubuntu:GNOME', 'DBUS_SESSION_BUS_ADDRESS': 'session'}
        with patch.dict(os.environ, environment, clear=True), \
                patch.object(runtime.Path, 'read_text', return_value='6.8.0-generic Ubuntu'):
            self.assertFalse(runtime.is_wsl())


class SelectionTests(unittest.TestCase):
    def test_actual_cli_detection_rejects_native_modules_before_any_write(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            for module in NATIVE_MODULES:
                with self.subTest(module=module), patch.dict(os.environ, {'WSL_DISTRO_NAME': 'Ubuntu-24.04'}), \
                        patch.object(installer_main.Path, 'home', return_value=home), \
                        patch.object(installer_main, 'check_platform') as check, \
                        self.assertRaisesRegex(ValueError, 'not available on wsl/'):
                    installer_main.main(['--modules', module, '--configs-only', '--yes'])
                check.assert_not_called()
            self.assertEqual(list(home.iterdir()), [])

    def test_native_override_cannot_enable_installation(self):
        with patch.dict(os.environ, {'WSL_DISTRO_NAME': 'Ubuntu-24.04'}), \
                self.assertRaisesRegex(ValueError, 'overrides are allowed only for previews'):
            installer_main.main(['--modules', 'macos-theme', '--platform', 'native', '--yes'])

    def test_module_listing_marks_native_modules_unavailable(self):
        output = io.StringIO()
        with patch.dict(os.environ, {'WSL_DISTRO_NAME': 'Ubuntu-24.04'}), contextlib.redirect_stdout(output):
            self.assertEqual(installer_main.main(['--list-modules']), 0)
        lines = {line.split()[0]: line for line in output.getvalue().splitlines()}
        for module in NATIVE_MODULES:
            self.assertIn('[unavailable for this target]', lines[module])

    def test_plain_select_all_excludes_native_packages_even_with_gnome_environment(self):
        with patch.dict(os.environ, {'XDG_CURRENT_DESKTOP': 'ubuntu:GNOME',
                                     'DBUS_SESSION_BUS_ADDRESS': 'session'}), \
                patch('builtins.input', side_effect=['a', '']), contextlib.redirect_stdout(io.StringIO()):
            selected = ui.choose('wsl', 'amd64', plain=True)
        self.assertFalse(selected.intersection(NATIVE_MODULES))
        self.assertTrue({'latex', 'diagrams', 'ros-desktop', 'fonts'}.issubset(selected))
        resolved = catalog.resolve(selected, 'wsl', 'amd64')
        self.assertFalse(set(catalog.packages_for(resolved)).intersection(
            {'gnome-tweaks', 'fcitx5', 'fcitx5-mozc', 'snapd', 'sassc'}))

    def test_full_screen_checklist_never_exposes_native_modules(self):
        observed = []

        class Screen:
            def getmaxyx(self):
                return 45, 120

            def addnstr(self, *args):
                pass

            def erase(self):
                pass

            def refresh(self):
                pass

            def getch(self):
                return next(keys)

        def wrapper(callback, choices, selected, platform, arch):
            nonlocal keys
            observed.extend(choices)
            events = []
            for name in choices:
                if name not in selected:
                    events.append(ord(' '))
                events.append(fake_curses.KEY_DOWN)
            keys = iter([*events, 10])
            return callback(Screen(), choices, selected, platform, arch)

        keys = iter(())
        fake_curses = SimpleNamespace(wrapper=wrapper, curs_set=lambda value: None,
                                     has_colors=lambda: False, A_BOLD=1, A_REVERSE=2,
                                     KEY_DOWN=258, KEY_UP=259, KEY_ENTER=343, error=RuntimeError)
        with patch.dict(sys.modules, {'curses': fake_curses}), \
                patch.object(ui.sys.stdin, 'isatty', return_value=True), \
                patch.dict(os.environ, {'TERM': 'xterm-256color'}):
            selected = ui.choose('wsl', 'amd64')
        self.assertEqual(selected, set(observed))
        self.assertFalse(selected.intersection(NATIVE_MODULES))
        self.assertTrue(selected)


class DesktopIsolationTests(unittest.TestCase):
    @unittest.skipUnless(sys.platform == 'linux', 'Needs ordinary Linux symlink permissions')
    def test_wsl_fonts_skip_gsettings_even_with_gnome_environment(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            ctx = SimpleNamespace(home=home, data=home / '.local/share/dotfiles', platform='wsl',
                                  versions={'nerd_font': {'version': 'test', 'sha256': 'a' * 64}},
                                  backup=Mock(), runner=Mock())
            directory = fonts.font_directory(ctx)
            directory.mkdir(parents=True)
            for name in fonts.FONT_FILES:
                (directory / name).write_bytes(b'font')
            (directory / '.dotfiles-sha256').write_text('a' * 64, encoding='ascii')
            target = fonts.font_target(ctx)
            target.parent.mkdir(parents=True)
            target.symlink_to(directory, target_is_directory=True)
            with patch.dict(os.environ, {'XDG_CURRENT_DESKTOP': 'ubuntu:GNOME',
                                         'DBUS_SESSION_BUS_ADDRESS': 'session'}), \
                    patch.object(fonts, 'configure_windows_terminal') as windows:
                fonts.configure_fonts(ctx)
            windows.assert_called_once_with(ctx, directory)
            ctx.backup.set_setting.assert_not_called()
            ctx.runner.capture.assert_not_called()
            ctx.runner.run.assert_not_called()


if __name__ == '__main__':
    unittest.main()
