#!/usr/bin/env python3
"""Formatter safety/integration tests with disposable source trees and fake tools."""
from __future__ import annotations

import importlib.util
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'commands/ros-format.py'
SPEC = importlib.util.spec_from_file_location('ros_format', SCRIPT)
FORMAT = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = FORMAT
SPEC.loader.exec_module(FORMAT)

FAKE = '''#!/usr/bin/env python3
import os
from pathlib import Path
import sys
path = Path(sys.argv[-1])
content = path.read_bytes()
if b'FAIL' in content:
    path.write_bytes(b'corrupted temporary copy')
    sys.exit(7)
result = content.replace(b'value=1', b'value = 1').replace(b'int x=1;', b'int x = 1;')
if b'CHANGE_AST' in content:
    result = result.replace(b'value = 1', b'value = 2')
if Path(sys.argv[0]).name == 'ament_uncrustify':
    if '--reformat' in sys.argv:
        path.write_bytes(result)
        sys.exit(1 if content != result else 0)
    sys.exit(1 if content != result else 0)
assert '--max-line-length' in sys.argv and sys.argv[sys.argv.index('--max-line-length') + 1] == '99'
assert '--ignore-local-config' in sys.argv and '--global-config' in sys.argv
assert '--aggressive' not in sys.argv
path.write_bytes(result)
'''


@unittest.skipUnless(sys.platform == 'linux', 'Run on Ubuntu or WSL; tests use POSIX executable tools.')
class FormatterTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='ros-format-test-')
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name)
        self.source = self.base / 'source tree'
        self.source.mkdir()
        self.bin = self.base / 'bin'
        self.bin.mkdir()
        for name in ('autopep8', 'ament_uncrustify'):
            tool = self.bin / name
            tool.write_text(FAKE, encoding='utf-8')
            tool.chmod(0o755)
        self.environment = {**os.environ, 'PATH': f'{self.bin}:{os.environ["PATH"]}',
                            'ROS_DISTRO': 'jazzy', 'PYTHONDONTWRITEBYTECODE': '1'}

    def file(self, name, content=b'value=1\n'):
        path = self.source / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        return path

    def invoke(self, *args, stdin=None, expected=0):
        result = subprocess.run([sys.executable, str(SCRIPT), '--language', 'python', *map(str, args)],
                                cwd=self.source, env=self.environment, input=stdin,
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
        self.assertEqual(result.returncode, expected, result.stderr.decode() + result.stdout.decode())
        return result

    def test_check_diff_write_idempotence_spaces_and_permissions(self):
        path = self.file('my package/node script.py')
        path.chmod(0o751)
        before = path.stat()
        self.invoke('--recursive', '--check', self.source, expected=1)
        self.assertEqual(path.read_bytes(), b'value=1\n')
        diff = self.invoke('--recursive', '--dry-run', self.source).stdout
        self.assertIn(b'-value=1', diff)
        self.assertIn(b'+value = 1', diff)
        self.invoke('--recursive', self.source)
        self.assertEqual(path.read_bytes(), b'value = 1\n')
        self.assertEqual(path.stat().st_mode & 0o777, 0o751)
        self.assertGreaterEqual(path.stat().st_mtime_ns, before.st_mtime_ns)
        self.invoke('--recursive', '--check', self.source)
        self.assertFalse(list(self.source.rglob('.ros-format-*')))

    def test_default_exclusions_override_and_extra_glob(self):
        excluded = [self.file(f'{name}/node.py') for name in
                    ('build', 'install', 'log', '.git', 'venv', '.venv', 'vendor', 'cmake-build-debug')]
        ignored = self.file('ignored/pkg.py')
        self.file('ignored/AMENT_IGNORE', b'')
        active = self.file('src/pkg.py')
        self.invoke('--recursive', self.source)
        self.assertEqual(active.read_bytes(), b'value = 1\n')
        for path in [*excluded, ignored]:
            self.assertEqual(path.read_bytes(), b'value=1\n')
        self.invoke('--recursive', '--include-excluded', '--exclude', 'vendor', self.source)
        for path in [*excluded, ignored]:
            expected = b'value=1\n' if path.parent.name == 'vendor' else b'value = 1\n'
            self.assertEqual(path.read_bytes(), expected)

    def test_never_follows_file_directory_or_explicit_symlinks(self):
        external = self.base / 'external.py'
        external.write_bytes(b'value=1\n')
        (self.source / 'linked.py').symlink_to(external)
        (self.source / 'linked dir').symlink_to(self.base, target_is_directory=True)
        self.invoke('--recursive', '--include-excluded', self.source)
        self.invoke(self.source / 'linked.py')
        self.invoke('--recursive', '--include-excluded', self.source / 'linked dir')
        self.invoke(self.source / 'linked dir' / 'external.py')
        self.assertEqual(external.read_bytes(), b'value=1\n')

    def test_formatter_failure_preserves_all_originals(self):
        earlier = self.file('a.py')
        failing = self.file('z.py', b'value=1\n# FAIL\n')
        self.invoke('--recursive', self.source, expected=2)
        self.assertEqual(earlier.read_bytes(), b'value=1\n')
        self.assertEqual(failing.read_bytes(), b'value=1\n# FAIL\n')

    def test_invalid_python_and_semantic_change_are_rejected(self):
        invalid = self.file('syntax.py', b'def broken(:\n')
        self.invoke(invalid, expected=2)
        self.assertEqual(invalid.read_bytes(), b'def broken(:\n')
        changed = self.file('changed.py', b'value=1\n# CHANGE_AST\n')
        self.invoke(changed, expected=2)
        self.assertEqual(changed.read_bytes(), b'value=1\n# CHANGE_AST\n')

    def test_missing_dependency_and_wrong_ros_distro(self):
        path = self.file('node.py')
        (self.bin / 'autopep8').unlink()
        self.environment['PATH'] = str(self.bin)
        result = self.invoke(path, expected=2)
        self.assertIn(b'autopep8 is unavailable', result.stderr)
        self.environment['ROS_DISTRO'] = 'humble'
        source = self.file('main.cpp', b'int x=1;\n')
        result = self.invoke('--language', 'cpp', source, expected=2)
        self.assertIn(b'targets ROS 2 Jazzy', result.stderr)

    def test_cpp_reformat_exit_one_is_verified_before_commit(self):
        source = self.file('main.cpp', b'int x=1;\n')
        self.invoke('--language', 'cpp', '--check', source, expected=1)
        self.assertEqual(source.read_bytes(), b'int x=1;\n')
        self.invoke('--language', 'cpp', source)
        self.assertEqual(source.read_bytes(), b'int x = 1;\n')

    def test_stdin_is_clean_and_never_reads_or_writes_named_file(self):
        path = self.file('named.py', b'keep me untouched\n')
        result = self.invoke('--stdin', '--filename', path, stdin=b'value=1\n')
        self.assertEqual(result.stdout, b'value = 1\n')
        self.assertEqual(path.read_bytes(), b'keep me untouched\n')
        self.invoke('--stdin', '--filename', 'unsaved.py', stdin=b'# FAIL\n', expected=2)

    def test_concurrent_edit_is_not_overwritten(self):
        path = self.file('concurrent.py')
        change = FORMAT.Change(path, path.read_bytes(), b'value = 1\n', FORMAT.identity(path))
        path.write_bytes(b'value = 3\n')
        with self.assertRaises(FORMAT.FormatError):
            FORMAT.write_changes([change])
        self.assertEqual(path.read_bytes(), b'value = 3\n')

    def test_write_failure_rolls_back_prior_files(self):
        paths = [self.file('a.py'), self.file('b.py')]
        changes = [FORMAT.Change(path, path.read_bytes(), b'value = 1\n', FORMAT.identity(path))
                   for path in paths]
        original_replace = os.replace
        calls = 0

        def fail_second(source, target):
            nonlocal calls
            calls += 1
            if calls == 2:
                raise OSError('simulated filesystem failure')
            original_replace(source, target)

        with mock.patch.object(FORMAT.os, 'replace', side_effect=fail_second):
            with self.assertRaises(OSError):
                FORMAT.write_changes(changes)
        for path in paths:
            self.assertEqual(path.read_bytes(), b'value=1\n')
        self.assertFalse(list(self.source.rglob('.ros-format-*')))

    def test_shell_wrappers_forward_quoted_arguments(self):
        capture = self.bin / 'ros-format'
        capture.write_text('#!/usr/bin/env python3\nimport json, sys\nprint(json.dumps(sys.argv[1:]))\n')
        capture.chmod(0o755)
        import json
        for name, language, recursive in (
                ('clang_autoformat', 'cpp', False), ('recursive_clang_autoformat', 'cpp', True),
                ('pep8_autoformat', 'python', False), ('recursive_pep8_autoformat', 'python', True)):
            command = f'source "$1"; {name} --check "source with spaces"'
            result = subprocess.run(['bash', '-c', command, 'test',
                                     str(ROOT / 'configs/shell/formatting.bash')],
                                    env=self.environment, stdout=subprocess.PIPE, check=True)
            expected = ['--language', language] + (['--recursive'] if recursive else [])
            self.assertEqual(json.loads(result.stdout), [*expected, '--check', 'source with spaces'])


if __name__ == '__main__':
    unittest.main()
