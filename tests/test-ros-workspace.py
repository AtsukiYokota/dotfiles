#!/usr/bin/env python3
"""Workspace database ownership, argument preservation and CMake/clangd integration."""
from __future__ import annotations

import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'commands/ros-workspace.py'
SPEC = importlib.util.spec_from_file_location('ros_workspace', SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class WorkspaceTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix='ros-workspace-test-')
        self.addCleanup(temporary.cleanup)
        self.base = Path(temporary.name)
        self.workspace = self.base / '日本語 workspace'
        self.workspace.mkdir()
        self.build = self.workspace / 'build'
        self.build.mkdir()
        self.output = self.workspace / 'compile_commands.json'

    def invoke(self, operation='compdb', *arguments, expected=0, env=None):
        result = subprocess.run([sys.executable, str(SCRIPT), operation,
                                 '--workspace', str(self.workspace), *map(str, arguments)],
                                text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                env=env, check=False)
        self.assertEqual(result.returncode, expected, result.stdout + result.stderr)
        return result

    def package(self, name, *, filename='ソース file.cpp', flags=None):
        directory = self.build / name
        directory.mkdir(parents=True, exist_ok=True)
        source = self.workspace / 'src' / name / filename
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_text('int main() { return 0; }\n', encoding='utf-8')
        entry = {'directory': str(directory), 'file': str(source),
                 'arguments': ['c++', *(flags or []), '-c', str(source)]}
        path = directory / 'compile_commands.json'
        path.write_text(json.dumps([entry]), encoding='utf-8')
        return path, entry

    def test_aggregation_dedup_unicode_spaces_partial_builds_and_removed_sources(self):
        first, entry = self.package('first package', flags=['-DVALUE=a b', '-Iinclude path'])
        first.write_text(json.dumps([entry, entry]), encoding='utf-8')
        second, old = self.package('second')
        self.invoke()
        output = json.loads(self.output.read_text(encoding='utf-8'))
        self.assertEqual(len(output), 2)
        self.assertEqual(output[0]['arguments'], entry['arguments'])
        entry['arguments'].append('-DNEW_BUILD=1')
        first.write_text(json.dumps([entry]), encoding='utf-8')
        self.invoke()
        output = json.loads(self.output.read_text(encoding='utf-8'))
        self.assertEqual(len(output), 2, 'Unrebuilt packages remain available from their existing databases.')
        Path(old['file']).unlink()
        self.invoke()
        output = json.loads(self.output.read_text(encoding='utf-8'))
        self.assertEqual(len(output), 1)
        self.assertIn('-DNEW_BUILD=1', output[0]['arguments'])
        self.assertTrue(second.exists())

    def test_unmanaged_and_edited_outputs_require_force_and_backup(self):
        self.package('pkg')
        original = b'custom compilation database\n'
        self.output.write_bytes(original)
        result = self.invoke(expected=1)
        self.assertIn('--force', result.stderr)
        self.assertEqual(self.output.read_bytes(), original)
        self.invoke('compdb', '--force')
        backups = list(self.workspace.glob('compile_commands.json.backup-*'))
        self.assertEqual(len(backups), 1)
        self.assertEqual(backups[0].read_bytes(), original)
        self.output.write_bytes(b'edited after generation\n')
        self.invoke(expected=1)
        self.assertEqual(self.output.read_bytes(), b'edited after generation\n')

    def test_package_database_takes_precedence_over_old_colcon_root_aggregate(self):
        _, entry = self.package('pkg', flags=['-DNEW_BUILD=1'])
        old = {**entry, 'arguments': ['c++', '-DOLD_BUILD=1', '-c', entry['file']]}
        (self.build / 'compile_commands.json').write_text(json.dumps([old]), encoding='utf-8')
        self.invoke()
        entries = json.loads(self.output.read_text(encoding='utf-8'))
        self.assertEqual(len(entries), 1)
        self.assertIn('-DNEW_BUILD=1', entries[0]['arguments'])

    @unittest.skipUnless(sys.platform == 'linux', 'POSIX symlink test')
    def test_force_replaces_symlink_itself_without_writing_target(self):
        self.package('pkg')
        target = self.base / 'external.json'
        target.write_bytes(b'external target')
        self.output.symlink_to(target)
        self.invoke(expected=1)
        self.invoke('compdb', '--force')
        self.assertFalse(self.output.is_symlink())
        self.assertEqual(target.read_bytes(), b'external target')
        backups = list(self.workspace.glob('compile_commands.json.backup-*'))
        self.assertEqual(len(backups), 1)
        self.assertTrue(backups[0].is_symlink())
        self.assertEqual(backups[0].resolve(), target)

    @unittest.skipUnless(sys.platform == 'linux', 'POSIX symlink test')
    def test_skips_symlink_databases_and_directories_outside_build(self):
        self.package('pkg')
        outside = self.base / 'outside'
        outside.mkdir()
        (outside / 'compile_commands.json').write_text('not valid JSON', encoding='utf-8')
        (self.build / 'linked').symlink_to(outside, target_is_directory=True)
        (self.build / 'compile_commands.json').symlink_to(outside / 'compile_commands.json')
        self.invoke()
        self.assertEqual(len(json.loads(self.output.read_text(encoding='utf-8'))), 1)

    def test_escape_paths_and_invalid_entry_preserve_existing_output(self):
        database, entry = self.package('pkg')
        self.invoke()
        before = self.output.read_bytes()
        for invalid in ({**entry, 'file': '../../../outside.cpp'},
                        {**entry, 'directory': str(self.base)},
                        {**entry, 'output': '../../../../elsewhere.o'},
                        {**entry, 'arguments': 'not a list'},
                        {**entry, 'arguments': ['', 'file.cpp']},
                        {**entry, 'command': ''},
                        {'directory': str(database.parent), 'file': entry['file']},
                        []):
            with self.subTest(invalid=invalid):
                database.write_text(json.dumps([invalid]), encoding='utf-8')
                self.invoke(expected=1)
                self.assertEqual(self.output.read_bytes(), before)

    def test_relative_paths_command_form_and_output_normalization(self):
        database, entry = self.package('pkg')
        value = {'directory': '.', 'file': '../../src/pkg/ソース file.cpp',
                 'command': 'c++ -c "../../src/pkg/ソース file.cpp"', 'output': 'file.o'}
        database.write_text(json.dumps([value]), encoding='utf-8')
        self.invoke()
        result = json.loads(self.output.read_text(encoding='utf-8'))[0]
        self.assertEqual(result['directory'], str(database.parent))
        self.assertEqual(result['file'], entry['file'])
        self.assertEqual(result['command'], value['command'])
        self.assertEqual(result['output'], str(database.parent / 'file.o'))

    def test_custom_output_and_build_directory(self):
        self.package('pkg')
        custom_build = self.workspace / 'build debug'
        self.build.rename(custom_build)
        # Update the working directory recorded by CMake after the fixture move.
        database = custom_build / 'pkg/compile_commands.json'
        entries = json.loads(database.read_text(encoding='utf-8'))
        entries[0]['directory'] = str(database.parent)
        database.write_text(json.dumps(entries), encoding='utf-8')
        self.invoke('compdb', '--build-base', 'build debug', '--output', 'editor/compile_commands.json')
        self.assertTrue((self.workspace / 'editor/compile_commands.json').is_file())
        self.assertFalse(self.output.exists())

    def test_paths_cannot_escape_workspace_or_replace_metadata(self):
        self.package('pkg')
        for arguments in (('--build-base', '../outside'), ('--build-base', '.'),
                          ('--output', '../external.json'), ('--output', '.git/config'),
                          ('--output', 'build/.dotfiles-compile-commands.json')):
            self.invoke('compdb', *arguments, expected=1)
        self.assertFalse((self.base / 'external.json').exists())

    def test_missing_or_empty_database_preserves_previous_output(self):
        database, entry = self.package('pkg')
        self.invoke()
        before = self.output.read_bytes()
        database.write_text('[]', encoding='utf-8')
        self.invoke(expected=1)
        self.assertEqual(self.output.read_bytes(), before)
        database.unlink()
        self.invoke(expected=1)
        self.assertEqual(self.output.read_bytes(), before)

    def test_atomic_write_failure_does_not_truncate_database(self):
        self.package('pkg')
        self.invoke()
        before = self.output.read_bytes()
        with mock.patch.object(MODULE.os, 'replace', side_effect=OSError('simulated failure')):
            with self.assertRaises(OSError):
                MODULE.write_database(self.workspace, self.build, self.output)
        self.assertEqual(self.output.read_bytes(), before)
        self.assertEqual(list(self.workspace.glob('.ros-workspace-*')), [])

    def test_init_is_explicit_and_does_not_replace_existing_file(self):
        self.assertFalse((self.workspace / 'justfile').exists())
        self.invoke('init')
        target = self.workspace / 'justfile'
        self.assertIn('ros-workspace build -- "$@"', target.read_text(encoding='utf-8'))
        target.write_text('custom commands\n', encoding='utf-8')
        self.invoke('init', expected=1)
        self.assertEqual(target.read_text(encoding='utf-8'), 'custom commands\n')

    @unittest.skipUnless(sys.platform == 'linux' and shutil.which('just'), 'just is needed for recipe integration')
    def test_real_just_template_preserves_arguments_and_workspace(self):
        self.invoke('init')
        binary = self.base / 'bin'
        binary.mkdir()
        helper = binary / 'ros-workspace'
        helper.write_text('#!/usr/bin/env python3\nimport json, os, pathlib, sys\n'
                          'pathlib.Path(os.environ["ARG_LOG"]).write_text(json.dumps('
                          '{"args":sys.argv[1:],"cwd":os.getcwd()}))\n', encoding='utf-8')
        helper.chmod(0o755)
        log = self.base / 'just-arguments.json'
        environment = {**os.environ, 'PATH': f'{binary}:{os.environ["PATH"]}', 'ARG_LOG': str(log)}
        nested = self.workspace / 'src'
        nested.mkdir()
        arguments = ['--cmake-args', '-DNAME=日本語 and spaces', '$(touch UNEXPECTED_FILE)']
        result = subprocess.run(['just', 'build', *arguments], cwd=nested, env=environment,
                                stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        self.assertEqual(result.returncode, 0, result.stdout)
        recorded = json.loads(log.read_text(encoding='utf-8'))
        self.assertEqual(recorded['args'], ['build', '--', *arguments])
        self.assertEqual(recorded['cwd'], str(self.workspace))
        self.assertFalse((self.workspace / 'UNEXPECTED_FILE').exists())

    @unittest.skipUnless(sys.platform == 'linux', 'POSIX executable fixture')
    def test_build_failure_and_argument_boundaries(self):
        self.package('pkg')
        self.invoke()
        before = self.output.read_bytes()
        binary = self.base / 'bin'
        binary.mkdir()
        colcon = binary / 'colcon'
        colcon.write_text('#!/usr/bin/env python3\nimport json, os, pathlib, sys\n'
                          'pathlib.Path(os.environ["ARG_LOG"]).write_text(json.dumps(sys.argv[1:]))\n'
                          'sys.exit(int(os.environ.get("BUILD_RESULT", "0")))\n', encoding='utf-8')
        colcon.chmod(0o755)
        log = self.base / 'arguments.json'
        environment = {**os.environ, 'PATH': f'{binary}:{os.environ["PATH"]}', 'ARG_LOG': str(log),
                       'BUILD_RESULT': '7'}
        self.invoke('build', '--', '--packages-select', 'pkg', '--cmake-args', '-DNAME=a b',
                    expected=7, env=environment)
        self.assertEqual(self.output.read_bytes(), before)
        arguments = json.loads(log.read_text(encoding='utf-8'))
        self.assertEqual(arguments[:3], ['--log-base', str(self.workspace / 'log'), 'build'])
        self.assertIn('--symlink-install', arguments)
        self.assertEqual(arguments.count('--cmake-args'), 1)
        self.assertIn('-DCMAKE_EXPORT_COMPILE_COMMANDS=ON', arguments)
        self.assertIn('-DNAME=a b', arguments)
        environment['BUILD_RESULT'] = '0'
        self.invoke('build', '--', '--packages-select', 'pkg', env=environment)
        for extra in (('--build-base', '/elsewhere'), ('--install-base=elsewhere',),
                      ('--cmake-args', '-DCMAKE_EXPORT_COMPILE_COMMANDS=OFF')):
            log.unlink(missing_ok=True)
            self.invoke('build', '--', *extra, expected=1, env=environment)
            self.assertFalse(log.exists(), 'Invalid options must be rejected before running colcon.')

    @unittest.skipUnless(shutil.which('cmake') and shutil.which('c++') and shutil.which('clangd'),
                         'CMake, C++ compiler and clangd are needed for integration')
    def test_real_cmake_database_is_discovered_and_used_by_clangd(self):
        source = self.workspace / 'src/demo'
        source.mkdir(parents=True)
        (source / 'CMakeLists.txt').write_text('cmake_minimum_required(VERSION 3.16)\n'
                                             'project(compdb_test LANGUAGES CXX)\n'
                                             'add_executable(demo main.cpp)\n'
                                             'target_compile_definitions(demo PRIVATE EXPECTED_FLAG=1)\n',
                                             encoding='utf-8')
        file = source / 'main.cpp'
        file.write_text('#ifndef EXPECTED_FLAG\n#error Missing compilation database\n#endif\n'
                        'int main() { return 0; }\n', encoding='utf-8')
        configured = subprocess.run(['cmake', '-S', str(source), '-B', str(self.build / 'demo'),
                                     '-DCMAKE_EXPORT_COMPILE_COMMANDS=ON'],
                                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        self.assertEqual(configured.returncode, 0, configured.stdout)
        self.invoke()
        checked = subprocess.run(['clangd', f'--check={file}', '--log=info'],
                                 stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        self.assertEqual(checked.returncode, 0, checked.stdout)
        self.assertIn('EXPECTED_FLAG=1', checked.stdout)
        self.assertIn(str(self.output), checked.stdout)


if __name__ == '__main__':
    unittest.main()
