"""Font deployment and comment-preserving terminal settings in temporary homes."""
import io
import json
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
import deploy
import fonts


PROFILE = '{3bf1ad7c-e3f0-46dc-8643-d1ce3d07811a}'


class FontsTests(unittest.TestCase):
    def context(self, home):
        temporary = home / 'temporary'
        temporary.mkdir()
        return SimpleNamespace(home=home, data=home / '.local/share/dotfiles', temp=temporary,
                               platform='native', versions={'nerd_font': {
                                   'version': 'test', 'url': 'https://example.invalid/font.tar.xz',
                                   'sha256': 'f' * 64}}, backup=deploy.Backup(home / 'backup', home))

    def test_install_checks_archive_layout_caches_faces_and_restores_font_link(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            target = ctx.home / '.local/share/fonts/dotfiles-nerd-font'
            target.parent.mkdir(parents=True)
            target.write_text('old font selection', encoding='utf-8')
            downloads, commands = [], []

            def download(url, path, digest):
                downloads.append(url)
                with tarfile.open(path, 'w:xz') as archive:
                    for name in (*fonts.FONT_FILES, 'OFL.txt', 'unused-font.ttf'):
                        content = name.encode('ascii')
                        member = tarfile.TarInfo(name)
                        member.size = len(content)
                        archive.addfile(member, io.BytesIO(content))

            ctx.runner = SimpleNamespace(download=download, run=commands.append,
                                         capture=lambda argv: fonts.FAMILY + ',JetBrainsMono NFM')
            fonts.install_fonts(ctx)
            fonts.install_fonts(ctx)
            self.assertEqual(len(downloads), 1)
            self.assertEqual(set(item.name for item in fonts.font_directory(ctx).iterdir()),
                             set((*fonts.FONT_FILES, 'OFL.txt', '.dotfiles-sha256')))
            self.assertTrue(target.is_symlink())
            self.assertEqual(commands[0][:2], ['fc-cache', '-f'])
            deploy.restore(ctx.backup.directory, ctx.home)
            self.assertEqual(target.read_text(encoding='utf-8'), 'old font selection')

    def test_rejects_existing_unknown_font_cache_and_symlinked_cache(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            directory = fonts.font_directory(ctx)
            directory.mkdir(parents=True)
            with self.assertRaisesRegex(RuntimeError, 'Unrecognized'):
                fonts.install_fonts(ctx)
            directory.rmdir()
            directory.symlink_to(ctx.home, target_is_directory=True)
            with self.assertRaisesRegex(ValueError, 'inside home'):
                fonts.install_fonts(ctx)

    def test_fontconfig_target_follows_custom_xdg_data_home(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            ctx.data = ctx.home / 'custom-data/dotfiles'
            directory = fonts.font_directory(ctx)
            directory.mkdir(parents=True)
            (directory / '.dotfiles-sha256').write_text('f' * 64, encoding='ascii')
            for name in (*fonts.FONT_FILES, 'OFL.txt'):
                (directory / name).write_bytes(b'font')
            commands = []
            ctx.runner = SimpleNamespace(run=commands.append, capture=lambda argv: fonts.FAMILY)
            fonts.install_fonts(ctx)
            target = ctx.home / 'custom-data/fonts/dotfiles-nerd-font'
            self.assertTrue(target.is_symlink())
            self.assertEqual(commands, [['fc-cache', '-f', str(target)]])

    def test_missing_config_only_fonts_never_invokes_external_commands(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            # No runner attribute at all: missing fonts must not spawn a process.
            fonts.configure_fonts(ctx)

    def test_configs_only_recreates_restored_link_using_cached_fonts_without_download(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            directory = fonts.font_directory(ctx)
            directory.mkdir(parents=True)
            (directory / '.dotfiles-sha256').write_text('f' * 64, encoding='ascii')
            for name in (*fonts.FONT_FILES, 'OFL.txt'):
                (directory / name).write_bytes(b'font')
            commands = []
            # No download method: restoration must reuse the complete cache.
            ctx.runner = SimpleNamespace(run=commands.append, capture=lambda argv: fonts.FAMILY)
            fonts.install_fonts(ctx)
            target = fonts.font_target(ctx)
            deploy.restore(ctx.backup.directory, ctx.home)
            self.assertFalse(target.exists())
            self.assertTrue(directory.is_dir())
            ctx.backup = deploy.Backup(ctx.home / 'second-backup', ctx.home)
            with patch.dict(os.environ, {'XDG_CURRENT_DESKTOP': '', 'DBUS_SESSION_BUS_ADDRESS': ''}):
                fonts.configure_fonts(ctx)
                fonts.configure_fonts(ctx)
            self.assertTrue(target.is_symlink())
            self.assertEqual(commands, [['fc-cache', '-f', str(target)]] * 2)
            self.assertEqual(len(ctx.backup.entries), 1)

    def test_archive_font_symlink_is_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))

            def download(url, path, digest):
                with tarfile.open(path, 'w:xz') as archive:
                    for name in (*fonts.FONT_FILES, 'OFL.txt'):
                        member = tarfile.TarInfo(name)
                        member.type = tarfile.SYMTYPE
                        member.linkname = '../../unexpected'
                        archive.addfile(member)

            ctx.runner = SimpleNamespace(download=download)
            with self.assertRaisesRegex(RuntimeError, 'Unexpected link'):
                fonts.install_fonts(ctx)

    def test_gnome_profiles_and_interface_are_reversible_and_idempotent(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            directory = fonts.font_directory(ctx)
            directory.mkdir(parents=True)
            for name in fonts.FONT_FILES:
                (directory / name).write_bytes(b'font')
            (directory / '.dotfiles-sha256').write_text('f' * 64, encoding='ascii')
            target = fonts.font_target(ctx)
            target.parent.mkdir(parents=True)
            target.symlink_to(directory, target_is_directory=True)
            profile = PROFILE.strip('{}')
            schema = f'org.gnome.Terminal.Legacy.Profile:/org/gnome/terminal/legacy/profiles:/:{profile}/'
            original = {('org.gnome.desktop.interface', 'monospace-font-name'): "'Monospace 11'",
                        (schema, 'use-system-font'): 'true', (schema, 'font'): "'Ubuntu Mono 12'"}
            state = original.copy()
            writes = []

            def capture(argv):
                if argv == ['gsettings', 'list-schemas']:
                    return 'org.gnome.desktop.interface\norg.gnome.Terminal.ProfilesList'
                if argv[2:4] == ['org.gnome.Terminal.ProfilesList', 'list']:
                    return repr([profile])
                return state[tuple(argv[2:4])]

            def run(argv, **kwargs):
                writes.append(argv)
                state[tuple(argv[2:4])] = argv[4]

            ctx.runner = SimpleNamespace(capture=capture, run=run)
            with patch.dict(os.environ, {'XDG_CURRENT_DESKTOP': 'ubuntu:GNOME', 'DBUS_SESSION_BUS_ADDRESS': 'test'}), \
                    patch.object(fonts.shutil, 'which', return_value='/usr/bin/gsettings'):
                fonts.configure_fonts(ctx)
                fonts.configure_fonts(ctx)
            self.assertEqual(len(writes), 3)
            self.assertEqual(len(ctx.backup.entries), 3)
            self.assertEqual(state[(schema, 'font')], repr(fonts.FAMILY + ' 11'))
            with patch.object(deploy.subprocess, 'check_output', side_effect=lambda argv, **kwargs: capture(argv)), \
                    patch.object(deploy.subprocess, 'run', side_effect=run):
                deploy.restore(ctx.backup.directory, ctx.home)
            self.assertEqual(state, original)

    def test_ptyxis_font_is_reversible_without_gnome_terminal_profiles(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            directory = fonts.font_directory(ctx)
            directory.mkdir(parents=True)
            for name in fonts.FONT_FILES:
                (directory / name).write_bytes(b'font')
            (directory / '.dotfiles-sha256').write_text('f' * 64, encoding='ascii')
            target = fonts.font_target(ctx)
            target.parent.mkdir(parents=True)
            target.symlink_to(directory, target_is_directory=True)
            original = {('org.gnome.desktop.interface', 'monospace-font-name'): "'Monospace 11'",
                        ('org.gnome.Ptyxis', 'use-system-font'): 'true',
                        ('org.gnome.Ptyxis', 'font-name'): "'Ubuntu Mono 14'"}
            state = original.copy()
            writes = []

            def capture(argv):
                if argv == ['gsettings', 'list-schemas']:
                    return 'org.gnome.desktop.interface\norg.gnome.Ptyxis'
                return state[tuple(argv[2:4])]

            def run(argv, **kwargs):
                writes.append(argv)
                state[tuple(argv[2:4])] = argv[4]

            ctx.runner = SimpleNamespace(capture=capture, run=run)
            with patch.dict(os.environ, {'XDG_CURRENT_DESKTOP': 'ubuntu:GNOME', 'DBUS_SESSION_BUS_ADDRESS': 'test'}), \
                    patch.object(fonts.shutil, 'which', return_value='/usr/bin/gsettings'):
                fonts.configure_fonts(ctx)
                fonts.configure_fonts(ctx)
            self.assertEqual(len(writes), 3)
            self.assertEqual(len(ctx.backup.entries), 3)
            self.assertEqual(state[('org.gnome.Ptyxis', 'use-system-font')], 'false')
            self.assertEqual(state[('org.gnome.Ptyxis', 'font-name')], repr(fonts.FAMILY + ' 11'))
            with patch.object(deploy.subprocess, 'check_output', side_effect=lambda argv, **kwargs: capture(argv)), \
                    patch.object(deploy.subprocess, 'run', side_effect=run):
                deploy.restore(ctx.backup.directory, ctx.home)
            self.assertEqual(state, original)

    def test_windows_settings_preserve_comments_and_unrelated_profiles(self):
        text = '''{
          // Keep this comment and key ordering.
          "profiles": {"defaults": {"font": {"size": 13}}, "list": [
            {"guid": "ACTIVE", "name": "Ubuntu", "font": {"size": 15, "face": "Old"}},
            {"guid": "other", "font": {"face": "Keep me"}},
          ]}, "url": "https://example.invalid//not-a-comment", /* Keep block. */
        }'''.replace('ACTIVE', PROFILE)
        updated, found = fonts.patch_windows_terminal(text, PROFILE.upper(), 'Ubuntu')
        self.assertTrue(found)
        self.assertEqual(updated, text.replace('"Old"', json.dumps(fonts.WINDOWS_FAMILY)))
        self.assertEqual(fonts.patch_windows_terminal(updated, PROFILE, 'Ubuntu')[0], updated)

    def test_windows_settings_insert_font_and_face_with_trailing_commas_or_null(self):
        for font in ('', ', "font": {}', ', "font": {"size": 13,}', ', "font": null', ', "font": {/* keep */}'):
            for comma in ('', ','):
                with self.subTest(font=font, comma=comma):
                    text = '{"profiles": {"list": [{"guid": ' + json.dumps(PROFILE) + font + comma + '}]}}'
                    updated, found = fonts.patch_windows_terminal(text, PROFILE, '')
                    self.assertTrue(found)
                    actual = fonts.JsonComments(updated).parse().value
                    self.assertEqual(actual['profiles']['list'][0]['font']['face'], fonts.WINDOWS_FAMILY)
                    self.assertEqual(fonts.patch_windows_terminal(updated, PROFILE, '')[0], updated)

    def test_windows_settings_scope_matches_only_active_or_exact_wsl_distro(self):
        text = json.dumps({'profiles': {'list': [
            {'name': 'Ubuntu-26.04', 'source': 'Windows.Terminal.Wsl'},
            {'name': 'Ubuntu-26.04', 'source': 'Other'},
            {'name': 'Debian', 'source': 'Windows.Terminal.Wsl'}]}})
        updated, found = fonts.patch_windows_terminal(text, '', 'Ubuntu-26.04')
        self.assertTrue(found)
        value = fonts.JsonComments(updated).parse().value
        self.assertEqual(value['profiles']['list'][0]['font']['face'], fonts.WINDOWS_FAMILY)
        self.assertNotIn('font', value['profiles']['list'][1])
        self.assertNotIn('font', value['profiles']['list'][2])
        # An explicit active GUID must not silently configure another profile.
        self.assertEqual(fonts.patch_windows_terminal(text, PROFILE, 'Ubuntu-26.04'), (text, False))

    def test_windows_settings_reject_duplicate_keys_and_ambiguous_profile(self):
        for text in ('{"profiles": [], "profiles": []}', '{"a": 1 "b": 2}', '{"a": 1,',
                     '{"a": NaN}', '{"a": []} /* unterminated', '{} unexpected'):
            with self.subTest(text=text), self.assertRaises(ValueError):
                fonts.JsonComments(text).parse()
        profile = {'guid': PROFILE}
        with self.assertRaisesRegex(ValueError, 'Ambiguous'):
            fonts.patch_windows_terminal(json.dumps({'profiles': [profile, profile]}), PROFILE, '')


if __name__ == '__main__':
    unittest.main(verbosity=2)
