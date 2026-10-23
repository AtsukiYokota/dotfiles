#!/usr/bin/env python3
"""Real tmux/PTY integration with disposable HOME, socket and clipboard mocks."""
from __future__ import annotations

import base64
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


@unittest.skipUnless(sys.platform == 'linux' and TMUX, 'requires Linux and tmux')
class TmuxTests(unittest.TestCase):
    def setUp(self):
        import fcntl
        import pty
        import termios

        self.scratch = tempfile.TemporaryDirectory(prefix='dotfiles-tmux-test-')
        self.addCleanup(self.scratch.cleanup)
        self.root = Path(self.scratch.name)
        self.home = self.root / 'test home'
        self.bin = self.root / 'mock-bin'
        self.project = self.home / 'project with spaces'
        self.socket = self.root / 'tmux.sock'
        self.clipboard = self.root / 'clipboard'
        self.pasted = self.root / 'pasted'
        for path in (self.home / '.local/bin', self.bin, self.project, self.root / 'tmp'):
            path.mkdir(parents=True)
        shutil.copyfile(ROOT / '.tmux.conf', self.home / '.tmux.conf')
        self.helper = self.home / '.local/bin/dotfiles-clipboard'
        shutil.copyfile(ROOT / 'scripts/clipboard.sh', self.helper)
        self.helper.chmod(0o755)
        for name, body in {
            'wl-copy': 'if [[ -e "$TEST_ROOT/fail-wayland" ]]; then cat >/dev/null; exit 1; fi\ncat > "$TEST_ROOT/clipboard"\n',
            'wl-paste': 'if [[ -e "$TEST_ROOT/fail-wayland" ]]; then printf partial; exit 1; fi\ncat "$TEST_ROOT/clipboard"\n',
            'xsel': 'if [[ ${!#} == --output ]]; then cat "$TEST_ROOT/clipboard"; else cat > "$TEST_ROOT/clipboard"; fi\n',
            # Never talk to the host X server if xclip happens to be installed.
            'xclip': 'exit 1\n',
        }.items():
            path = self.bin / name
            path.write_text('#!/usr/bin/env bash\nset -euo pipefail\n' + body, encoding='utf-8')
            path.chmod(0o755)
        self.env = dict(os.environ)
        for key in ('TMUX', 'TMUX_PANE', 'DISPLAY', 'WAYLAND_DISPLAY', 'WSL_DISTRO_NAME', 'WSL_INTEROP', 'BASH_ENV', 'ENV'):
            self.env.pop(key, None)
        self.env.update({
            'HOME': str(self.home), 'TMPDIR': str(self.root / 'tmp'),
            'XDG_CONFIG_HOME': str(self.home / '.config'), 'XDG_CACHE_HOME': str(self.home / '.cache'),
            'XDG_STATE_HOME': str(self.home / '.local/state'), 'XDG_RUNTIME_DIR': str(self.root / 'tmp'),
            'PATH': str(self.bin) + ':/usr/bin:/bin', 'TEST_ROOT': str(self.root),
            'WAYLAND_DISPLAY': 'mock-wayland', 'TERM': 'xterm-256color', 'SHELL': '/bin/bash',
            'LANG': 'C.UTF-8', 'LC_ALL': 'C.UTF-8', 'PS1': '$ ',
        })
        self.run_tmux('-f', str(self.home / '.tmux.conf'), 'new-session', '-d', '-s', 'test',
                      '-c', str(self.project), 'exec bash --noprofile --norc')
        self.addCleanup(lambda: subprocess.run([TMUX, '-S', str(self.socket), 'kill-server'],
                                               env=self.env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
        self.run_tmux('set-option', '-g', 'default-command', 'exec bash --noprofile --norc')
        self.run_tmux('set-option', '-g', 'default-shell', '/bin/bash')
        self.run_tmux('set-option', '-g', 'remain-on-exit', 'on')
        self.master, slave = pty.openpty()
        fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', 30, 120, 0, 0))

        def controlling_terminal():
            os.setsid()
            fcntl.ioctl(0, termios.TIOCSCTTY, 0)

        try:
            self.client = subprocess.Popen([TMUX, '-S', str(self.socket), 'attach-session', '-t', 'test'],
                                           cwd=self.project, env=self.env, stdin=slave, stdout=slave, stderr=slave,
                                           preexec_fn=controlling_terminal)
        except BaseException:
            os.close(self.master)
            raise
        finally:
            os.close(slave)
        self.output = bytearray()
        self.addCleanup(self.close_terminal)
        self.wait_for(lambda: self.run_tmux('list-clients', '-F', '#{client_width}').strip() == b'120')

    def close_terminal(self):
        if self.client.poll() is None:
            os.killpg(self.client.pid, signal.SIGKILL)
        self.client.wait(timeout=5)
        os.close(self.master)

    def run_tmux(self, *arguments, input=None):
        result = subprocess.run([TMUX, '-S', str(self.socket), *arguments], env=self.env,
                                input=input, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=10)
        self.assertEqual(result.returncode, 0, result.stderr.decode(errors='replace'))
        return result.stdout

    def drain(self):
        while select.select([self.master], [], [], 0)[0]:
            try:
                chunk = os.read(self.master, 65536)
            except OSError as error:
                if error.errno == errno.EIO:
                    return
                raise
            if not chunk:
                return
            self.output.extend(chunk)

    def wait_for(self, condition):
        deadline = time.monotonic() + 10
        while time.monotonic() < deadline:
            self.drain()
            if condition():
                return
            time.sleep(0.02)
        self.fail('Timed out; terminal output: ' + repr(bytes(self.output[-4000:])))

    def key(self, value):
        os.write(self.master, value)

    def count(self, command):
        return len(self.run_tmux(command, '-F', '#{pane_id}').splitlines())

    def pane(self, expression):
        return self.run_tmux('display-message', '-p', expression).decode().strip()

    def shell(self, command):
        self.run_tmux('send-keys', '-l', command)
        self.run_tmux('send-keys', 'Enter')

    def test_legacy_and_prefix_window_pane_keys(self):
        self.assertEqual(self.run_tmux('show-options', '-gv', 'prefix').strip(), b'C-x')
        self.key(b'\x05')  # Original Ctrl+E: side-by-side split.
        self.wait_for(lambda: self.count('list-panes') == 2)
        self.key(b'\x18o')  # Prefix fallback: stacked split.
        self.wait_for(lambda: self.count('list-panes') == 3)
        paths = self.run_tmux('list-panes', '-F', '#{pane_current_path}').decode().splitlines()
        self.assertEqual(paths, [str(self.project)] * 3)
        current = self.pane('#{pane_id}')
        self.key(b'\x1b[1;5D')  # Ctrl+Left.
        self.wait_for(lambda: self.pane('#{pane_id}') != current)
        layout = self.pane('#{window_layout}')
        self.key(b'\x1b[1;6C')  # Ctrl+Shift+Right, standard xterm function-key sequence.
        self.wait_for(lambda: self.pane('#{window_layout}') != layout)
        self.key(b'\x18t')
        self.wait_for(lambda: self.count('list-windows') == 2)
        index = self.pane('#{window_index}')
        self.key(b'\x0e')  # Original Ctrl+N.
        self.wait_for(lambda: self.pane('#{window_index}') != index)
        self.key(b'\x17')  # Original Ctrl+W.
        self.wait_for(lambda: self.count('list-panes') == 2)
        self.assertNotIn(b'unknown option', self.output)
        self.assertNotIn(b'invalid option', self.output)

    def test_copy_mode_selection_reaches_system_and_tmux_buffers(self):
        self.shell(r"printf '\033[2J\033[Hcopy first\n日本語 second\n'")
        self.wait_for(lambda: b'copy first\n' in self.run_tmux('capture-pane', '-p'))
        self.key(b'\x18c')
        self.wait_for(lambda: self.pane('#{pane_in_mode}') == '1')
        # Type individual actions: a single fast burst can trigger tmux's
        # assume-paste-time heuristic instead of representing keyboard input.
        for character in b'kk0vj$y':
            self.key(bytes([character]))
            time.sleep(0.03)
            self.drain()
        expected = 'copy first\n日本語 second\n'.encode()
        self.wait_for(lambda: self.clipboard.exists())
        self.assertEqual(self.clipboard.read_bytes(), expected)
        self.assertEqual(self.run_tmux('show-buffer'), expected)
        self.wait_for(lambda: self.pane('#{pane_in_mode}') == '0')

    def test_mouse_drag_copies_without_an_extra_copy_key(self):
        self.shell(r"printf '\033[2J\033[Hmouse first\nsecond line\n'")
        self.wait_for(lambda: b'mouse first\n' in self.run_tmux('capture-pane', '-p'))
        for sequence in (b'\x1b[<0;1;1M', b'\x1b[<32;5;2M', b'\x1b[<0;5;2m'):
            self.key(sequence)
            time.sleep(0.03)
            self.drain()
        self.wait_for(self.clipboard.exists)
        self.assertEqual(self.clipboard.read_bytes(), b'mouse first\nsecon')
        self.assertEqual(self.run_tmux('show-buffer'), self.clipboard.read_bytes())

    def test_headless_copy_emits_osc52_to_the_attached_terminal(self):
        (self.root / 'fail-wayland').touch()
        text = 'terminal clipboard\n日本語\n'.encode()
        env = dict(self.env, TMUX=f'{self.socket},{self.pane("#{pid}")},0', TMUX_PANE=self.pane('#{pane_id}'))
        subprocess.run([str(self.helper), 'copy'], input=text, env=env, check=True, timeout=10)
        self.wait_for(lambda: base64.b64encode(text) in self.output)
        self.assertIn(b'\x1b]52;', self.output)
        self.assertEqual(self.run_tmux('show-buffer'), text)

    def prepare_receiver(self):
        receiver = self.root / 'receiver.py'
        receiver.write_text(
            'import os, pathlib, tty\n'
            'tty.setraw(0)\n'
            'os.write(1, b"\\x1b[?2004hPASTE_READY")\n'
            'data = b""\n'
            'while not data.endswith(b"\\x1b[201~"):\n'
            '    data += os.read(0, 65536)\n'
            'pathlib.Path(os.environ["TEST_ROOT"], "pasted").write_bytes(data)\n', encoding='utf-8')
        self.shell('exec /usr/bin/python3 ' + shlex.quote(str(receiver)))
        self.wait_for(lambda: b'PASTE_READY' in self.run_tmux('capture-pane', '-p'))

    def test_prefix_p_pastes_complete_clipboard_with_brackets(self):
        text = 'first line\n日本語 and spaces\n\n'.encode()
        self.clipboard.write_bytes(text)
        self.prepare_receiver()
        self.key(b'\x18p')
        self.wait_for(self.pasted.exists)
        self.assertEqual(self.pasted.read_bytes(), b'\x1b[200~' + text + b'\x1b[201~')
        self.wait_for(lambda: not list((self.root / 'tmp').glob('dotfiles-clipboard.*')))

    def test_ctrl_p_uses_internal_buffer_without_readable_clipboard(self):
        text = 'internal buffer\n二行目\n'.encode()
        (self.root / 'fail-wayland').touch()
        self.run_tmux('load-buffer', '-', input=text)
        self.prepare_receiver()
        self.key(b'\x10')
        self.wait_for(self.pasted.exists)
        self.assertEqual(self.pasted.read_bytes(), b'\x1b[200~' + text + b'\x1b[201~')

    def test_ctrl_c_still_interrupts_the_foreground_application(self):
        receiver = self.root / 'interrupt.py'
        receiver.write_text(
            'import os, pathlib, signal, time\n'
            'def stop(signum, frame):\n'
            '    pathlib.Path(os.environ["TEST_ROOT"], "interrupted").write_text("SIGINT")\n'
            '    raise SystemExit(0)\n'
            'signal.signal(signal.SIGINT, stop)\n'
            'print("INTERRUPT_READY", flush=True)\n'
            'time.sleep(30)\n', encoding='utf-8')
        self.shell('exec /usr/bin/python3 ' + shlex.quote(str(receiver)))
        self.wait_for(lambda: b'INTERRUPT_READY' in self.run_tmux('capture-pane', '-p'))
        self.key(b'\x03')
        self.wait_for(lambda: (self.root / 'interrupted').exists())
        self.assertEqual((self.root / 'interrupted').read_text(), 'SIGINT')

    def test_failed_wayland_falls_back_without_partial_text_or_temp_leaks(self):
        (self.root / 'fail-wayland').touch()
        text = 'fallback\n日本語\n\n'.encode()
        env = dict(self.env, DISPLAY='mock-x11')
        subprocess.run([str(self.helper), 'copy'], input=text, env=env, check=True, timeout=10)
        result = subprocess.run([str(self.helper), 'paste'], env=env, check=True,
                                stdout=subprocess.PIPE, timeout=10)
        self.assertEqual(result.stdout, text)
        self.assertEqual(self.clipboard.read_bytes(), text)
        self.assertEqual(list((self.root / 'tmp').glob('dotfiles-clipboard.*')), [])


if __name__ == '__main__':
    unittest.main(verbosity=2)
