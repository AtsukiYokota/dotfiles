#!/usr/bin/env python3
"""Keep Flatpak installation user-scoped and preserve existing repository trust."""
import contextlib
import io
import os
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest import mock

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
import flatpak_apps


def remote_config(name=flatpak_apps.REMOTE, extra=''):
    return (f'[remote "{name}"]\nurl=https://dl.flathub.org/repo/\n'
            'gpg-verify=true\ngpg-verify-summary=true\n' + extra)


class FlatpakTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.home = Path(self.temporary.name) / 'home with spaces'
        self.home.mkdir()
        self.temp = self.home / 'downloads'
        self.temp.mkdir()
        self.directory = self.home / '.local/share/flatpak'
        self.config = self.directory / 'repo/config'
        self.runner = mock.Mock()
        self.runner.capture.return_value = ''
        self.runner.download.side_effect = lambda url, destination, digest: destination.write_text('verified fixture')
        self.ctx = SimpleNamespace(home=self.home, data=self.home / '.local/share/dotfiles',
                                   temp=self.temp, platform='native', arch='amd64', runner=self.runner)
        self.environment = mock.patch.dict(os.environ, {'FLATPAK_USER_DIR': ''})
        self.environment.start()
        self.output = contextlib.redirect_stdout(io.StringIO())
        self.output.__enter__()

    def tearDown(self):
        self.output.__exit__(None, None, None)
        self.environment.stop()
        self.temporary.cleanup()

    def write_config(self, text):
        self.config.parent.mkdir(parents=True, exist_ok=True)
        self.config.write_text(text)

    def fake_install(self, argv, env):
        self.assertEqual(env, {'FLATPAK_USER_DIR': str(self.directory)})
        if argv[1] == 'remote-add':
            self.assertTrue(Path(argv[-1]).is_file())
            self.write_config(remote_config())

    def test_first_install_uses_verified_descriptor_user_scope_and_stable(self):
        self.runner.run.side_effect = self.fake_install
        self.assertEqual(flatpak_apps.install_capture(self.ctx), 'dotfiles-flathub')
        self.runner.download.assert_called_once_with(flatpak_apps.REPO_URL,
            self.temp / 'flathub.flatpakrepo', flatpak_apps.REPO_SHA256)
        commands = [call.args[0] for call in self.runner.run.call_args_list]
        self.assertEqual(commands[0], ['flatpak', 'remote-add', '--user', '--if-not-exists',
                                     '--from', 'dotfiles-flathub', self.temp / 'flathub.flatpakrepo'])
        self.assertEqual(commands[1], ['flatpak', 'install', '--user', '--noninteractive',
                                     '--assumeyes', '--or-update', 'dotfiles-flathub',
                                     'io.github.seadve.Kooha//stable'])
        self.assertTrue(all('sudo' not in command and '--system' not in command for command in commands))

    def test_existing_remote_is_not_readded_or_its_filter_reset(self):
        text = remote_config(extra='xa.filter=/some/local/filter\n')
        self.write_config(text)
        flatpak_apps.install_capture(self.ctx)
        self.runner.download.assert_not_called()
        self.runner.run.assert_called_once()
        self.assertEqual(self.runner.run.call_args.args[0][1], 'install')
        self.assertEqual(self.config.read_text(), text)

    def test_existing_official_origin_is_reused_for_update(self):
        self.write_config(remote_config('flathub'))
        self.runner.capture.return_value = 'io.github.seadve.Kooha\tflathub\tstable\tx86_64\n'
        self.assertEqual(flatpak_apps.install_capture(self.ctx), 'flathub')
        self.runner.download.assert_not_called()
        self.runner.run.assert_called_once()
        self.assertEqual(self.runner.run.call_args.args[0][-2:], ['flathub', flatpak_apps.CAPTURE_REF])
        self.assertEqual(self.config.read_text(), remote_config('flathub'))

    def test_untrusted_existing_origin_is_not_silently_replaced(self):
        text = remote_config('third-party').replace('https://dl.flathub.org/repo/', 'https://example.invalid/repo/')
        self.write_config(text)
        self.runner.capture.return_value = 'io.github.seadve.Kooha\tthird-party\tstable\tx86_64\n'
        with self.assertRaisesRegex(RuntimeError, 'official Flathub'):
            flatpak_apps.install_capture(self.ctx)
        self.runner.run.assert_not_called()
        self.runner.download.assert_not_called()
        self.assertEqual(self.config.read_text(), text)

    def test_bad_owned_remote_rejected_before_download_or_commands(self):
        for replacement in ('url=https://example.invalid/repo/', 'gpg-verify=false',
                            'gpg-verify-summary=false', 'xa.disable=true',
                            'metalink=https://example.invalid/mirror',
                            'mirrorlist=https://example.invalid/mirror'):
            with self.subTest(replacement=replacement):
                key = replacement.split('=', 1)[0]
                text = '\n'.join(line for line in remote_config().splitlines()
                                 if not line.startswith(key + '=')) + '\n' + replacement + '\n'
                self.write_config(text)
                with self.assertRaisesRegex(RuntimeError, 'official Flathub'):
                    flatpak_apps.install_capture(self.ctx)
                self.runner.assert_not_called()
                self.runner.run.assert_not_called()
                self.runner.capture.assert_not_called()
                self.runner.download.assert_not_called()
                self.assertEqual(self.config.read_text(), text)

    def test_bad_new_remote_cannot_install_an_application(self):
        def add_bad(argv, env):
            self.write_config(remote_config().replace('gpg-verify=true', 'gpg-verify=false'))
        self.runner.run.side_effect = add_bad
        with self.assertRaisesRegex(RuntimeError, 'official Flathub'):
            flatpak_apps.install_capture(self.ctx)
        self.assertEqual(self.runner.run.call_count, 1)
        self.assertEqual(self.runner.run.call_args.args[0][1], 'remote-add')

    def test_failed_descriptor_verification_prevents_remote_add(self):
        self.runner.download.side_effect = RuntimeError('SHA-256 mismatch')
        with self.assertRaisesRegex(RuntimeError, 'SHA-256'):
            flatpak_apps.install_capture(self.ctx)
        self.runner.run.assert_not_called()

    def test_config_only_and_wsl_never_install(self):
        self.ctx.configs_only = True
        self.assertIsNone(flatpak_apps.install_capture(self.ctx))
        self.ctx.platform = 'wsl'
        with self.assertRaisesRegex(ValueError, 'native Ubuntu'):
            flatpak_apps.install_capture(self.ctx)
        self.runner.run.assert_not_called()
        self.runner.capture.assert_not_called()
        self.runner.download.assert_not_called()

    def test_custom_user_directory_is_honored_and_outside_home_rejected(self):
        with mock.patch.dict(os.environ, {'FLATPAK_USER_DIR': str(self.home / 'custom flatpak')}):
            self.directory = self.home / 'custom flatpak'
            self.config = self.directory / 'repo/config'
            self.runner.run.side_effect = self.fake_install
            flatpak_apps.install_capture(self.ctx)
            self.assertIn('FLATPAK_USER_DIR=' + str(self.directory), self.runner.capture.call_args.args[0])
        self.runner.reset_mock()
        for path in ('relative-path', str(self.home.parent / 'outside')):
            with mock.patch.dict(os.environ, {'FLATPAK_USER_DIR': path}):
                with self.assertRaisesRegex(ValueError, 'inside home'):
                    flatpak_apps.install_capture(self.ctx)
        self.runner.run.assert_not_called()
        self.runner.capture.assert_not_called()
        self.runner.download.assert_not_called()

    @unittest.skipUnless(sys.platform == 'linux', 'Linux symlinks')
    def test_symlinked_user_repository_cannot_escape_home(self):
        outside = self.home.parent / 'outside'
        outside.mkdir()
        self.directory.mkdir(parents=True)
        (self.directory / 'repo').symlink_to(outside, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, 'inside home'):
            flatpak_apps.install_capture(self.ctx)
        self.runner.run.assert_not_called()
        self.runner.capture.assert_not_called()
        self.runner.download.assert_not_called()


if __name__ == '__main__':
    unittest.main()
