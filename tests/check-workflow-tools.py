#!/usr/bin/env python3
"""Exercise reviewed workflow binaries in a disposable HOME and real Bash PTY."""
from __future__ import annotations

import errno
import json
import os
from pathlib import Path
import platform
import re
import select
import shlex
import shutil
import signal
import struct
import subprocess
import sys
import tempfile
import time
from types import SimpleNamespace

sys.dont_write_bytecode = True
REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / 'installer'))
from actions import install_archive
from deploy import Backup
from planning import apply_file_operations
from runtime import Runner
from workflow_tools import install_tools


def checked(argv, env, cwd, *, input=None):
    result = subprocess.run([str(arg) for arg in argv], env=env, cwd=cwd,
                            text=True, capture_output=True, input=input, timeout=40)
    if result.returncode:
        raise AssertionError(f'{argv}: {result.returncode}\n{result.stdout}\n{result.stderr}')
    return result.stdout


def shell_session(env, home, output, commands):
    import fcntl
    import pty
    import termios

    master, slave = pty.openpty()
    fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', 30, 120, 0, 0))

    def setup():
        os.setsid()
        fcntl.ioctl(0, termios.TIOCSCTTY, 0)

    process = subprocess.Popen(['/bin/bash', '--noprofile', '--rcfile', str(home / '.bashrc'), '-i'],
                               cwd=home, env=env, stdin=slave, stdout=slave, stderr=slave,
                               preexec_fn=setup)
    os.close(slave)
    terminal = bytearray()
    try:
        os.write(master, (commands + '\nexit\n').encode())
        deadline = time.monotonic() + 30
        while time.monotonic() < deadline:
            if select.select([master], [], [], 0.1)[0]:
                try:
                    chunk = os.read(master, 65536)
                except OSError as exc:
                    if exc.errno != errno.EIO:
                        raise
                    break
                if not chunk:
                    break
                terminal.extend(chunk)
            if process.poll() is not None:
                break
        process.wait(timeout=3)
        if process.returncode or not output.is_file():
            raise AssertionError('Interactive shell failed: ' + repr(bytes(terminal[-5000:])))
        if b'command not found' in terminal or b'syntax error' in terminal:
            raise AssertionError('Interactive initialization error: ' + repr(bytes(terminal[-5000:])))
    finally:
        if process.poll() is None:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait(timeout=5)
        os.close(master)


def lazygit_session(binary, env, project):
    import fcntl
    import pty
    import termios

    master, slave = pty.openpty()
    fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', 35, 140, 0, 0))

    def setup():
        os.setsid()
        fcntl.ioctl(0, termios.TIOCSCTTY, 0)

    process = subprocess.Popen([str(binary)], cwd=project, env=env, stdin=slave,
                               stdout=slave, stderr=slave, preexec_fn=setup)
    os.close(slave)
    terminal = bytearray()
    try:
        deadline = time.monotonic() + 15
        ready = False
        while time.monotonic() < deadline and process.poll() is None:
            if select.select([master], [], [], 0.1)[0]:
                try:
                    terminal.extend(os.read(master, 65536))
                except OSError as exc:
                    if exc.errno != errno.EIO:
                        raise
                    break
            if b'Local branches' in terminal or b'Files' in terminal:
                ready = True
                break
        if not ready:
            raise AssertionError('lazygit did not initialize: ' + repr(bytes(terminal[-5000:])))
        os.write(master, b'q')
        # A first-run notice can cover the normal quit key; Ctrl-C still closes
        # the fixture UI cleanly without touching the real user's Git state.
        try:
            process.wait(timeout=3)
        except subprocess.TimeoutExpired:
            os.write(master, b'\x03')
            process.wait(timeout=3)
        if process.returncode:
            raise AssertionError('lazygit failed after startup: ' + repr(bytes(terminal[-5000:])))
    finally:
        if process.poll() is None:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait(timeout=5)
        os.close(master)


def exercise(ctx, env):
    home = ctx.home
    binary = home / '.local/bin'
    for name in ('fd', 'bat', 'zoxide', 'atuin', 'just', 'lazygit', 'delta', 'direnv', 'starship'):
        argument = 'version' if name == 'direnv' else '--version'
        version = checked([binary / name, argument], env, home)
        assert ctx.versions[name]['version'] in version, (name, version)

    # Installing and configuring twice must not create duplicate Git includes or
    # overwrite the user's existing identity or unrelated Git settings.
    install_tools(ctx)
    apply_file_operations(ctx)
    assert checked(['git', 'config', '--global', 'user.email'], env, home).strip() == 'fixture@example.invalid'
    assert checked(['git', 'config', '--includes', '--global', '--get-all', 'core.pager'], env, home).strip() == 'delta'
    assert checked(['git', 'config', '--includes', '--global', 'interactive.diffFilter'], env, home).strip() == 'delta --color-only'
    assert (home / '.gitconfig').read_text().count('# >>> dotfiles delta >>>') == 1
    patch = '--- a/test.py\n+++ b/test.py\n@@ -1 +1 @@\n-print("old")\n+print("new")\n'
    delta = checked([binary / 'delta', '--paging=never', '--color-only'], env, home, input=patch)
    assert 'print("new")' in re.sub(r'\x1b\[[0-9;]*m', '', delta)
    git_project = home / 'git project'
    git_project.mkdir()
    checked(['git', 'init', '-b', 'fixture'], env, git_project)
    (git_project / 'test.py').write_text('print("fixture")\n')
    lazygit_session(binary / 'lazygit', env, git_project)

    # Search respects Git ignore rules and hidden files. bat must load the
    # configured theme, render source code, and keep redirected output plain.
    (git_project / 'main.cpp').write_text('int main() { return 0; }\n')
    (git_project / 'ignored.cpp').write_text('// ignored fixture\n')
    (git_project / '.hidden.cpp').write_text('// hidden fixture\n')
    (git_project / '.gitignore').write_text('ignored.cpp\n')
    found = checked([binary / 'fd', '--color=never', '-e', 'cpp'], env, git_project).splitlines()
    assert found == ['main.cpp'], found
    found_all = checked([binary / 'fd', '--color=never', '-HI', '-e', 'cpp'], env, git_project).splitlines()
    assert set(found_all) == {'main.cpp', 'ignored.cpp', '.hidden.cpp'}, found_all
    themes = checked([binary / 'bat', '--list-themes', '--color=never'], env, git_project)
    assert 'gruvbox-dark' in themes
    plain = checked([binary / 'bat', '--paging=never', 'main.cpp'], env, git_project)
    assert plain == (git_project / 'main.cpp').read_text(), repr(plain)
    highlighted = checked([binary / 'bat', '--paging=never', '--color=always', '--style=numbers', 'main.cpp'], env, git_project)
    assert '\x1b[' in highlighted and 'main' in highlighted, repr(highlighted)

    # No account, service or network access is required for local history.
    env['ATUIN_SESSION'] = checked([binary / 'atuin', 'uuid'], env, home).strip()
    atuin = checked([binary / 'atuin', 'history', 'start', 'printf workflow-history-fixture'], env, home).strip()
    assert atuin
    checked([binary / 'atuin', 'history', 'end', '--exit', '0', atuin], env, home)
    history = checked([binary / 'atuin', 'history', 'list', '--format', '{command}'], env, home)
    assert 'printf workflow-history-fixture' in history

    # Untrusted .envrc remains blocked. Explicit approval is exercised only for
    # our tiny fixture; changing directories must unload its exported variable.
    project = home / 'project with spaces'
    project.mkdir()
    marker = project / 'approved-marker'
    (project / '.envrc').write_text('export DOTFILES_DIRENV_FIXTURE=approved\nprintf approved > approved-marker\n')
    denied = subprocess.run([str(binary / 'direnv'), 'export', 'bash'], cwd=project, env=env,
                            capture_output=True, text=True, timeout=10)
    assert not marker.exists(), 'Unapproved .envrc executed'
    assert 'blocked' in denied.stderr.lower(), denied.stderr
    checked([binary / 'direnv', 'allow', str(project)], env, home)
    script = ('cd -- ' + shlex.quote(str(project)) + '\n'
              'eval "$(direnv export bash)"\n'
              'test "$DOTFILES_DIRENV_FIXTURE" = approved || exit 11\n'
              'cd -- "$HOME"\neval "$(direnv export bash)"\n'
              'test "${DOTFILES_DIRENV_FIXTURE+x}" != x || exit 12\n')
    checked(['/bin/bash', '--noprofile', '--norc', '-c', script], env, home)
    assert marker.read_text() == 'approved'

    checked([binary / 'zoxide', 'add', str(project)], env, home)
    assert checked([binary / 'zoxide', 'query', 'project'], env, home).strip() == str(project)
    tasks = checked([binary / 'just', '--justfile', REPO / 'configs/projects/ros.justfile', '--list'], env, home)
    assert all(name in tasks for name in ('build', 'compdb', 'test', 'list'))

    # Real interactive startup checks coexistence with Starship, normal arrow
    # history, Atuin Ctrl-R and the direnv/zoxide prompt hooks.
    report = home / 'shell-report.txt'
    command = ('{ bind -X; bind -p; declare -p PROMPT_COMMAND; '
               'type -t z; type -t _direnv_hook; type -t starship_precmd; } > ' + shlex.quote(str(report)))
    shell_session(env, home, report, command)
    bindings = report.read_text()
    assert '\\C-r' in bindings and 'atuin' in bindings, bindings
    assert '"\\e[A": previous-history' in bindings, bindings
    assert '_direnv_hook' in bindings and '__zoxide_hook' in bindings, bindings
    assert 'starship' in bindings, bindings
    assert bindings.count('function\n') >= 2, bindings

    # The helper's own real-just test checks literal arguments, Unicode paths,
    # subdirectory invocation and workspace-root execution.
    checked([sys.executable, '-B', REPO / 'tests/test-ros-workspace.py'], env, home)
    print('Workflow tools: verified binaries, repeat install, Git/delta/lazygit config, local Atuin history,')
    print('fd search/ignore rules, bat theme/rendering, direnv approval/unload, zoxide lookup,')
    print('real just recipes and interactive Bash/Starship/Atuin keys passed.')


def main():
    if sys.platform != 'linux':
        raise SystemExit('Run this integration test in Linux/WSL.')
    arch = {'x86_64': 'amd64', 'aarch64': 'arm64'}[platform.machine()]
    versions = json.loads((REPO / 'installer/versions.json').read_text())
    with tempfile.TemporaryDirectory(prefix='dotfiles-workflow-tools-') as temporary:
        root = Path(temporary)
        home = root / 'home with spaces'
        home.mkdir()
        temp = root / 'downloads'
        temp.mkdir()
        config = home / '.config'
        data = home / '.local/share/dotfiles'
        config.mkdir()
        backup = Backup(home / '.local/state/dotfiles/backups/test', home)
        ctx = SimpleNamespace(repo=REPO, home=home, config=config, data=data, temp=temp,
                              arch=arch, platform='native', versions=versions,
                              modules=['shell', 'file-tools', 'zoxide', 'atuin', 'just', 'git-tools', 'direnv'],
                              backup=backup, runner=Runner(root / 'install.log'))
        (home / '.gitconfig').write_text('[user]\n  name = Workflow Test\n  email = fixture@example.invalid\n')
        env = {key: value for key, value in os.environ.items() if key in ('HTTPS_PROXY', 'HTTP_PROXY', 'NO_PROXY', 'https_proxy', 'http_proxy', 'no_proxy')}
        env.update(HOME=str(home), USER='workflow-test', LOGNAME='workflow-test',
                   PATH=str(home / '.local/bin') + ':/usr/bin:/bin',
                   XDG_CONFIG_HOME=str(config), XDG_DATA_HOME=str(data.parent),
                   XDG_CACHE_HOME=str(home / '.cache'), XDG_STATE_HOME=str(home / '.local/state'),
                   SHELL='/bin/bash', TERM='xterm-256color', LANG='C.UTF-8', LC_ALL='C.UTF-8',
                   DOTFILES_AUTO_TMUX='0', DOTFILES_AUTO_ROS='0',
                   GIT_CONFIG_NOSYSTEM='1', INPUTRC=str(home / '.inputrc'),
                   STARSHIP_CONFIG=str(config / 'starship.toml'))
        saved = dict(os.environ)
        try:
            os.environ.clear()
            os.environ.update(env)
            install_tools(ctx)
            install_archive(ctx, 'starship', {'starship': 'starship'}, flat=True)
            apply_file_operations(ctx)
            exercise(ctx, env)
        finally:
            os.environ.clear()
            os.environ.update(saved)


if __name__ == '__main__':
    main()
