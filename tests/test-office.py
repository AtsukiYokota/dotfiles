#!/usr/bin/env python3
"""Offline ibisOffice lifecycle checks; execute only a small fixture application."""
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time
from types import SimpleNamespace
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
import deploy
import office


ICON = b'fixture application icon'
APP = ('''#!/usr/bin/python3
import json
import os
from pathlib import Path
import sys
if sys.argv[1:] == ['--appimage-extract', 'ibisoffice.png']:
    icon = Path('squashfs-root/ibisoffice.png')
    icon.parent.mkdir()
    icon.write_bytes(%r)
    if os.environ.get('DOTFILES_TEST_EXTRACT_ERROR'):
        sys.exit(9)
else:
    Path(os.environ['DOTFILES_TEST_ARGUMENTS']).write_text(json.dumps(sys.argv[1:]))
''' % ICON).encode('utf-8')


class FixtureRunner:
    def __init__(self):
        self.downloads = []
        self.commands = []

    def download(self, url, path, digest):
        self.downloads.append(url)
        if hashlib.sha256(APP).hexdigest() != digest:
            raise RuntimeError('Fixture download SHA-256 mismatch.')
        path.write_bytes(APP)

    def run(self, argv, **kwargs):
        argv = [str(arg) for arg in argv]
        self.commands.append(argv)
        if argv[0] != 'update-desktop-database':
            subprocess.run(argv, check=True, timeout=10, **kwargs)


@unittest.skipUnless(sys.platform == 'linux', 'Linux AppImage fixture and symlink semantics')
class OfficeTests(unittest.TestCase):
    def context(self, home):
        home.mkdir(parents=True, exist_ok=True)
        temporary = home / 'temporary'
        temporary.mkdir()
        return SimpleNamespace(home=home, data=home / '.local/share/dotfiles', temp=temporary,
                               platform='native', arch='amd64', versions={'ibis_office': {
                                   'version': 'test',
                                   'amd64': {'url': 'https://example.invalid/office.AppImage',
                                             'sha256': hashlib.sha256(APP).hexdigest()},
                                   'icon_sha256': hashlib.sha256(ICON).hexdigest()}},
                               runner=FixtureRunner(), backup=deploy.Backup(home / 'backup', home))

    def test_install_configure_repeat_restore_and_reuse_cached_application(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            binary = ctx.home / '.local/bin/ibis-office'
            desktop = ctx.data.parent / 'applications/ibisoffice.desktop'
            mime = ctx.home / '.config/mimeapps.list'
            for path, text in ((binary, 'old command'), (desktop, 'old launcher'),
                               (mime, '[Default Applications]\napplication/pdf=keep.desktop;\n')):
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(text)
            office.install_office(ctx)
            office.configure_office(ctx)
            office.install_office(ctx)
            office.configure_office(ctx)
            directory = office.office_directory(ctx)
            self.assertEqual(len(ctx.runner.downloads), 1)
            self.assertEqual(set(path.name for path in directory.iterdir()),
                             {'ibisOffice.AppImage', 'ibisoffice.png'})
            self.assertTrue(os.access(binary, os.X_OK))
            self.assertEqual(binary.resolve(), directory / 'ibisOffice.AppImage')
            self.assertEqual(len(ctx.backup.entries), 2)
            self.assertEqual(mime.read_text(), '[Default Applications]\napplication/pdf=keep.desktop;\n')
            self.assertEqual([argv for argv in ctx.runner.commands if argv[0] == 'update-desktop-database'],
                             [['update-desktop-database', str(desktop.parent)]] * 2)
            self.assertFalse(any(argv[0] in ('xdg-mime', 'sudo') for argv in ctx.runner.commands))
            deploy.restore(ctx.backup.directory, ctx.home)
            self.assertEqual(binary.read_text(), 'old command')
            self.assertEqual(desktop.read_text(), 'old launcher')
            self.assertTrue(directory.is_dir())
            ctx.backup = deploy.Backup(ctx.home / 'second-backup', ctx.home)
            ctx.runner = SimpleNamespace(run=lambda argv: None)
            office.configure_office(ctx)  # No download method: configuration reuses the cache.
            self.assertTrue(binary.is_symlink())

    def test_configuration_without_download_gives_guidance_and_does_not_write(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            del ctx.runner
            with patch('sys.stdout', new_callable=io.StringIO) as output:
                office.configure_office(ctx)
            self.assertIn('without --configs-only', output.getvalue())
            self.assertFalse(ctx.data.exists())
            self.assertEqual(ctx.backup.entries, [])

    def test_wsl_and_unsupported_architecture_are_rejected_before_download(self):
        for target, architecture in [('wsl', 'amd64'), ('native', 'arm64'), ('wsl', 'arm64')]:
            with self.subTest(target=target, architecture=architecture), tempfile.TemporaryDirectory() as temporary:
                ctx = self.context(Path(temporary))
                ctx.platform, ctx.arch = target, architecture
                for action in (office.install_office, office.configure_office):
                    with self.assertRaisesRegex(ValueError, 'native Ubuntu amd64'):
                        action(ctx)
                self.assertEqual(ctx.runner.downloads, [])
                self.assertFalse(ctx.data.exists())

    def test_corrupted_application_and_icon_are_never_reused_or_published(self):
        for name in ('ibisOffice.AppImage', 'ibisoffice.png'):
            with self.subTest(name=name), tempfile.TemporaryDirectory() as temporary:
                ctx = self.context(Path(temporary))
                office.install_office(ctx)
                (office.office_directory(ctx) / name).write_bytes(b'corrupted')
                for action in (office.install_office, office.configure_office):
                    with self.assertRaisesRegex(RuntimeError, 'Unrecognized'):
                        action(ctx)
                self.assertEqual(len(ctx.runner.downloads), 1)
                self.assertEqual(ctx.backup.entries, [])

    def test_symlinked_application_icon_and_version_directory_are_rejected(self):
        for name in ('ibisOffice.AppImage', 'ibisoffice.png', None):
            with self.subTest(name=name), tempfile.TemporaryDirectory() as temporary:
                ctx = self.context(Path(temporary))
                office.install_office(ctx)
                directory = office.office_directory(ctx)
                target = directory / name if name else directory
                saved = ctx.home / 'saved'
                target.rename(saved)
                target.symlink_to(saved, target_is_directory=name is None)
                for action in (office.install_office, office.configure_office):
                    with self.assertRaises((ValueError, RuntimeError)):
                        action(ctx)
                self.assertEqual(ctx.backup.entries, [])

    def test_outside_home_and_symlinked_data_parent_are_rejected_before_download(self):
        for symbolic in (False, True):
            with self.subTest(symbolic=symbolic), tempfile.TemporaryDirectory() as temporary:
                base = Path(temporary)
                ctx = self.context(base / 'home')
                outside = base / 'outside'
                outside.mkdir()
                if symbolic:
                    alias = ctx.home / 'alias'
                    alias.symlink_to(outside, target_is_directory=True)
                    ctx.data = alias / 'dotfiles'
                else:
                    ctx.data = outside / 'dotfiles'
                for action in (office.install_office, office.configure_office):
                    with self.assertRaisesRegex(ValueError, 'inside home'):
                        action(ctx)
                self.assertEqual(ctx.runner.downloads, [])
                self.assertEqual(list(outside.iterdir()), [])

    def test_failed_extraction_leaves_no_published_install_and_can_be_retried(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            with patch.dict(os.environ, {'DOTFILES_TEST_EXTRACT_ERROR': '1'}):
                with self.assertRaises(subprocess.CalledProcessError):
                    office.install_office(ctx)
            self.assertFalse(office.office_directory(ctx).exists())
            self.assertFalse(list(ctx.temp.glob('ibis-office-extract-*')))
            office.install_office(ctx)
            office.configure_office(ctx)
            self.assertTrue((ctx.home / '.local/bin/ibis-office').exists())

    def test_wrong_extracted_icon_hash_leaves_no_published_install(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary))
            ctx.versions['ibis_office']['icon_sha256'] = '0' * 64
            with self.assertRaisesRegex(RuntimeError, 'Unrecognized'):
                office.install_office(ctx)
            self.assertFalse(office.office_directory(ctx).exists())
            self.assertEqual(ctx.backup.entries, [])

    def test_custom_xdg_data_home_and_shell_argument_forwarding(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary) / 'home space $dollar `tick` "quote" %percent \\slash')
            ctx.data = ctx.home / 'custom data/dotfiles'
            office.install_office(ctx)
            office.configure_office(ctx)
            self.assertTrue((ctx.data.parent / 'applications/ibisoffice.desktop').is_file())
            self.assertFalse((ctx.home / '.local/share/applications').exists())
            output = ctx.home / 'arguments.json'
            arguments = ['document with spaces.docx', '日本語.xlsx', 'semi;$(touch never).pptx', '--literal']
            environment = dict(os.environ, HOME=str(ctx.home), DOTFILES_TEST_ARGUMENTS=str(output))
            subprocess.run(['/bin/sh', '-c', 'exec "$@"', 'fixture',
                            str(ctx.home / '.local/bin/ibis-office'), *arguments],
                           env=environment, check=True, timeout=10)
            self.assertEqual(json.loads(output.read_text()), arguments)

    @unittest.skipUnless(shutil.which('gio'), 'GIO is needed to exercise desktop-entry Exec parsing')
    def test_desktop_launcher_uses_real_gio_argument_parsing_with_special_paths(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = self.context(Path(temporary) / 'home space $dollar `tick` "quote" %percent \\slash')
            office.install_office(ctx)
            office.configure_office(ctx)
            desktop = ctx.data.parent / 'applications/ibisoffice.desktop'
            document = ctx.home / '日本語 $(touch never) "quote".docx'
            document.touch()
            output = ctx.home / 'arguments.json'
            environment = dict(os.environ, HOME=str(ctx.home), XDG_DATA_HOME=str(ctx.data.parent),
                               XDG_CONFIG_HOME=str(ctx.home / '.config'),
                               XDG_CACHE_HOME=str(ctx.home / '.cache'),
                               DOTFILES_TEST_ARGUMENTS=str(output))
            launched = subprocess.run(['gio', 'launch', str(desktop), str(document)],
                                      env=environment, capture_output=True, text=True, timeout=10)
            self.assertEqual(launched.returncode, 0, launched.stdout + launched.stderr)
            deadline = time.monotonic() + 5
            while not output.exists() and time.monotonic() < deadline:
                time.sleep(0.05)
            self.assertTrue(output.exists(), 'GIO did not launch the fixture')
            self.assertEqual(json.loads(output.read_text()), [str(document)])


if __name__ == '__main__':
    unittest.main(verbosity=2)
