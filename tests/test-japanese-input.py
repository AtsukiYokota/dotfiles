#!/usr/bin/env python3
"""Native IME configuration tests; use temporary homes and simulated D-Bus."""
import ast
import json
import os
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest import mock

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
import deploy
import japanese_input as ime
import runtime


class DesktopRunner:
    def __init__(self, sources, running=False):
        self.sources = sources
        self.running = running
        self.commands = []
        self.on_stop = None

    def capture(self, argv, **kwargs):
        if argv == ['gsettings', 'get', ime.SCHEMA, 'sources']:
            return self.sources
        if argv == ime.DBUS + ['org.freedesktop.DBus.NameHasOwner', ime.FCITX_SERVICE]:
            return '(true,)' if self.running else '(false,)'
        raise AssertionError(argv)

    def run(self, argv, **kwargs):
        self.commands.append(argv)
        if argv == ['fcitx5-remote', '-e']:
            if self.on_stop:
                self.on_stop()
            self.running = False
        elif argv == ['fcitx5', '-d']:
            self.running = True
        elif argv[:4] == ['gsettings', 'set', ime.SCHEMA, 'sources']:
            self.sources = argv[4]
        else:
            raise AssertionError(argv)


class JapaneseInputTests(unittest.TestCase):
    def context(self, home, sources="[('xkb', 'us'), ('ibus', 'mozc-jp')]", running=False):
        config = home / '.config'
        config.mkdir()
        return SimpleNamespace(home=home, config=config, platform='native',
                               backup=deploy.Backup(home / 'backup', home),
                               runner=DesktopRunner(sources, running))

    def configure(self, ctx):
        with mock.patch.object(ime, 'require_session'), \
                mock.patch.object(ime.shutil, 'which', return_value='/usr/bin/tool'), \
                mock.patch.object(ime, '_start_fcitx', side_effect=lambda context: context.runner.run(['fcitx5', '-d'])):
            ime.configure_japanese_input(ctx)

    def restore(self, ctx):
        with mock.patch.object(ime, 'require_session'), \
                mock.patch.object(runtime, 'Runner', return_value=ctx.runner), \
                mock.patch.object(ime, '_start_fcitx', side_effect=lambda context: context.runner.run(['fcitx5', '-d'])), \
                mock.patch.object(deploy.subprocess, 'check_output', side_effect=ctx.runner.capture), \
                mock.patch.object(deploy.subprocess, 'run', side_effect=ctx.runner.run):
            ime.restore_japanese_input(ctx.backup.directory, ctx.home)

    def test_modifiers_are_directional_and_keep_editor_control_space_available(self):
        original = '# user note\n[Hotkey/TriggerKeys]\n0=Control+space\n1=Zenkaku_Hankaku\n\n' \
                   '[Hotkey/AltTriggerKeys]\n# old shift toggle\n0=Shift_L\n\n' \
                   '[Behavior]\nPreeditEnabledByDefault=False\n'
        result = ime.configure_global(original)
        sections = ime.parse_ini(result)
        self.assertEqual(sections['Hotkey/ActivateKeys'], {'0': 'Alt_R', '1': 'Henkan_Mode'})
        self.assertEqual(sections['Hotkey/DeactivateKeys'], {'0': 'Alt_L', '1': 'Muhenkan'})
        self.assertEqual(sections['Hotkey/AltTriggerKeys'], {})
        self.assertEqual(sections['Hotkey/TriggerKeys'], {'0': 'Zenkaku_Hankaku'})
        self.assertEqual(sections['Behavior']['PreeditEnabledByDefault'], 'False')
        self.assertIn('# user note', result)
        self.assertIn('# old shift toggle', result)
        self.assertEqual(ime.configure_global(result), result)

    def test_physical_us_jis_and_custom_variants_are_retained(self):
        for source, expected in [('us', 'us'), ('jp', 'jp'), ('us+altgr-intl', 'us-altgr-intl')]:
            with self.subTest(source=source):
                kept, layout = ime.input_sources(repr([('xkb', source), ('ibus', 'mozc-jp'), ('xkb', 'de')]))
                self.assertEqual(layout, expected)
                self.assertEqual(kept, [('xkb', source), ('xkb', 'de')])
        self.assertEqual(ime.input_sources('@a(ss) []', 'XKBLAYOUT="jp"\nXKBVARIANT=""\n'),
                         ([('xkb', 'jp')], 'jp'))
        self.assertEqual(ime.input_sources("[('ibus', 'mozc-jp')]", 'XKBLAYOUT="us,de"\nXKBVARIANT="dvorak,"\n'),
                         ([('xkb', 'us+dvorak')], 'us-dvorak'))
        with self.assertRaisesRegex(ValueError, 'physical keyboard'):
            ime.input_sources('[]', '')

    def test_profile_adds_mozc_without_deleting_existing_groups_or_comments(self):
        original = '# custom group\n[Groups/0]\nName=Work\nDefault Layout=de\nDefaultIM=pinyin\n\n' \
                   '[Groups/0/Items/0]\nName=keyboard-de\nLayout=\n\n' \
                   '[Groups/0/Items/1]\nName=pinyin\nLayout=\n\n[GroupOrder]\n0=Work\n'
        result = ime.configure_profile(original, 'jp')
        sections = ime.parse_ini(result)
        self.assertEqual(sections['Groups/0']['DefaultIM'], 'pinyin')
        self.assertEqual(sections['Groups/1']['Default Layout'], 'jp')
        self.assertEqual(sections['Groups/1']['DefaultIM'], 'mozc')
        self.assertEqual(sections['Groups/1/Items/0']['Name'], 'keyboard-jp')
        self.assertEqual(sections['Groups/1/Items/1']['Name'], 'mozc')
        self.assertEqual(sections['GroupOrder'], {'0': ime.GROUP, '1': 'Work'})
        self.assertIn('# custom group', result)
        self.assertEqual(ime.configure_profile(result, 'jp'), result)

    def test_runtime_profile_quotes_and_comments_do_not_duplicate_managed_group(self):
        generated = ime.configure_profile('', 'us')
        self.assertIn('Name="Dotfiles Japanese"', generated)
        normalized = generated.replace('Name=', '# Name\nName=') + '\n'
        repeated = ime.configure_profile(normalized, 'us')
        groups = [options for name, options in ime.parse_ini(repeated).items()
                  if ime.re.fullmatch(r'Groups/\d+', name)]
        self.assertEqual(len(groups), 1)
        self.assertEqual(ime.profile_values(repeated), ime.profile_values(generated))
        for value in ['Work group', 'Name "quoted"', 'Windows\\Path', 'line\nbreak']:
            with self.subTest(value=value):
                self.assertEqual(ime.decode_value(ime.encode_value(value)), value)

    def test_semantic_profile_accepts_reindexing_but_rejects_functional_edits(self):
        original = '[Groups/0]\nName=Work\nDefault Layout=de\nDefaultIM=pinyin\n\n' \
                   '[Groups/0/Items/0]\nName=keyboard-de\nLayout=\n\n' \
                   '[Groups/0/Items/1]\nName=pinyin\nLayout=\n\n[GroupOrder]\n0=Work\n'
        generated = ime.configure_profile(original, 'us')
        reordered = generated.replace('Groups/0', 'Groups/TEMP').replace('Groups/1', 'Groups/0').replace('Groups/TEMP', 'Groups/1')
        self.assertEqual(ime.profile_values(generated), ime.profile_values(reordered))
        for changed in [generated.replace('DefaultIM=mozc', 'DefaultIM=pinyin'),
                        generated.replace('DefaultIM=mozc\n', ''),
                        generated.replace('DefaultIM=mozc', 'DefaultIM=mozc\nCustom=True'),
                        generated.replace('Name=keyboard-us', 'Name=mozc').replace('Name=mozc\nLayout=\n\n[GroupOrder]', 'Name=keyboard-us\nLayout=\n\n[GroupOrder]'),
                        generated + '\n[Future]\nOption=True\n']:
            with self.subTest(changed=changed):
                self.assertNotEqual(ime.profile_values(generated), ime.profile_values(changed))

    def test_full_configuration_is_repeatable_and_restores_originals(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            previous = '# prior framework\nrun_im ibus\n'
            (ctx.home / '.xinputrc').write_text(previous, encoding='utf-8')
            original_sources = ctx.runner.sources
            self.configure(ctx)
            first = len(ctx.backup.entries)
            self.configure(ctx)
            self.assertEqual(len(ctx.backup.entries), first)
            self.assertEqual(ast.literal_eval(ctx.runner.sources), [('xkb', 'us')])
            self.assertIn('run_im fcitx5', (ctx.home / '.xinputrc').read_text())
            # No live IBus stop or unsolicited Fcitx startup; login applies env.
            self.assertEqual(ctx.runner.commands, [['gsettings', 'set', ime.SCHEMA, 'sources', "[('xkb', 'us')]"]])
            with mock.patch.object(deploy.subprocess, 'check_output', side_effect=ctx.runner.capture), \
                    mock.patch.object(deploy.subprocess, 'run', side_effect=ctx.runner.run):
                deploy.restore(ctx.backup.directory, ctx.home)
            self.assertEqual((ctx.home / '.xinputrc').read_text(), previous)
            self.assertEqual(ctx.runner.sources, original_sources)
            self.assertFalse((ctx.config / 'fcitx5/config').exists())
            self.assertFalse((ctx.config / 'fcitx5/profile').exists())

    def test_running_fcitx_saves_before_configuration_is_read_then_restarts(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary), running=True)
            path = ctx.config / 'fcitx5/config'
            path.parent.mkdir()
            path.write_text('[Behavior]\nPreeditEnabledByDefault=True\n')
            ctx.runner.on_stop = lambda: path.write_text('[Behavior]\nPreeditEnabledByDefault=False\n')
            self.configure(ctx)
            self.assertEqual(ime.parse_ini(path.read_text())['Behavior']['PreeditEnabledByDefault'], 'False')
            self.assertEqual(ctx.runner.commands[0], ['fcitx5-remote', '-e'])
            self.assertEqual(ctx.runner.commands[-1], ['fcitx5', '-d'])
            self.assertTrue(ctx.runner.running)

    def test_restart_detaches_all_standard_streams(self):
        ctx = SimpleNamespace(runner=DesktopRunner('[]', running=True))
        with mock.patch.object(ime.subprocess, 'run') as command:
            ime._start_fcitx(ctx)
        command.assert_called_once_with(['fcitx5', '-d'], stdin=ime.subprocess.DEVNULL,
                                        stdout=ime.subprocess.DEVNULL, stderr=ime.subprocess.DEVNULL,
                                        check=True, timeout=10)

    def test_restore_stops_daemon_and_retains_normalized_profile_bytes(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            directory = ctx.config / 'fcitx5'
            directory.mkdir()
            original = '# previous group\n[Groups/0]\nName=Work\nDefault Layout=de\nDefaultIM=keyboard-de\n\n' \
                       '[Groups/0/Items/0]\nName=keyboard-de\nLayout=\n\n[GroupOrder]\n0=Work\n'
            profile = directory / 'profile'
            profile.write_text(original)
            self.configure(ctx)
            normalized = '# user comment kept in the extra copy\n' + profile.read_text().replace('Name=', '# Name\nName=') + '\n'
            ctx.runner.running = True
            ctx.runner.on_stop = lambda: profile.write_text(normalized)
            self.restore(ctx)
            self.assertEqual(profile.read_text(), original)
            self.assertFalse(ctx.runner.running)
            self.assertEqual(ctx.runner.commands[-2], ['fcitx5-remote', '-e'])
            copies = list(ctx.backup.directory.glob('.fcitx-profile-before-restore-*'))
            self.assertEqual(len(copies), 1)
            self.assertEqual(copies[0].read_text(), normalized)

    def test_restore_rejects_profile_setting_edits_and_restarts_daemon(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            self.configure(ctx)
            profile = ctx.config / 'fcitx5/profile'
            edited = profile.read_text().replace('DefaultIM=mozc', 'DefaultIM=pinyin')
            profile.write_text(edited)
            ctx.runner.running = True
            with self.assertRaisesRegex(ValueError, 'profile changed'):
                self.restore(ctx)
            self.assertEqual(profile.read_text(), edited)
            self.assertTrue(ctx.runner.running)
            self.assertFalse(list(ctx.backup.directory.glob('.fcitx-profile-before-restore-*')))

    def test_restore_keeps_other_file_conflict_checks_strict(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            self.configure(ctx)
            config = ctx.config / 'fcitx5/config'
            edited = config.read_text() + '# later user edit\n'
            config.write_text(edited)
            ctx.runner.running = True
            with self.assertRaisesRegex(ValueError, 'File changed since installation'):
                self.restore(ctx)
            self.assertEqual(config.read_text(), edited)
            self.assertTrue(ctx.runner.running)

    def test_restore_checks_ownership_before_touching_daemon(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            manifest_path = ctx.backup.directory / 'manifest.json'
            for changes in [{'version': 2}, {'home': str(ctx.home / 'another-user')}]:
                manifest = {'version': 1, 'home': str(ctx.home), 'entries': [], **changes}
                manifest_path.write_text(json.dumps(manifest))
                with mock.patch.object(ime, '_stop_fcitx') as stop:
                    with self.assertRaisesRegex(ValueError, 'does not belong'):
                        ime.restore_japanese_input(ctx.backup.directory, ctx.home)
                    stop.assert_not_called()

    def test_restore_allows_missing_profile_and_repeat_restore(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            self.configure(ctx)
            (ctx.config / 'fcitx5/profile').unlink()
            self.restore(ctx)
            self.restore(ctx)
            self.assertFalse((ctx.config / 'fcitx5/config').exists())

    def test_bad_profile_does_not_partially_replace_config_and_daemon_restarts(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary), running=True)
            directory = ctx.config / 'fcitx5'
            directory.mkdir()
            (directory / 'config').write_text('[Behavior]\nCustom=keep\n')
            (directory / 'profile').write_text('[Groups/0]\nName=One\nName=Duplicate\n')
            with self.assertRaisesRegex(ValueError, 'Duplicate'):
                self.configure(ctx)
            self.assertFalse(ctx.backup.entries)
            self.assertEqual((directory / 'config').read_text(), '[Behavior]\nCustom=keep\n')
            self.assertTrue(ctx.runner.running)

    def test_wsl_and_missing_dependencies_are_rejected_before_mutation(self):
        with self.assertRaisesRegex(ValueError, 'Windows IME'):
            ime.configure_japanese_input(SimpleNamespace(platform='wsl'))
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            with mock.patch.object(ime, 'require_session'), mock.patch.object(ime.shutil, 'which', return_value=None):
                with self.assertRaisesRegex(ValueError, 'without --configs-only'):
                    ime.configure_japanese_input(ctx)
            self.assertFalse(ctx.backup.entries)
            self.assertFalse(ctx.runner.commands)

    def test_session_preflight_requires_gnome_and_user_bus(self):
        with mock.patch.dict(os.environ, {'XDG_CURRENT_DESKTOP': '', 'DBUS_SESSION_BUS_ADDRESS': ''}):
            with self.assertRaisesRegex(ValueError, 'native GNOME'):
                ime.require_session()


if __name__ == '__main__':
    unittest.main(verbosity=2)
