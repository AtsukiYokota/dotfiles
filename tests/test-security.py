#!/usr/bin/env python3
"""Offline checks for the narrow runtime security inventory."""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('security_inventory', ROOT / 'scripts/check-security.py')
security = importlib.util.module_from_spec(spec)
spec.loader.exec_module(security)


class SecurityTests(unittest.TestCase):
    def test_pinned_node_has_october_security_fixes(self):
        versions = json.loads((ROOT / 'installer/versions.json').read_text())
        self.assertEqual(security.node_status(versions['node']['version']), 'PATCHED')

    def test_node_fix_boundaries_and_unknown_release_lines(self):
        for version in ('22.23.3', '24.22.0', '26.12.0', '24.19.0'):
            self.assertEqual(security.node_status(version), 'VULNERABLE', version)
        for version in ('v22.23.4', '24.22.1', '26.12.1', '24.23.0'):
            self.assertEqual(security.node_status(version), 'PATCHED', version)
        for version in ('24.22.1-rc.1', '20.20.0', '27.0.0', '24.22', 'not a version'):
            self.assertEqual(security.node_status(version), 'UNKNOWN', version)

    def test_python_brotli_patch_branches_and_binding_versions(self):
        for version in ('1.0.3', '1.0.9', '1.1.0', '1.2.0'):
            self.assertEqual(security.python_status('brotli', version), 'VULNERABLE', version)
        for version in ('1.0.10', '1.1.1', '1.2.1'):
            self.assertEqual(security.python_status('brotli', version), 'PATCHED', version)
        self.assertEqual(security.python_status('brotlicffi', '1.2.0.2'), 'VULNERABLE')
        self.assertEqual(security.python_status('brotlicffi', '1.2.1.0'), 'PATCHED')
        self.assertEqual(security.python_status('brotli', '1.2.1rc1'), 'UNKNOWN')
        self.assertEqual(security.python_status('nodejs-wheel-binaries', '24.19.0'), 'VULNERABLE')

    def test_distro_versions_are_not_misclassified_by_upstream_number(self):
        results = security.apt_findings('libbrotli1:amd64\t1.1.0-2ubuntu0.99\tinstalled\n'
                                        'python3-brotli\t1.1.0-2build2\tconfig-files\n'
                                        'nodejs\t99:24.19.0+dfsg-1ubuntu0.1\tinstalled\n')
        self.assertEqual(len(results), 2)
        self.assertEqual({item['status'] for item in results}, {'UNKNOWN'})
        self.assertEqual(results[0]['version'], '1.1.0-2ubuntu0.99')
        self.assertIn('backports', results[0]['detail'])

    def test_old_managed_nodes_and_metadata_without_importing_code(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for version in ('24.19.0', '24.22.1'):
                binary = root / 'dotfiles/tools/node' / version / 'bin/node'
                binary.parent.mkdir(parents=True)
                binary.write_text('must not execute')
            results = security.managed_findings(root)
            self.assertEqual([item['status'] for item in results], ['VULNERABLE', 'PATCHED'])
            site = root / 'tool/lib/python3.12/site-packages'
            metadata = site / 'nodejs_wheel_binaries-24.19.0.dist-info/METADATA'
            metadata.parent.mkdir(parents=True)
            metadata.write_text('Metadata-Version: 2.1\nName: nodejs-wheel-binaries\nVersion: 24.19.0\n')
            (site / 'sitecustomize.py').write_text('raise RuntimeError("Do not import environment code")')
            (site / 'malicious.pth').write_text('import sys; raise RuntimeError("Do not process .pth")')
            results = security.metadata_findings(root / 'tool')
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['status'], 'VULNERABLE')

    def test_node_preload_options_are_removed_and_command_is_bounded(self):
        with mock.patch.dict(os.environ, {'NODE_OPTIONS': '--require untrusted.js', 'NODE_PATH': '/untrusted'}), \
                mock.patch.object(subprocess, 'run') as run:
            security.command(['node', '--version'])
        self.assertNotIn('NODE_OPTIONS', run.call_args.kwargs['env'])
        self.assertNotIn('NODE_PATH', run.call_args.kwargs['env'])
        self.assertEqual(run.call_args.kwargs['timeout'], 10)

    def test_machine_readable_report_and_exit_codes(self):
        pending = security.finding('APT', '1.1.0-2build2', 'UNKNOWN', '/tmp', 'pending', security.UBUNTU_URL)
        with mock.patch.object(security, 'inspect', return_value=[pending]), contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(security.main(['--json']), 2)
        report = json.loads(output.getvalue())
        self.assertEqual(report['reviewed'], security.REVIEWED)
        self.assertIn('not scanned', report['scope'])
        self.assertEqual(security.exit_status([dict(status='VULNERABLE'), pending]), 1)
        self.assertEqual(security.exit_status([dict(status='PATCHED')]), 0)


if __name__ == '__main__':
    unittest.main()
