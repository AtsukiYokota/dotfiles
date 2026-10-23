#!/usr/bin/env python3
"""Verify the previous theme cache is backed up, recognizable and restorable."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
import deploy
import editor
from runtime import Runner


class EditorCacheTests(unittest.TestCase):
    def setUp(self):
        self.scratch = tempfile.TemporaryDirectory(prefix='dotfiles-editor-cache-')
        self.addCleanup(self.scratch.cleanup)
        self.home = Path(self.scratch.name)
        self.lazy = self.home / 'data with spaces/nvim/lazy'
        self.old = self.lazy / 'solarized.nvim'
        self.new = self.lazy / 'gruvbox.nvim'
        (self.old / 'lua').mkdir(parents=True)
        (self.new / 'lua').mkdir(parents=True)
        (self.new / 'lua/gruvbox.lua').write_text('return {}\n')
        (self.old / 'lua/solarized.lua').write_text('-- local user edits retained\n')
        subprocess.run(['git', 'init', str(self.old)], check=True, capture_output=True)
        subprocess.run(['git', '-C', str(self.old), 'remote', 'add', 'origin',
                        'https://github.com/maxmx03/solarized.nvim.git'], check=True, capture_output=True)
        backup = deploy.Backup(self.home / 'backup', self.home)
        self.ctx = SimpleNamespace(home=self.home, data=self.home / 'data with spaces/dotfiles',
                                   backup=backup, runner=Runner(backup.directory / 'install.log'))
        env = patch.dict(os.environ, {'NVIM_APPNAME': 'nvim'})
        env.start()
        self.addCleanup(env.stop)

    def test_retirement_preserves_local_edits_and_git_metadata_and_restores(self):
        self.assertTrue(editor.retire_obsolete_theme(self.ctx))
        self.assertFalse(self.old.exists())
        self.assertTrue(self.new.exists())
        self.assertEqual(len(self.ctx.backup.entries), 1)
        saved = self.ctx.backup.directory / self.ctx.backup.entries[0]['backup']
        self.assertEqual((saved / 'lua/solarized.lua').read_text(), '-- local user edits retained\n')
        self.assertTrue((saved / '.git').is_dir())
        deploy.restore(self.ctx.backup.directory, self.home)
        self.assertEqual((self.old / 'lua/solarized.lua').read_text(), '-- local user edits retained\n')
        self.assertTrue((self.old / '.git').is_dir())

    def test_second_retirement_is_no_op_and_does_not_add_manifest_entry(self):
        self.assertTrue(editor.retire_obsolete_theme(self.ctx))
        self.assertFalse(editor.retire_obsolete_theme(self.ctx))
        self.assertEqual(len(self.ctx.backup.entries), 1)

    def test_unknown_origin_is_preserved(self):
        subprocess.run(['git', '-C', str(self.old), 'remote', 'set-url', 'origin',
                        'https://github.com/someone/solarized.nvim.git'], check=True)
        self.assertFalse(editor.retire_obsolete_theme(self.ctx))
        self.assertTrue(self.old.exists())
        self.assertEqual(self.ctx.backup.entries, [])

    def test_missing_gruvbox_or_custom_app_prevents_retirement(self):
        with patch.dict(os.environ, {'NVIM_APPNAME': 'separate-editor'}):
            self.assertFalse(editor.retire_obsolete_theme(self.ctx))
        (self.new / 'lua/gruvbox.lua').unlink()
        self.assertFalse(editor.retire_obsolete_theme(self.ctx))
        self.assertTrue(self.old.exists())
        self.assertEqual(self.ctx.backup.entries, [])

    def test_restore_refuses_recreated_cache_without_losing_backup(self):
        self.assertTrue(editor.retire_obsolete_theme(self.ctx))
        self.old.mkdir()
        (self.old / 'new-content').write_text('keep\n')
        with self.assertRaisesRegex(ValueError, 'changed since installation'):
            deploy.restore(self.ctx.backup.directory, self.home)
        self.assertEqual((self.old / 'new-content').read_text(), 'keep\n')
        saved = self.ctx.backup.directory / self.ctx.backup.entries[0]['backup']
        self.assertTrue((saved / 'lua/solarized.lua').exists())

    def test_supported_origins_and_lookalikes(self):
        for origin in ('https://github.com/maxmx03/solarized.nvim.git',
                       'git@github.com:maxmx03/solarized.nvim.git',
                       'ssh://git@github.com/maxmx03/solarized.nvim'):
            self.assertTrue(editor._legacy_origin(origin))
        for origin in ('https://github.com/maxmx03/solarized.nvim-malicious',
                       'https://github.com.evil.invalid/maxmx03/solarized.nvim.git'):
            self.assertFalse(editor._legacy_origin(origin))


if __name__ == '__main__':
    unittest.main()
