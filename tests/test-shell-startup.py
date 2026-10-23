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
                    if key not in ('TMUX', 'TMUX_PANE', 'BASH_ENV', 'ENV', 'DOTFILES_AUTO_TMUX', '_DOTFILES_BASH_LOADED')}
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

    def test_terminal_starts_main_once_and_local_reload_does_not_attach_again(self):
        terminal = self.start()
        self.wait_prompt(terminal)
        self.assertEqual(self.log.read_text().splitlines(), ['new-session', '-A', '-s', 'main'])
        marker = self.root / 'reloaded'
        os.write(terminal[1], ('source ' + shlex.quote(str(ROOT / '.bashrc')) + '; touch ' + shlex.quote(str(marker)) + '\n').encode())
        self.wait_for(terminal, marker.exists)
        self.assertEqual(len(self.log.read_text().splitlines()), 4)

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
    def test_real_tmux_start_detach_and_reattach_without_nested_sessions(self):
        self.mock_tmux.write_text('#!/bin/bash\nexec ' + shlex.quote(TMUX) + ' -S ' + shlex.quote(str(self.socket)) + ' "$@"\n')
        shutil.copyfile(ROOT / '.tmux.conf', self.home / '.tmux.conf')
        # Every pane uses the actual supplement, also exercising the TMUX guard.
        command = '/bin/bash --noprofile --rcfile ' + shlex.quote(str(self.rcfile)) + ' -i'
        (self.home / '.tmux.conf.local').write_text('set -g default-command ' + shlex.quote(command) + '\n', encoding='utf-8')

        def tmux(*arguments):
            return subprocess.run([TMUX, '-S', str(self.socket), *arguments], env=self.env,
                                  capture_output=True, text=True, timeout=5)

        self.addCleanup(lambda: tmux('kill-server'))
        terminal = self.start()
        self.wait_for(terminal, lambda: tmux('list-clients', '-F', '#{client_session}').stdout.strip() == 'main')
        self.assertEqual(tmux('list-sessions', '-F', '#S').stdout.strip(), 'main')
        self.assertEqual(tmux('list-panes', '-a', '-F', '#{pane_id}').stdout.count('\n'), 1)
        os.write(terminal[1], b'\x18d')  # Ctrl+x, d detaches to the parent shell.
        marker = self.root / 'after-detach'
        self.wait_for(terminal, lambda: not tmux('list-clients').stdout.strip())
        os.write(terminal[1], ('touch ' + shlex.quote(str(marker)) + '\n').encode())
        self.wait_for(terminal, marker.exists)
        another = self.start()
        self.wait_for(another, lambda: tmux('list-clients', '-F', '#{client_session}').stdout.strip() == 'main')
        self.assertEqual(tmux('list-sessions', '-F', '#S').stdout.strip(), 'main')
        self.assertEqual(tmux('list-panes', '-a', '-F', '#{pane_id}').stdout.count('\n'), 1)


if __name__ == '__main__':
    unittest.main()
