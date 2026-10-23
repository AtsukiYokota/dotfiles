#!/usr/bin/env python3
"""Exercise terminal Bash startup with disposable HOME, PTYs and tmux sockets."""
from __future__ import annotations

import errno
import os
from pathlib import Path
import select
import shlex
import shutil
import signal
import struct
import subprocess
import sys
import tempfile
import time
import unittest

ROOT = Path(__file__).resolve().parents[1]
TMUX = shutil.which('tmux')
IM_VARIABLES = ('GTK_IM_MODULE', 'QT_IM_MODULE', 'XMODIFIERS', 'CLUTTER_IM_MODULE', 'SDL_IM_MODULE')


@unittest.skipUnless(sys.platform == 'linux', 'requires Linux PTYs')
class ShellStartupTests(unittest.TestCase):
    def setUp(self):
        self.scratch = tempfile.TemporaryDirectory(prefix='dotfiles-startup-test-')
        self.addCleanup(self.scratch.cleanup)
        self.root = Path(self.scratch.name)
        self.home = self.root / 'home with spaces'
        self.bin = self.root / 'bin'
        self.home.mkdir()
        self.bin.mkdir()
        self.log = self.root / 'tmux-calls'
        self.socket = self.root / 'tmux.sock'
        self.env = {key: value for key, value in os.environ.items()
                    if key not in ('TMUX', 'TMUX_PANE', 'BASH_ENV', 'ENV', 'DOTFILES_AUTO_TMUX', '_DOTFILES_BASH_LOADED', *IM_VARIABLES)}
        self.env.update(HOME=str(self.home), PATH=str(self.bin) + ':/usr/bin:/bin',
                        XDG_CONFIG_HOME=str(self.home / '.config'), XDG_CACHE_HOME=str(self.home / '.cache'),
                        XDG_DATA_HOME=str(self.home / '.local/share'), XDG_STATE_HOME=str(self.home / '.local/state'),
                        TERM='xterm-256color', LANG='C.UTF-8', LC_ALL='C.UTF-8', SHELL='/bin/bash', DOTFILES_AUTO_ROS='0')
        self.mock_tmux = self.bin / 'tmux'
        self.mock_tmux.write_text('#!/bin/bash\nprintf "%s\\n" "$@" >> ' + shlex.quote(str(self.log)) + '\n', encoding='utf-8')
        self.mock_tmux.chmod(0o755)
        self.rcfile = self.root / 'rcfile'
        self.rcfile.write_text('source ' + shlex.quote(str(ROOT / '.bashrc')) + '\nPS1="STARTUP_READY> "\n', encoding='utf-8')

    def start(self, *, command=None, env=None):
        import fcntl
        import pty
        import termios

        master, slave = pty.openpty()
        fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', 24, 100, 0, 0))

        def controlling_terminal():
            os.setsid()
            fcntl.ioctl(0, termios.TIOCSCTTY, 0)

        argv = ['/bin/bash', '--noprofile', '--rcfile', str(self.rcfile), '-i']
        if command is not None:
            argv.extend(['-c', command])
        try:
            process = subprocess.Popen(argv, cwd=self.home, env=env or self.env, stdin=slave,
                                       stdout=slave, stderr=slave, preexec_fn=controlling_terminal)
        finally:
            os.close(slave)
        output = bytearray()

        def cleanup():
            if process.poll() is None:
                os.killpg(process.pid, signal.SIGKILL)
            process.wait(timeout=5)
            os.close(master)

        self.addCleanup(cleanup)
        return process, master, output

    def wait_for(self, terminal, predicate):
        process, master, output = terminal
        deadline = time.monotonic() + 10
        while time.monotonic() < deadline:
            while select.select([master], [], [], 0)[0]:
                try:
                    chunk = os.read(master, 65536)
                except OSError as error:
                    if error.errno != errno.EIO:
                        raise
                    break
                if not chunk:
                    break
                output.extend(chunk)
            if predicate():
                return
            time.sleep(0.02)
        self.fail(f'Startup timeout (status={process.poll()}): {bytes(output[-3000:])!r}')

    def wait_prompt(self, terminal):
        self.wait_for(terminal, lambda: b'STARTUP_READY> ' in terminal[2])

    def test_terminal_starts_new_session_once_and_local_reload_does_not_start_another(self):
        terminal = self.start()
        self.wait_prompt(terminal)
        expected = ['new-session']
        for variable in IM_VARIABLES:
            expected.extend(['-e', variable + '='])
        self.assertEqual(self.log.read_text().splitlines(), expected)
        marker = self.root / 'reloaded'
        os.write(terminal[1], ('source ' + shlex.quote(str(ROOT / '.bashrc')) + '; touch ' + shlex.quote(str(marker)) + '\n').encode())
        self.wait_for(terminal, marker.exists)
        self.assertEqual(self.log.read_text().splitlines(), expected)

    def test_local_opt_out(self):
        (self.home / '.bashrc.local').write_text('DOTFILES_AUTO_TMUX=0\n')
        self.wait_prompt(self.start())
        self.assertFalse(self.log.exists())

    def test_nested_tmux_and_dumb_terminal_skip_attach(self):
        for values in ({'TMUX': '/tmp/existing,123,0'}, {'TERM': 'dumb'}):
            with self.subTest(values=values):
                self.wait_prompt(self.start(env=self.env | values))
                self.assertFalse(self.log.exists())

    def test_interactive_command_with_tty_skips_attach(self):
        terminal = self.start(command='printf COMMAND_FINISHED')
        self.wait_for(terminal, lambda: terminal[0].poll() is not None)
        self.assertIn(b'COMMAND_FINISHED', terminal[2])
        self.assertFalse(self.log.exists())

    def test_redirected_shell_and_noninteractive_sourcing_skip_attach(self):
        for argv in (['/bin/bash', '--noprofile', '--rcfile', str(self.rcfile), '-i'],
                     ['/bin/bash', '-c', 'source ' + shlex.quote(str(ROOT / '.bashrc'))]):
            with self.subTest(argv=argv):
                result = subprocess.run(argv, env=self.env, input='exit\n', capture_output=True, text=True, timeout=10)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertFalse(self.log.exists())

    @unittest.skipUnless(TMUX, 'requires real tmux')
    def test_real_terminals_have_independent_sessions_and_preserve_existing_work(self):
        self.mock_tmux.write_text('#!/bin/bash\nexec ' + shlex.quote(TMUX) + ' -S ' + shlex.quote(str(self.socket)) + ' "$@"\n')
        shutil.copyfile(ROOT / '.tmux.conf', self.home / '.tmux.conf')
        # Every pane uses the actual supplement, also exercising the TMUX guard.
        command = '/bin/bash --noprofile --rcfile ' + shlex.quote(str(self.rcfile)) + ' -i'
        (self.home / '.tmux.conf.local').write_text('set -g default-command ' + shlex.quote(command) + '\n', encoding='utf-8')

        def tmux(*arguments):
            return subprocess.run([TMUX, '-S', str(self.socket), *arguments], env=self.env,
                                  capture_output=True, text=True, timeout=5)

        self.addCleanup(lambda: tmux('kill-server'))
        self.assertEqual(tmux('new-session', '-d', '-s', 'main', '-n', 'existing-work').returncode, 0)
        previous = tmux('list-sessions', '-F', '#{session_id}').stdout.strip()
        terminal = self.start()
        self.wait_for(terminal, lambda: tmux('list-clients', '-F', '#{session_id}').stdout.count('\n') == 1)
        first = tmux('list-clients', '-F', '#{session_id}').stdout.strip()
        self.assertNotEqual(first, previous)
        another = self.start()
        self.wait_for(another, lambda: tmux('list-clients', '-F', '#{session_id}').stdout.count('\n') == 2)
        clients = set(tmux('list-clients', '-F', '#{session_id}').stdout.splitlines())
        self.assertEqual(len(clients), 2)
        second, = clients - {first}
        self.assertNotEqual(second, previous)
        self.assertEqual(tmux('list-panes', '-t', first, '-F', '#{pane_id}').stdout.count('\n'), 1)
        self.assertEqual(tmux('list-panes', '-t', second, '-F', '#{pane_id}').stdout.count('\n'), 1)
        self.assertEqual(tmux('split-window', '-d', '-t', first).returncode, 0)
        self.assertEqual(tmux('list-panes', '-t', first, '-F', '#{pane_id}').stdout.count('\n'), 2)
        self.assertEqual(tmux('list-panes', '-t', second, '-F', '#{pane_id}').stdout.count('\n'), 1)
        os.write(terminal[1], b'\x18d')  # Ctrl+x, d detaches to the parent shell.
        marker = self.root / 'after-detach'
        self.wait_for(terminal, lambda: tmux('list-clients', '-F', '#{session_id}').stdout.strip() == second)
        os.write(terminal[1], ('touch ' + shlex.quote(str(marker)) + '\n').encode())
        self.wait_for(terminal, marker.exists)
        later = self.start()
        self.wait_for(later, lambda: tmux('list-clients', '-F', '#{session_id}').stdout.count('\n') == 2)
        third, = set(tmux('list-clients', '-F', '#{session_id}').stdout.splitlines()) - {second}
        self.assertNotIn(third, {previous, first, second})
        self.assertEqual(set(tmux('list-sessions', '-F', '#{session_id}').stdout.splitlines()),
                         {previous, first, second, third})
        self.assertEqual(tmux('list-panes', '-t', 'main', '-F', '#{window_name}').stdout.strip(), 'existing-work')

    @unittest.skipUnless(TMUX, 'requires real tmux')
    def test_new_sessions_use_current_input_method_and_leave_old_session_unchanged(self):
        self.mock_tmux.write_text('#!/bin/bash\nexec ' + shlex.quote(TMUX) + ' -S ' + shlex.quote(str(self.socket)) + ' "$@"\n')
        shutil.copyfile(ROOT / '.tmux.conf', self.home / '.tmux.conf')
        command = '/bin/bash --noprofile --rcfile ' + shlex.quote(str(self.rcfile)) + ' -i'
        (self.home / '.tmux.conf.local').write_text('set -g default-command ' + shlex.quote(command) + '\n', encoding='utf-8')
        # Record what a real shell in each initial/split pane actually receives.
        with self.rcfile.open('a', encoding='utf-8') as output:
            expressions = ' '.join('"${' + variable + '-UNSET}"' for variable in IM_VARIABLES)
            output.write('if [[ -n ${TMUX_PANE:-} ]]; then\n  printf "%s\\n" ' + expressions
                         + ' > "$HOME/input-env-${TMUX_PANE#%}"\nfi\n')

        def tmux(*arguments, env=None):
            return subprocess.run([TMUX, '-S', str(self.socket), *arguments], env=env or self.env,
                                  capture_output=True, text=True, timeout=5)

        def pane_file(session):
            pane = tmux('display-message', '-p', '-t', session, '#{pane_id}').stdout.strip()
            return self.home / ('input-env-' + pane.removeprefix('%'))

        self.addCleanup(lambda: tmux('kill-server'))
        old_values = {variable: ('@im=ibus' if variable == 'XMODIFIERS' else 'ibus') for variable in IM_VARIABLES}
        self.assertEqual(tmux('new-session', '-d', '-s', 'old', env=self.env | old_values).returncode, 0)
        # Model an already-running server with the previous configuration: none
        # of the new environment is automatically imported by tmux options.
        self.assertEqual(tmux('set-option', '-g', 'update-environment', '').returncode, 0)
        current_values = {variable: ('@im=fcitx' if variable == 'XMODIFIERS' else 'fcitx') for variable in IM_VARIABLES}
        current = self.start(env=self.env | current_values)
        self.wait_for(current, lambda: tmux('list-clients', '-F', '#{session_id}').stdout.count('\n') == 1)
        session = tmux('list-clients', '-F', '#{session_id}').stdout.strip()
        initial = pane_file(session)
        old = pane_file('old')
        self.wait_for(current, lambda: initial.exists() and old.exists())
        self.assertEqual(initial.read_text().splitlines(), list(current_values.values()))
        self.assertEqual(old.read_text().splitlines(), list(old_values.values()))
        split = tmux('split-window', '-d', '-P', '-F', '#{pane_id}', '-t', session).stdout.strip()
        later_pane = self.home / ('input-env-' + split.removeprefix('%'))
        self.wait_for(current, later_pane.exists)
        self.assertEqual(later_pane.read_text().splitlines(), list(current_values.values()))

        no_ime = self.start()  # All five variables are absent in this terminal.
        self.wait_for(no_ime, lambda: tmux('list-clients', '-F', '#{session_id}').stdout.count('\n') == 2)
        clean_session, = set(tmux('list-clients', '-F', '#{session_id}').stdout.splitlines()) - {session}
        clean = pane_file(clean_session)
        self.wait_for(no_ime, clean.exists)
        self.assertEqual(clean.read_text().splitlines(), [''] * len(IM_VARIABLES))
        # Neither the old session nor the server-global fallback was mutated.
        for variable, value in old_values.items():
            self.assertEqual(tmux('show-environment', '-g', variable).stdout.strip(), variable + '=' + value)
        old_split = tmux('split-window', '-d', '-P', '-F', '#{pane_id}', '-t', 'old').stdout.strip()
        old_later = self.home / ('input-env-' + old_split.removeprefix('%'))
        self.wait_for(no_ime, old_later.exists)
        self.assertEqual(old_later.read_text().splitlines(), list(old_values.values()))


if __name__ == '__main__':
    unittest.main()
