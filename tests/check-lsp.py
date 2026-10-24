#!/usr/bin/env python3
"""Real language servers and Neovim completion inside tmux in a temporary HOME.

Downloads the installer's checked runtimes and servers into a disposable HOME.
Uses Ubuntu's clangd when installed, or extracts its packages temporarily;
never changes the host's editor configuration or global package stores.
"""
from __future__ import annotations

import errno
import json
import os
from pathlib import Path
import platform
import select
import shlex
import shutil
import signal
import struct
import subprocess
import sys
import tarfile
import tempfile
import time

sys.dont_write_bytecode = True
REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / 'installer'))
from runtime import Runner
from lsp_cpp import prepare_clangd, check_cpp_completion


def unpack(runner, versions, name, arch, root):
    archive = root / (name + '.tar.gz')
    destination = root / name
    destination.mkdir()
    spec = versions[name][arch]
    runner.download(spec['url'], archive, spec['sha256'])
    with tarfile.open(archive) as bundle:
        bundle.extractall(destination, filter='data')
    return destination


class Editor:
    def __init__(self, nvim, root, env):
        import fcntl
        import pty
        import termios

        self.nvim = str(nvim)
        self.env = env
        self.socket = root / 'editor.sock'
        self.tmux_socket = root / 'tmux.sock'
        self.tmux = shutil.which('tmux', path=env['PATH'])
        if not self.tmux:
            raise RuntimeError('Install tmux to verify completion with the repository terminal bindings.')
        self.output = bytearray()
        self.master, slave = pty.openpty()
        fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', 35, 120, 0, 0))

        def terminal():
            os.setsid()
            fcntl.ioctl(0, termios.TIOCSCTTY, 0)

        # Silence only informational startup messages about uninstalled visual
        # plugins. All settings, LSP autocommands and real keyboard mappings load.
        init = root / 'init.lua'
        init.write_text('_G.dotfiles_test_notifications = {}\n'
                        'vim.notify = function(message) table.insert(_G.dotfiles_test_notifications, message) end\n'
                        'dofile(' + json.dumps(str(REPO / 'configs/nvim/init.lua')) + ')\n')
        command = [self.nvim, '--listen', str(self.socket), '-i', 'NONE', '-u', str(init)]
        try:
            self.process = subprocess.Popen(
                [self.tmux, '-S', str(self.tmux_socket), '-f', str(REPO / '.tmux.conf'),
                 'new-session', '-s', 'completion-check', '-c', str(root / 'project'), shlex.join(command)],
                cwd=root / 'project', env=env, stdin=slave, stdout=slave, stderr=slave,
                preexec_fn=terminal,
            )
        except BaseException:
            os.close(self.master)
            raise
        finally:
            os.close(slave)
        try:
            self.wait(lambda: self.socket.exists(), 'editor RPC socket')
            self.wait(lambda: self.query('vim.v.vim_did_enter') == 1, 'editor startup and configuration')
        except BaseException:
            self.close()
            raise

    def close(self):
        subprocess.run([self.tmux, '-S', str(self.tmux_socket), 'kill-server'],
                       env=self.env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=5)
        if self.process.poll() is None:
            try:
                os.killpg(self.process.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
        try:
            self.process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            os.killpg(self.process.pid, signal.SIGKILL)
            self.process.wait(timeout=5)
        os.close(self.master)

    def drain(self):
        while select.select([self.master], [], [], 0)[0]:
            try:
                data = os.read(self.master, 65536)
            except OSError as error:
                if error.errno == errno.EIO:
                    return
                raise
            if not data:
                return
            self.output.extend(data)

    def query(self, lua):
        expression = "json_encode(luaeval('" + lua.replace("'", "''") + "'))"
        self.drain()
        result = subprocess.run([self.nvim, '--server', str(self.socket), '--remote-expr', expression],
                                env=self.env, capture_output=True, text=True, timeout=10)
        if result.returncode:
            raise AssertionError('Neovim RPC failed: ' + result.stderr)
        return json.loads(result.stdout)

    def execute(self, lua):
        return self.query('(function() ' + lua + '; return true end)()')

    def wait(self, condition, label, timeout=30):
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            self.drain()
            if self.process.poll() is not None:
                raise AssertionError('Neovim exited: ' + repr(bytes(self.output[-2000:])))
            if condition():
                return
            time.sleep(0.05)
        raise AssertionError('Timed out waiting for ' + label + '; terminal: ' + repr(bytes(self.output[-2000:])))

    def keys(self, keys, delay=0.025):
        for value in keys:
            os.write(self.master, bytes([value]))
            time.sleep(delay)
            self.drain()

    def open(self, path, server):
        self.keys(b'\x1b')
        self.keys((':edit! ' + str(path) + '\r').encode(), delay=0.001)
        self.wait(lambda: self.query('vim.api.nvim_buf_get_name(0)') == str(path), 'open ' + path.name)
        self.keys(b'G')
        if server is None:
            assert self.query('#vim.lsp.get_clients({bufnr=0})') == 0, 'Unexpected LSP on text buffer'
            return
        self.wait(lambda: server in self.query('vim.tbl_map(function(c) return c.name end, vim.lsp.get_clients({bufnr=0}))'),
                  server + ' attachment', timeout=40)
        self.wait(lambda: self.query('vim.lsp.get_clients({bufnr=0})[1].initialized'), server + ' initialization')
        assert not self.query('vim.bo.autocomplete'), 'Buffer-word completion must not mask failed LSP completion'
        print('  LSP attached: ' + server, flush=True)

    def completion(self):
        return self.query('(function() local c = vim.fn.complete_info(); return { visible = vim.fn.pumvisible(), '
                          'selected = c.selected, words = vim.tbl_map(function(i) return i.word end, c.items) } end)()')

    def menu(self, word):
        self.wait(lambda: self.completion()['visible'] == 1 and word in self.completion()['words'],
                  'completion candidate ' + word)
        result = self.completion()
        assert result['selected'] == -1, 'Automatic completion must not select/insert a candidate: ' + repr(result)


def check_completion(editor, project):
    source = project / 'completion_probe.py'
    original = 'def dotfiles_completion_probe() -> int:\n    return 42\n\nimport os\n\n'
    source.write_text(original)
    editor.open(source, 'basedpyright')
    editor.keys(b'Adotfiles_compl')
    editor.menu('dotfiles_completion_probe')
    editor.keys(b'\t')
    editor.wait(lambda: editor.completion()['selected'] == 0, 'Tab selects first candidate')
    editor.keys(b'\x1b[Z', delay=0)  # xterm Shift+Tab.
    editor.wait(lambda: editor.completion()['selected'] == -1, 'Shift+Tab returns to no selection')
    editor.keys(b'\t')
    editor.keys(b'\r')
    editor.wait(lambda: editor.query('vim.api.nvim_get_current_line()') == 'dotfiles_completion_probe',
                'Enter accepts selected candidate')
    assert editor.query('vim.api.nvim_buf_line_count(0)') == 5, 'Accepting completion inserted an unwanted newline'
    print('  Python identifier autocompletion + Tab + Enter passed.', flush=True)

    editor.open(source, 'basedpyright')
    editor.keys(b'Adotfiles_compl')
    editor.menu('dotfiles_completion_probe')
    editor.keys(b'\r')
    editor.wait(lambda: editor.query('vim.api.nvim_buf_line_count(0)') == 6, 'unselected Enter creates a newline')
    assert editor.query('vim.api.nvim_buf_get_lines(0, 4, 5, false)[1]') == 'dotfiles_compl', 'Enter accepted an unselected candidate'
    print('  Unselected Enter preserves typed text and adds a newline.', flush=True)

    editor.open(source, 'basedpyright')
    editor.keys(b'Aos.pa')
    editor.menu('path')
    editor.keys(b'\x1b')
    editor.wait(lambda: editor.completion()['visible'] == 0, 'completion dismissal')
    editor.keys(b'A')
    editor.keys(b'\x07 ')  # Ctrl+G then plain Space passes through the configured tmux.
    editor.menu('path')
    print('  Member completion and Ctrl+G Space manual completion passed.', flush=True)


def check_text_completion(editor, project):
    source = project / 'notes.txt'
    source.write_text('dotfiles_buffer_probe\ndotfiles_buffer_second\n\n')
    editor.open(source, None)
    assert editor.query('vim.bo.autocomplete'), 'Plain text must enable buffer-word autocompletion'
    editor.keys(b'Adotfiles_buffer_p')
    editor.menu('dotfiles_buffer_probe')
    editor.keys(b'\t\r')
    editor.wait(lambda: editor.query('vim.api.nvim_get_current_line()') == 'dotfiles_buffer_probe',
                'plain-text completion acceptance')
    editor.open(source, None)
    editor.keys(b'Adotfiles_buffer_p\x1b')
    editor.wait(lambda: editor.completion()['visible'] == 0, 'plain-text completion dismissal')
    editor.keys(b'A\x07 ')
    editor.wait(lambda: 'dotfiles_buffer_probe' in editor.completion()['words'], 'manual buffer-word completion')
    print('  Plain text autocompletion + Tab + Enter and manual fallback passed.', flush=True)

    for filename in ('dotfiles_path_one.txt', 'dotfiles_path_two.txt'):
        (project / filename).write_text('path completion test\n')
    editor.open(source, None)
    editor.keys(b'Adotfiles_path_\x07\x06')
    editor.wait(lambda: editor.query('vim.fn.complete_info().mode') == 'files', 'Ctrl+G Ctrl+F file completion')
    editor.wait(lambda: 'dotfiles_path_one.txt' in editor.completion()['words'], 'filename completion candidates')
    print('  Ctrl+G Ctrl+F filename completion passed.', flush=True)


def check_other_servers(editor, project):
    cases = [
        ('script.sh', '#!/bin/bash\necho hello\n', 'bashls'),
        ('data.json', '{"example": true}\n', 'jsonls'),
        ('config.yaml', 'example: true\n', 'yamlls'),
        ('index.html', '<!DOCTYPE html>\n<html><body></body></html>\n', 'html'),
        ('style.css', 'body { color: red; }\n', 'cssls'),
        ('document.tex', '\\documentclass{article}\n\\begin{document}\nHello\n\\end{document}\n', 'texlab'),
        ('probe.ts', 'function dotfilesCompletionProbe(): number { return 42; }\n\n', 'ts_ls'),
    ]
    (project / 'package.json').write_text('{"private":true}\n')
    (project / 'tsconfig.json').write_text('{"compilerOptions":{"strict":true}}\n')
    for name, text, server in cases:
        path = project / name
        path.write_text(text)
        editor.open(path, server)
    editor.keys(b'AdotfilesCompl')
    editor.menu('dotfilesCompletionProbe')
    editor.keys(b'\t\r')
    editor.wait(lambda: editor.query('vim.api.nvim_get_current_line()') == 'dotfilesCompletionProbe',
                'TypeScript completion acceptance')
    print('  TypeScript identifier autocompletion + Tab + Enter passed.', flush=True)


def main():
    if sys.platform != 'linux':
        raise SystemExit('Run with Linux Python (Ubuntu 24.04 or WSL).')
    arch = {'x86_64': 'amd64', 'aarch64': 'arm64'}[platform.machine()]
    versions = json.loads((REPO / 'installer/versions.json').read_text())
    with tempfile.TemporaryDirectory(prefix='dotfiles-lsp-test-') as temp:
        root = Path(temp)
        home = root / 'home'
        project = root / 'project'
        home.mkdir()
        project.mkdir()
        (project / '.git').mkdir()
        env = {key: value for key, value in os.environ.items()
               if key not in ('TMUX', 'TMUX_PANE', 'NVIM', 'VIM', 'VIMRUNTIME', 'PYTHONPATH', 'PYTHONHOME',
                              'BASH_ENV', 'ENV', 'NODE_PATH', 'NODE_OPTIONS')
               and not key.upper().startswith(('UV_', 'NPM_CONFIG_'))}
        env.update(HOME=str(home), XDG_CONFIG_HOME=str(home / '.config'), XDG_DATA_HOME=str(home / '.local/share'),
                   XDG_STATE_HOME=str(home / '.local/state'), XDG_CACHE_HOME=str(home / '.cache'),
                   XDG_RUNTIME_DIR=str(root), NVIM_APPNAME='nvim', GIT_CONFIG_GLOBAL='/dev/null',
                   GIT_CONFIG_NOSYSTEM='1', TERM='xterm-256color', LANG='C.UTF-8', LC_ALL='C.UTF-8',
                   PATH='/usr/bin:/bin', UV_CACHE_DIR=str(root / 'uv-cache'), UV_PYTHON_DOWNLOADS='never',
                   UV_TOOL_DIR=str(home / '.local/share/uv/tools'), UV_TOOL_BIN_DIR=str(home / '.local/bin'),
                   NPM_CONFIG_USERCONFIG=str(root / 'empty-npmrc'), NPM_CONFIG_GLOBALCONFIG=str(root / 'empty-global-npmrc'),
                   NPM_CONFIG_CACHE=str(root / 'npm-cache'))
        runner = Runner(root / 'commands.log')
        nvim = next(unpack(runner, versions, 'neovim', arch, root).glob('*/bin/nvim'))
        node = next(unpack(runner, versions, 'node', arch, root).glob('*/bin/node'))
        texlab = unpack(runner, versions, 'texlab', arch, root) / 'texlab'
        prefix = home / '.local'
        env['PATH'] = ':'.join([str(prefix / 'bin'), str(node.parent), str(texlab.parent), '/usr/bin', '/bin'])
        packages = [name + '@' + version for name, version in versions['npm_language_servers'].items()]
        packages.append('basedpyright@' + versions['basedpyright'])
        subprocess.run([node, node.parent.parent / 'lib/node_modules/npm/bin/npm-cli.js', 'install', '--global',
                        '--prefix', prefix, '--ignore-scripts', '--no-fund', '--no-audit', *packages],
                       env=env, check=True, timeout=180)
        prepare_clangd(root, env)
        editor = Editor(nvim, root, env)
        try:
            check_completion(editor, project)
            check_cpp_completion(editor, project)
            check_other_servers(editor, project)
            check_text_completion(editor, project)
            panes = subprocess.check_output([editor.tmux, '-S', str(editor.tmux_socket), 'list-panes', '-a'],
                                            env=env, text=True, timeout=5).splitlines()
            assert len(panes) == 1, 'Completion shortcuts unexpectedly split the tmux pane'
            logfile = home / '.local/state/nvim/lsp.log'
            if logfile.exists():
                assert 'Cannot read properties of null' not in logfile.read_text(errors='replace'), \
                    'Language server failed because its configuration contains null settings'
        except BaseException:
            print('Editor state: ' + repr(editor.query('{mode=vim.fn.mode(), filetype=vim.bo.filetype, '
                  'executable=vim.fn.exepath("basedpyright-langserver"), enabled=vim.lsp.is_enabled("basedpyright"), '
                  'path=vim.env.PATH, error=vim.v.errmsg, notifications=_G.dotfiles_test_notifications, '
                  'eventignore=vim.o.eventignore, logpath=vim.lsp.log.get_filename(), '
                  'clients=vim.tbl_map(function(c) return c.name end, vim.lsp.get_clients())}')),
                  file=sys.stderr)
            logfile = home / '.local/state/nvim/lsp.log'
            if logfile.exists():
                print('LSP log tail:\n' + logfile.read_text(errors='replace')[-6000:], file=sys.stderr)
            raise
        finally:
            editor.close()
    print('Real LSP initialization and keyboard completion inside configured tmux passed.')


if __name__ == '__main__':
    main()
