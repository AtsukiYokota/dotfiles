"""No-account integration of service module selection, preview and diagnosis."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
import catalog
import main
import planning
from deploy import Backup
from service_apps import SERVICE_MODULES

spec = importlib.util.spec_from_file_location('doctor', ROOT / 'commands/doctor.py')
doctor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(doctor)


class ServicesIntegration(unittest.TestCase):
    def test_modules_are_opt_in_native_only_and_architecture_checked(self):
        for name in SERVICE_MODULES:
            self.assertNotIn(name, catalog.DEFAULTS)
            self.assertTrue(catalog.available(name, 'native', 'amd64'))
            self.assertFalse(catalog.available(name, 'wsl', 'amd64'))
            self.assertEqual(catalog.available(name, 'native', 'arm64'), name not in {'dropbox', 'slack', 'obsidian'})
            self.assertEqual(catalog.resolve({name}, 'native', 'amd64'), [name])

    def test_preview_and_configuration_deployment_leave_authentication_untouched(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            private = home / '.config/dotfiles-services/google-drive/rclone.conf'
            private.parent.mkdir(parents=True)
            private.write_text('PRIVATE-CREDENTIAL-FIXTURE')
            data = home / '.local/share/dotfiles'
            versions = json.loads((ROOT / 'installer/versions.json').read_text())
            output = io.StringIO()
            with patch.object(planning, 'read_command', side_effect=AssertionError('No package query in configs-only')), \
                    contextlib.redirect_stdout(output):
                report = planning.show_details(ROOT, home, home / '.config', data, SERVICE_MODULES, versions,
                                               'amd64', 'native', configs_only=True, show_diff=True)
            self.assertNotIn('PRIVATE-CREDENTIAL', output.getvalue())
            self.assertEqual({Path(item['path']).name for item in report['configurations']}, {'doctor', 'dotfiles-apps', 'dotfiles-drive'})
            backup = Backup(home / '.local/state/dotfiles/backups/test', home)
            ctx = SimpleNamespace(repo=ROOT, home=home, config=home / '.config', modules=SERVICE_MODULES, backup=backup)
            planning.apply_file_operations(ctx)
            self.assertEqual(private.read_text(), 'PRIVATE-CREDENTIAL-FIXTURE')
            for path in backup.directory.rglob('*'):
                if path.is_file():
                    self.assertNotIn('PRIVATE-CREDENTIAL', path.read_text())

    def test_doctor_does_not_run_gui_clients_or_read_account_state(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            private = home / '.config/dotfiles-services/onedrive/refresh_token'
            private.parent.mkdir(parents=True)
            private.write_text('PRIVATE-CREDENTIAL-FIXTURE')
            run = Mock(return_value=SimpleNamespace(returncode=0, stdout='rclone v1.75.2\n', stderr=''))
            checker = doctor.Doctor(ROOT, home=home, env={'PATH': '/usr/bin'}, system=home, run=run)
            checker.locate = lambda name: '/usr/bin/' + name
            result = checker.diagnose(SERVICE_MODULES)
            self.assertEqual(run.call_count, 1)
            self.assertEqual(run.call_args.args[0], ['/usr/bin/rclone', 'version'])
            self.assertNotIn('PRIVATE-CREDENTIAL', json.dumps(result))
            self.assertTrue(any(check['id'] == 'service-accounts' and check['status'] == 'SKIP' for check in result['checks']))

    def test_cloud_and_snap_preflight_require_systemd_but_configs_only_does_not(self):
        for name in ('onedrive', 'google-drive', 'slack', 'obsidian', 'teams-for-linux'):
            with patch.object(main.shutil, 'which', return_value='/usr/bin/tool'), \
                    patch.object(main.Path, 'read_text', return_value='init\n'):
                with self.assertRaisesRegex(ValueError, 'systemd'):
                    main.preflight([name], False)
                main.preflight([name], True)


if __name__ == '__main__':
    unittest.main()
