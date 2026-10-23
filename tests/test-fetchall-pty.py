#!/usr/bin/env python3
"""Exercise fetchall's per-worktree confirmation with a real controlling TTY."""
from __future__ import annotations

import errno
import os
from pathlib import Path
import select
import signal
import subprocess
import sys
import tempfile
import time
import unittest

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(sys.platform == 'linux', 'requires a Linux controlling terminal')
class FetchallTerminalTests(unittest.TestCase):
    def test_confirm_one_worktree_and_decline_the_next(self):
        import fcntl
        import pty
        import termios

        with tempfile.TemporaryDirectory(prefix='dotfiles-fetchall-pty-') as temporary:
            root = Path(temporary)
            home, collection = root / 'home', root / 'collection'
            home.mkdir()
            collection.mkdir()
            (root / 'template').mkdir()
            env = {key: value for key, value in os.environ.items() if not key.startswith('GIT_')}
            env.update({
                'HOME': str(home), 'XDG_CONFIG_HOME': str(home / '.config'),
                'GIT_CONFIG_GLOBAL': '/dev/null', 'GIT_CONFIG_NOSYSTEM': '1',
                'GIT_ALLOW_PROTOCOL': 'file', 'GIT_TERMINAL_PROMPT': '0',
                'GIT_AUTHOR_NAME': 'Dotfiles Test', 'GIT_AUTHOR_EMAIL': 'test@example.invalid',
                'GIT_COMMITTER_NAME': 'Dotfiles Test', 'GIT_COMMITTER_EMAIL': 'test@example.invalid',
                'GIT_TEMPLATE_DIR': str(root / 'template'),
                'GIT_CONFIG_COUNT': '1', 'GIT_CONFIG_KEY_0': 'core.hooksPath', 'GIT_CONFIG_VALUE_0': '/dev/null',
                'LANG': 'C.UTF-8', 'LC_ALL': 'C.UTF-8',
            })

            def git(*arguments):
                return subprocess.check_output(['git', *map(str, arguments)], cwd=root,
                                               env=env, stderr=subprocess.PIPE, text=True, timeout=15).strip()

            upstream, seed = root / 'upstream.git', root / 'seed'
            git('init', '-q', '--bare', '--initial-branch=main', upstream)
            git('clone', '-q', upstream, seed)
            (seed / 'file').write_text('initial\n', encoding='utf-8')
            git('-C', seed, 'add', 'file')
            git('-C', seed, 'commit', '-qm', 'initial')
            git('-C', seed, 'push', '-qu', 'origin', 'main')
            before = git('-C', seed, 'rev-parse', 'HEAD')
            project, worktree = collection / 'project with spaces', collection / 'linked worktree'
            git('clone', '-q', upstream, project)
            git('-C', project, 'worktree', 'add', '-q', '--track', '-b', 'linked', worktree, 'origin/main')
            (seed / 'file').write_text('updated\n', encoding='utf-8')
            git('-C', seed, 'commit', '-qam', 'update')
            git('-C', seed, 'push', '-q')
            after = git('-C', seed, 'rev-parse', 'HEAD')

            master, slave = pty.openpty()

            def controlling_terminal():
                os.setsid()
                fcntl.ioctl(0, termios.TIOCSCTTY, 0)

            try:
                process = subprocess.Popen(['bash', str(ROOT / 'commands/fetchall.sh'), '-p', str(collection)],
                                           cwd=root, env=env, stdin=slave, stdout=slave, stderr=slave,
                                           preexec_fn=controlling_terminal)
            except BaseException:
                os.close(master)
                raise
            finally:
                os.close(slave)
            output = bytearray()

            def wait_prompt(start=0):
                expected = b' with --ff-only? [y/N] '
                deadline = time.monotonic() + 15
                while expected not in output[start:]:
                    remaining = deadline - time.monotonic()
                    if remaining <= 0:
                        self.fail(f'Timed out waiting for pull confirmation: {bytes(output)!r}')
                    if not select.select([master], [], [], min(remaining, 0.2))[0]:
                        if process.poll() is not None:
                            self.fail(f'Exited before the next confirmation: {bytes(output)!r}')
                        continue
                    try:
                        chunk = os.read(master, 65536)
                    except OSError as error:
                        if error.errno != errno.EIO:
                            raise
                        chunk = b''
                    if not chunk:
                        self.fail(f'Terminal closed before confirmation: {bytes(output)!r}')
                    output.extend(chunk)
                prompts = [path for path in (project, worktree)
                           if ('Pull ' + str(path)).encode() + expected in output[start:]]
                self.assertEqual(len(prompts), 1, bytes(output))
                return prompts[0]

            try:
                approved = wait_prompt()
                self.assertEqual(git('-C', project, 'rev-parse', 'HEAD'), before)
                self.assertEqual(git('-C', worktree, 'rev-parse', 'HEAD'), before)
                offset = len(output)
                os.write(master, b'y\n')
                declined = wait_prompt(offset)
                self.assertNotEqual(approved, declined)
                self.assertEqual(git('-C', approved, 'rev-parse', 'HEAD'), after)
                self.assertEqual(git('-C', declined, 'rev-parse', 'HEAD'), before)
                os.write(master, b'\n')
                self.assertEqual(process.wait(timeout=15), 0, bytes(output))
                self.assertEqual(git('-C', approved, 'rev-parse', 'HEAD'), after)
                self.assertEqual(git('-C', declined, 'rev-parse', 'HEAD'), before)
            finally:
                if process.poll() is None:
                    os.killpg(process.pid, signal.SIGKILL)
                process.wait(timeout=10)
                os.close(master)


if __name__ == '__main__':
    unittest.main(verbosity=2)
