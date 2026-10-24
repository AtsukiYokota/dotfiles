"""Offline checks for exact configuration plans and partial local APT estimates."""
from __future__ import annotations

import contextlib
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
import planning
from deploy import Backup


class ConfigurationTests(unittest.TestCase):
    def test_shell_blocks_preserve_existing_text_and_are_idempotent(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            (home / '.bashrc').write_text('export USER_SETTING=yes\n', encoding='utf-8')
            (home / '.profile').write_text('# my login settings\n', encoding='utf-8')
            operations = planning.file_operations(ROOT, home, home / '.config', ['shell'])
            by_name = {item.target.name: item for item in operations}
            self.assertIn('export USER_SETTING=yes', by_name['.bashrc'].content)
            self.assertIn('# my login settings', by_name['.profile'].content)
            for name in ('.bashrc', '.profile'):
                (home / name).write_text(by_name[name].content, encoding='utf-8')
            again = {item.target.name: item for item in planning.file_operations(ROOT, home, home / '.config', ['shell'])}
            self.assertEqual(again['.bashrc'].content, by_name['.bashrc'].content)
            self.assertEqual(again['.profile'].content, by_name['.profile'].content)

    def test_malformed_user_block_fails_without_modifying_it(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            text = 'export KEEP=yes\n# >>> dotfiles managed >>>\n'
            (home / '.bashrc').write_text(text, encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'Malformed'):
                planning.file_operations(ROOT, home, home / '.config', ['shell'])
            self.assertEqual((home / '.bashrc').read_text(encoding='utf-8'), text)

    def test_reversed_block_markers_are_rejected_before_deployment(self):
        with self.assertRaisesRegex(ValueError, 'Malformed'):
            planning._managed_block('# end\nprivate-setting\n# begin\n', '# begin', '# end', 'managed')

    def test_default_report_hides_contents_and_explicit_diff_redacts(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            path = home / '.config-file'
            old = 'export PASSWORD=secret-value\nemail=private@example.com\nvisible=before\n'
            path.write_text(old, encoding='utf-8')
            operation = planning.FileOperation('write', path, content='visible=after\n')
            default = planning.config_report([operation], home)
            self.assertEqual(default[0]['diff'], [])
            self.assertNotIn('secret-value', json.dumps(default))
            explicit = planning.config_report([operation], home, True)
            self.assertNotIn('secret-value', json.dumps(explicit))
            self.assertNotIn('private@example.com', json.dumps(explicit))
            self.assertIn('-visible=before', explicit[0]['diff'])
            self.assertEqual(path.read_text(encoding='utf-8'), old)

    def test_private_key_blocks_are_redacted_including_payload(self):
        value = '-----BEGIN RSA PRIVATE KEY-----\nsensitive-payload\n-----END RSA PRIVATE KEY-----\nkeep=yes'
        redacted = planning.redact(value)
        self.assertNotIn('sensitive-payload', redacted)
        self.assertIn('keep=yes', redacted)

    def test_diff_is_bounded_and_large_file_contents_are_omitted(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            path = home / 'small'
            operation = planning.FileOperation('write', path, content='\n'.join(f'line{i}' for i in range(200)))
            report = planning.config_report([operation], home, True)[0]
            self.assertLessEqual(len(report['diff']), 81)
            self.assertIn('truncated', report['diff'][-1])
            path.write_text('x' * (256 * 1024), encoding='utf-8')
            report = planning.config_report([operation], home, True)[0]
            self.assertEqual(report['diff'], [])
            self.assertIn('large file', report['note'])

    @unittest.skipUnless(sys.platform == 'linux', 'Linux symlinks')
    def test_outside_symlink_contents_are_not_shown_and_parent_escape_is_blocked(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            home = root / 'home'
            home.mkdir()
            outside = root / 'outside'
            outside.mkdir()
            (outside / 'config').write_text('unlabeled-private-value', encoding='utf-8')
            (home / 'config').symlink_to(outside / 'config')
            (home / 'linked').symlink_to(outside, target_is_directory=True)
            operations = [planning.FileOperation('write', home / 'config', content='new'),
                          planning.FileOperation('write', home / 'linked/config', content='new')]
            report = planning.config_report(operations, home, True)
            self.assertNotIn('unlabeled-private-value', json.dumps(report))
            self.assertEqual(report[0]['diff'], [])
            self.assertEqual(report[1]['status'], 'BLOCKED')

    @unittest.skipUnless(sys.platform == 'linux', 'Linux symlinks')
    def test_actual_deployment_uses_same_operations_as_plan(self):
        from types import SimpleNamespace
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            source = home / 'source'
            source.write_text('managed=true\n', encoding='utf-8')
            operations = [planning.FileOperation('write', home / 'written', content='new\n', mode=0o755),
                          planning.FileOperation('link', home / 'linked', source=source)]
            ctx = SimpleNamespace(repo=ROOT, home=home, config=home / '.config', modules=[],
                                  backup=Backup(home / 'backup', home))
            self.assertEqual([item['status'] for item in planning.config_report(operations, home)], ['NEW', 'NEW'])
            with mock.patch.object(planning, 'all_file_operations', return_value=operations):
                planning.apply_file_operations(ctx)
            self.assertEqual([item['status'] for item in planning.config_report(operations, home)], ['CURRENT', 'CURRENT'])
            self.assertEqual((home / 'written').stat().st_mode & 0o777, 0o755)


VERSIONS = {'ros_source': {'url': 'https://example.invalid/ros2-apt-source_1.0.resolute_all.deb'}}


class AptTests(unittest.TestCase):
    def fixture(self, missing=False):
        calls = []

        def capture(argv):
            calls.append(argv)
            if 'policy' in argv:
                text = ''.join(f'{name}:\n  Installed: (none)\n  Candidate: 1\n' for name in ('gnupg', 'software-properties-common'))
                return text + 'alpha:\n  Installed: 1\n  Candidate: 2\n' + ('beta:\n  Installed: (none)\n  Candidate: (none)\n' if missing else 'beta:\n  Installed: (none)\n  Candidate: 1\n')
            if '--simulate' in argv:
                return 'Inst alpha [1] (2 Ubuntu:26.04/resolute [amd64])\nInst dep (3 Ubuntu:26.04/resolute [amd64])\nConf alpha (2 Ubuntu [amd64])\n'
            if 'show' in argv:
                return 'Package: alpha\nVersion: 2\nSize: 100\nInstalled-Size: 3\n\nPackage: dep\nVersion: 3\nSize: 200\nInstalled-Size: 5\n'
            if argv[0] == '/usr/bin/dpkg-query':
                return 'alpha:amd64\t1\t2\tinstalled\nold\t1\t1000\tconfig-files\n'
            self.fail(f'Unexpected preview command: {argv}')

        return capture, calls

    def report(self, capture):
        with mock.patch.object(planning, 'packages_for', return_value=['alpha', 'beta']):
            return planning.apt_report([], VERSIONS, 'amd64', capture=capture,
                                       current_codename='resolute', current_arch='amd64')

    def test_dependency_sizes_and_upgrade_delta_use_real_metadata(self):
        capture, calls = self.fixture()
        report = self.report(capture)
        self.assertTrue(report['complete'])
        self.assertEqual(report['download_bytes'], 300)
        self.assertEqual(report['installed_delta_bytes'], 6 * 1024)
        self.assertEqual(report['changes'][1]['name'], 'dep')
        self.assertEqual(report['packages'][0]['status'], 'UPDATE')
        self.assertEqual(len(calls), 4)
        for command in calls:
            self.assertNotIn('sudo', command)
            self.assertNotIn('update', command)
            if command[0] == '/usr/bin/apt-get':
                self.assertIn('--simulate', command)

    def test_missing_external_repository_remains_partial_not_zero(self):
        capture, calls = self.fixture(missing=True)
        report = self.report(capture)
        self.assertFalse(report['complete'])
        self.assertEqual(report['download_bytes'], 300)
        self.assertTrue(any('beta' in note for note in report['unknown']))
        simulation = next(command for command in calls if '--simulate' in command)
        self.assertNotIn('beta', simulation)

    def test_other_release_or_arch_never_uses_wrong_host_package_cache(self):
        capture = mock.Mock(side_effect=AssertionError('must not execute'))
        for codename, arch in (('noble', 'amd64'), ('resolute', 'arm64')):
            report = planning.apt_report([], VERSIONS, 'amd64', capture=capture,
                                         current_codename=codename, current_arch=arch)
            self.assertIsNone(report['download_bytes'])
            self.assertFalse(report['complete'])
        capture.assert_not_called()

    def test_failed_simulation_does_not_claim_zero_download(self):
        original, _ = self.fixture()

        def capture(argv):
            if '--simulate' in argv:
                raise RuntimeError('Cannot resolve dependency')
            return original(argv)

        report = self.report(capture)
        self.assertIsNone(report['download_bytes'])
        self.assertIn('Cannot resolve dependency', report['unknown'])

    def test_no_changes_with_complete_cache_reports_zero(self):
        original, _ = self.fixture()

        def capture(argv):
            return '' if '--simulate' in argv else original(argv)

        report = self.report(capture)
        self.assertEqual(report['download_bytes'], 0)
        self.assertEqual(report['installed_delta_bytes'], 0)
        self.assertTrue(report['complete'])

    def test_reader_rejects_shell_or_actual_apt_install(self):
        for argv in (['bash', '-c', 'echo unsafe'], ['/usr/bin/apt-get', 'install', 'git']):
            with self.assertRaises(ValueError):
                planning.read_command(argv)
        response = subprocess.CompletedProcess([], 0, stdout='metadata', stderr='')
        with mock.patch.object(planning.subprocess, 'run', return_value=response) as run:
            self.assertEqual(planning.read_command(['/usr/bin/apt-cache', 'policy', 'git']), 'metadata')
            kwargs = run.call_args.kwargs
            self.assertNotIn('shell', kwargs)
            self.assertEqual(kwargs['env']['APT_CONFIG'], '/dev/null')


class ToolTests(unittest.TestCase):
    def test_cached_tool_and_registry_unknown_sizes_are_distinct(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            data = home / '.local/share/dotfiles'
            directory = data / 'tools/node/24.22.1'
            directory.mkdir(parents=True)
            (directory / '.dotfiles-sha256').write_text('abc', encoding='ascii')
            versions = {'node': {'version': '24.22.1', 'amd64': {'sha256': 'abc', 'size': 1234}},
                        'npm_language_servers': {'bash-language-server': '5.8.1'}}
            with mock.patch.object(planning.subprocess, 'run', side_effect=AssertionError('must not execute binaries')):
                report = planning.user_tools_report(['node'], versions, home, data, 'amd64')
            self.assertEqual(report['tools'][0]['status'], 'CACHED')
            self.assertEqual(report['tools'][0]['download_bytes'], 0)
            self.assertIsNone(report['tools'][1]['download_bytes'])

    def test_configs_only_never_queries_packages_or_creates_probe_files(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            before = list(home.iterdir())
            output = io.StringIO()
            with mock.patch.object(planning, 'all_file_operations', return_value=[]), \
                    mock.patch.object(planning, 'apt_report', side_effect=AssertionError('must not inspect apt')), \
                    mock.patch.object(planning, 'read_command', side_effect=AssertionError('must not run commands')), \
                    contextlib.redirect_stdout(output):
                report = planning.show_details(ROOT, home, home / '.config', home / '.local/share/dotfiles',
                                               ['shell'], {}, 'amd64', 'wsl', configs_only=True)
            self.assertIsNone(report['apt'])
            self.assertEqual(before, list(home.iterdir()))
            self.assertIn('Downloads: 0', output.getvalue())


class IntegratedPreflightTests(unittest.TestCase):
    def test_malformed_git_config_aborts_before_backup_or_deployment(self):
        import main
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            content = '# <<< dotfiles delta <<<\n# >>> dotfiles delta >>>\n'
            (home / '.gitconfig').write_text(content, encoding='utf-8')
            with mock.patch.dict(os.environ, {'HOME': str(home)}, clear=True), \
                    mock.patch.object(main.Path, 'home', return_value=home), \
                    mock.patch.object(main, 'Backup') as backup, \
                    mock.patch.object(main, 'deploy_configs') as deploy, \
                    mock.patch.object(main, 'install_modules') as install, \
                    contextlib.redirect_stdout(io.StringIO()), \
                    self.assertRaisesRegex(ValueError, 'configuration preview error'):
                main.main(['--modules', 'git-tools', '--configs-only', '--yes'])
            backup.assert_not_called()
            deploy.assert_not_called()
            install.assert_not_called()
            self.assertEqual((home / '.gitconfig').read_text(encoding='utf-8'), content)
            self.assertEqual(sorted(path.name for path in home.iterdir()), ['.gitconfig'])

    @unittest.skipUnless(sys.platform == 'linux', 'Linux symlinks')
    def test_home_binary_parent_escape_aborts_before_any_installation(self):
        import main
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            home, outside = root / 'home', root / 'outside'
            home.mkdir()
            outside.mkdir()
            (home / '.local').mkdir()
            (home / '.local/bin').symlink_to(outside, target_is_directory=True)
            with mock.patch.dict(os.environ, {'HOME': str(home)}, clear=True), \
                    mock.patch.object(main.Path, 'home', return_value=home), \
                    mock.patch.object(main, 'Backup') as backup, \
                    mock.patch.object(main, 'deploy_configs') as deploy, \
                    contextlib.redirect_stdout(io.StringIO()), \
                    self.assertRaisesRegex(ValueError, 'configuration preview error'):
                main.main(['--modules', 'cpp', '--configs-only', '--yes'])
            backup.assert_not_called()
            deploy.assert_not_called()
            self.assertEqual(list(outside.iterdir()), [])


if __name__ == '__main__':
    unittest.main()
