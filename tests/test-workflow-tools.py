#!/usr/bin/env python3
"""Preserve personal Git settings and transactional tool/selection state."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest import mock

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
from deploy import Backup, restore
from planning import apply_file_operations
from workflow_tools import workflow_operations, install_binary, record_installation


class WorkflowTests(unittest.TestCase):
    def test_selection_receipt_accumulates_successes_and_recovers_invalid_metadata(self):
        with tempfile.TemporaryDirectory() as temporary:
            state = Path(temporary)
            record_installation(state, ['shell', 'zoxide'], 'wsl', 'amd64')
            record_installation(state, ['just'], 'wsl', 'amd64')
            self.assertEqual(json.loads((state / 'installed.json').read_text())['modules'], ['just', 'shell', 'zoxide'])
            (state / 'installed.json').write_text('[]')
            record_installation(state, ['atuin'], 'native', 'arm64')
            self.assertEqual(json.loads((state / 'installed.json').read_text())['modules'], ['atuin'])

    @unittest.skipUnless(sys.platform == 'linux', 'Linux configuration semantics')
    def test_git_identity_custom_include_and_permissions_survive_deploy_restore(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary) / 'test home'
            home.mkdir()
            gitconfig = home / '.gitconfig'
            original = '# private settings\n[user]\n name = Fixture User\n email = fixture@example.invalid\n[include]\n path = custom.gitconfig\n'
            gitconfig.write_text(original)
            gitconfig.chmod(0o600)
            (home / 'custom.gitconfig').write_text('[alias]\n st = status --short\n')
            ctx = SimpleNamespace(home=home, repo=ROOT, config=home / 'config with spaces', modules=['git-tools'],
                                  backup=Backup(home / 'backups/first', home))
            first = ctx.backup
            apply_file_operations(ctx)
            env = dict(os.environ, HOME=str(home), GIT_CONFIG_GLOBAL=str(gitconfig), GIT_CONFIG_NOSYSTEM='1')
            def get(key):
                return subprocess.check_output(['git', 'config', '--global', '--includes', '--get', key], env=env, text=True).strip()
            self.assertEqual(get('user.email'), 'fixture@example.invalid')
            self.assertEqual(get('user.name'), 'Fixture User')
            self.assertEqual(get('alias.st'), 'status --short')
            self.assertEqual(get('core.pager'), 'delta')
            self.assertEqual(gitconfig.stat().st_mode & 0o777, 0o600)
            ctx.backup = Backup(home / 'backups/second', home)
            apply_file_operations(ctx)
            self.assertEqual(ctx.backup.entries, [])
            restore(first.directory, home)
            self.assertEqual(gitconfig.read_text(), original)

    def test_malformed_managed_git_block_fails_before_writes(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            path = home / '.gitconfig'
            text = '# <<< dotfiles delta <<<\n# >>> dotfiles delta >>>\n'
            path.write_text(text)
            with self.assertRaises(ValueError):
                workflow_operations(ROOT, home, home / '.config', ['git-tools'])
            self.assertEqual(path.read_text(), text)

    @unittest.skipUnless(sys.platform == 'linux', 'Linux symlink semantics')
    def test_binary_failure_never_publishes_and_rerun_checks_content(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            temp = home / 'temporary'
            temp.mkdir()
            payload = b'#!/bin/sh\nexit 0\n'
            digest = hashlib.sha256(payload).hexdigest()
            runner = mock.Mock()
            runner.download.side_effect = RuntimeError('checksum mismatch')
            ctx = SimpleNamespace(home=home, temp=temp, data=home / 'data', arch='amd64', runner=runner,
                versions={'direnv': {'version':'test', 'amd64': {'url':'https://example.invalid/direnv', 'sha256':digest}}},
                backup=Backup(home / 'backup', home))
            with self.assertRaises(RuntimeError):
                install_binary(ctx, 'direnv')
            directory = home / 'data/tools/direnv/test'
            self.assertFalse(directory.exists())
            runner.download.side_effect = lambda url, path, checksum: path.write_bytes(payload)
            install_binary(ctx, 'direnv')
            self.assertTrue(os.access(home / '.local/bin/direnv', os.X_OK))
            install_binary(ctx, 'direnv')
            (directory / 'direnv').write_text('corrupted')
            with self.assertRaises(RuntimeError):
                install_binary(ctx, 'direnv')


if __name__ == '__main__':
    unittest.main()
