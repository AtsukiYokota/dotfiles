#!/usr/bin/env python3
"""Launcher shortcut ownership, package verification, and local config safety."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
import desktop_extras as desktop
from deploy import Backup, restore


class SettingsRunner:
    def __init__(self, paths=None):
        self.settings = {(desktop.MEDIA_SCHEMA, 'custom-keybindings'): repr(paths or []),
                         (desktop.CUSTOM_TARGET, 'command'): "''",
                         (desktop.CUSTOM_TARGET, 'binding'): "''",
                         (desktop.CUSTOM_TARGET, 'name'): "''"}
        self.calls = []
        self.recursive = {}

    def capture(self, args):
        if args == ['gsettings', 'list-schemas']:
            return '\n'.join(desktop.SHORTCUT_SCHEMAS)
        if args[:2] == ['gsettings', 'list-recursively']:
            return self.recursive.get(args[2], '')
        if args[:2] != ['gsettings', 'get']:
            raise AssertionError(args)
        return self.settings[args[2], args[3]]

    def run(self, args):
        if args[:2] != ['gsettings', 'set']:
            raise AssertionError(args)
        self.calls.append(args)
        self.settings[args[2], args[3]] = args[4]


class DesktopExtrasTests(unittest.TestCase):
    def test_shortcut_preserves_others_is_idempotent_and_restores(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            other = '/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/'
            runner = SettingsRunner([other])
            runner.settings[desktop.CUSTOM_SCHEMA + ':' + other, 'binding'] = "'<Super>e'"
            original = dict(runner.settings)
            ctx = SimpleNamespace(platform='native', runner=runner, backup=Backup(home / 'backup', home))
            with patch.object(desktop, 'require_session'), \
                    patch.object(desktop, '_launcher_running', return_value=False), \
                    patch.object(desktop, 'require_installed_launcher'):
                desktop.configure_launcher(ctx)
                desktop.configure_launcher(ctx)
            self.assertEqual(len(runner.calls), 4)
            self.assertEqual(desktop._value(runner.settings[desktop.MEDIA_SCHEMA, 'custom-keybindings']),
                             [other, desktop.CUSTOM_PATH])
            def output(args, **kwargs):
                return runner.capture(args)
            def run(args, **kwargs):
                runner.run(args)
            with patch('deploy.subprocess.check_output', side_effect=output), \
                    patch('deploy.subprocess.run', side_effect=run):
                restore(ctx.backup.directory, home)
            self.assertEqual(runner.settings, original)

    def test_conflicting_custom_shortcut_fails_before_any_write(self):
        other = '/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/'
        for key in ('<Primary>space', '<Control>space', '<Ctrl>space'):
            runner = SettingsRunner([other])
            runner.settings[desktop.CUSTOM_SCHEMA + ':' + other, 'binding'] = repr(key)
            with self.assertRaisesRegex(ValueError, 'already belongs'):
                desktop.check_launcher_shortcut(runner)
            self.assertEqual(runner.calls, [])

    def test_conflicting_builtin_shortcut_or_occupied_path_fails(self):
        runner = SettingsRunner()
        schema = 'org.gnome.desktop.wm.keybindings'
        runner.recursive[schema] = schema + " switch-input-source ['<Control>space']"
        with self.assertRaisesRegex(ValueError, 'already belongs'):
            desktop.check_launcher_shortcut(runner)
        runner.recursive.clear()
        runner.settings[desktop.CUSTOM_TARGET, 'command'] = "'another-program'"
        with self.assertRaisesRegex(ValueError, 'already used'):
            desktop.check_launcher_shortcut(runner)

    def test_malformed_paths_cannot_be_applied(self):
        for value in ('not a variant', "['/path/', '/path/']", "['bad-path']", "'not-a-list'"):
            runner = SettingsRunner()
            runner.settings[desktop.MEDIA_SCHEMA, 'custom-keybindings'] = value
            with self.assertRaises(ValueError):
                desktop.check_launcher_shortcut(runner)
        runner = SettingsRunner()
        runner.settings[desktop.MEDIA_SCHEMA, 'custom-keybindings'] = '@as []'
        self.assertEqual(desktop.check_launcher_shortcut(runner), [])

    def test_app_config_retains_comments_private_values_and_explicit_telemetry_choice(self):
        original = '# local preferences\n[General]\nhotkey=Alt+Space\ntelemetry=true\n\n[other]\naccount=local-only\n'
        result = desktop.launcher_config(original)
        self.assertIn('# local preferences\n', result)
        self.assertIn('telemetry=true\n', result)
        self.assertIn('[other]\naccount=local-only\n', result)
        self.assertIn('hotkey=\n', result)
        self.assertIn('[applications]\nenabled=true\n', result)
        self.assertEqual(desktop.launcher_config(result), result)
        for text in ('[General]\nhotkey=a\nhotkey=b\n', '[General]\n[General]\n', 'unexpected text\n'):
            with self.assertRaises(ValueError):
                desktop.launcher_config(text)

    def test_file_operations_are_local_writes_and_autostart_uses_xcb_only_for_albert(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            config = home / 'custom-config'
            self.assertEqual(desktop.launcher_file_operations(ROOT, home, config, []), [])
            operations = desktop.launcher_file_operations(ROOT, home, config, ['launcher'])
            self.assertEqual(len(operations), 2)
            self.assertTrue(all(operation.kind == 'write' for operation in operations))
            self.assertEqual(operations[0].target, config / 'albert/config')
            self.assertIn('telemetry=false', operations[0].content)
            self.assertIn('Exec=/usr/bin/albert --platform xcb\n', operations[1].content)
            self.assertEqual(operations[1].target, config / 'autostart/albert.desktop')
            self.assertNotIn('QT_QPA_PLATFORM', operations[1].content)
            self.assertFalse(config.exists())

    def test_wsl_and_missing_gnome_session_rejected(self):
        with patch.object(desktop, 'is_wsl', return_value=True):
            with self.assertRaisesRegex(ValueError, 'WSL'):
                desktop.require_session()
        with patch.object(desktop, 'is_wsl', return_value=False), \
                patch.dict(os.environ, {'XDG_CURRENT_DESKTOP': 'KDE', 'DBUS_SESSION_BUS_ADDRESS': 'test'}):
            with self.assertRaisesRegex(ValueError, 'GNOME'):
                desktop.require_session()
        with self.assertRaisesRegex(ValueError, 'WSL'):
            desktop.install_launcher(SimpleNamespace(platform='wsl'))

    def test_running_process_and_missing_config_only_binary_fail_before_settings(self):
        runner = SettingsRunner()
        with patch.object(desktop, 'require_session'), \
                patch.object(desktop, '_launcher_running', return_value=True):
            with self.assertRaisesRegex(ValueError, 'Quit Albert'):
                desktop.preflight_launcher(runner)
        with patch.object(desktop, 'require_session'), \
                patch.object(desktop, '_launcher_running', return_value=False), \
                patch.object(desktop, 'require_installed_launcher', side_effect=ValueError('not installed')):
            with self.assertRaisesRegex(ValueError, 'not installed'):
                desktop.preflight_launcher(runner, configs_only=True)
        self.assertEqual(runner.calls, [])

    def test_package_download_and_identity_verified_before_apt(self):
        with tempfile.TemporaryDirectory() as temporary:
            temp = Path(temporary)
            calls = []
            metadata = {'Package': 'albert', 'Version': '35.1.0-0+764.1', 'Architecture': 'amd64'}
            def capture(args):
                calls.append(args)
                if args[0] == 'dpkg-query':
                    raise subprocess.CalledProcessError(1, args)
                return metadata[args[-1]]
            def download(url, path, digest):
                calls.append(['download', url, digest])
                path.write_bytes(b'verified fixture package')
            runner = SimpleNamespace(capture=capture, download=download, run=calls.append)
            ctx = SimpleNamespace(platform='native', arch='amd64', temp=temp, runner=runner,
                versions={'albert': {'version': metadata['Version'], 'amd64': {
                    'url': 'https://example.invalid/albert.deb', 'sha256': 'f' * 64}}})
            desktop.install_launcher(ctx)
            self.assertEqual(calls[-1][:6], ['sudo', 'apt-get', 'install', '-y', '--no-remove', '--no-install-recommends'])
            self.assertEqual(calls[-1][-1], str(temp / 'albert.deb'))
            calls.clear()
            metadata['Architecture'] = 'arm64'
            with self.assertRaisesRegex(RuntimeError, 'Architecture'):
                desktop.install_launcher(ctx)
            self.assertFalse(any(call[0] == 'sudo' for call in calls))

    def test_already_installed_version_does_not_download(self):
        runner = SimpleNamespace(capture=lambda args: 'install ok installed\t35.1.0-0+764.1')
        ctx = SimpleNamespace(platform='native', arch='amd64', runner=runner,
            versions={'albert': {'version': '35.1.0-0+764.1', 'amd64': {}}})
        desktop.install_launcher(ctx)


if __name__ == '__main__':
    unittest.main()
