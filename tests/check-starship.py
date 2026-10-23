#!/usr/bin/env python3
"""Validate the Gruvbox prompt with the pinned Starship in a temporary HOME."""
import json
import os
from pathlib import Path
import platform
import re
import subprocess
import sys
import tarfile
import tempfile

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
from runtime import Runner


def main():
    if sys.platform != 'linux':
        raise SystemExit('Run in Linux (Ubuntu 24.04 or WSL).')
    arch = {'x86_64': 'amd64', 'aarch64': 'arm64'}[platform.machine()]
    metadata = json.loads((ROOT / 'installer/versions.json').read_text())['starship'][arch]
    with tempfile.TemporaryDirectory(prefix='dotfiles-starship-test-') as temporary:
        root = Path(temporary)
        archive = root / 'starship.tar.gz'
        runner = Runner(root / 'commands.log')
        runner.download(metadata['url'], archive, metadata['sha256'])
        with tarfile.open(archive) as bundle:
            bundle.extractall(root / 'runtime', filter='data')
        binary = root / 'runtime/starship'
        home = root / 'home'
        project = home / 'project'
        project.mkdir(parents=True)
        env = os.environ.copy()
        env.update(HOME=str(home), XDG_CONFIG_HOME=str(home / '.config'), XDG_CACHE_HOME=str(home / '.cache'),
                   STARSHIP_CONFIG=str(ROOT / 'configs/starship.toml'), STARSHIP_SHELL='bash',
                   TERM='xterm-256color', PATH='/usr/bin:/bin', LANG='C.UTF-8', LC_ALL='C.UTF-8',
                   ROS_DISTRO='jazzy', VIRTUAL_ENV=str(root / 'robot-env'),
                   GIT_CONFIG_GLOBAL='/dev/null', GIT_CONFIG_NOSYSTEM='1')
        Path(env['VIRTUAL_ENV']).mkdir()

        def run(*arguments):
            result = subprocess.run(arguments, cwd=project, env=env, capture_output=True, text=True, timeout=30)
            if result.returncode:
                raise AssertionError(result.stderr)
            return result

        run('git', 'init', '-b', 'prompt-test')
        run('git', 'config', 'user.name', 'Prompt Test')
        run('git', 'config', 'user.email', 'prompt@example.invalid')
        tracked = project / 'robot.py'
        tracked.write_text('print("before")\n')
        run('git', 'add', 'robot.py')
        run('git', 'commit', '-m', 'Temporary prompt fixture')
        tracked.write_text('print("after")\n')
        (project / 'new.txt').write_text('new\n')
        result = run(str(binary), 'prompt', '--status', '7', '--cmd-duration', '2500', '--jobs', '2', '--terminal-width', '200')
        prompt = re.sub(r'\x1b\[[0-9;]*m', '', result.stdout)
        for expected in ('prompt-test', 'mod:1', 'new:1', 'env:robot-env', 'ROS:jazzy', 'took:2s', 'jobs:2', 'exit:7', ''):
            if expected not in prompt:
                raise AssertionError(f'Missing {expected!r}: {prompt!r}')
        if re.search(r'\b(WARN|ERROR)\b', result.stderr):
            raise AssertionError(result.stderr)
        print('Starship Gruvbox prompt: palette, Git, Python environment, ROS, duration, jobs and failure status passed.')


if __name__ == '__main__':
    main()
