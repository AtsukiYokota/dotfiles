"""Preserving WSL configuration edits, using temporary files only."""
import configparser
import contextlib
import hashlib
import io
import json
import os
from pathlib import Path
import stat
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
import wsl_interop


def digest(content):
    return hashlib.sha256(content).hexdigest()


def parsed(content):
    parser = configparser.ConfigParser(inline_comment_prefixes=('#', ';'))
    parser.read_string(content.decode('utf-8-sig'))
    return parser


class ConfigPatchTests(unittest.TestCase):
    def assert_enabled(self, content):
        settings = parsed(content)
        self.assertTrue(settings.getboolean('interop', 'enabled'))
        self.assertTrue(settings.getboolean('interop', 'appendWindowsPath'))

    def test_only_managed_values_change_preserving_sections_comments_and_spacing(self):
        original = (b'# Existing settings must survive.\n'
                    b'[boot]\nsystemd=true\ncommand=service example start\n\n'
                    b'[user]\ndefault=local-user\n\n'
                    b'[interop]  # Windows tools\n'
                    b'  enabled = false   # keep this explanation\n'
                    b'\tappendWindowsPath\t=\tfalse ; keep this too\n'
                    b'futureOption=untouched\n\n'
                    b'[network]\ngenerateResolvConf=false\nhostname=local-host\n'
                    b'[automount]\nroot=/windows/\noptions="metadata,umask=022"\n')
        expected = original.replace(b'enabled = false', b'enabled = true').replace(
            b'appendWindowsPath\t=\tfalse', b'appendWindowsPath\t=\ttrue')
        updated = wsl_interop.patch_config(original)
        self.assertEqual(updated, expected)
        self.assert_enabled(updated)
        self.assertEqual(wsl_interop.patch_config(updated), updated)

    def test_missing_interop_section_retains_original_bytes(self):
        for original in (b'', b'[user]\ndefault=local-user\n', b'[boot]\nsystemd=true'):
            with self.subTest(original=original):
                updated = wsl_interop.patch_config(original)
                self.assertTrue(updated.startswith(original))
                self.assert_enabled(updated)
                self.assertEqual(wsl_interop.patch_config(updated), updated)

    def test_missing_keys_are_inserted_inside_interop_section(self):
        for body in (b'', b'enabled=false\n', b'appendWindowsPath=false\n'):
            with self.subTest(body=body):
                original = b'[interop]\n' + body + b'\n[network]\ngenerateResolvConf=false\n'
                updated = wsl_interop.patch_config(original)
                self.assert_enabled(updated)
                self.assertEqual(dict(parsed(updated)['network']), {'generateresolvconf': 'false'})
                self.assertEqual(wsl_interop.patch_config(updated), updated)

    def test_crlf_and_bom_are_retained(self):
        for prefix in (b'', b'\xef\xbb\xbf'):
            with self.subTest(prefix=prefix):
                original = prefix + b'; owner settings\r\n[interop]\r\nenabled=false\r\n[user]\r\ndefault=test\r\n'
                updated = wsl_interop.patch_config(original)
                self.assertEqual(updated.startswith(b'\xef\xbb\xbf'), bool(prefix))
                self.assertNotIn(b'\n', updated.replace(b'\r\n', b''))
                self.assertIn(b'[user]\r\ndefault=test\r\n', updated)
                self.assert_enabled(updated)
                self.assertEqual(wsl_interop.patch_config(updated), updated)

    def test_enabled_config_is_byte_identical(self):
        original = b'[boot]\nsystemd=true\n[interop]\n enabled = true # already enabled\nappendWindowsPath=true\n'
        self.assertEqual(wsl_interop.patch_config(original), original)

    def test_managed_section_and_keys_are_matched_case_insensitively(self):
        original = b'[INTEROP]\nENABLED=FALSE # keep\nAppendWindowsPath=False\n[user]\ndefault=test\n'
        expected = original.replace(b'ENABLED=FALSE', b'ENABLED=true').replace(
            b'AppendWindowsPath=False', b'AppendWindowsPath=true')
        updated = wsl_interop.patch_config(original)
        self.assertEqual(updated, expected)
        self.assertEqual(wsl_interop.patch_config(updated), updated)

    def test_commented_settings_are_not_treated_as_active(self):
        original = b'# [interop]\n[interop]\n# enabled=false\n; appendWindowsPath=false\n'
        updated = wsl_interop.patch_config(original)
        self.assertIn(b'# enabled=false\n', updated)
        self.assertIn(b'; appendWindowsPath=false\n', updated)
        self.assert_enabled(updated)

    def test_ambiguous_or_malformed_content_is_rejected(self):
        invalid = (
            b'[interop]\nenabled=false\n[interop]\nappendWindowsPath=false\n',
            b'[interop]\nenabled=false\n[INTEROP]\nappendWindowsPath=false\n',
            b'[interop]\nenabled=false\nenabled=true\n',
            b'[interop]\nenabled=false\nENABLED=true\n',
            b'[interop]\nappendWindowsPath=false\nappendWindowsPath=true\n',
            b'[interop\nenabled=false\n',
            b'[interop]\nenabled false\n',
            b'[interop]\nenabled=garbage\n',
            b'[interop]\nappendWindowsPath=\n',
            b'[interop]\nenabled=false\x00\n',
            b'# invalid utf8: \xff\n',
        )
        for content in invalid:
            with self.subTest(content=content), self.assertRaises(ValueError):
                wsl_interop.patch_config(content)

    def test_oversized_config_is_rejected(self):
        with self.assertRaises(ValueError):
            wsl_interop.patch_config(b'#' * (1024 * 1024 + 1))


@unittest.skipUnless(sys.platform == 'linux', 'Requires Linux atomic file and ownership semantics')
class ConfigWriteTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='dotfiles-wsl-interop-')
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.path = self.root / 'wsl.conf'
        self.original = b'[boot]\nsystemd=true\n[interop]\nenabled=false\nappendWindowsPath=false\n'

    def test_missing_file_is_created_without_original_backup(self):
        self.assertIsNone(wsl_interop.read_config(self.path))
        result = wsl_interop.apply_config(self.path, 'missing')
        self.assertTrue(result['changed'])
        self.assertTrue(result['restart_required'])
        self.assertIsNone(result['backup'])
        self.assertEqual(wsl_interop.read_config(self.path), wsl_interop.patch_config(b''))

    def test_existing_file_is_backed_up_before_replacement_and_metadata_preserved(self):
        self.path.write_bytes(self.original)
        self.path.chmod(0o640)
        previous = self.path.stat()
        result = wsl_interop.apply_config(self.path, digest(self.original))
        self.assertTrue(result['changed'])
        self.assertTrue(result['restart_required'])
        backup = Path(result['backup'])
        self.assertEqual(backup.parent, self.path.parent)
        self.assertNotEqual(backup, self.path)
        self.assertEqual(backup.read_bytes(), self.original)
        self.assertEqual(self.path.read_bytes(), wsl_interop.patch_config(self.original))
        current = self.path.stat()
        if os.name == 'posix':
            self.assertEqual(stat.S_IMODE(current.st_mode), stat.S_IMODE(previous.st_mode))
            self.assertEqual((current.st_uid, current.st_gid), (previous.st_uid, previous.st_gid))
            self.assertEqual(stat.S_IMODE(backup.stat().st_mode), 0o600)

    def test_second_run_makes_no_backup_or_config_write(self):
        self.path.write_bytes(self.original)
        first = wsl_interop.apply_config(self.path, digest(self.original))
        updated = self.path.read_bytes()
        files = set(self.root.iterdir())
        metadata = self.path.stat()
        second = wsl_interop.apply_config(self.path, digest(updated))
        self.assertFalse(second['changed'])
        self.assertFalse(second['restart_required'])
        self.assertIsNone(second['backup'])
        self.assertEqual(set(self.root.iterdir()), files)
        self.assertEqual(self.path.stat().st_ino, metadata.st_ino)
        self.assertEqual(self.path.stat().st_mtime_ns, metadata.st_mtime_ns)
        self.assertEqual(Path(first['backup']).read_bytes(), self.original)

    def test_changed_content_is_not_overwritten(self):
        modified = self.original + b'\n[user]\ndefault=another-user\n'
        self.path.write_bytes(modified)
        with self.assertRaises(RuntimeError):
            wsl_interop.apply_config(self.path, digest(self.original))
        self.assertEqual(self.path.read_bytes(), modified)

    def test_new_file_appearing_after_preview_is_not_overwritten(self):
        self.path.write_bytes(self.original)
        with self.assertRaises(RuntimeError):
            wsl_interop.apply_config(self.path, 'missing')
        self.assertEqual(self.path.read_bytes(), self.original)

    def test_disappearing_config_is_not_recreated_from_stale_preview(self):
        with self.assertRaises(RuntimeError):
            wsl_interop.apply_config(self.path, digest(self.original))
        self.assertFalse(self.path.exists())

    @unittest.skipUnless(os.name == 'posix', 'Requires POSIX symlink semantics')
    def test_symlink_config_is_rejected_without_touching_destination(self):
        destination = self.root / 'other.conf'
        destination.write_bytes(self.original)
        self.path.symlink_to(destination)
        with self.assertRaises(ValueError):
            wsl_interop.read_config(self.path)
        with self.assertRaises(ValueError):
            wsl_interop.apply_config(self.path, digest(self.original))
        self.assertTrue(self.path.is_symlink())
        self.assertEqual(destination.read_bytes(), self.original)

    def test_nonregular_config_is_rejected(self):
        self.path.mkdir()
        with self.assertRaises(ValueError):
            wsl_interop.read_config(self.path)
        with self.assertRaises(ValueError):
            wsl_interop.apply_config(self.path, 'missing')
        self.assertTrue(self.path.is_dir())

    @unittest.skipUnless(os.name == 'posix', 'Requires POSIX hard link semantics')
    def test_hard_link_config_is_rejected(self):
        self.path.write_bytes(self.original)
        linked = self.root / 'linked.conf'
        os.link(self.path, linked)
        with self.assertRaises(ValueError):
            wsl_interop.read_config(self.path)
        with self.assertRaises(ValueError):
            wsl_interop.apply_config(self.path, digest(self.original))
        self.assertEqual(linked.read_bytes(), self.original)
        self.assertEqual(self.path.read_bytes(), self.original)

    @unittest.skipUnless(os.name == 'posix', 'Requires POSIX symlink semantics')
    def test_symlinked_parent_is_rejected(self):
        actual = self.root / 'actual'
        actual.mkdir()
        linked = self.root / 'linked'
        linked.symlink_to(actual, target_is_directory=True)
        target = actual / 'wsl.conf'
        target.write_bytes(self.original)
        with self.assertRaises(ValueError):
            wsl_interop.apply_config(linked / 'wsl.conf', digest(self.original))
        self.assertEqual(target.read_bytes(), self.original)

    def test_invalid_expected_digest_is_rejected_without_changes(self):
        self.path.write_bytes(self.original)
        for expected in ('', 'invalid', '../other-file', 'a' * 63):
            with self.subTest(expected=expected), self.assertRaises(ValueError):
                wsl_interop.apply_config(self.path, expected)
        self.assertEqual(list(self.root.iterdir()), [self.path])
        self.assertEqual(self.path.read_bytes(), self.original)

    def test_invalid_config_remains_untouched(self):
        original = b'[interop]\nenabled=false\nenabled=true\n'
        self.path.write_bytes(original)
        with self.assertRaises(ValueError):
            wsl_interop.apply_config(self.path, digest(original))
        self.assertEqual(self.path.read_bytes(), original)


class PrivilegedCliTests(unittest.TestCase):
    def setUp(self):
        # Every CLI test intercepts the writer, including successful root/WSL
        # simulations: these tests can never modify the real /etc/wsl.conf.
        writer = patch.object(wsl_interop, 'apply_config', return_value={
            'changed': True, 'backup': None, 'restart_required': True})
        self.apply = writer.start()
        self.addCleanup(writer.stop)
        self.arguments = ['--apply', '--expected-sha256', 'missing']

    def test_nonroot_invocation_cannot_write(self):
        with patch.object(wsl_interop.sys, 'platform', 'linux'), \
                patch.object(wsl_interop.os, 'geteuid', return_value=1000, create=True), \
                patch.object(wsl_interop, '_is_wsl', return_value=True), \
                self.assertRaisesRegex(ValueError, 'requires root inside WSL'):
            wsl_interop.main(self.arguments)
        self.apply.assert_not_called()

    def test_fake_wsl_environment_cannot_authorize_native_root(self):
        fake = {'WSL_DISTRO_NAME': 'PretendUbuntu', 'WSL_INTEROP': '/run/WSL/fake_interop'}
        with patch.dict(os.environ, fake), \
                patch.object(wsl_interop.sys, 'platform', 'linux'), \
                patch.object(wsl_interop.os, 'geteuid', return_value=0, create=True), \
                patch.object(wsl_interop.Path, 'read_text', return_value='6.8.0-generic Ubuntu'), \
                patch.object(wsl_interop.Path, 'is_file', return_value=False), \
                self.assertRaisesRegex(ValueError, 'requires root inside WSL'):
            wsl_interop.main(self.arguments)
        self.apply.assert_not_called()

    def test_nonlinux_invocation_cannot_write(self):
        with patch.object(wsl_interop.sys, 'platform', 'win32'), \
                patch.object(wsl_interop.os, 'geteuid', return_value=0, create=True), \
                patch.object(wsl_interop, '_is_wsl', return_value=True), \
                self.assertRaisesRegex(ValueError, 'requires root inside WSL'):
            wsl_interop.main(self.arguments)
        self.apply.assert_not_called()

    def test_cli_only_uses_fixed_configuration_path(self):
        output = io.StringIO()
        with patch.object(wsl_interop.sys, 'platform', 'linux'), \
                patch.object(wsl_interop.os, 'geteuid', return_value=0, create=True), \
                patch.object(wsl_interop, '_is_wsl', return_value=True), \
                contextlib.redirect_stdout(output):
            self.assertEqual(wsl_interop.main(self.arguments), 0)
        self.apply.assert_called_once_with(Path('/etc/wsl.conf'), 'missing')
        self.assertEqual(json.loads(output.getvalue()), self.apply.return_value)

    def test_arbitrary_cli_target_is_rejected_before_writer(self):
        for target in (['--path', '/tmp/other.conf'], ['--target', '/tmp/other.conf'], ['/tmp/other.conf']):
            with self.subTest(target=target), contextlib.redirect_stderr(io.StringIO()), \
                    self.assertRaises(SystemExit) as stopped:
                wsl_interop.main(self.arguments + target)
            self.assertEqual(stopped.exception.code, 2)
            self.apply.assert_not_called()


if __name__ == '__main__':
    unittest.main(verbosity=2)
