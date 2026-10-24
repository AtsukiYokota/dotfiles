#!/usr/bin/env python3
"""Checked preview assets in disposable homes; no network or installation."""
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import sys
import tarfile
import tempfile
from types import SimpleNamespace
import unittest
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
from deploy import Backup
from preview_assets import _copy_archive, install_preview_assets
import preview_assets


class AssetTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.home = self.root / 'home'
        self.home.mkdir()
        self.archive = self.root / 'assets.tgz'
        self.contents = {'package/dist/main.js': b'window.safePreview = true;',
                         'package/dist/fonts/font.woff2': b'font\x00data',
                         'package/package.json': b'{"scripts":{"postinstall":"must not run"}}'}
        self.make_archive()
        self.package = dict(version='1', url='https://example.test/assets.tgz',
                            sha256=hashlib.sha256(self.archive.read_bytes()).hexdigest(),
                            files={'package/dist/main.js': 'static/markdown/markdown-it.min.js'},
                            directories={'package/dist/fonts': 'static/katex/fonts'})
        self.downloads = []

        def download(url, target, digest):
            self.downloads.append(url)
            self.assertEqual(hashlib.sha256(self.archive.read_bytes()).hexdigest(), digest)
            shutil.copyfile(self.archive, target)
        self.ctx = SimpleNamespace(home=self.home, data=self.home / '.local/share/dotfiles',
                                   versions={'markdown_preview': dict(version='test', packages={'test': self.package})},
                                   runner=SimpleNamespace(download=download),
                                   backup=Backup(self.home / 'backup', self.home))

    def tearDown(self):
        self.temporary.cleanup()

    def make_archive(self, link=False):
        with tarfile.open(self.archive, 'w:gz') as archive:
            for name, content in self.contents.items():
                member = tarfile.TarInfo(name)
                if link and name.endswith('main.js'):
                    member.type = tarfile.SYMTYPE
                    member.linkname = '/etc/passwd'
                    archive.addfile(member)
                else:
                    member.size = len(content)
                    archive.addfile(member, io.BytesIO(content))

    def test_only_reviewed_files_are_copied_and_verified_on_reuse(self):
        manifest = install_preview_assets(self.ctx)
        directory = Path(manifest['root'])
        self.assertFalse((directory / 'package/package.json').exists())
        self.assertEqual(len(manifest['files']), 2)
        self.assertEqual((directory / 'static/katex/fonts/font.woff2').read_bytes(), b'font\x00data')
        published = self.ctx.data / 'preview-assets.json'
        self.assertTrue(published.is_symlink())
        self.assertEqual(json.loads(published.read_text()), manifest)
        self.assertEqual(install_preview_assets(self.ctx), manifest)
        self.assertEqual(len(self.downloads), 1)
        (directory / 'static/markdown/markdown-it.min.js').write_text('modified')
        with self.assertRaisesRegex(RuntimeError, 'checksum mismatch'):
            install_preview_assets(self.ctx)

    def test_archive_link_and_missing_files_fail_without_publishing(self):
        self.make_archive(link=True)
        self.package['sha256'] = hashlib.sha256(self.archive.read_bytes()).hexdigest()
        with self.assertRaisesRegex(ValueError, 'Unexpected preview asset member'):
            install_preview_assets(self.ctx)
        self.assertFalse((self.ctx.data / 'preview-assets/test').exists())
        self.assertFalse((self.ctx.data / 'preview-assets.json').exists())
        self.make_archive()
        self.package['sha256'] = hashlib.sha256(self.archive.read_bytes()).hexdigest()
        self.package['files']['package/missing.js'] = 'static/missing.js'
        with self.assertRaisesRegex(ValueError, 'lacks required files'):
            install_preview_assets(self.ctx)

    def test_destination_traversal_and_external_cache_are_refused(self):
        self.package['files']['package/dist/main.js'] = '../outside.js'
        with self.assertRaisesRegex(ValueError, 'Invalid preview asset path'):
            install_preview_assets(self.ctx)
        self.assertFalse((self.root / 'outside.js').exists())
        self.ctx.data = self.root / 'outside-home'
        with self.assertRaisesRegex(ValueError, 'inside home'):
            install_preview_assets(self.ctx)

    def test_archive_directory_traversal_is_refused(self):
        self.contents['package/dist/fonts/../../escape.js'] = b'not a font'
        self.make_archive()
        self.package['sha256'] = hashlib.sha256(self.archive.read_bytes()).hexdigest()
        with self.assertRaisesRegex(ValueError, 'Invalid preview asset path'):
            install_preview_assets(self.ctx)
        self.assertFalse((self.ctx.data / 'preview-assets/test').exists())

    def test_failed_mermaid_build_never_publishes_old_assets(self):
        self.ctx.versions['markdown_preview']['mermaid_bundle'] = dict(files={}, sha256='0' * 64)
        with mock.patch.object(preview_assets, '_build_mermaid', side_effect=RuntimeError('Build checksum mismatch')):
            with self.assertRaisesRegex(RuntimeError, 'Build checksum mismatch'):
                install_preview_assets(self.ctx)
        self.assertFalse((self.ctx.data / 'preview-assets/test').exists())
        self.assertFalse((self.ctx.data / 'preview-assets.json').exists())

    def test_build_ignores_inherited_node_preloads_and_esbuild_override(self):
        self.ctx.repo = self.root / 'repo'
        sources = self.ctx.repo / 'configs/markdown-preview'
        sources.mkdir(parents=True)
        specification = {'files': {}, 'sha256': hashlib.sha256(b'reviewed bundle').hexdigest()}
        for name, content in (('package.json', b'{}'), ('package-lock.json', b'{}'), ('mermaid-entry.js', b'entry')):
            (sources / name).write_bytes(content)
            specification['files'][name] = hashlib.sha256(content).hexdigest()
        self.ctx.versions['node'] = {'version': '24.22.1'}
        node = self.ctx.data / 'tools/node/24.22.1/bin/node'
        node.parent.mkdir(parents=True)
        node.write_text('not executed')
        calls = []

        def run(argv, env):
            calls.append((argv, env))
            for argument in argv:
                if argument.startswith('--outfile='):
                    Path(argument.removeprefix('--outfile=')).write_bytes(b'reviewed bundle')
        self.ctx.runner.run = run
        work = self.root / 'build-work'
        work.mkdir()
        with mock.patch.dict(os.environ, {'NODE_OPTIONS': '--require untrusted.js', 'NODE_PATH': '/untrusted',
                                          'ESBUILD_BINARY_PATH': '/untrusted/esbuild'}):
            preview_assets._build_mermaid(self.ctx, specification, work, self.root / 'output')
        self.assertEqual(len(calls), 2)
        self.assertIn('--ignore-scripts', calls[0][0])
        for _argv, environment in calls:
            for name in ('NODE_OPTIONS', 'NODE_PATH', 'ESBUILD_BINARY_PATH'):
                self.assertEqual(environment[name], '')

    def test_changed_source_spec_and_redirected_asset_are_refused(self):
        manifest = install_preview_assets(self.ctx)
        self.package['version'] = 'different'
        with self.assertRaisesRegex(RuntimeError, 'reviewed sources'):
            install_preview_assets(self.ctx)
        self.package['version'] = '1'
        source = Path(manifest['root']) / 'static/markdown/markdown-it.min.js'
        source.unlink()
        source.symlink_to(self.archive)
        with self.assertRaisesRegex(RuntimeError, 'redirected'):
            install_preview_assets(self.ctx)

    def test_manifest_selects_security_fixed_markdown_and_katex_versions(self):
        spec = json.loads((ROOT / 'installer/versions.json').read_text())['markdown_preview']
        packages = spec['packages']
        self.assertEqual(packages['markdown-it']['version'], '15.0.3')
        self.assertEqual(packages['markdown-it-emoji']['version'], '3.1.0')
        self.assertEqual(packages['markdown-it-emoji']['files']['package/dist/markdown-it-emoji.min.js'],
                         'static/markdown/markdown-it-emoji.min.js')
        self.assertGreaterEqual(tuple(map(int, packages['katex']['version'].split('.'))), (0, 18, 2))
        self.assertNotIn('package/dist/mermaid.min.js', packages['mermaid']['files'])
        for filename, expected in spec['mermaid_bundle']['files'].items():
            self.assertEqual(hashlib.sha256((ROOT / 'configs/markdown-preview' / filename).read_bytes()).hexdigest(), expected)
        lock = json.loads((ROOT / 'configs/markdown-preview/package-lock.json').read_text())
        self.assertEqual(lock['packages']['node_modules/dompurify']['version'], '3.4.17')


if __name__ == '__main__':
    unittest.main()
