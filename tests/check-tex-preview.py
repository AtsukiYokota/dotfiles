#!/usr/bin/env python3
"""Exercise TeX preview with pinned Neovim/VimTeX in a temporary home.

By default latexmk is a small process fixture. --real-tex uses installed TeX
engines and extracts the resulting Japanese/English PDF text. The PDF viewer
is always a fixture, so no window is opened on the host desktop.
"""
import argparse
import ctypes
import json
import os
from pathlib import Path
import platform
import shutil
import signal
import subprocess
import sys
import tarfile
import tempfile
import time

sys.dont_write_bytecode = True
REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / 'installer'))
from runtime import Runner


MOCK_LATEXMK = r'''
import hashlib
import json
import os
from pathlib import Path
import signal
import sys
import time

source = Path(sys.argv[-1])
with Path(os.environ['TEX_TEST_CALLS']).open('a') as log:
    log.write(json.dumps({'cwd': str(Path.cwd()), 'args': sys.argv[1:]}) + '\n')
running = True
def stop(*_):
    global running
    running = False
signal.signal(signal.SIGTERM, stop)
previous = None
while running:
    text = '\n'.join(p.read_text() for p in sorted(Path.cwd().glob('*.tex')))
    digest = hashlib.sha256(text.encode()).hexdigest()
    if digest != previous:
        previous = digest
        print('vimtex_compiler_callback_compiling', flush=True)
        if 'UndefinedCommandForTest' in text:
            source.with_suffix('.log').write_text('! Undefined control sequence.\n')
            print('vimtex_compiler_callback_failure', flush=True)
        else:
            source.with_suffix('.pdf').write_text('%PDF-1.4\n' + text)
            source.with_suffix('.log').write_text('This is a test compiler\n')
            print('vimtex_compiler_callback_success', flush=True)
    time.sleep(0.05)
'''

MOCK_VIEWER = r'''
import json
import os
from pathlib import Path
import sys
import time
# Deliberately finish after the launching shell, exposing cleanup races.
time.sleep(0.15)
with Path(os.environ['TEX_TEST_VIEWER']).open('a') as log:
    log.write(json.dumps({'cwd': str(Path.cwd()), 'args': sys.argv[1:]}) + '\n')
'''


def executable(path, body):
    path.write_text(f'#!{sys.executable}\n' + body)
    path.chmod(0o755)


def wait_for_children(timeout):
    """Reap adopted fixture jobs, including background viewers in other groups."""
    deadline = time.monotonic() + timeout
    while True:
        try:
            pid, _ = os.waitpid(-1, os.WNOHANG)
        except ChildProcessError:
            return True
        if pid:
            continue
        if time.monotonic() >= deadline:
            return False
        time.sleep(0.01)


def signal_children(sig):
    def children(pid):
        try:
            return [int(value) for value in Path(f'/proc/{pid}/task/{pid}/children').read_text().split()]
        except FileNotFoundError:
            return []

    def stop(pid):
        for child in children(pid):
            stop(child)
        try:
            os.kill(pid, sig)
        except ProcessLookupError:
            pass

    for child in children(os.getpid()):
        stop(child)


def finish_processes(process):
    if process.poll() is None:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)
    if wait_for_children(5):
        return
    signal_children(signal.SIGTERM)
    if not wait_for_children(2):
        signal_children(signal.SIGKILL)
        if not wait_for_children(5):
            raise RuntimeError('TeX test descendants did not exit after SIGKILL')
    raise RuntimeError('TeX test left background jobs running after editor exit')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--real-tex', action='store_true')
    args = parser.parse_args()
    if sys.platform != 'linux':
        parser.error('Run this test under Linux / WSL.')
    if args.real_tex:
        for command in ('latexmk', 'platex', 'uplatex', 'lualatex', 'pdflatex', 'dvipdfmx', 'pdftotext'):
            if not shutil.which(command):
                parser.error(f'{command} is required for --real-tex')
    arch = {'x86_64': 'amd64', 'aarch64': 'arm64'}[platform.machine()]
    version = json.loads((REPO / 'installer/versions.json').read_text())['neovim'][arch]
    commit = json.loads((REPO / 'configs/nvim/lazy-lock.json').read_text())['vimtex']['commit']
    with tempfile.TemporaryDirectory(prefix='dotfiles-tex-test-') as temp:
        root = Path(temp)
        runner = Runner(root / 'commands.log')
        archive = root / 'nvim.tar.gz'
        runner.download(version['url'], archive, version['sha256'])
        with tarfile.open(archive) as bundle:
            bundle.extractall(root, filter='data')
        nvim = next(root.glob('nvim-linux-*/bin/nvim'))
        plugin = root / 'vimtex'
        subprocess.run(['git', 'init', '-q', str(plugin)], check=True)
        subprocess.run(['git', '-C', str(plugin), 'fetch', '--quiet', '--depth=1',
                        'https://github.com/lervag/vimtex.git', commit], check=True, timeout=120)
        subprocess.run(['git', '-C', str(plugin), 'checkout', '--quiet', 'FETCH_HEAD'], check=True)
        home, binaries = root / 'home', root / 'bin'
        home.mkdir()
        binaries.mkdir()
        shutil.copyfile(REPO / '.latexmkrc', home / '.latexmkrc')
        executable(binaries / 'zathura', MOCK_VIEWER)
        if not args.real_tex:
            executable(binaries / 'latexmk', MOCK_LATEXMK)
        environment = os.environ.copy()
        environment.update(
            HOME=str(home), XDG_CONFIG_HOME=str(home / '.config'),
            XDG_DATA_HOME=str(home / '.local/share'), XDG_STATE_HOME=str(home / '.local/state'),
            XDG_CACHE_HOME=str(home / '.cache'), NVIM_APPNAME='nvim',
            PATH=str(binaries) + os.pathsep + environment.get('PATH', ''),
            TEX_TEST_ROOT=str(root), TEX_TEST_REPO=str(REPO), TEX_TEST_PLUGIN=str(plugin),
            TEX_TEST_CALLS=str(root / 'compiler.jsonl'), TEX_TEST_VIEWER=str(root / 'viewer.jsonl'),
            TEX_TEST_REAL='1' if args.real_tex else '0', DISPLAY=':test-fixture', WAYLAND_DISPLAY='',
            GIT_CONFIG_GLOBAL='/dev/null', GIT_CONFIG_NOSYSTEM='1',
        )
        # VimTeX launches viewers with a background shell command. Neovim's
        # job/session boundaries do not contain every viewer, so adopt orphaned
        # descendants and reap them before deleting the private fixture tree.
        libc = ctypes.CDLL(None, use_errno=True)
        if libc.prctl(36, 1, 0, 0, 0) != 0:  # PR_SET_CHILD_SUBREAPER
            raise OSError(ctypes.get_errno(), 'Cannot supervise TeX test descendants')
        process = subprocess.Popen(
            [str(nvim), '--headless', '-u', 'NONE', '-i', 'NONE', '-l', str(REPO / 'tests/nvim-tex-preview.lua')],
            env=environment, start_new_session=True,
        )
        try:
            if process.wait(timeout=300):
                raise RuntimeError('TeX preview integration failed')
        finally:
            finish_processes(process)
    print('TeX preview integration passed' + (' (real Japanese/English PDFs).' if args.real_tex else ' (process fixtures).'))


if __name__ == '__main__':
    main()
