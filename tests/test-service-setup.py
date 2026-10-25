#!/usr/bin/env python3
"""Service onboarding safety checks without any live account or network access."""
from contextlib import nullcontext, redirect_stdout, redirect_stderr
import importlib.util
import io
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
REPO = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('service_setup', REPO / 'commands/service_setup.py')
setup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(setup)


@unittest.skipUnless(sys.platform == 'linux', 'Private Linux paths and permission semantics')
class ServiceSetupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='dotfiles-service-setup-')
        self.root = Path(self.temp.name)
        self.home = self.root / 'home'
        self.home.mkdir()
        self.repo = self.root / 'repo'
        self.repo.mkdir()
        self.env = {'HOME': str(self.home), 'PATH': '/usr/bin', 'DISPLAY': ':99'}
        self.apps = setup.Onboarding(self.repo, self.home, self.env)
        self.stdout = io.StringIO()
        self.stderr = io.StringIO()
        self.stack = [redirect_stdout(self.stdout), redirect_stderr(self.stderr)]
        for manager in self.stack:
            manager.__enter__()

    def tearDown(self):
        for manager in reversed(self.stack):
            manager.__exit__(None, None, None)
        self.temp.cleanup()

    def receipt(self, modules):
        path = self.home / '.local/state/dotfiles/installed.json'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps({'modules': modules}))

    def prepare_onedrive(self, ready=False):
        folder = self.home / 'My OneDrive'
        folder.mkdir(exist_ok=True)
        setup.private_write(self.apps.private / 'config', self.apps.config_text(folder), self.home, self.repo)
        self.apps.write_profile(folder, ready)
        return folder

    def test_list_uses_receipt_only_without_starting_apps_or_reading_tokens(self):
        self.receipt(['onedrive', 'google-drive', 'slack', 'shell'])
        with patch.object(setup.subprocess, 'run') as run, patch.object(setup.subprocess, 'Popen') as popen:
            self.apps.show_list()
        run.assert_not_called()
        popen.assert_not_called()
        self.assertIn('onedrive          installed', self.stdout.getvalue())
        self.assertIn('notion-electron', self.stdout.getvalue())

    def test_redirected_setup_refuses_before_oauth(self):
        with patch.object(setup.subprocess, 'run') as run:
            with self.assertRaisesRegex(ValueError, 'interactive terminal'):
                self.apps.setup_onedrive()
        run.assert_not_called()
        self.assertFalse(self.apps.private.exists())

    def test_symlink_and_git_config_paths_are_refused(self):
        (self.home / '.config').symlink_to(self.repo, target_is_directory=True)
        with self.assertRaises(ValueError):
            setup.private_write(self.apps.profile, '{}', self.home, self.repo)
        (self.home / '.config').unlink()
        (self.home / '.config/.git').mkdir(parents=True)
        with self.assertRaisesRegex(ValueError, 'Git checkout'):
            setup.private_write(self.apps.profile, '{}', self.home, self.repo)
        self.assertFalse((self.repo / 'dotfiles-services').exists())

    def test_other_git_checkout_is_refused(self):
        other = self.home / 'another-repo'
        (other / '.git').mkdir(parents=True)
        with self.assertRaisesRegex(ValueError, 'Git checkout'):
            self.apps.folder(str(other / 'sync'))

    def test_initial_folder_must_be_new_visible_separate_and_outside_checkout(self):
        existing = self.home / 'Documents'
        existing.mkdir()
        (existing / 'keep.txt').write_text('unchanged')
        for candidate in (existing, self.home, self.home / '.ssh/data', Path('/tmp/outside'), self.home / 'bad"path'):
            with self.subTest(candidate=candidate), self.assertRaises(ValueError):
                self.apps.folder(str(candidate))
        self.assertEqual((existing / 'keep.txt').read_text(), 'unchanged')

    def test_google_drive_folder_must_not_overlap(self):
        google = self.home / '.config/dotfiles-services/google-drive/profile.json'
        setup.private_write(google, json.dumps({'local': str(self.home / 'Cloud')}), self.home, self.repo)
        with self.assertRaisesRegex(ValueError, 'non-overlapping'):
            self.apps.folder(str(self.home / 'Cloud/OneDrive'))

    def test_unmanaged_service_directory_is_untouched(self):
        self.apps.private.mkdir(parents=True)
        token = self.apps.private / 'refresh_token'
        token.write_text('existing-secret')
        with patch.object(setup, 'require_terminal'), patch.object(self.apps, 'command', return_value=['onedrive']), patch.object(setup.subprocess, 'run') as run:
            with self.assertRaisesRegex(ValueError, 'unmanaged'):
                self.apps.setup_onedrive()
        run.assert_not_called()
        self.assertEqual(token.read_text(), 'existing-secret')

    def test_cancel_folder_choice_creates_nothing(self):
        with patch.object(setup, 'require_terminal'), patch.object(self.apps, 'command', return_value=['onedrive']), patch('builtins.input', side_effect=['', 'no']), patch.object(setup.subprocess, 'run') as run:
            self.assertEqual(self.apps.setup_onedrive(), 0)
        run.assert_not_called()
        self.assertFalse(self.apps.private.exists())

    def fake_run(self, calls, *, sync_failure=False):
        def run(argv, **kwargs):
            calls.append((argv, kwargs))
            if '--sync' not in argv:
                setup.private_write(self.apps.private / 'refresh_token', 'do-not-log-this-token', self.home, self.repo)
                return SimpleNamespace(returncode=1)  # Upstream lacks an operational mode after auth.
            return SimpleNamespace(returncode=1 if sync_failure and '--dry-run' not in argv else 0)
        return run

    def test_auth_and_preview_then_cancel_do_not_start_sync(self):
        calls = []
        with patch.object(setup, 'require_terminal'), patch.object(setup, 'hidden_terminal_input', return_value=nullcontext()), patch.object(self.apps, 'command', return_value=['/usr/bin/onedrive', '--confdir', str(self.apps.private)]), patch('builtins.input', side_effect=['', 'YES', 'no']), patch.object(setup.subprocess, 'run', side_effect=self.fake_run(calls)), patch.object(self.apps, 'resume_onedrive') as resume:
            self.apps.setup_onedrive()
        self.assertEqual(len(calls), 2)
        self.assertNotIn('--sync', calls[0][0])
        self.assertEqual(calls[1][0][-2:], ['--sync', '--dry-run'])
        self.assertTrue(all('stdout' not in kwargs and 'capture_output' not in kwargs for _, kwargs in calls))
        self.assertTrue(all('do-not-log-this-token' not in ' '.join(argv) for argv, _ in calls))
        self.assertNotIn('do-not-log-this-token', self.stdout.getvalue() + self.stderr.getvalue())
        resume.assert_not_called()
        self.assertFalse(json.loads(self.apps.profile.read_text())['ready'])
        self.assertEqual(stat.S_IMODE(self.apps.private.stat().st_mode), 0o700)
        self.assertEqual(stat.S_IMODE((self.apps.private / 'refresh_token').stat().st_mode), 0o600)

    def test_sync_failure_does_not_enable_monitor(self):
        calls = []
        with patch.object(setup, 'require_terminal'), patch.object(setup, 'hidden_terminal_input', return_value=nullcontext()), patch.object(self.apps, 'command', return_value=['onedrive']), patch('builtins.input', side_effect=['', 'YES', 'SYNC']), patch.object(setup.subprocess, 'run', side_effect=self.fake_run(calls, sync_failure=True)), patch.object(self.apps, 'resume_onedrive') as resume:
            with self.assertRaisesRegex(ValueError, 'Initial synchronization failed'):
                self.apps.setup_onedrive()
        resume.assert_not_called()
        self.assertFalse(json.loads(self.apps.profile.read_text())['ready'])

    def test_first_sync_success_is_required_before_autostart(self):
        calls = []
        with patch.object(setup, 'require_terminal'), patch.object(setup, 'hidden_terminal_input', return_value=nullcontext()), patch.object(self.apps, 'command', return_value=['onedrive']), patch('builtins.input', side_effect=['', 'YES', 'SYNC']), patch.object(setup.subprocess, 'run', side_effect=self.fake_run(calls)), patch.object(self.apps, 'resume_onedrive', return_value=0) as resume:
            self.apps.setup_onedrive()
        self.assertEqual(calls[-1][0], ['onedrive', '--sync'])
        resume.assert_called_once()
        self.assertTrue(json.loads(self.apps.profile.read_text())['ready'])

    def test_resume_writes_private_no_log_service_only_for_completed_setup(self):
        self.prepare_onedrive()
        with patch.object(setup, 'quiet_run', return_value=0) as run:
            with self.assertRaisesRegex(ValueError, 'Complete the setup'):
                self.apps.resume_onedrive()
            run.assert_not_called()
            self.apps.write_profile(self.home / 'My OneDrive', True)
            self.apps.resume_onedrive()
        unit = self.apps.unit.read_text()
        for expected in ('StandardOutput=null', 'StandardError=null', 'StandardInput=null', 'UMask=0077', 'LimitCORE=0', 'Restart=no'):
            self.assertIn(expected, unit)
        self.assertNotIn('refresh_token', unit)
        self.assertNotIn('--auth-response', unit)
        self.assertEqual(stat.S_IMODE(self.apps.unit.stat().st_mode), 0o600)

    def test_changed_logging_config_blocks_background_sync(self):
        self.prepare_onedrive(ready=True)
        config = self.apps.private / 'config'
        config.write_text(config.read_text().replace('enable_logging = "false"', 'enable_logging = "true"'))
        with patch.object(setup, 'quiet_run') as run:
            with self.assertRaisesRegex(ValueError, 'configuration changed'):
                self.apps.run_onedrive()
        run.assert_not_called()

    def test_background_run_cannot_publish_authentication_to_journal(self):
        self.prepare_onedrive(ready=True)
        with patch.object(self.apps, 'command', return_value=['onedrive']), patch.object(setup.subprocess, 'run', return_value=SimpleNamespace(returncode=0)) as run:
            self.assertEqual(self.apps.run_onedrive(), 0)
        self.assertEqual(run.call_args.args[0], ['onedrive', '--monitor'])
        self.assertEqual(run.call_args.kwargs['stdin'], subprocess.DEVNULL)
        self.assertEqual(run.call_args.kwargs['stdout'], subprocess.DEVNULL)
        self.assertEqual(run.call_args.kwargs['stderr'], subprocess.DEVNULL)

    def test_missing_sync_root_marker_stops_deletion_propagation(self):
        folder = self.prepare_onedrive(ready=True)
        (folder / setup.MARKER).unlink()
        with patch.object(setup, 'quiet_run') as run:
            with self.assertRaisesRegex(ValueError, 'access marker'):
                self.apps.run_onedrive()
        run.assert_not_called()

    def test_gui_launch_is_detached_and_never_captured(self):
        self.receipt(['slack'])
        with patch.object(setup, 'require_terminal'), patch.object(setup.shutil, 'which', return_value='/snap/bin/slack'), patch.object(setup.subprocess, 'Popen') as popen:
            self.assertEqual(self.apps.dispatch('setup', 'slack'), 0)
        self.assertEqual(popen.call_args.args[0], ['/snap/bin/slack', '--disable-logging'])
        self.assertEqual(popen.call_args.kwargs['stdout'], subprocess.DEVNULL)
        self.assertEqual(popen.call_args.kwargs['stderr'], subprocess.DEVNULL)
        self.assertTrue(popen.call_args.kwargs['start_new_session'])

    def test_gui_profile_linked_into_checkout_is_refused(self):
        (self.home / '.config').mkdir()
        (self.home / '.config/Slack').symlink_to(self.repo)
        with patch.object(setup, 'require_terminal'), patch.object(setup.subprocess, 'Popen') as popen:
            with self.assertRaises(ValueError):
                self.apps.launch_gui('slack')
        popen.assert_not_called()

    def test_snap_revision_link_is_allowed_but_profile_escape_is_refused(self):
        revision = self.home / 'snap/slack/123'
        (revision / '.config').mkdir(parents=True)
        (revision.parent / 'current').symlink_to('123')
        (revision / '.config/Slack').symlink_to(self.repo)
        with patch.object(setup, 'require_terminal'), patch.object(setup.subprocess, 'Popen') as popen:
            with self.assertRaises(ValueError):
                self.apps.launch_gui('slack')
        popen.assert_not_called()

    def test_redirecting_desktop_data_or_cache_into_repo_is_refused(self):
        for variable in ('XDG_DATA_HOME', 'XDG_CACHE_HOME', 'XDG_STATE_HOME'):
            with self.subTest(variable=variable):
                self.apps.env[variable] = str(self.repo)
                with patch.object(setup, 'require_terminal'), patch.object(setup.subprocess, 'Popen') as popen:
                    with self.assertRaises(ValueError):
                        self.apps.launch_gui('obsidian')
                popen.assert_not_called()
                del self.apps.env[variable]

    def test_electron_debug_logging_environment_is_not_inherited(self):
        self.apps.env.update({'ELECTRON_ENABLE_LOGGING': '1', 'CHROME_LOG_FILE': '/tmp/debug.log', 'DEBUG': '*'})
        with patch.object(setup, 'require_terminal'), patch.object(setup.shutil, 'which', return_value='/snap/bin/teams-for-linux'), patch.object(setup.subprocess, 'Popen') as popen:
            self.apps.launch_gui('teams-for-linux')
        environment = popen.call_args.kwargs['env']
        self.assertNotIn('DEBUG', environment)
        self.assertNotIn('ELECTRON_ENABLE_LOGGING', environment)
        self.assertNotIn('CHROME_LOG_FILE', environment)
        command = popen.call_args.args[0]
        logging = json.loads(command[command.index('--logConfig') + 1])
        self.assertFalse(logging['transports']['file']['level'])
        self.assertFalse(logging['transports']['console']['level'])

    def test_service_command_rejects_newline_injection(self):
        with self.assertRaises(ValueError):
            setup.systemd_quote('/home/user/repo\nExecStart=/usr/bin/false')
        self.assertEqual(setup.systemd_quote('/home/user/$private%folder'), '"/home/user/$$private%%folder"')

    def test_google_setup_dispatch_does_not_capture_oauth(self):
        self.receipt(['google-drive'])
        with patch.object(setup.subprocess, 'run', return_value=SimpleNamespace(returncode=0)) as run:
            self.apps.dispatch('setup', 'google-drive')
        self.assertEqual(run.call_args.args[0][-1], 'setup')
        self.assertEqual(run.call_args.kwargs, {'check': False})

    def test_missing_selection_refuses_to_launch(self):
        with patch.object(setup.subprocess, 'run') as run:
            with self.assertRaisesRegex(ValueError, 'receipt'):
                self.apps.dispatch('setup', 'google-drive')
        run.assert_not_called()

    def test_notion_disables_logging_and_self_updates_with_native_binary(self):
        self.receipt(['notion-electron'])
        with patch.object(setup, 'require_terminal'), patch.object(setup.shutil, 'which', return_value='/usr/bin/notion-electron'), patch.object(setup.subprocess, 'Popen') as popen:
            self.assertEqual(self.apps.dispatch('setup', 'notion-electron'), 0)
        command = popen.call_args.args[0]
        self.assertEqual(command, ['/usr/bin/notion-electron', '--disable-logging', '--disable-update-functionality'])
        self.assertNotIn('--no-sandbox', command)
        self.assertEqual(popen.call_args.kwargs['stdout'], subprocess.DEVNULL)
        self.assertEqual(popen.call_args.kwargs['stderr'], subprocess.DEVNULL)

    def test_notion_package_and_product_profiles_cannot_target_git(self):
        (self.home / '.config').mkdir()
        for name in ('notion-electron', 'Notion Electron'):
            profile = self.home / '.config' / name
            profile.symlink_to(self.repo)
            with patch.object(setup, 'require_terminal'), patch.object(setup.subprocess, 'Popen') as popen:
                with self.assertRaises(ValueError):
                    self.apps.launch_gui('notion-electron')
            popen.assert_not_called()
            profile.unlink()


if __name__ == '__main__':
    unittest.main()
