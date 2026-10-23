"""Exercise archive installation and reversible GNOME keyboard settings in isolation."""
import io
import os
from pathlib import Path
import sys
import tarfile
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
import actions
import catalog
import deploy
import keyboard
import main


class TerminalSetupTests(unittest.TestCase):
    def test_keyboard_merges_unrelated_options_and_is_idempotent(self):
        original = "['grp:alt_shift_toggle', 'caps:escape', 'ctrl:swapcaps', 'compose:ralt', 'grp_led:caps']"
        expected = "['grp:alt_shift_toggle', 'compose:ralt', 'grp_led:caps', 'ctrl:nocaps']"
        self.assertEqual(keyboard.caps_as_ctrl(original), expected)
        self.assertEqual(keyboard.caps_as_ctrl(expected), expected)
        self.assertEqual(keyboard.caps_as_ctrl('@as []'), "['ctrl:nocaps']")
        with self.assertRaises(ValueError):
            keyboard.caps_as_ctrl("{'invalid': 1}")

    def test_keyboard_records_restorable_setting_and_avoids_duplicate_change(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            state = {'value': "['compose:ralt']"}
            writes = []

            def apply(argv, **kwargs):
                writes.append(argv)
                state['value'] = argv[-1]

            runner = SimpleNamespace(capture=lambda argv: state['value'], run=apply)
            backup = deploy.Backup(home / 'backup', home)
            ctx = SimpleNamespace(platform='native', runner=runner, backup=backup)
            with patch.object(keyboard, 'require_session'):
                keyboard.configure_keyboard(ctx)
                keyboard.configure_keyboard(ctx)
            self.assertEqual(len(writes), 1)
            self.assertEqual(len(backup.entries), 1)
            self.assertEqual(state['value'], "['compose:ralt', 'ctrl:nocaps']")
            with patch.object(deploy.subprocess, 'check_output', side_effect=lambda *a, **k: state['value']), \
                 patch.object(deploy.subprocess, 'run', side_effect=apply):
                deploy.restore(home / 'backup', home)
            self.assertEqual(state['value'], "['compose:ralt']")

    def test_caps_compose_level_and_group_conflicts_are_removed_but_other_controls_remain(self):
        original = "['compose:caps', 'lv3:caps_switch', 'grp:shift_caps_toggle', 'ctrl:aa_ctrl', 'ctrl:hyper_capscontrol', 'ctrl:lctrl_meta', 'caps:internal', 'shift:both_capslock', 'grp_led:caps']"
        self.assertEqual(keyboard.caps_as_ctrl(original),
                         "['ctrl:lctrl_meta', 'caps:internal', 'shift:both_capslock', 'grp_led:caps', 'ctrl:nocaps']")

    def test_keyboard_only_defaults_in_native_gnome_and_preflight_also_guards_configs_only(self):
        with patch.dict(os.environ, {'XDG_CURRENT_DESKTOP': 'ubuntu:GNOME', 'DBUS_SESSION_BUS_ADDRESS': 'test'}):
            self.assertIn('keyboard', catalog.defaults_for('native', 'amd64'))
            self.assertNotIn('keyboard', catalog.defaults_for('wsl', 'amd64'))
        with patch.dict(os.environ, {'XDG_CURRENT_DESKTOP': '', 'DBUS_SESSION_BUS_ADDRESS': ''}):
            self.assertNotIn('keyboard', catalog.defaults_for('native', 'amd64'))
            with self.assertRaisesRegex(ValueError, 'GNOME'):
                main.preflight(['keyboard'], True)
        with self.assertRaises(ValueError):
            catalog.resolve({'keyboard'}, 'wsl', 'amd64')
        with self.assertRaises(ValueError):
            keyboard.configure_keyboard(SimpleNamespace(platform='wsl'))

    def test_resolute_caps_options_do_not_override_control_mapping(self):
        original = "['caps:return', 'caps:ctrl_shifted_capslock', 'lv3:caps_switch_capslock_with_ctrl', 'caps:internal_nocancel', 'compose:ralt']"
        expected = "['caps:internal_nocancel', 'compose:ralt', 'ctrl:nocaps']"
        self.assertEqual(keyboard.caps_as_ctrl(original), expected)
        self.assertEqual(keyboard.caps_as_ctrl(expected), expected)

    def test_flat_starship_archive_is_cached_and_existing_binary_is_restorable(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            binary = home / '.local/bin/starship'
            binary.parent.mkdir(parents=True)
            binary.write_text('old prompt\n', encoding='utf-8')
            temporary_dir = home / 'temporary'
            temporary_dir.mkdir()
            downloads = []

            def download(url, path, digest):
                downloads.append(url)
                with tarfile.open(path, 'w:gz') as bundle:
                    content = b'#!/bin/sh\necho test-starship\n'
                    entry = tarfile.TarInfo('starship')
                    entry.size, entry.mode = len(content), 0o755
                    bundle.addfile(entry, io.BytesIO(content))

            ctx = SimpleNamespace(home=home, data=home / 'data', temp=temporary_dir,
                                  arch='amd64', runner=SimpleNamespace(download=download),
                                  backup=deploy.Backup(home / 'backup', home),
                                  versions={'starship': {'version': 'test', 'amd64': {
                                      'url': 'https://example.invalid/starship.tar.gz', 'sha256': '0' * 64}}})
            for _ in range(2):
                actions.install_archive(ctx, 'starship', {'starship': 'starship'}, flat=True)
            self.assertEqual(len(downloads), 1)
            self.assertTrue(binary.is_symlink())
            self.assertTrue(os.access(binary, os.X_OK))
            deploy.restore(home / 'backup', home)
            self.assertEqual(binary.read_text(encoding='utf-8'), 'old prompt\n')
            marker = home / 'data/tools/starship/test/.dotfiles-sha256'
            marker.write_text('different hash', encoding='ascii')
            with self.assertRaisesRegex(RuntimeError, 'Unrecognized'):
                actions.install_archive(ctx, 'starship', {'starship': 'starship'}, flat=True)


if __name__ == '__main__':
    unittest.main(verbosity=2)
