#!/usr/bin/env python3
"""Resolve every selectable module's APT dependencies without installing them.

Run after enabling the pinned official ROS repository and, on amd64, Chrome's
official repository. CI supplies these in its disposable Ubuntu 26.04 runner.
"""
import os
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
from catalog import MODULES, available, packages_for, resolve


def main():
    release = dict(line.split('=', 1) for line in Path('/etc/os-release').read_text().splitlines()
                   if '=' in line)
    if release.get('ID', '').strip('"') != 'ubuntu' or release.get('VERSION_ID', '').strip('"') != '26.04':
        raise RuntimeError('This package-resolution check requires Ubuntu 26.04.')
    arch = subprocess.check_output(['dpkg', '--print-architecture'], text=True).strip()
    for platform in ('native', 'wsl'):
        selected = {name for name in MODULES if available(name, platform, arch)}
        modules = resolve(selected, platform, arch)
        packages = packages_for(modules) + ['ros-lyrical-desktop', 'ros-dev-tools']
        if 'chrome' in modules:
            packages.append('google-chrome-stable')
        result = subprocess.run(['apt-get', '--simulate', '--no-remove', '--no-install-recommends',
                                 'install', *packages], text=True, capture_output=True,
                                env=dict(os.environ, LC_ALL='C.UTF-8'), timeout=180)
        if result.returncode:
            print(result.stdout[-16000:] + result.stderr, file=sys.stderr)
            raise RuntimeError(f'Module package resolution failed on {platform}/{arch}.')
        print(f'Ubuntu 26.04 {platform}/{arch}: {len(modules)} modules, '
              f'{len(set(packages))} requested APT packages and dependencies resolved.')


if __name__ == '__main__':
    main()
