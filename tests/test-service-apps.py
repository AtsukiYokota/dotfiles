#!/usr/bin/env python3
"""Install-client boundaries: verified artifacts, no login, no service start."""
import hashlib
import io
from pathlib import Path
import stat
import subprocess
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest import mock
import zipfile

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
from deploy import Backup
import service_apps as service


def context(home):
    temporary = home / 'temporary'
    temporary.mkdir()
    return SimpleNamespace(home=home, temp=temporary, data=home / 'data', arch='amd64',
                           platform='native', runner=mock.Mock(),
                           versions={'dropbox': {'amd64': {'url': 'https://example.invalid/dropbox.deb',
                                                          'sha256': 'a' * 64}},
                                     'onedrive_repository': {'key_url': 'https://example.invalid/key.asc',
                                                            'sha256': 'b' * 64}},
                           backup=Backup(home / 'backups', home))


def snap_info(name, arch='amd64'):
    snap_id, publisher, _ = service.SNAPS[name]
    return {'snap': {'snap-id': snap_id, 'publisher': {'username': publisher}},
            'channel-map': [{'channel': {'track': 'latest', 'risk': 'stable', 'architecture': arch}}]}


class ServiceTests(unittest.TestCase):
    def test_snap_install_and_refresh_do_not_launch_clients(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = context(Path(temporary))
            for name in service.SNAPS:
                with self.subTest(name=name), mock.patch.object(service, 'snap_metadata', return_value=snap_info(name)):
                    ctx.runner.reset_mock()
                    ctx.runner.capture.side_effect = subprocess.CalledProcessError(1, ['snap', 'list'])
                    service.install_service(ctx, name)
                    expected = ['sudo', 'snap', 'install', name, '--channel=latest/stable']
                    if name == 'obsidian':
                        expected.append('--classic')
                    ctx.runner.run.assert_called_once_with(expected)
                    ctx.runner.reset_mock()
                    ctx.runner.capture.side_effect = None
                    service.install_service(ctx, name)
                    ctx.runner.run.assert_called_once_with(['sudo', 'snap', 'refresh', name, '--channel=latest/stable'])

    def test_snap_identity_and_architecture_are_checked_before_installing(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = context(Path(temporary))
            for bad in [snap_info('slack', 'arm64'), {'snap': {'snap-id': 'unexpected'}}]:
                with mock.patch.object(service, 'snap_metadata', return_value=bad), self.assertRaises(RuntimeError):
                    service.install_snap(ctx, 'slack')
            ctx.runner.run.assert_not_called()
            ctx.runner.capture.assert_not_called()

    def test_no_service_module_runs_in_wsl(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = context(Path(temporary))
            ctx.platform = 'wsl'
            for module in service.SERVICE_MODULES:
                with self.assertRaises(ValueError):
                    service.install_service(ctx, module)
            ctx.runner.run.assert_not_called()

    def test_dropbox_only_installs_verified_package_and_signature_support(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = context(Path(temporary))
            ctx.runner.download.side_effect = lambda url, target, digest: target.write_bytes(b'package')
            service.install_service(ctx, 'dropbox')
            ctx.runner.download.assert_called_once_with('https://example.invalid/dropbox.deb', ctx.temp / 'dropbox.deb', 'a' * 64)
            ctx.runner.run.assert_called_once_with(['sudo', 'apt-get', 'install', '-y', '--no-remove',
                                                   '--no-install-recommends', 'python3-gpg', str(ctx.temp / 'dropbox.deb')])
            ctx.arch = 'arm64'
            with self.assertRaises(ValueError):
                service.install_dropbox(ctx)

    def test_onedrive_selects_matching_repository_and_does_not_enable_service(self):
        for series in ('24.04', '26.04'):
            with self.subTest(series=series), tempfile.TemporaryDirectory() as temporary:
                ctx = context(Path(temporary))
                with mock.patch.object(service.platform, 'freedesktop_os_release', return_value={'ID': 'ubuntu', 'VERSION_ID': series}), \
                        mock.patch.object(service, 'existing_onedrive_source', return_value=None):
                    service.install_service(ctx, 'onedrive')
                source = (ctx.temp / 'dotfiles-onedrive.sources').read_text()
                self.assertIn(f'xUbuntu_{series}/', source)
                self.assertIn('Signed-By: /etc/apt/keyrings/dotfiles-onedrive.asc', source)
                preferences = (ctx.temp / 'dotfiles-onedrive.pref').read_text()
                self.assertIn(f'home:npreining:debian-ubuntu-onedrive/xUbuntu_{series}', preferences)
                self.assertNotIn('Pin: origin download.opensuse.org', preferences)
                commands = [call.args[0] for call in ctx.runner.run.call_args_list]
                self.assertEqual(commands[-1], ['sudo', 'apt-get', 'install', '-y', '--no-remove',
                                                '--no-install-recommends', '--no-install-suggests', 'onedrive'])
                self.assertFalse(any('systemctl' in command or command[0] == 'onedrive' for command in commands))

    def test_existing_onedrive_source_is_reused_but_wrong_release_is_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            source = directory / 'existing.list'
            source.write_text(f'deb [signed-by=/usr/share/keyrings/obs.gpg] {service.ONEDRIVE_BASE}xUbuntu_24.04/ ./\n')
            self.assertEqual(service.existing_onedrive_source(directory, '24.04'), source)
            with self.assertRaises(RuntimeError):
                service.existing_onedrive_source(directory, '26.04')
            source.write_text('# ' + source.read_text())
            self.assertIsNone(service.existing_onedrive_source(directory, '26.04'))
            source.unlink()
            source = directory / 'existing.sources'
            source.write_text(f'Types: deb\nURIs: {service.ONEDRIVE_BASE}xUbuntu_24.04/\nSuites: ./\nEnabled: no\n')
            self.assertIsNone(service.existing_onedrive_source(directory, '26.04'))

    @unittest.skipUnless(sys.platform == 'linux', 'Linux symlink semantics')
    def test_rclone_extracts_only_binary_is_idempotent_and_rejects_tampering(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = context(Path(temporary))
            archive = io.BytesIO()
            with zipfile.ZipFile(archive, 'w') as bundle:
                bundle.writestr('rclone-vtest-linux-amd64/rclone', b'#!/bin/sh\nexit 0\n')
                bundle.writestr('../../outside', b'not extracted')
            payload = archive.getvalue()
            digest = hashlib.sha256(payload).hexdigest()
            ctx.versions['rclone'] = {'version': 'test', 'amd64': {'url': 'https://example.invalid/rclone.zip', 'sha256': digest}}
            ctx.runner.download.side_effect = lambda url, target, checksum: target.write_bytes(payload)
            directory = service.install_rclone(ctx)
            self.assertTrue((ctx.home / '.local/bin/rclone').is_symlink())
            self.assertTrue((directory / 'rclone').stat().st_mode & 0o100)
            self.assertFalse((ctx.home / 'outside').exists())
            service.install_rclone(ctx)
            ctx.runner.download.assert_called_once()
            (directory / 'rclone').write_text('tampered')
            with self.assertRaises(RuntimeError):
                service.install_rclone(ctx)

    def test_rclone_rejects_symlink_member_and_does_not_publish_failed_download(self):
        with tempfile.TemporaryDirectory() as temporary:
            ctx = context(Path(temporary))
            ctx.versions['rclone'] = {'version': 'test', 'amd64': {'url': 'https://example.invalid/rclone.zip', 'sha256': 'a' * 64}}
            ctx.runner.download.side_effect = RuntimeError('checksum mismatch')
            with self.assertRaises(RuntimeError):
                service.install_rclone(ctx)
            self.assertFalse((ctx.data / 'tools/rclone/test').exists())
            archive = io.BytesIO()
            with zipfile.ZipFile(archive, 'w') as bundle:
                info = zipfile.ZipInfo('rclone-vtest-linux-amd64/rclone')
                info.external_attr = (stat.S_IFLNK | 0o777) << 16
                bundle.writestr(info, 'outside')
            ctx.runner.download.side_effect = lambda url, target, digest: target.write_bytes(archive.getvalue())
            with self.assertRaises(RuntimeError):
                service.install_rclone(ctx)
            self.assertFalse((ctx.data / 'tools/rclone/test').exists())


if __name__ == '__main__':
    unittest.main()
