#!/usr/bin/env python3
"""Offline end-to-end CLI checks on Ubuntu 26.04, using disposable HOME/PTYs.

Run as an ordinary user: python3 tests/test-cli.py
No packages, downloads, real home settings, or desktop settings are touched.
"""
from __future__ import annotations

import errno
import hashlib
import json
import os
from pathlib import Path
import select
import stat
import struct
import subprocess
import sys
import tempfile
import time
import unittest

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
CLI = ROOT / 'installer/main.py'


def supported_platform():
    if sys.platform != 'linux' or sys.version_info < (3, 12) or os.geteuid() == 0:
        return False
    release = Path('/etc/os-release').read_text(encoding='utf-8')
    values = dict(line.split('=', 1) for line in release.splitlines() if '=' in line)
    return values.get('ID', '').strip('"') == 'ubuntu' and values.get('VERSION_ID', '').strip('"') == '26.04'


def snapshot(directory, exclude=None):
    """Record contents and modes without following any directory symlink."""
    result = {}

    def visit(path):
        if exclude is not None and path == exclude:
            return
        info = path.lstat()
        relative = str(path.relative_to(directory))
        mode = stat.S_IMODE(info.st_mode)
        if stat.S_ISLNK(info.st_mode):
            result[relative] = ('link', os.readlink(path), mode)
        elif stat.S_ISDIR(info.st_mode):
            result[relative] = ('directory', mode)
            for child in sorted(path.iterdir()):
                visit(child)
        else:
            result[relative] = ('file', hashlib.sha256(path.read_bytes()).hexdigest(), mode)

    visit(directory)
    return result


@unittest.skipUnless(supported_platform(), 'requires Ubuntu 26.04, Python 3.12+, and a non-root user')
class CliTests(unittest.TestCase):
    def setUp(self):
        self.scratch = tempfile.TemporaryDirectory(prefix='dotfiles-cli-test-')
        self.addCleanup(self.scratch.cleanup)
        self.root = Path(self.scratch.name)
        self.home = self.root / 'test home'
        self.home.mkdir()
        self.config = self.home / 'config with spaces'
        self.state = self.home / 'state with spaces'
        self.data = self.home / 'data with spaces'
        self.temp = self.root / 'temporary files'
        for path in (self.config, self.state, self.data, self.temp):
            path.mkdir()
        for filename, content in {
            '.bashrc': '# existing bash setup\nexport PRIVATE_SETTING=preserved\n',
            '.profile': '# existing login setup\n',
            '.tmux.conf': '# existing tmux setup\n',
            '.vimrc': 'set number\n',
            'private-inputrc': 'set bell-style none\n',
        }.items():
            path = self.home / filename
            path.write_text(content, encoding='utf-8')
            path.chmod(0o600)
        (self.home / '.inputrc').symlink_to('private-inputrc')
        (self.config / 'nvim').mkdir()
        (self.config / 'nvim/init.lua').write_text('-- existing editor configuration\n', encoding='utf-8')

        # The real CLI may import these modules, but config-only deployment must
        # never launch sudo/apt/git/gsettings, or access the network. An attempted
        # call fails the child process before it can affect the host.
        guard = self.root / 'guard'
        guard.mkdir()
        (guard / 'sitecustomize.py').write_text(
            'import os, socket, subprocess, urllib.request\n'
            'def forbidden(*args, **kwargs):\n'
            '    raise RuntimeError("CLI test forbids external commands and network access")\n'
            'subprocess.Popen = forbidden\n'
            'os.system = forbidden\n'
            'os.posix_spawn = forbidden\n'
            'os.posix_spawnp = forbidden\n'
            'socket.socket.connect = forbidden\n'
            'socket.socket.connect_ex = forbidden\n'
            'socket.create_connection = forbidden\n'
            'urllib.request.urlopen = forbidden\n', encoding='utf-8')
        self.env = dict(os.environ)
        self.env.update({
            'HOME': str(self.home),
            'XDG_CONFIG_HOME': str(self.config),
            'XDG_STATE_HOME': str(self.state),
            'XDG_DATA_HOME': str(self.data),
            'XDG_CACHE_HOME': str(self.home / 'cache with spaces'),
            'TMPDIR': str(self.temp),
            'PYTHONPATH': str(guard),
            'PYTHONDONTWRITEBYTECODE': '1',
            'PYTHONNOUSERSITE': '1',
            'TERM': 'xterm-256color',
            'LANG': 'C.UTF-8',
            'LC_ALL': 'C.UTF-8',
        })
        self.before = snapshot(self.home)

    def cli(self, *arguments):
        result = subprocess.run([sys.executable, str(CLI), *arguments],
                                cwd=ROOT, env=self.env, stdin=subprocess.DEVNULL,
                                stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                text=True, timeout=30)
        self.assertEqual(result.returncode, 0, result.stdout)
        return result.stdout

    def backups(self):
        return sorted((self.state / 'dotfiles/backups').iterdir())

    def test_configs_only_repeat_and_restore(self):
        arguments = ('--modules', 'shell,neovim,latex,diagrams', '--configs-only', '--yes')
        self.cli(*arguments)
        first, = self.backups()
        first_manifest = json.loads((first / 'manifest.json').read_text(encoding='utf-8'))
        self.assertTrue(first_manifest['entries'])
        self.assertEqual(stat.S_IMODE(first.stat().st_mode), 0o700)
        links = {
            self.home / name: ROOT / name
            for name in ('.inputrc', '.dircolors', '.tmux.conf', '.rosrc', '.vimrc', '.latexmkrc')
        }
        links[self.config / 'nvim'] = ROOT / 'configs/nvim'
        for target, source in links.items():
            with self.subTest(target=target):
                self.assertTrue(target.is_symlink())
                self.assertEqual(target.resolve(), source.resolve())
        for name in ('dotfiles-clipboard', 'fetchall', 'png2eps', 'jpg2eps', 'image2eps.py'):
            target = self.home / '.local/bin' / name
            self.assertTrue(target.is_file(), str(target))
            self.assertTrue(os.access(target, os.X_OK), str(target))
        self.assertEqual((self.home / '.bashrc').read_text(encoding='utf-8').count('# >>> dotfiles managed >>>'), 1)
        self.assertEqual((self.home / '.profile').read_text(encoding='utf-8').count('# >>> dotfiles PATH >>>'), 1)
        self.assertEqual(stat.S_IMODE((self.home / '.bashrc').stat().st_mode), 0o600)
        self.assertIn('PRIVATE_SETTING=preserved', (self.home / '.bashrc').read_text(encoding='utf-8'))
        selection = json.loads((first / 'selection.json').read_text(encoding='utf-8'))
        self.assertTrue(selection['configs_only'])
        self.assertTrue({'shell', 'neovim', 'latex', 'diagrams'}.issubset(selection['modules']))
        installed = snapshot(self.home, exclude=self.state / 'dotfiles/backups')

        self.cli(*arguments)
        self.assertEqual(len(self.backups()), 2)
        # A host/WSL clock correction can make the second timestamp sort first.
        second, = set(self.backups()) - {first}
        self.assertEqual(snapshot(self.home, exclude=self.state / 'dotfiles/backups'), installed)
        self.assertEqual(json.loads((second / 'manifest.json').read_text(encoding='utf-8'))['entries'], [])

        # Restoring the no-op second run must leave the first deployment intact.
        self.cli('--restore', str(second), '--yes')
        self.assertEqual(snapshot(self.home, exclude=self.state / 'dotfiles/backups'), installed)
        self.cli('--restore', str(first), '--yes')
        restored = snapshot(self.home, exclude=self.state / 'dotfiles/backups')
        # Backups and empty parent directories are intentionally retained.
        self.assertEqual({key: value for key, value in restored.items() if value[0] != 'directory'},
                         {key: value for key, value in self.before.items() if value[0] != 'directory'})
        for key, value in self.before.items():
            self.assertEqual(restored[key], value, key)
        for name in ('.rosrc', '.latexmkrc', '.local/bin/fetchall', '.local/bin/png2eps'):
            self.assertFalse(os.path.lexists(self.home / name), name)

    def open_terminal(self):
        import fcntl
        import pty
        import termios

        master, slave = pty.openpty()
        fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', 24, 100, 0, 0))
        try:
            process = subprocess.Popen([sys.executable, str(CLI), '--configs-only'],
                                       cwd=ROOT, env=self.env, stdin=slave, stdout=slave,
                                       stderr=slave, start_new_session=True)
        except BaseException:
            os.close(master)
            raise
        finally:
            os.close(slave)

        def cleanup():
            if process.poll() is None:
                process.kill()
            process.wait(timeout=10)
            os.close(master)

        self.addCleanup(cleanup)
        return process, master, bytearray()

    def read_until(self, process, master, output, expected):
        deadline = time.monotonic() + 15
        while expected not in output:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                self.fail(f'Timed out waiting for {expected!r}: {bytes(output)!r}')
            ready, _, _ = select.select([master], [], [], min(remaining, 0.2))
            if not ready:
                if process.poll() is not None:
                    self.fail(f'CLI exited before {expected!r}: {bytes(output)!r}')
                continue
            try:
                chunk = os.read(master, 65536)
            except OSError as error:
                if error.errno != errno.EIO:
                    raise
                chunk = b''
            if not chunk:
                self.fail(f'Terminal closed before {expected!r}: {bytes(output)!r}')
            output.extend(chunk)

    def await_checklist(self, process, master, output):
        self.read_until(process, master, output, b'Up/Down: move')
        self.assertIn(b'\x1b[', output, 'the real curses screen must be rendered')
        self.assertNotIn(b'plain checklist', output)
        self.assertEqual(snapshot(self.home), self.before)

    def test_curses_q_cancels_without_home_changes(self):
        process, master, output = self.open_terminal()
        self.await_checklist(process, master, output)
        os.write(master, b'q')
        self.read_until(process, master, output, b'Cancelled.')
        self.assertEqual(process.wait(timeout=10), 130, bytes(output))
        self.assertEqual(snapshot(self.home), self.before)

    def test_curses_review_then_empty_confirmation_does_not_write(self):
        process, master, output = self.open_terminal()
        self.await_checklist(process, master, output)
        os.write(master, b'\r')
        self.read_until(process, master, output, b'Type INSTALL to start')
        self.assertEqual(snapshot(self.home), self.before)
        os.write(master, b'\r')
        self.read_until(process, master, output, b'Cancelled. No changes made.')
        self.assertEqual(process.wait(timeout=10), 0, bytes(output))
        self.assertEqual(snapshot(self.home), self.before)


if __name__ == '__main__':
    unittest.main(verbosity=2)
