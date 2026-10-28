"""Offline WSL configuration preview and restart-to-font setup lifecycle."""
import contextlib
import errno
import io
import json
from pathlib import Path
import shlex
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
import fonts
import main
import planning
import wsl_interop
import wsl_setup


class PreviewTests(unittest.TestCase):
    def test_system_preview_is_read_only_and_bounds_sensitive_diffs(self):
        with tempfile.TemporaryDirectory() as temporary:
            config = Path(temporary) / 'wsl.conf'
            original = b'[interop]\nenabled=false\nappendWindowsPath=false\npassword=private-value\n'
            config.write_bytes(original)
            with patch.object(wsl_setup, 'CONFIG_PATH', config), \
                    patch.object(wsl_setup.shutil, 'which', side_effect=AssertionError('No process lookup in preview')):
                ordinary = wsl_setup.configuration_plan()
                detailed = wsl_setup.configuration_plan(show_diff=True)
            self.assertEqual(ordinary['status'], 'UPDATE')
            self.assertEqual(ordinary['diff'], [])
            self.assertEqual(ordinary['expected_sha256'], wsl_interop.fingerprint(original))
            self.assertNotIn('private-value', '\n'.join(detailed['diff']))
            self.assertIn('+enabled=true', detailed['diff'])
            self.assertEqual(config.read_bytes(), original)
            self.assertEqual(list(config.parent.iterdir()), [config])

    def test_preview_includes_system_target_only_for_wsl_fonts(self):
        for platform, modules, expected in [('wsl', ['fonts'], 1), ('native', ['fonts'], 0), ('wsl', ['cpp'], 0)]:
            with self.subTest(platform=platform, modules=modules), tempfile.TemporaryDirectory() as temporary:
                home = Path(temporary)
                item = {'path': '/etc/wsl.conf', 'status': 'UPDATE', 'diff': [], 'changed': True}
                with patch.object(planning, 'all_file_operations', return_value=[]), \
                        patch.object(wsl_setup, 'configuration_plan', return_value=item) as plan, \
                        contextlib.redirect_stdout(io.StringIO()):
                    report = planning.show_details(ROOT, home, home / '.config', home / '.local/share',
                                                   modules, {}, 'amd64', platform, configs_only=True)
                self.assertEqual(plan.call_count, expected)
                self.assertEqual('wsl_interop' in report, bool(expected))

    def test_malformed_system_config_blocks_installation_at_preview(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            with patch.object(planning, 'all_file_operations', return_value=[]), \
                    patch.object(wsl_setup, 'configuration_plan', side_effect=ValueError('Duplicate interop')), \
                    contextlib.redirect_stdout(io.StringIO()):
                report = planning.show_details(ROOT, home, home, home, ['fonts'], {}, 'amd64', 'wsl', configs_only=True)
            self.assertIn('Duplicate interop', report['configuration_error'])

    def test_cancel_does_not_run_privileged_helper(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            with patch.object(main.Path, 'home', return_value=home), \
                    patch.object(main, 'detect_platform', return_value=({'ID': 'ubuntu'}, 'wsl', 'amd64')), \
                    patch.object(main, 'check_platform'), patch.object(main, 'preflight'), \
                    patch.object(main, 'show_plan'), \
                    patch.object(planning, 'show_details', return_value={'configurations': []}), \
                    patch.dict(main.os.environ, {'XDG_STATE_HOME': str(home / 'state'),
                                                'XDG_CONFIG_HOME': str(home / 'config'),
                                                'XDG_DATA_HOME': str(home / 'data')}), \
                    patch('builtins.input', return_value=''), \
                    patch.object(wsl_setup, 'ensure_interop') as configure, \
                    contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(main.main(['--modules', 'fonts', '--configs-only']), 0)
            configure.assert_not_called()
            self.assertEqual(list(home.iterdir()), [])

    def test_successful_linux_install_reports_windows_setup_as_pending(self):
        def install(ctx):
            ctx.wsl_windows_pending = True
            ctx.wsl_restart_required = True

        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            with patch.object(main.Path, 'home', return_value=home), \
                    patch.object(main, 'detect_platform', return_value=({'ID': 'ubuntu'}, 'wsl', 'amd64')), \
                    patch.object(main, 'check_platform'), patch.object(main, 'preflight'), \
                    patch.object(main, 'show_plan'), \
                    patch.object(main, 'install_modules', side_effect=install), \
                    patch('workflow_tools.record_installation') as receipt, \
                    patch.object(planning, 'show_details', return_value={'configurations': []}), \
                    patch.dict(main.os.environ, {'XDG_STATE_HOME': str(home / 'state'),
                                                'XDG_CONFIG_HOME': str(home / 'config'),
                                                'XDG_DATA_HOME': str(home / 'data')}), \
                    contextlib.redirect_stdout(io.StringIO()) as output:
                self.assertEqual(main.main(['--modules', 'fonts', '--yes']), 0)
            receipt.assert_called_once()
            self.assertIn('Ubuntu setup complete. Windows font setup requires', output.getvalue())
            self.assertIn('--modules fonts --configs-only', output.getvalue())
            self.assertNotIn('Installation complete.', output.getvalue())


@unittest.skipUnless(sys.platform == 'linux', 'Temporary-file lifecycle uses Linux file semantics')
class LifecycleTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        root = Path(self.temporary.name)
        self.config = root / 'wsl.conf'
        self.config.write_bytes(b'[boot]\nsystemd=true\n[interop]\nenabled=false\nappendWindowsPath=false\n')
        self.addCleanup(patch.stopall)
        patch.object(wsl_setup, 'CONFIG_PATH', self.config).start()
        patch.object(wsl_setup.shutil, 'which', side_effect=lambda name: '/usr/bin/' + name).start()
        self.ctx = SimpleNamespace(home=root, repo=root / 'checkout with spaces', data=root / 'data/dotfiles',
                                   platform='wsl', versions={'nerd_font': {'version': 'test', 'sha256': 'f' * 64}},
                                   backup=SimpleNamespace(directory=root / 'backup'), runner=Mock(), modules=['fonts'])
        self.ctx.backup.directory.mkdir()
        directory = fonts.font_directory(self.ctx)
        directory.mkdir(parents=True)
        for name in fonts.FONT_FILES:
            (directory / name).write_bytes(b'font')
        (directory / '.dotfiles-sha256').write_text('f' * 64, encoding='ascii')
        target = fonts.font_target(self.ctx)
        target.parent.mkdir(parents=True)
        target.symlink_to(directory, target_is_directory=True)

    def fake_apply(self, argv):
        self.assertEqual(argv[:5], ['sudo', '/usr/bin/python3', '-I', '-B', str(self.ctx.repo / 'installer/wsl_interop.py')])
        self.assertNotIn('--shutdown', argv)
        return json.dumps(wsl_interop.apply_config(self.config, argv[-1]))

    def test_first_run_preserves_config_defers_fonts_and_next_run_completes(self):
        self.ctx.wsl_interop_plan = wsl_setup.configuration_plan()
        self.ctx.runner.capture.side_effect = self.fake_apply
        with patch.object(fonts, 'configure_windows_terminal') as windows, contextlib.redirect_stdout(io.StringIO()) as output:
            fonts.configure_fonts(self.ctx)
            wsl_setup.report_pending(self.ctx, installation_complete=True)
        windows.assert_not_called()
        self.assertIn('[boot]\nsystemd=true', self.config.read_text())
        self.assertIn('enabled=true', self.config.read_text())
        self.assertTrue(self.ctx.wsl_restart_required)
        self.assertIn('wsl --shutdown', output.getvalue())
        self.assertIn('cd ' + shlex.quote(str(self.ctx.repo)), output.getvalue())
        self.assertIn('--modules fonts --configs-only', output.getvalue())
        record = json.loads((self.ctx.backup.directory / 'wsl-interop.json').read_text())
        self.assertEqual(Path(record['backup']).read_bytes(), b'[boot]\nsystemd=true\n[interop]\nenabled=false\nappendWindowsPath=false\n')
        # Fresh installer invocation after the user's restart: no sudo or extra backup.
        self.ctx.wsl_interop_plan = wsl_setup.configuration_plan()
        self.ctx.wsl_windows_pending = False
        self.ctx.wsl_restart_required = False
        self.ctx.runner.reset_mock()
        with patch.object(fonts, 'configure_windows_terminal') as windows:
            fonts.configure_fonts(self.ctx)
        windows.assert_called_once_with(self.ctx, fonts.font_directory(self.ctx))
        self.ctx.runner.capture.assert_not_called()
        self.assertEqual(len(list(self.config.parent.glob('wsl.conf.dotfiles-backup-*'))), 1)

    def test_changes_since_confirmation_abort_before_sudo(self):
        self.ctx.wsl_interop_plan = wsl_setup.configuration_plan()
        self.config.write_bytes(self.config.read_bytes() + b'# User changed this\n')
        with self.assertRaisesRegex(RuntimeError, 'changed after the preview'):
            wsl_setup.ensure_interop(self.ctx)
        self.ctx.runner.capture.assert_not_called()

    def test_native_never_reads_or_writes_wsl_config(self):
        self.ctx.platform = 'native'
        with patch.object(wsl_setup, 'read_config', side_effect=AssertionError('native config access')):
            self.assertTrue(wsl_setup.ensure_interop(self.ctx))
        self.ctx.runner.capture.assert_not_called()

    def test_uninstalled_fonts_config_only_does_not_modify_system(self):
        self.ctx.versions['nerd_font']['version'] = 'not-installed'
        before = self.config.read_bytes()
        with contextlib.redirect_stdout(io.StringIO()):
            fonts.configure_fonts(self.ctx)
        self.assertEqual(self.config.read_bytes(), before)
        self.ctx.runner.capture.assert_not_called()

    def test_failed_full_installation_guidance_keeps_original_modules(self):
        self.ctx.wsl_windows_pending = True
        self.ctx.modules = ['fonts', 'shell', 'neovim', 'diagrams']
        with contextlib.redirect_stdout(io.StringIO()) as output:
            wsl_setup.report_pending(self.ctx, installation_complete=False)
        self.assertIn('--modules fonts,shell,neovim,diagrams', output.getvalue())
        self.assertNotIn('--configs-only', output.getvalue())

    def test_failed_installation_guidance_preserves_configuration_and_plugin_modes(self):
        self.ctx.wsl_windows_pending = True
        self.ctx.configs_only = True
        self.ctx.no_plugins = True
        with contextlib.redirect_stdout(io.StringIO()) as output:
            wsl_setup.report_pending(self.ctx, installation_complete=False)
        self.assertIn('--modules fonts --configs-only --no-plugins', output.getvalue())

    def test_still_unavailable_windows_process_remains_pending(self):
        self.ctx.runner.capture.side_effect = ['C:\\setup-windows-fonts.ps1', OSError(errno.ENOEXEC, 'Exec format error')]
        with contextlib.redirect_stdout(io.StringIO()):
            fonts.configure_windows_terminal(self.ctx, fonts.font_directory(self.ctx))
        self.assertTrue(self.ctx.wsl_windows_pending)
        self.ctx.runner.run.assert_not_called()


if __name__ == '__main__':
    unittest.main(verbosity=2)
