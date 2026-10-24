#!/usr/bin/env python3
"""Check CI mirror replacement in temporary fixtures, never the host's APT."""
import importlib.util
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


spec = importlib.util.spec_from_file_location('ci_apt', Path(__file__).with_name('configure-ci-apt.py'))
ci_apt = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ci_apt)


class CiAptTests(unittest.TestCase):
    def test_runner_mirror_list_keeps_public_fallback_priorities(self):
        public = ('https://archive.ubuntu.com/ubuntu/\tpriority:2\n'
                  'https://security.ubuntu.com/ubuntu/\tpriority:3\n')
        original = '# Ubuntu mirrors\nhttp://azure.archive.ubuntu.com/ubuntu/\tpriority:1\n' + public
        self.assertEqual(ci_apt.public_mirrors(original), '# Ubuntu mirrors\n' + public)

    def test_azure_only_list_remains_usable(self):
        original = '# mirror\n\n  https://azure.archive.ubuntu.com/ubuntu\tpriority:1\n'
        expected = '# mirror\n\n  https://archive.ubuntu.com/ubuntu/\tpriority:1\n'
        self.assertEqual(ci_apt.public_mirrors(original), expected)

    def test_legacy_and_deb822_sources_keep_suites_architectures_and_keys(self):
        for suite in ('noble', 'resolute'):
            for arch in ('amd64', 'arm64'):
                original = (
                    f'Types: deb\nURIs: http://azure.archive.ubuntu.com/ubuntu/\n'
                    f'Suites: {suite} {suite}-updates {suite}-backports {suite}-security\n'
                    f'Architectures: {arch}\nComponents: main universe restricted multiverse\n'
                    'Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg\n\n'
                    f'deb [arch={arch}] https://azure.archive.ubuntu.com/ubuntu {suite} main\n')
                expected = original.replace('http://azure.archive.ubuntu.com/ubuntu/', ci_apt.ARCHIVE)
                expected = expected.replace('https://azure.archive.ubuntu.com/ubuntu ', ci_apt.ARCHIVE + ' ')
                self.assertEqual(ci_apt.public_source(original), expected)

    def test_unrelated_uris_and_mirror_transport_are_unchanged(self):
        original = ('URIs: mirror+file:/etc/apt/apt-mirrors.txt\n'
                    'URIs: http://ports.ubuntu.com/ubuntu-ports/\n'
                    'URIs: http://packages.ros.org/ros2/ubuntu\n'
                    'URIs: https://dl.google.com/linux/chrome-stable/deb/\n'
                    'URIs: https://azure.archive.ubuntu.com/ubuntu-other\n')
        self.assertEqual(ci_apt.public_source(original), original)

    def test_configuration_is_idempotent_and_leaves_vendor_files_untouched(self):
        with tempfile.TemporaryDirectory(prefix='dotfiles-ci-apt-') as temporary:
            apt = Path(temporary)
            sources = apt / 'sources.list.d'
            sources.mkdir()
            (apt / 'apt-mirrors.txt').write_text('http://azure.archive.ubuntu.com/ubuntu/\n')
            (sources / 'ubuntu.sources').write_text('URIs: mirror+file:/etc/apt/apt-mirrors.txt\n')
            vendor = sources / 'ros2.sources'
            vendor.write_text('URIs: http://packages.ros.org/ros2/ubuntu\nSigned-By: /vendor.gpg\n')
            before = vendor.read_bytes()
            self.assertEqual(ci_apt.configure(apt), ['apt-mirrors.txt'])
            self.assertEqual(ci_apt.configure(apt), [])
            self.assertEqual(vendor.read_bytes(), before)

    def test_cli_refuses_non_ci_environment_before_touching_apt(self):
        with patch.dict(os.environ, {}, clear=True), patch.object(ci_apt, 'configure') as configure:
            with self.assertRaises(SystemExit):
                ci_apt.main()
            configure.assert_not_called()


if __name__ == '__main__':
    unittest.main(verbosity=2)
