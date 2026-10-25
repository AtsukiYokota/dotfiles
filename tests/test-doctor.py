#!/usr/bin/env python3
"""Doctor diagnostics against isolated files and fake version commands."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock

sys.dont_write_bytecode = True
REPO = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('doctor', REPO / 'commands/doctor.py')
doctor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(doctor)


class DoctorTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='dotfiles-doctor-')
        self.root = Path(self.temp.name)
        self.home = self.root / 'private-user'
        self.repo = self.root / 'repo'
        self.system = self.root / 'system'
        for path in (self.home, self.repo / 'installer', self.system):
            path.mkdir(parents=True)
        (self.home / '.tmux.conf').write_text('# fixture')
        (self.home / '.local/bin').mkdir(parents=True)
        (self.home / '.local/bin/dotfiles-clipboard').write_text('# fixture')
        self.versions = {'just': {'version': '1.42.0'}, 'node': {'version': '24.22.1'}}
        self.write_versions()
        self.env = {'PATH': '/usr/bin', 'HOME': str(self.home)}
        self.run = Mock(return_value=SimpleNamespace(returncode=0, stdout='just 1.42.0\n', stderr=''))

    def tearDown(self):
        self.temp.cleanup()

    def write_versions(self):
        (self.repo / 'installer/versions.json').write_text(json.dumps(self.versions))

    def make_doctor(self, available=()):
        checker = doctor.Doctor(self.repo, home=self.home, env=self.env, system=self.system, run=self.run)
        checker.locate = lambda name: '/usr/bin/' + name if name in available else None
        return checker

    @staticmethod
    def check(result, identifier):
        return next(item for item in result['checks'] if item['id'] == identifier)

    def write_state(self, value):
        path = self.home / '.local/state/dotfiles/installed.json'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value))

    def test_successful_state_selects_only_installed_modules(self):
        self.write_state({'modules': ['just']})
        result = self.make_doctor({'just', 'tmux', 'starship'}).diagnose()
        self.assertEqual(result['modules'], ['fonts', 'just', 'shell'])
        self.assertEqual(self.check(result, 'just')['status'], 'PASS')
        self.assertEqual(result['summary']['FAIL'], 0)
        self.assertEqual(self.run.call_count, 3)

    def test_failed_old_backup_is_not_success_state(self):
        old = self.home / '.local/state/dotfiles/backups/old'
        old.mkdir(parents=True)
        (old / 'selection.json').write_text('{"modules":["neovim","ros2"]}')
        result = self.make_doctor({'node'}).diagnose()
        self.assertEqual(self.check(result, 'selection')['status'], 'WARN')
        self.assertEqual(result['summary']['FAIL'], 0)
        self.assertNotIn('ros2', result['modules'])
        self.assertEqual(self.check(result, 'bash-language-server')['status'], 'WARN')

    def test_file_tools_diagnose_missing_or_wrong_versions(self):
        self.versions.update(fd={'version': '10.5.0'}, bat={'version': '0.26.1'})
        self.write_versions()
        self.run.return_value.stdout = 'fd 10.4.0\n'
        result = self.make_doctor({'fd'}).diagnose(['file-tools'])
        self.assertEqual(self.check(result, 'fd')['status'], 'WARN')
        self.assertEqual(self.check(result, 'bat')['status'], 'FAIL')
        self.assertIn('shell', result['modules'])

    def test_explicit_selection_reports_missing_dependencies(self):
        result = self.make_doctor().diagnose(['neovim'])
        self.assertTrue({'shell', 'fonts', 'node', 'python', 'cpp'} <= set(result['modules']))
        self.assertEqual(self.check(result, 'clangd')['status'], 'FAIL')
        self.assertEqual(self.check(result, 'basedpyright-langserver')['status'], 'FAIL')
        self.assertEqual(self.check(result, 'markdown-assets')['status'], 'FAIL')
        self.run.assert_not_called()

    def test_capture_checks_user_app_metadata_without_launching_gui(self):
        flatpak_data = self.home / 'custom-flatpak'
        self.env['FLATPAK_USER_DIR'] = str(flatpak_data)
        checker = self.make_doctor()
        self.assertEqual(self.check(checker.diagnose(['screen-capture']), 'kooha')['status'], 'FAIL')
        metadata = flatpak_data / 'app/io.github.seadve.Kooha/current/active/metadata'
        metadata.parent.mkdir(parents=True)
        metadata.write_text('[Application]\nname=io.github.seadve.Kooha\n')
        result = self.make_doctor().diagnose(['screen-capture'])
        self.assertEqual(self.check(result, 'kooha')['status'], 'PASS')
        self.assertEqual(self.check(result, 'screen-capture-runtime')['status'], 'SKIP')
        self.run.assert_not_called()

    def test_version_commands_have_clean_environment_timeout_and_safe_cwd(self):
        self.env.update(NODE_OPTIONS='--require=/untrusted/project.js', PYTHONPATH='/untrusted',
                        BASH_ENV='/untrusted', LD_PRELOAD='/untrusted.so', SECRET='private-value')
        result = self.make_doctor({'just'}).diagnose(['just'])
        args, kwargs = self.run.call_args
        self.assertEqual(args[0], ['/usr/bin/just', '--version'])
        self.assertEqual(kwargs['cwd'], str(self.system))
        self.assertEqual(kwargs['timeout'], 5)
        self.assertNotIn('shell', kwargs)
        self.assertEqual(set(kwargs['env']), {'HOME', 'PATH', 'LC_ALL', 'LANG', 'RUSTUP_AUTO_INSTALL'})
        self.assertEqual(kwargs['env']['RUSTUP_AUTO_INSTALL'], '0')
        self.assertNotIn('private-value', json.dumps(result))
        self.assertNotIn(str(self.home), json.dumps(result))

    def test_hung_or_unexpected_version_is_warning_not_crash(self):
        self.run.side_effect = subprocess.TimeoutExpired(['just', '--version'], 5)
        result = self.make_doctor({'just'}).diagnose(['just'])
        self.assertEqual(self.check(result, 'just')['status'], 'WARN')
        self.assertIn('timed out', self.check(result, 'just')['detail'])

    def test_version_difference_is_not_a_vulnerability_claim(self):
        self.run.return_value.stdout = 'just 1.99.0'
        result = self.make_doctor({'just'}).diagnose(['just'])
        item = self.check(result, 'just')
        self.assertEqual(item['status'], 'WARN')
        self.assertIn('Reviewed installer version: 1.42.0', item['detail'])

    def test_tool_installed_outside_path_is_repairable_warning(self):
        tool = self.home / '.local/bin/just'
        tool.parent.mkdir(parents=True, exist_ok=True)
        tool.write_text('#!/bin/false\n')
        tool.chmod(0o755)
        result = self.make_doctor().diagnose(['just'])
        self.assertEqual(self.check(result, 'just')['status'], 'WARN')
        self.assertIn('absent from this shell PATH', self.check(result, 'just')['detail'])

    def test_ros_paths_are_checked_without_starting_ros_or_project(self):
        (self.repo / '.rosrc').write_text('selected=${DOTFILES_ROS_DISTRO:-jazzy}\n')
        base = self.system / 'opt/ros/jazzy'
        (base / 'bin').mkdir(parents=True)
        (base / 'setup.bash').write_text('touch /never-execute-this\n')
        (base / 'bin/ros2').write_text('never execute ROS')
        self.env.update(ROS_DISTRO='jazzy', ROS_VERSION='2')
        checker = self.make_doctor({'ros2', 'colcon', 'rosdep', 'vcs'})
        checker.selection_known = True
        checker.ros()
        result = {'checks': checker.checks}
        self.assertEqual(self.check(result, 'ros-setup')['status'], 'PASS')
        self.assertEqual(self.check(result, 'ros-shell')['status'], 'PASS')
        self.run.assert_not_called()

    def preview_fixture(self):
        self.versions['markdown_preview'] = {'version': 'test', 'packages': {
            'test': {'files': {'in/file': 'static/test.js'}}}}
        self.write_versions()
        base = self.home / '.local/share/dotfiles/preview-assets/test'
        files = {}
        for relative in ('static/test.js', 'static/mermaid/mermaid.min.js'):
            path = base / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(b'fixture')
            files[relative] = {'path': str(path), 'sha256': hashlib.sha256(b'fixture').hexdigest()}
        manifest = {'version': 'test', 'root': str(base), 'files': files,
                    'sources_sha256': hashlib.sha256(json.dumps(self.versions['markdown_preview'], sort_keys=True).encode()).hexdigest()}
        (base.parent.parent / 'preview-assets.json').write_text(json.dumps(manifest))
        checker = self.make_doctor()
        checker.versions = self.versions
        checker.selection_known = True
        return checker, base

    def test_preview_hashes_detect_modified_file(self):
        checker, base = self.preview_fixture()
        checker.preview()
        self.assertEqual(checker.checks[-1]['status'], 'PASS')
        (base / 'static/test.js').write_bytes(b'changed')
        checker.preview()
        self.assertEqual(checker.checks[-1]['status'], 'FAIL')

    def test_preview_rejects_escape_without_reading_outside(self):
        checker, base = self.preview_fixture()
        pointer = base.parent.parent / 'preview-assets.json'
        manifest = json.loads(pointer.read_text())
        manifest['files']['static/../../outside'] = {'path': str(base / 'static/../../outside'), 'sha256': '0' * 64}
        pointer.write_text(json.dumps(manifest))
        checker.preview()
        self.assertEqual(checker.checks[-1]['status'], 'FAIL')

    def test_wsl_clipboard_is_discovered_but_never_accessed(self):
        self.env.update(WSL_DISTRO_NAME='private-distro', WAYLAND_DISPLAY='private-socket',
                        XDG_CURRENT_DESKTOP='GNOME', DBUS_SESSION_BUS_ADDRESS='private-dbus')
        (self.system / 'mnt/wslg').mkdir(parents=True)
        checker = self.make_doctor({'powershell.exe'})
        checker.desktop({'shell', 'keyboard'})
        result = {'checks': checker.checks}
        self.assertEqual(self.check(result, 'wslg')['status'], 'PASS')
        self.assertEqual(self.check(result, 'clipboard')['status'], 'PASS')
        self.assertNotIn('private-', json.dumps(result))
        self.run.assert_not_called()

    def test_relative_path_entries_are_not_executable_search_roots(self):
        self.env['PATH'] = os.pathsep.join(['.', 'project/bin', '/usr/bin', ''])
        checker = doctor.Doctor(self.repo, home=self.home, env=self.env, system=self.system, run=self.run)
        self.assertEqual(checker.path, '/usr/bin')

    def test_font_check_respects_xdg_without_refreshing_font_caches(self):
        data = self.home / 'custom-data'
        self.env['XDG_DATA_HOME'] = str(data)
        directory = data / 'fonts/dotfiles-nerd-font'
        directory.mkdir(parents=True)
        for style in ('Regular', 'Bold', 'Italic', 'BoldItalic'):
            (directory / f'JetBrainsMonoNerdFontMono-{style}.ttf').write_bytes(b'font fixture')
        result = self.make_doctor({'fc-match'}).diagnose(['fonts'])
        self.assertEqual(self.check(result, 'nerd-font')['status'], 'PASS')
        self.run.assert_not_called()

    def test_invalid_state_is_warning_and_no_files_are_created(self):
        self.write_state({'modules': [None]})
        before = {str(p): p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        result = self.make_doctor().diagnose()
        self.assertEqual(self.check(result, 'selection')['status'], 'WARN')
        after = {str(p): p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        self.assertEqual(before, after)

    def test_unknown_modules_are_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Unknown modules'):
            self.make_doctor().diagnose(['unknown-module'])


if __name__ == '__main__':
    unittest.main()
