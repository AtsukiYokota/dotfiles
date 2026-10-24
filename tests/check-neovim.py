#!/usr/bin/env python3
"""Download the pinned Linux Neovim into a temporary home and smoke-test it.

Use --plugins to also exercise network bootstrap, a rerun, and plugin loading.
Never changes the real user's editor configuration or installs OS packages.
"""
import argparse
import json
import os
from pathlib import Path
import platform
import subprocess
import sys
import tarfile
import tempfile
from types import SimpleNamespace

sys.dont_write_bytecode = True
REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / 'installer'))
from runtime import Runner
from actions import install_archive
from deploy import Backup
from preview_assets import install_preview_assets


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plugins', action='store_true')
    args = parser.parse_args()
    if sys.platform != 'linux':
        parser.error('Run in Linux (Ubuntu 24.04 or WSL).')
    arch = {'x86_64': 'amd64', 'aarch64': 'arm64'}[platform.machine()]
    versions = json.loads((REPO / 'installer/versions.json').read_text())
    version = versions['neovim'][arch]
    lock = REPO / 'configs/nvim/lazy-lock.json'
    expected = json.loads(lock.read_text())
    with tempfile.TemporaryDirectory(prefix='dotfiles-neovim-test-') as temp:
        root = Path(temp)
        runner = Runner(root / 'commands.log')
        archive = root / 'nvim.tar.gz'
        runner.download(version['url'], archive, version['sha256'])
        with tarfile.open(archive) as bundle:
            bundle.extractall(root, filter='data')
        nvim = next(root.glob('nvim-linux-*/bin/nvim'))
        home = root / 'home'
        home.mkdir()
        environment = os.environ.copy()
        environment.update(HOME=str(home), XDG_CONFIG_HOME=str(home / '.config'),
                           XDG_DATA_HOME=str(home / '.local/share'), XDG_STATE_HOME=str(home / '.local/state'),
                           XDG_CACHE_HOME=str(home / '.cache'), NVIM_APPNAME='nvim',
                           GIT_CONFIG_GLOBAL='/dev/null', GIT_CONFIG_NOSYSTEM='1')
        subprocess.run([str(nvim), '--headless', '--cmd', 'set loadplugins', '-i', 'NONE', '-u', str(REPO / 'configs/nvim/init.lua'),
                        '-l', str(REPO / 'tests/nvim-smoke.lua')], env=environment, check=True, timeout=60)
        if args.plugins:
            ctx = SimpleNamespace(repo=REPO, home=home, data=home / '.local/share/dotfiles',
                                  temp=root, arch=arch, versions=versions, runner=runner,
                                  backup=Backup(home / '.local/state/asset-test', home))
            install_archive(ctx, 'node', {'node': 'bin/node'})
            install_preview_assets(ctx)
            bootstrap = [str(nvim), '--headless', '-u', 'NONE', '-i', 'NONE', '-l', str(REPO / 'configs/nvim/bootstrap.lua')]
            for _ in range(2):
                subprocess.run(bootstrap, env=environment, check=True, timeout=300)
            subprocess.run([str(nvim), '--headless', '--cmd', 'set loadplugins', '-i', 'NONE', '-u', str(REPO / 'configs/nvim/init.lua'),
                            '-l', str(REPO / 'tests/nvim-plugins.lua')], env=environment, check=True, timeout=60)
            if json.loads(lock.read_text()) != expected:
                raise AssertionError('Bootstrap changed the committed plugin lockfile.')
    print('Neovim validation passed.')


if __name__ == '__main__':
    main()
