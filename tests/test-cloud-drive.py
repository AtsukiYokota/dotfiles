#!/usr/bin/env python3
"""Private authentication and failure-safe bisync without accessing accounts."""
from contextlib import redirect_stdout
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('cloud_drive', ROOT / 'commands/cloud_drive.py')
cloud = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cloud)


@unittest.skipUnless(sys.platform == 'linux', 'Google Drive helper targets Linux desktop users')
class DriveTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.home = Path(self.temporary.name) / 'home'
        self.home.mkdir()
        self.repo = self.home / 'dotfiles'
        self.repo.mkdir()
        self.drive = cloud.Drive(self.home, self.repo)
        self.drive.prepare()
        self.local = self.home / 'GoogleDrive'
        self.local.mkdir()
        self.profile = {'schema': 1, 'local': str(self.local), 'remote_path': 'Documents',
                        'marker': '.dotfiles-drive-access-' + '1' * 32}

    def authenticated(self):
        self.drive.write(self.drive.auth, '[google-drive]\ntype = drive\ntoken = PRIVATE-TOKEN\n')
        self.drive.write(self.drive.profile, json.dumps(self.profile))
        self.drive.write(self.drive.filters, cloud.FILTERS)
        self.drive.status_write('ready')

    def test_rejects_repository_overlap_and_private_sync_roots(self):
        candidates = [self.home, self.repo, self.repo / 'nested', self.home / '.config/new',
                      self.home / '.mozilla/new', self.home / '.ssh/new', self.home / '..' / 'outside',
                      self.home / 'work/.config/new', self.home / 'contains\nnewline']
        for candidate in candidates:
            with self.subTest(path=candidate):
                profile = dict(self.profile, local=str(candidate))
                with self.assertRaises(cloud.DriveError):
                    self.drive.validate_selection(profile, empty=True)

    def test_rejects_git_checkout_and_nonempty_initial_destination(self):
        (self.local / 'precious.txt').write_text('keep me')
        with self.assertRaises(cloud.DriveError):
            self.drive.validate_selection(self.profile, empty=True)
        self.assertEqual((self.local / 'precious.txt').read_text(), 'keep me')
        (self.local / '.git').mkdir()
        with self.assertRaises(cloud.DriveError):
            self.drive.validate_selection(self.profile)

    def test_cloud_sync_roots_cannot_overlap(self):
        other = self.home / '.config/dotfiles-services/onedrive/profile.json'
        other.parent.mkdir(parents=True)
        other.write_text(json.dumps({'version': 1, 'folder': str(self.home / 'WorkFiles'), 'ready': True}))
        for local in (self.home / 'OneDrive/new', self.home / 'Dropbox/new', self.home / 'WorkFiles/new'):
            with self.subTest(path=local), self.assertRaises(cloud.DriveError):
                self.drive.validate_selection(dict(self.profile, local=str(local)), empty=True)

    @unittest.skipUnless(sys.platform == 'linux', 'Linux symlink semantics')
    def test_rejects_symlinked_credentials_and_sync_directories(self):
        outside = self.home / 'secret'
        outside.write_text('private')
        self.drive.auth.symlink_to(outside)
        with self.assertRaises(cloud.DriveError):
            self.drive.prepare()
        self.drive.auth.unlink()
        self.local.rmdir()
        self.local.symlink_to(self.repo, target_is_directory=True)
        with self.assertRaises(cloud.DriveError):
            self.drive.validate_selection(self.profile)

    @unittest.skipUnless(sys.platform == 'linux', 'Linux mode semantics')
    def test_private_files_and_directories_have_no_group_or_world_access(self):
        self.authenticated()
        for directory in (self.drive.config, self.drive.state):
            self.assertEqual(directory.stat().st_mode & 0o777, 0o700)
        for path in (self.drive.auth, self.drive.profile, self.drive.result, self.drive.filters):
            self.assertEqual(path.stat().st_mode & 0o777, 0o600)
        outside = self.home / 'linked-token'
        os.link(self.drive.auth, outside)
        with self.assertRaises(cloud.DriveError):
            self.drive.prepare()

    def test_refuses_malformed_remote_paths_and_markers(self):
        for remote in ('../outside', '/absolute', 'foo/../bar', 'other:path', 'foo\n--dump',
                       '.dotfiles-drive-backup', 'foo\\bar'):
            with self.subTest(remote=remote), self.assertRaises(cloud.DriveError):
                self.drive.validate_selection(dict(self.profile, remote_path=remote))
        with self.assertRaises(cloud.DriveError):
            self.drive.validate_selection(dict(self.profile, marker='../secret'))

    def test_scheduled_command_preserves_conflicts_backups_and_access_checks(self):
        command = self.drive.command(self.profile)
        self.assertIn('--check-access', command)
        self.assertIn('--drive-skip-gdocs', command)
        self.assertIn('--backup-dir1', command)
        self.assertIn('--backup-dir2', command)
        self.assertIn('--max-delete', command)
        self.assertEqual(command[command.index('--conflict-resolve') + 1], 'none')
        self.assertNotIn('--resync', command)
        self.assertNotIn('--resync-mode', command)
        self.assertNotIn('--force', command)
        self.assertNotIn('--copy-links', command)
        initial = self.drive.command(self.profile, initial=True, dry_run=True)
        self.assertIn('--dry-run', initial)
        self.assertEqual(initial[initial.index('--resync-mode') + 1], 'path2')
        self.assertNotIn('--check-access', initial)

    def test_rclone_env_cannot_override_config_or_enable_secret_logging(self):
        with mock.patch.dict(os.environ, {'RCLONE_CONFIG': '/tmp/elsewhere', 'RCLONE_DUMP': 'auth',
                                         'RCLONE_LOG_FILE': '/tmp/leak', 'RCLONE_RC_ENABLE': 'true'}):
            env = cloud.clean_environment(self.home, self.drive.state)
        self.assertFalse(any(name.startswith('RCLONE_') for name in env))
        self.assertEqual(env['XDG_CACHE_HOME'], str(self.drive.state / 'cache'))

    def test_noninteractive_execution_discards_outputs(self):
        self.drive.binary.parent.mkdir(parents=True, exist_ok=True)
        self.drive.binary.write_text('fixture')
        with mock.patch.object(cloud.subprocess, 'run', return_value=mock.Mock(returncode=0)) as run:
            self.drive.execute(['bisync', 'one', 'two'])
        arguments, kwargs = run.call_args
        self.assertEqual(kwargs['stdout'], subprocess.DEVNULL)
        self.assertEqual(kwargs['stderr'], subprocess.DEVNULL)
        self.assertEqual(kwargs['stdin'], subprocess.DEVNULL)
        self.assertEqual(arguments[0][arguments[0].index('--log-file') + 1], os.devnull)

    def test_authentication_hides_inputs_and_does_not_dump_config(self):
        output = io.StringIO()
        def authenticate(arguments, **kwargs):
            self.assertEqual(arguments, ['config', 'reconnect', 'google-drive:', '--auto-confirm'])
            self.assertTrue(kwargs['terminal'])
            self.assertIn('client_secret = PRIVATE-SECRET', self.drive.auth.read_text())
            with self.drive.auth.open('a') as stream:
                stream.write('token = PRIVATE-TOKEN\n')
            return 0
        with mock.patch.object(cloud.getpass, 'getpass', side_effect=['fixture.apps.googleusercontent.com', 'PRIVATE-SECRET']), \
                mock.patch.object(self.drive, 'execute', side_effect=authenticate), redirect_stdout(output):
            self.drive.authenticate()
        self.assertNotIn('PRIVATE-SECRET', output.getvalue())
        self.assertNotIn('PRIVATE-TOKEN', output.getvalue())

    @unittest.skipUnless(sys.platform == 'linux', 'Linux flock semantics')
    def test_failure_pauses_and_never_silently_resyncs(self):
        self.authenticated()
        with mock.patch.object(self.drive, 'execute', return_value=7) as execute:
            with self.assertRaises(cloud.DriveError):
                self.drive.run()
            self.assertNotIn('--resync', execute.call_args.args[0])
            with self.assertRaises(cloud.DriveError):
                self.drive.run()
            self.assertEqual(execute.call_count, 1)
        self.assertEqual(json.loads(self.drive.result.read_text())['status'], 'paused-after-error')

    @unittest.skipUnless(sys.platform == 'linux', 'Linux flock semantics')
    def test_initial_cancellation_does_not_touch_remote_or_enable_timer(self):
        self.drive.write(self.drive.auth, '[google-drive]\ntype = drive\ntoken = PRIVATE-TOKEN\n')
        with mock.patch.object(cloud, 'require_terminal'), mock.patch('builtins.input', side_effect=['Documents', str(self.local), 'no']), \
                mock.patch.object(self.drive, 'execute', return_value=0) as execute, \
                mock.patch.object(self.drive, 'remote_summary', return_value=(3, 1024)), \
                mock.patch.object(self.drive, 'install_timer') as timer, redirect_stdout(io.StringIO()):
            self.drive.setup()
        self.assertEqual(execute.call_count, 1)
        self.assertIn('--dry-run', execute.call_args.args[0])
        timer.assert_not_called()
        self.assertFalse(self.drive.profile.exists())
        self.assertEqual(list(self.local.iterdir()), [])

    def test_timer_has_no_account_paths_and_discards_journal_output(self):
        executable = self.home / '.local/bin/dotfiles-drive'
        executable.parent.mkdir(parents=True, exist_ok=True)
        executable.write_text('fixture')
        with mock.patch.object(self.drive, 'systemctl', return_value=0):
            self.drive.install_timer()
        unit = (self.drive.units / cloud.SERVICE).read_text()
        self.assertIn('StandardOutput=null', unit)
        self.assertIn('StandardError=null', unit)
        self.assertIn('UMask=0077', unit)
        self.assertIn('LimitCORE=0', unit)
        self.assertNotIn(str(self.local), unit)
        self.assertNotIn('google-drive:', unit)
        self.assertIn('OnUnitInactiveSec=5min', (self.drive.units / cloud.TIMER).read_text())

    def test_status_never_prints_private_profile_or_auth_content(self):
        self.authenticated()
        output = io.StringIO()
        with mock.patch.object(self.drive, 'systemctl', return_value=0), redirect_stdout(output):
            self.drive.status()
        self.assertNotIn('PRIVATE-TOKEN', output.getvalue())
        self.assertNotIn(str(self.local), output.getvalue())
        self.assertNotIn('Documents', output.getvalue())

    def test_terminal_is_required_for_login_and_confirmation(self):
        with mock.patch.object(cloud.sys.stdin, 'isatty', return_value=False):
            with self.assertRaises(cloud.DriveError):
                cloud.require_terminal()

    def test_remote_preflight_requires_existing_folder_and_only_reports_totals(self):
        with mock.patch.object(self.drive, 'execute', return_value=3), \
                mock.patch.object(cloud.subprocess, 'run') as run:
            with self.assertRaises(cloud.DriveError):
                self.drive.remote_summary('google-drive:missing')
            run.assert_not_called()
        self.drive.binary.parent.mkdir(parents=True, exist_ok=True)
        self.drive.binary.write_text('fixture')
        with mock.patch.object(self.drive, 'execute', return_value=0), \
                mock.patch.object(cloud.subprocess, 'run', return_value=mock.Mock(returncode=0, stdout='{"count": 3, "bytes": 1024}')) as run:
            self.assertEqual(self.drive.remote_summary('google-drive:folder'), (3, 1024))
            self.assertIn('--json', run.call_args.args[0])
            self.assertEqual(run.call_args.kwargs['stderr'], subprocess.DEVNULL)


@unittest.skipUnless(os.environ.get('DOTFILES_RCLONE_TEST_BINARY'), 'Set DOTFILES_RCLONE_TEST_BINARY for real local/local bisync verification')
class RcloneIntegration(unittest.TestCase):
    setUp = DriveTests.setUp

    def test_actual_bisync_create_edit_delete_backup_and_missing_marker(self):
        self.drive.binary = Path(os.environ['DOTFILES_RCLONE_TEST_BINARY'])
        self.drive.write(self.drive.auth, '')
        self.drive.write(self.drive.filters, cloud.FILTERS)
        remote = self.home / 'remote-fixture'
        remote.mkdir()
        (remote / 'hello.txt').write_text('remote original')
        self.assertEqual(self.drive.remote_summary(str(remote)), (1, len('remote original')))
        with self.assertRaises(cloud.DriveError):
            self.drive.remote_summary(str(remote / 'missing'))
        for folder in (remote, self.local):
            (folder / self.profile['marker']).write_text('check')
        def execute(initial=False):
            arguments = self.drive.command(self.profile, initial=initial)
            arguments[2] = str(remote)
            index = arguments.index('--backup-dir2') + 1
            arguments[index] = str(remote / cloud.BACKUP / ('run-' + cloud.uuid.uuid4().hex))
            return self.drive.execute(arguments)
        self.assertEqual(execute(initial=True), 0)
        self.assertEqual((self.local / 'hello.txt').read_text(), 'remote original')
        (self.local / 'local.txt').write_text('created locally')
        self.assertEqual(execute(), 0)
        self.assertEqual((remote / 'local.txt').read_text(), 'created locally')
        (self.local / 'hello.txt').write_text('edited locally and made longer')
        self.assertEqual(execute(), 0)
        self.assertEqual((remote / 'hello.txt').read_text(), 'edited locally and made longer')
        (remote / 'hello.txt').write_text('edited remotely with an even longer replacement')
        self.assertEqual(execute(), 0)
        self.assertEqual((self.local / 'hello.txt').read_text(), 'edited remotely with an even longer replacement')
        (self.local / 'hello.txt').write_text('conflicting local value')
        (remote / 'hello.txt').write_text('conflicting remote value with different size')
        self.assertEqual(execute(), 0)
        conflicts = [path.read_text() for path in self.local.glob('hello*')]
        self.assertIn('conflicting local value', conflicts)
        self.assertIn('conflicting remote value with different size', conflicts)
        # More than 10% deletion is deliberately refused. With a sufficiently
        # large fixture, a single deletion propagates and is retained in backup.
        for index in range(30):
            (self.local / f'pad-{index}.txt').write_text('padding')
        self.assertEqual(execute(), 0)
        (self.local / 'local.txt').unlink()
        self.assertEqual(execute(), 0)
        self.assertFalse((remote / 'local.txt').exists())
        self.assertTrue(any((remote / cloud.BACKUP).rglob('local.txt')))
        (self.local / self.profile['marker']).unlink()
        self.assertNotEqual(execute(), 0)
        self.assertTrue(list(remote.glob('hello*')))


if __name__ == '__main__':
    unittest.main()
