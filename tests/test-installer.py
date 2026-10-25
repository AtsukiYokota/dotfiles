"""Offline installer checks; use a temporary HOME and simulated OS commands."""
from __future__ import annotations

import io
import contextlib
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tarfile
import tempfile
from types import SimpleNamespace
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / 'installer'))
from installer import theme  # noqa: E402
import actions  # noqa: E402
import catalog  # noqa: E402
import deploy  # noqa: E402
import main as installer_main  # noqa: E402
import runtime  # noqa: E402
import ui  # noqa: E402


class CatalogTests(unittest.TestCase):
    def test_dependencies_precede_dependents_and_are_unique(self):
        selected = catalog.resolve({'neovim', 'ros-desktop', 'rust'}, 'wsl', 'arm64')
        self.assertEqual(len(selected), len(set(selected)))
        for name in selected:
            for dependency in catalog.MODULES[name].depends:
                self.assertLess(selected.index(dependency), selected.index(name))
        self.assertIn('ros2', selected)
        self.assertIn('python', selected)
        self.assertIn('node', selected)
        self.assertIn('fonts', selected)
        self.assertLess(selected.index('fonts'), selected.index('shell'))

    def test_native_and_architecture_restrictions_are_enforced(self):
        for name in ('desktop', 'vscode', 'chrome', 'ibis-office', 'macos-theme', 'japanese-input'):
            with self.subTest(name=name), self.assertRaises(ValueError):
                catalog.resolve({name}, 'wsl', 'amd64')
        for name in ('chrome', 'ibis-office'):
            with self.subTest(name=name), self.assertRaises(ValueError):
                catalog.resolve({name}, 'native', 'arm64')
        self.assertEqual(catalog.resolve({'macos-theme'}, 'native', 'arm64'), ['macos-theme'])

    def test_office_is_optional_and_does_not_require_a_development_environment(self):
        self.assertNotIn('ibis-office', catalog.defaults_for('native', 'amd64'))
        self.assertEqual(catalog.resolve({'ibis-office'}, 'native', 'amd64'), ['ibis-office'])

    def test_empty_and_unknown_selections_are_rejected(self):
        for selection in (set(), {'unknown-module'}):
            with self.assertRaises(ValueError):
                catalog.resolve(selection, 'native', 'amd64')

    def test_standalone_user_tools_include_their_persistent_shell_environment(self):
        for name in ('python', 'rust', 'node', 'latex', 'diagrams'):
            with self.subTest(module=name):
                resolved = catalog.resolve({name}, 'wsl', 'amd64')
                self.assertIn('shell', resolved)
                self.assertLess(resolved.index('shell'), resolved.index(name))


def fixture_context(root: Path):
    home, repo = root / 'test home', root / 'source repository'
    home.mkdir()
    repo.mkdir()
    for name in ('.bashrc', '.inputrc', '.dircolors', '.tmux.conf', '.rosrc', '.vimrc', '.latexmkrc'):
        (repo / name).write_text('# managed ' + name + '\n', encoding='utf-8')
    (repo / 'scripts').mkdir()
    (repo / 'scripts/clipboard.sh').write_text('#!/bin/sh\n', encoding='utf-8')
    (repo / 'commands').mkdir()
    for name in ('fetchall.sh', 'png2eps.sh', 'jpg2eps.sh', 'image2eps.py', 'ros-format.py', 'plantuml-render.py'):
        (repo / 'commands' / name).write_text('# test helper\n', encoding='utf-8')
    (repo / 'configs/nvim').mkdir(parents=True)
    (repo / 'configs/nvim/init.lua').write_text('-- managed\n', encoding='utf-8')
    (repo / 'configs/starship.toml').write_text('add_newline = true\n', encoding='utf-8')
    (repo / 'configs/shell').mkdir()
    (repo / 'configs/shell/formatting.bash').write_text('# helpers\n', encoding='utf-8')
    (repo / 'configs/shell/workflow.bash').write_text('# workflow\n', encoding='utf-8')
    config = home / '.config'
    (config / 'nvim').mkdir(parents=True)
    (config / 'nvim/user.lua').write_text('-- keep this directory\n', encoding='utf-8')
    (home / '.bashrc').write_text('export KEEP_ME=yes\n', encoding='utf-8')
    (home / '.profile').write_text('export LOGIN_SETTING=yes\n', encoding='utf-8')
    (home / '.inputrc').write_text('# personal readline\n', encoding='utf-8')
    (home / 'original-tmux').write_text('# personal tmux\n', encoding='utf-8')
    (home / '.tmux.conf').symlink_to('original-tmux')
    return SimpleNamespace(home=home, repo=repo, config=config,
                           modules=['shell', 'neovim', 'latex', 'diagrams'])


@unittest.skipUnless(sys.platform == 'linux', 'Linux symlink semantics; run in WSL for deployment tests')
class DeploymentTests(unittest.TestCase):
    def test_config_deployment_is_idempotent_and_restore_preserves_originals(self):
        with tempfile.TemporaryDirectory(prefix='dotfiles-deploy-test-') as temporary:
            ctx = fixture_context(Path(temporary))
            first = deploy.Backup(ctx.home / 'backups/first', ctx.home)
            ctx.backup = first
            actions.deploy_configs(ctx)
            self.assertIn('export KEEP_ME=yes', (ctx.home / '.bashrc').read_text())
            self.assertEqual((ctx.home / '.bashrc').read_text().count('# >>> dotfiles managed >>>'), 1)
            self.assertEqual((ctx.config / 'nvim').resolve(), ctx.repo / 'configs/nvim')
            for name in ('fetchall', 'png2eps', 'jpg2eps', 'image2eps.py', 'dotfiles-clipboard', 'dotfiles-plantuml-render'):
                self.assertTrue(os.access(ctx.home / '.local/bin' / name, os.X_OK))
            installed_bashrc = (ctx.home / '.bashrc').read_text()
            second = deploy.Backup(ctx.home / 'backups/second', ctx.home)
            ctx.backup = second
            actions.deploy_configs(ctx)
            self.assertEqual(second.entries, [])
            self.assertEqual((ctx.home / '.bashrc').read_text(), installed_bashrc)
            deploy.restore(second.directory, ctx.home)
            deploy.restore(first.directory, ctx.home)
            self.assertEqual((ctx.home / '.bashrc').read_text(), 'export KEEP_ME=yes\n')
            self.assertEqual((ctx.home / '.profile').read_text(), 'export LOGIN_SETTING=yes\n')
            self.assertEqual((ctx.home / '.inputrc').read_text(), '# personal readline\n')
            self.assertTrue((ctx.home / '.tmux.conf').is_symlink())
            self.assertEqual(os.readlink(ctx.home / '.tmux.conf'), 'original-tmux')
            self.assertEqual((ctx.config / 'nvim/user.lua').read_text(), '-- keep this directory\n')
            self.assertFalse((ctx.home / '.rosrc').exists())
            self.assertFalse((ctx.home / '.latexmkrc').exists())
            self.assertEqual((ctx.repo / '.bashrc').read_text(), '# managed .bashrc\n')
            deploy.restore(first.directory, ctx.home)  # repeated restoration is harmless

    def test_restore_rejects_new_user_changes_before_restoring_other_files(self):
        with tempfile.TemporaryDirectory(prefix='dotfiles-conflict-test-') as temporary:
            ctx = fixture_context(Path(temporary))
            ctx.backup = deploy.Backup(ctx.home / 'backups/first', ctx.home)
            actions.deploy_configs(ctx)
            target = ctx.home / '.inputrc'
            target.unlink()
            target.write_text('# edited after installation\n', encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'changed since installation'):
                deploy.restore(ctx.backup.directory, ctx.home)
            self.assertIn('dotfiles managed', (ctx.home / '.bashrc').read_text())
            self.assertEqual(target.read_text(), '# edited after installation\n')

    def test_symlinked_parent_outside_home_is_rejected(self):
        with tempfile.TemporaryDirectory(prefix='dotfiles-boundary-test-') as temporary:
            root = Path(temporary)
            home, outside = root / 'home', root / 'outside'
            home.mkdir()
            outside.mkdir()
            (home / '.config').symlink_to(outside, target_is_directory=True)
            source = home / 'source'
            source.write_text('source', encoding='utf-8')
            backup = deploy.Backup(home / 'backup', home)
            with self.assertRaisesRegex(ValueError, 'outside home'):
                backup.link(source, home / '.config/target')
            self.assertEqual(list(outside.iterdir()), [])

    def test_interrupted_original_move_is_recoverable(self):
        with tempfile.TemporaryDirectory(prefix='dotfiles-interruption-test-') as temporary:
            home = Path(temporary)
            target = home / '.bashrc'
            target.write_text('keep\n', encoding='utf-8')
            backup = deploy.Backup(home / 'backup', home)
            with mock.patch.object(deploy.shutil, 'move', side_effect=OSError('simulated interruption')):
                with self.assertRaises(OSError):
                    backup.write_text(target, 'new\n')
            deploy.restore(backup.directory, home)
            self.assertEqual(target.read_text(), 'keep\n')

    def test_malformed_shell_block_does_not_overwrite_shell_config(self):
        with tempfile.TemporaryDirectory(prefix='dotfiles-block-test-') as temporary:
            ctx = fixture_context(Path(temporary))
            original = '# >>> dotfiles managed >>>\nexport CUSTOM=yes\n'
            (ctx.home / '.bashrc').write_text(original, encoding='utf-8')
            ctx.backup = deploy.Backup(ctx.home / 'backup', ctx.home)
            with self.assertRaisesRegex((ValueError, RuntimeError), 'Malformed'):
                actions.deploy_configs(ctx)
            self.assertEqual((ctx.home / '.bashrc').read_text(), original)
            self.assertEqual(ctx.backup.entries, [])

    def test_write_text_preserves_existing_private_modes_and_creates_private_files(self):
        with tempfile.TemporaryDirectory(prefix='dotfiles-mode-test-') as temporary:
            home = Path(temporary)
            backup = deploy.Backup(home / 'backup', home)
            for mode in (0o600, 0o640):
                with self.subTest(mode=oct(mode)):
                    target = home / f'private-{mode:o}'
                    target.write_text('original\n', encoding='utf-8')
                    target.chmod(mode)
                    backup.write_text(target, 'installed\n')
                    self.assertEqual(target.stat().st_mode & 0o777, mode)
            created = home / 'new-config'
            old_umask = os.umask(0)
            try:
                backup.write_text(created, 'private by default\n')
            finally:
                os.umask(old_umask)
            self.assertEqual(created.stat().st_mode & 0o777, 0o600)
            deploy.restore(backup.directory, home)
            for mode in (0o600, 0o640):
                target = home / f'private-{mode:o}'
                self.assertEqual(target.read_text(), 'original\n')
                self.assertEqual(target.stat().st_mode & 0o777, mode)
            self.assertFalse(created.exists())

    def test_backup_directory_is_private_even_with_permissive_umask(self):
        with tempfile.TemporaryDirectory(prefix='dotfiles-backup-mode-test-') as temporary:
            home = Path(temporary)
            old_umask = os.umask(0)
            try:
                backup = deploy.Backup(home / 'state/backups/first', home)
                backup.write_text(home / 'config', 'contents\n')
            finally:
                os.umask(old_umask)
            self.assertEqual(backup.directory.stat().st_mode & 0o777, 0o700)
            self.assertTrue((backup.directory / 'manifest.json').is_file())

    def test_dangling_bashrc_link_is_backed_up_replaced_and_restorable(self):
        with tempfile.TemporaryDirectory(prefix='dotfiles-dangling-test-') as temporary:
            ctx = fixture_context(Path(temporary))
            bashrc = ctx.home / '.bashrc'
            bashrc.unlink()
            bashrc.symlink_to('obsolete-dotfiles/.bashrc')
            ctx.backup = deploy.Backup(ctx.home / 'backup', ctx.home)
            actions.deploy_configs(ctx)
            self.assertTrue(bashrc.is_file())
            self.assertFalse(bashrc.is_symlink())
            current = bashrc.read_text()
            self.assertEqual(current.count('# >>> dotfiles managed >>>'), 1)
            skeleton = Path('/etc/skel/.bashrc')
            if skeleton.is_file():
                self.assertTrue(current.startswith(skeleton.read_text().rstrip()))
            self.assertFalse((ctx.home / 'obsolete-dotfiles').exists())
            deploy.restore(ctx.backup.directory, ctx.home)
            self.assertTrue(bashrc.is_symlink())
            self.assertFalse(bashrc.exists())
            self.assertEqual(os.readlink(bashrc), 'obsolete-dotfiles/.bashrc')


class SettingsTests(unittest.TestCase):
    def test_settings_restore_uses_original_value_and_checks_conflicts(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            backup = deploy.Backup(home / 'backup', home)
            state = {'value': "'Yaru'"}
            runner = SimpleNamespace(
                capture=lambda argv: state['value'],
                run=lambda argv: state.update(value=argv[-1]),
            )
            backup.set_setting('org.gnome.desktop.interface', 'gtk-theme', "'WhiteSur-Dark'", runner)
            self.assertEqual(state['value'], "'WhiteSur-Dark'")
            state['value'] = "'My later choice'"
            with mock.patch.object(deploy.subprocess, 'check_output', side_effect=lambda *a, **k: state['value']), \
                 mock.patch.object(deploy.subprocess, 'run') as setter:
                with self.assertRaisesRegex(ValueError, 'Setting changed'):
                    deploy.restore(backup.directory, home)
                setter.assert_not_called()
            state['value'] = "'WhiteSur-Dark'"
            with mock.patch.object(deploy.subprocess, 'check_output', side_effect=lambda *a, **k: state['value']), \
                 mock.patch.object(deploy.subprocess, 'run', side_effect=lambda argv, **k: state.update(value=argv[-1])):
                deploy.restore(backup.directory, home)
            self.assertEqual(state['value'], "'Yaru'")


class ActionTests(unittest.TestCase):
    def test_vscode_selection_refreshes_existing_snap_or_installs_new(self):
        for installed in (True, False):
            with self.subTest(installed=installed), tempfile.TemporaryDirectory() as temporary:
                runner = mock.Mock()
                def capture(argv):
                    if argv == ['snap', 'list', 'code'] and not installed:
                        raise subprocess.CalledProcessError(1, argv)
                    return ''
                runner.capture.side_effect = capture
                ctx = SimpleNamespace(modules=['vscode'], runner=runner, versions={},
                                      backup=SimpleNamespace(directory=Path(temporary)))
                with mock.patch.object(actions, 'prepare_apt'), \
                     mock.patch.object(actions, 'deploy_configs'), \
                     contextlib.redirect_stdout(io.StringIO()):
                    actions.install_modules(ctx)
                expected = ['sudo', 'snap', 'refresh', 'code'] if installed else \
                    ['sudo', 'snap', 'install', 'code', '--classic']
                runner.run.assert_called_once_with(expected)

    def test_old_theme_retirement_requires_successful_plugin_bootstrap(self):
        for outcome in ('success', 'failure', 'skipped'):
            with self.subTest(outcome=outcome), tempfile.TemporaryDirectory() as temporary:
                home = Path(temporary)
                runner = mock.Mock()
                runner.capture.return_value = ''
                if outcome == 'failure':
                    runner.run.side_effect = subprocess.CalledProcessError(1, ['nvim'])
                ctx = SimpleNamespace(home=home, repo=ROOT, modules=['neovim'], versions={},
                                      runner=runner, no_plugins=outcome == 'skipped',
                                      backup=SimpleNamespace(directory=home))
                with mock.patch.object(actions, 'prepare_apt'), \
                     mock.patch.object(actions, 'deploy_configs'), \
                     mock.patch.object(actions, 'install_archive'), \
                     mock.patch('preview_assets.install_preview_assets'), \
                     mock.patch('editor.retire_obsolete_theme') as retire, \
                     contextlib.redirect_stdout(io.StringIO()):
                    if outcome == 'failure':
                        with self.assertRaises(subprocess.CalledProcessError):
                            actions.install_modules(ctx)
                    else:
                        actions.install_modules(ctx)
                if outcome == 'success':
                    retire.assert_called_once_with(ctx)
                else:
                    retire.assert_not_called()

    def test_selected_lsp_installation_matches_reviewed_plan(self):
        versions = json.loads((ROOT / 'installer/versions.json').read_text(encoding='utf-8'))
        for requested, expected in (({'neovim'}, {'starship', 'uv', 'node', 'neovim'}),
                                    ({'latex'}, {'starship', 'texlab'}),
                                    ({'shell'}, {'starship'}),
                                    ({'file-tools'}, {'starship', 'fd', 'bat'})):
            with self.subTest(selection=requested), tempfile.TemporaryDirectory() as temporary:
                home = Path(temporary)
                modules = catalog.resolve(requested, 'wsl', 'amd64')
                runner = mock.Mock()
                runner.capture.return_value = ''
                ctx = SimpleNamespace(home=home, config=home / '.config', data=home / '.local/share/dotfiles', modules=modules,
                                      versions=versions, runner=runner, no_plugins=True,
                                      backup=SimpleNamespace(directory=home, write_text=mock.Mock()))
                args = installer_main.parser().parse_args(['--modules', ','.join(requested)])
                output = io.StringIO()
                with contextlib.redirect_stdout(output):
                    installer_main.show_plan(modules, requested, 'wsl', 'amd64', args, versions, home)
                with mock.patch.object(actions, 'prepare_apt'), \
                     mock.patch.object(actions, 'deploy_configs'), \
                     mock.patch('fonts.install_fonts') as install_fonts, \
                     mock.patch('preview_assets.install_preview_assets') as install_preview_assets, \
                     mock.patch.object(actions, 'install_archive', return_value=home / 'pinned-node') as archive, \
                     contextlib.redirect_stdout(io.StringIO()):
                    actions.install_modules(ctx)
                self.assertEqual({call.args[1] for call in archive.call_args_list}, expected)
                install_fonts.assert_called_once_with(ctx)
                if 'neovim' in modules:
                    install_preview_assets.assert_called_once_with(ctx)
                    self.assertIn('Markdown preview assets', output.getvalue())
                else:
                    install_preview_assets.assert_not_called()
                self.assertIn('Nerd Font: JetBrainsMono Nerd Font Mono', output.getvalue())
                npm_calls = [call for call in runner.run.call_args_list if '--global' in call.args[0]]
                if 'node' in modules:
                    self.assertEqual(len(npm_calls), 2 if 'python' in modules else 1)
                    for package, version in versions['npm_language_servers'].items():
                        self.assertIn(f'{package}@{version}', npm_calls[0].args[0])
                        self.assertIn(f'{package}@{version}', output.getvalue())
                else:
                    self.assertEqual(npm_calls, [])
                    self.assertNotIn('User npm language tools', output.getvalue())
                self.assertEqual('User tool: texlab ' in output.getvalue(), 'latex' in modules)

    def test_npm_uses_pinned_node_and_user_prefix_before_shell_setup(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary) / 'home with spaces'
            home.mkdir()
            node = home / 'data/tools/node/24'
            ctx = SimpleNamespace(home=home, runner=mock.Mock(),
                                  versions={'npm_language_servers': {'test-language-server': '1.2.3'}})
            with mock.patch.dict(os.environ, {'PATH': '/usr/bin', 'NPM_CONFIG_PREFIX': '/unrelated/prefix'}):
                actions.install_node_language_servers(ctx, node)
                actions.install_node_language_servers(ctx, node)
            self.assertEqual(ctx.runner.run.call_count, 2)
            self.assertEqual(ctx.runner.run.call_args_list[0], ctx.runner.run.call_args_list[1])
            argv = ctx.runner.run.call_args.args[0]
            self.assertEqual(argv[:2], [str(node / 'bin/node'), str(node / 'lib/node_modules/npm/bin/npm-cli.js')])
            self.assertNotIn('sudo', argv)
            self.assertNotIn('--force', argv)
            self.assertIn('--ignore-scripts', argv)
            self.assertEqual(argv[argv.index('--prefix') + 1], str(home / '.local'))
            environment = ctx.runner.run.call_args.kwargs['env']
            self.assertEqual(environment['NPM_CONFIG_PREFIX'], str(home / '.local'))
            self.assertEqual(environment['PATH'], str(node / 'bin') + os.pathsep + '/usr/bin')

    def test_python_uses_verified_node_before_installing_basedpyright(self):
        modules = catalog.resolve({'python'}, 'wsl', 'amd64')
        self.assertLess(modules.index('node'), modules.index('python'))

    def test_basedpyright_migrates_only_its_previous_uv_environment(self):
        for installed in ('basedpyright v1.40.2\n- basedpyright\n- basedpyright-langserver\nruff v1.0.0\n',
                          'ruff v1.0.0\n- ruff\n', ''):
            with self.subTest(installed=installed), tempfile.TemporaryDirectory() as temporary:
                home = Path(temporary)
                runner = mock.Mock()
                runner.capture.return_value = installed
                ctx = SimpleNamespace(home=home, data=home / 'data', runner=runner,
                                      versions={'node': {'version': '24.22.1'}, 'basedpyright': '1.40.2'})
                uv = home / '.local/bin/uv'
                actions.install_basedpyright(ctx, uv)
                runner.capture.assert_called_once_with([str(uv), 'tool', 'list', '--color', 'never'])
                commands = [call.args[0] for call in runner.run.call_args_list]
                if installed.startswith('basedpyright '):
                    self.assertEqual(commands[0], [str(uv), 'tool', 'uninstall', 'basedpyright'])
                    self.assertEqual(len(commands), 2)
                else:
                    self.assertEqual(len(commands), 1)
                self.assertIn('basedpyright@1.40.2', commands[-1])
                self.assertEqual(commands[-1][0], str(home / 'data/tools/node/24.22.1/bin/node'))
                self.assertNotIn('--force', commands[-1])

    def test_failed_uv_migration_does_not_replace_basedpyright_entrypoints(self):
        runner = mock.Mock()
        runner.capture.return_value = 'basedpyright v1.40.2\n'
        runner.run.side_effect = subprocess.CalledProcessError(1, ['uv', 'tool', 'uninstall'])
        ctx = SimpleNamespace(runner=runner)
        with self.assertRaises(subprocess.CalledProcessError):
            actions.install_basedpyright(ctx, Path('/home/test/.local/bin/uv'))
        runner.run.assert_called_once_with(['/home/test/.local/bin/uv', 'tool', 'uninstall', 'basedpyright'])

    @unittest.skipUnless(sys.platform == 'linux', 'Linux symlink semantics')
    def test_npm_refuses_prefix_subdirectories_outside_home(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            home, outside = root / 'home', root / 'outside'
            (home / '.local/lib').mkdir(parents=True)
            outside.mkdir()
            (home / '.local/lib/node_modules').symlink_to(outside)
            ctx = SimpleNamespace(home=home, runner=mock.Mock(), versions={'npm_language_servers': {}})
            with self.assertRaisesRegex(ValueError, 'inside home'):
                actions.install_node_language_servers(ctx, home / 'node')
            ctx.runner.run.assert_not_called()

    def test_chrome_reuses_active_sources_and_ignores_disabled_entries(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            source = directory / 'google-chrome.list'
            source.write_text('# deb https://dl.google.com/linux/chrome/deb/ stable main\n')
            self.assertIsNone(actions.existing_chrome_source(directory))
            source.write_text('deb [arch=amd64 signed-by=/vendor/key.gpg] https://dl.google.com/linux/chrome/deb/ stable main\n')
            self.assertEqual(actions.existing_chrome_source(directory), source)
            source.unlink()
            source = directory / 'google-chrome.sources'
            contents = 'Types: deb\nURIs: https://dl.google.com/linux/chrome/deb/\nSuites: stable\nComponents: main\n'
            source.write_text(contents + 'Enabled: no\n')
            self.assertIsNone(actions.existing_chrome_source(directory))
            source.write_text(contents)
            self.assertEqual(actions.existing_chrome_source(directory), source)
            source.write_text(contents.replace('/chrome/deb/', '/chrome-stable/deb/'))
            self.assertEqual(actions.existing_chrome_source(directory), source)
            source.write_text(contents.replace('/chrome/deb/', '/chrome-beta/deb/'))
            self.assertIsNone(actions.existing_chrome_source(directory))

    @unittest.skipUnless(sys.platform == 'linux', 'Verify Linux executable permissions')
    def test_plantuml_reuses_verified_jar_and_refuses_changed_content(self):
        with tempfile.TemporaryDirectory(prefix='dotfiles-plantuml-') as temporary:
            root = Path(temporary)
            home = root / "home with 'quote'"
            home.mkdir()
            payload = b'verified test jar'
            digest = hashlib.sha256(payload).hexdigest()
            runner = mock.Mock()
            runner.download.side_effect = lambda url, path, sha256: path.write_bytes(payload)
            ctx = SimpleNamespace(home=home, data=home / 'data', temp=root, arch='amd64', runner=runner,
                                  versions={'plantuml': {'version': 'test', 'url': 'https://example.invalid/plantuml.jar', 'sha256': digest}},
                                  backup=deploy.Backup(home / 'backup', home))
            actions.install_plantuml(ctx)
            wrapper = home / '.local/bin/plantuml'
            self.assertTrue(os.access(wrapper, os.X_OK))
            subprocess.run(['bash', '-n', str(wrapper)], check=True)
            jar = ctx.data / 'tools/plantuml/test/plantuml.jar'
            actions.install_plantuml(ctx)
            self.assertEqual(runner.download.call_count, 1)
            jar.write_bytes(b'changed')
            with self.assertRaisesRegex(RuntimeError, 'Unrecognized existing PlantUML'):
                actions.install_plantuml(ctx)
            deploy.restore(ctx.backup.directory, home)
            self.assertFalse(wrapper.exists())
            self.assertEqual(jar.read_bytes(), b'changed')

    def test_ros_apt_plan_is_ordered_and_never_upgrades_the_distribution(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            commands = []
            runner = SimpleNamespace(
                run=lambda argv: commands.append(argv),
                capture=lambda argv: 'noble-updates noble-backports',
                download=lambda url, destination, checksum: destination.write_bytes(b'test-package'),
            )
            ctx = SimpleNamespace(temp=root, modules=catalog.resolve({'ros-desktop'}, 'wsl', 'arm64'),
                                  runner=runner, versions={'ros_source': {'url': 'https://example.invalid/pinned.deb', 'sha256': '0' * 64}})
            actions.prepare_apt(ctx)
            update = next(index for index, command in enumerate(commands) if command[:3] == ['sudo', 'apt-get', 'update'])
            install = next(index for index, command in enumerate(commands) if command[:3] == ['sudo', 'apt-get', 'install'])
            self.assertLess(update, install)
            self.assertTrue(any('ros-jazzy-desktop' in command for command in commands))
            self.assertFalse(any('ros-jazzy-ros-base' in command for command in commands))
            self.assertFalse(any(token in ('upgrade', 'dist-upgrade', 'full-upgrade') for command in commands for token in command))
            self.assertTrue(all('--no-remove' in command for command in commands if command[:3] == ['sudo', 'apt-get', 'install']))

    def test_download_checksum_mismatch_removes_untrusted_file(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            runner = runtime.Runner(root / 'log')
            with mock.patch.object(runtime.urllib.request, 'urlopen', return_value=io.BytesIO(b'tampered')):
                with self.assertRaisesRegex(RuntimeError, 'SHA-256 mismatch'):
                    runner.download('https://example.invalid/tool', root / 'tool', hashlib.sha256(b'expected').hexdigest())
            self.assertFalse((root / 'tool').exists())


class InteractiveTests(unittest.TestCase):
    def test_native_arm64_select_all_excludes_amd64_only_modules(self):
        with mock.patch('builtins.input', side_effect=['a', '']), \
             contextlib.redirect_stdout(io.StringIO()):
            selected = ui.choose('native', 'arm64', plain=True)
        self.assertFalse(selected.intersection({'chrome', 'ibis-office'}))
        self.assertIn('desktop', selected)
        catalog.resolve(selected, 'native', 'arm64')

    def test_confirmation_cancel_creates_no_backup(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            with mock.patch.object(installer_main.Path, 'home', return_value=home), \
                 mock.patch.dict(os.environ, {'HOME': str(home), 'XDG_CONFIG_HOME': str(home / '.config'),
                                              'XDG_DATA_HOME': str(home / '.local/share'),
                                              'XDG_STATE_HOME': str(home / '.local/state')}), \
                 mock.patch.object(installer_main, 'detect_platform', return_value=({'ID': 'ubuntu', 'VERSION_ID': '24.04'}, 'wsl', 'amd64')), \
                 mock.patch.object(installer_main, 'check_platform'), \
                 mock.patch('builtins.input', return_value=''), \
                 contextlib.redirect_stdout(io.StringIO()):
                result = installer_main.main(['--configs-only', '--modules', 'shell'])
            self.assertEqual(result, 0)
            self.assertEqual(list(home.iterdir()), [])

    def test_missing_curses_falls_back_to_plain_checklist(self):
        import builtins
        original_import = builtins.__import__

        def without_curses(name, *args, **kwargs):
            if name == 'curses':
                raise ImportError('simulated missing curses')
            return original_import(name, *args, **kwargs)

        with mock.patch.object(ui.sys.stdin, 'isatty', return_value=True), \
             mock.patch.dict(os.environ, {'TERM': 'xterm'}), \
             mock.patch('builtins.__import__', side_effect=without_curses), \
             mock.patch('builtins.input', return_value=''), \
             contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(ui.choose('wsl', 'amd64'), catalog.DEFAULTS)

    def test_empty_plain_selection_can_be_corrected(self):
        shell_index = list(catalog.MODULES).index('shell') + 1
        with mock.patch('builtins.input', side_effect=['n', '', str(shell_index), '']), \
             contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(ui.choose('wsl', 'amd64', plain=True), {'shell'})


class ThemeRunner:
    """Create minimal upstream-shaped inputs without executing shell scripts."""

    def __init__(self):
        self.downloads = []
        self.commands = []

    def download(self, url, destination, checksum):
        source = next(item for item in theme.SOURCES.values() if item['commit'] in url)
        if checksum != source['sha256']:
            raise AssertionError('The download did not request its pinned checksum.')
        self.downloads.append(url)
        top = f"{source['repo']}-{source['commit']}"
        files = {
            'install.sh': '#!/bin/sh\nexit 1\n',
            'libs/lib-core.sh': 'MY_HOME=$(getent passwd "${MY_USERNAME}" | cut -d: -f6)\n'
                                'export WHITESUR_TMP_DIR="/tmp/WhiteSur.lock"\n',
            'dist/index.theme': '[Icon Theme]\nName=WhiteSur-cursors\n',
        }
        with tarfile.open(destination, 'w:gz') as archive:
            for name, content in files.items():
                data = content.encode()
                member = tarfile.TarInfo(f'{top}/{name}')
                member.size = len(data)
                archive.addfile(member, io.BytesIO(data))

    def run(self, argv, env=None):
        self.commands.append((argv, env))
        if argv[0] != 'bash' or env is None:
            raise AssertionError('Unexpected operating-system command in theme build.')
        output = Path(argv[argv.index('-d') + 1])
        if 'WhiteSur-gtk-theme-' in argv[1]:
            css = output / theme.THEME_NAME / 'gtk-3.0/gtk.css'
            css.parent.mkdir(parents=True)
            css.write_text('/* test theme */', encoding='utf-8')
        else:
            for name in theme.ICON_NAMES[:-1]:
                folder = output / name
                folder.mkdir()
                (folder / 'index.theme').write_text('[Icon Theme]\n', encoding='utf-8')

    def capture(self, argv):
        if argv == ['gsettings', 'list-schemas']:
            return 'org.gnome.desktop.interface\norg.gnome.desktop.wm.preferences\n'
        if argv[1] == 'list-keys' and argv[2] == 'org.gnome.desktop.interface':
            return 'gtk-theme\nicon-theme\ncursor-theme\ncolor-scheme\n'
        if argv[1] == 'list-keys' and argv[2] == 'org.gnome.desktop.wm.preferences':
            return 'button-layout\n'
        raise AssertionError(f'Unexpected captured command: {argv}')


class ThemeBackup:
    def __init__(self):
        self.links = []
        self.settings = []

    def link(self, source, target):
        self.links.append((source, target))

    def set_setting(self, schema, key, value, runner):
        self.settings.append((schema, key, value))


class ThemeTests(unittest.TestCase):
    def test_wsl_rejected_before_any_download_or_mutation(self):
        ctx = SimpleNamespace(platform='wsl')
        with self.assertRaisesRegex(RuntimeError, 'native Ubuntu'):
            theme.install_theme(ctx)

    @unittest.skipUnless(hasattr(tarfile, 'data_filter'), 'Requires Python 3.12 tarfile filtering')
    def test_archive_cannot_escape_extraction_directory(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            archive = root / 'unsafe.tar.gz'
            with tarfile.open(archive, 'w:gz') as stream:
                member = tarfile.TarInfo('../escaped')
                member.size = 1
                stream.addfile(member, io.BytesIO(b'x'))
            with self.assertRaises(tarfile.FilterError):
                theme._extract(archive, root / 'unpack', theme.SOURCES['gtk'])
            self.assertFalse((root / 'escaped').exists())

    @unittest.skipUnless(hasattr(tarfile, 'data_filter'), 'Requires Python 3.12 tarfile filtering')
    def test_staged_build_is_published_once_and_records_user_changes(self):
        with tempfile.TemporaryDirectory(prefix='dotfiles-theme-test-') as temporary:
            root = Path(temporary)
            home = root / 'real home'
            home.mkdir()
            ctx = SimpleNamespace(
                platform='native', home=home, temp=root / 'temporary',
                data=home / '.local/share/dotfiles', runner=ThemeRunner(), backup=ThemeBackup(),
            )
            with mock.patch.object(theme, '_require_session'), \
                    mock.patch.object(theme, '_install_wallpapers', return_value=ctx.data / 'wallpapers'):
                theme.install_theme(ctx)
                theme.install_theme(ctx)
            self.assertEqual(len(ctx.runner.downloads), 3)
            self.assertEqual(len(ctx.runner.commands), 2)
            self.assertEqual(len(ctx.backup.links), 10)
            self.assertEqual(len(ctx.backup.settings), 10)
            self.assertFalse((home / '.config/gtk-4.0').exists())
            self.assertFalse((home / '.local/bin/gnome-theme-switcher').exists())
            for argv, environment in ctx.runner.commands:
                self.assertNotEqual(Path(environment['HOME']), home)
                self.assertNotIn('--libadwaita', argv)
                self.assertNotIn('--silent-mode', argv)
                self.assertEqual(environment['DBUS_SESSION_BUS_ADDRESS'], '')
                self.assertTrue((Path(environment['PATH'].split(os.pathsep)[0]) / 'sudo').is_file())
            for source, target in ctx.backup.links:
                self.assertTrue(source.is_dir())
                self.assertTrue(source.is_relative_to(ctx.data))
                self.assertTrue(target.is_relative_to(home))

    def test_unrecognized_existing_build_is_preserved(self):
        with tempfile.TemporaryDirectory() as temporary:
            home = Path(temporary)
            ctx = SimpleNamespace(platform='native', home=home, data=home / 'data')
            installed = ctx.data / 'themes' / theme.BUILD_ID
            installed.mkdir(parents=True)
            sentinel = installed / 'user-file'
            sentinel.write_text('keep me', encoding='utf-8')
            with mock.patch.object(theme, '_require_session'):
                with self.assertRaisesRegex(RuntimeError, 'Unrecognized existing'):
                    theme.install_theme(ctx)
            self.assertEqual(sentinel.read_text(encoding='utf-8'), 'keep me')


@unittest.skipUnless((ROOT / 'installer/main.py').is_file(), 'Installer entry point is not present yet')
class InstallerPreviewTests(unittest.TestCase):
    def test_office_plan_describes_verified_download_and_configuration_only_mode(self):
        versions = {'ibis_office': {'version': 'test-version'}}
        for configs_only in (False, True):
            arguments = ['--modules', 'ibis-office']
            if configs_only:
                arguments.append('--configs-only')
            args = installer_main.parser().parse_args(arguments)
            output = io.StringIO()
            with self.subTest(configs_only=configs_only), contextlib.redirect_stdout(output):
                installer_main.show_plan(['ibis-office'], {'ibis-office'}, 'native', 'amd64',
                                         args, versions, Path('/test/home'))
            plan = output.getvalue()
            self.assertIn('~/.local/bin/ibis-office and application launcher', plan)
            self.assertIn('existing default file associations are unchanged', plan)
            if configs_only:
                self.assertIn('existing verified installation; no application download', plan)
                self.assertNotIn('APT packages', plan)
            else:
                self.assertIn('ibisOffice test-version', plan)
                self.assertIn('HTTPS + pinned SHA-256', plan)

    def test_preview_has_no_network_process_or_home_side_effects(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            home = root / 'home'
            home.mkdir()
            # sitecustomize runs inside the child interpreter. Any accidental
            # apt/sudo/Git/network call makes the preview fail before it runs.
            blocker = root / 'sitecustomize.py'
            blocker.write_text(
                'import socket, subprocess, urllib.request\n'
                'def blocked(*a, **k):\n'
                '    raise RuntimeError("dry-run attempted a command or network call")\n'
                'socket.create_connection = blocked\n'
                'urllib.request.urlopen = blocked\n'
                'subprocess.run = blocked\n'
                'subprocess.check_output = blocked\n'
                'subprocess.Popen = blocked\n', encoding='utf-8')
            environment = dict(os.environ, HOME=str(home), USERPROFILE=str(home),
                               XDG_CONFIG_HOME=str(home / '.config'),
                               XDG_DATA_HOME=str(home / '.local/share'),
                               XDG_STATE_HOME=str(home / '.local/state'),
                               PYTHONDONTWRITEBYTECODE='1', PYTHONPATH=str(root))
            result = subprocess.run(
                [sys.executable, str(ROOT / 'installer/main.py'), '--dry-run', '--yes',
                 '--modules', 'shell,neovim,ros2', '--platform', 'wsl', '--arch', 'amd64'],
                cwd=ROOT, env=environment, capture_output=True, text=True, timeout=30)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertEqual(list(home.rglob('*')), [])


if __name__ == '__main__':
    unittest.main(verbosity=2)
