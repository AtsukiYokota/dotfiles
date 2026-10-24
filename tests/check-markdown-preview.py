#!/usr/bin/env python3
"""Test pinned Markdown preview in an isolated home; --browser uses Playwright.

The browser opener is replaced by an argv recorder. --browser renders the real
local preview page in headless Chromium and checks updates without reloading.
"""
import argparse
import base64
import hashlib
import http.client
import json
import os
from pathlib import Path
import platform
import socket
import subprocess
import sys
import tarfile
import tempfile
from types import SimpleNamespace
import urllib.parse
import urllib.request

sys.dont_write_bytecode = True
REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / 'installer'))
from runtime import Runner
from deploy import Backup
from preview_assets import install_preview_assets
from actions import install_archive


def record(kind, **values):
    with Path(os.environ['MD_TEST_EVENTS']).open('a', encoding='utf-8') as out:
        out.write(json.dumps(dict(kind=kind, **values), ensure_ascii=False) + '\n')


def client(url, browser):
    # First prove HTML and relative image requests are served locally.
    request = urllib.request.Request(url, headers={'Accept': 'text/html'})
    with urllib.request.urlopen(request, timeout=10) as response:
        html = response.read().decode('utf-8')
        assert response.headers['Content-Type'] == 'text/html; charset=UTF-8'
        assert "script-src 'self'" in response.headers['Content-Security-Policy']
        assert response.headers['X-Content-Type-Options'] == 'nosniff'
    assert 'InitialPreview' in html and '日本語' in html
    assert '/live-preview.nvim/static/markdown/markdown-it.min.js' in html
    with urllib.request.urlopen(urllib.parse.urljoin(url, 'image.png'), timeout=10) as response:
        assert response.read().startswith(b'\x89PNG\r\n\x1a\n')
    parsed = urllib.parse.urlsplit(url)
    origin = f'http://127.0.0.1:{parsed.port}'
    def rejected(path, **headers):
        connection = http.client.HTTPConnection(parsed.hostname, parsed.port, timeout=10)
        try:
            connection.request('GET', path, headers=headers)
            response = connection.getresponse()
            assert response.status == 403, (path, headers, response.status)
            assert b'FixturePrivate' not in response.read()
        finally:
            connection.close()
    for path in ('/../private.md', '/%2e%2e/private.md', '/outside.md', '/.hidden.md', '/public.md',
                 '/live-preview.nvim/README.md', '/live-preview.nvim/static/../../README.md'):
        rejected(path)
    rejected(parsed.path, Host='untrusted.example')
    rejected(parsed.path, Origin='http://untrusted.example')
    for headers in ({}, {'Origin': 'http://untrusted.example'}):
        rejected('/', Upgrade='websocket', Connection='Upgrade',
                 **{'Sec-WebSocket-Key': base64.b64encode(os.urandom(16)).decode(),
                    'Sec-WebSocket-Version': '13'}, **headers)
    with urllib.request.urlopen(origin + '/live-preview.nvim/static/markdown/main.js', timeout=10) as response:
        script = response.read()
        assert b'html: false' in script and b'html: true' not in script
    manifest = json.loads((Path(os.environ['XDG_DATA_HOME']) / 'dotfiles/preview-assets.json').read_text())
    for relative in ('static/markdown/markdown-it.min.js', 'static/markdown/markdown-it-emoji.min.js', 'static/katex/katex.min.js',
                     'static/katex/katex.min.css', 'static/mermaid/mermaid.min.js'):
        for request_path in (relative, relative.replace('static/', 'static//', 1)):
            with urllib.request.urlopen(origin + '/live-preview.nvim/' + request_path, timeout=10) as response:
                assert hashlib.sha256(response.read()).hexdigest() == manifest['files'][relative]['sha256'], \
                    'An unreviewed plugin-bundled asset was served'
    expected = ('EditPreview', 'SavedPreview', 'SavedAgain')
    if browser:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as playwright:
            chromium = playwright.chromium.launch(headless=True)
            page = chromium.new_page()
            page.on('pageerror', lambda error: print('Preview browser error: ' + str(error), file=sys.stderr, flush=True))
            external = []
            def local_only(route):
                if urllib.parse.urlsplit(route.request.url).hostname == '127.0.0.1':
                    route.continue_()
                else:
                    external.append(route.request.url)
                    route.abort()
            page.route('**/*', local_only)
            page.goto(url)
            page.wait_for_function("() => document.querySelector('h1')?.textContent.includes('InitialPreview')")
            page.wait_for_function("() => document.querySelector('img')?.complete && document.querySelector('img')?.naturalWidth > 0")
            page.wait_for_function("() => typeof socket !== 'undefined' && socket.readyState === WebSocket.OPEN")
            page.wait_for_function("() => document.querySelector('.katex') !== null")
            page.wait_for_function("() => document.querySelector('.language-mermaid svg') !== null")
            assert '😄' in page.locator('.markdown-body').inner_text()
            assert page.evaluate('() => mermaid.mermaidAPI.getConfig().securityLevel') == 'strict'
            fallback = page.evaluate("""() => {
                const render = katex.renderToString;
                katex.renderToString = () => { throw new Error('Fixture render failure'); };
                try { return md.render('$<img src=x onerror=alert(1)>$'); }
                finally { katex.renderToString = render; }
            }""")
            assert '<img' not in fallback and '&#60;img' in fallback
            assert page.evaluate('typeof window.previewInjected') == 'undefined'
            assert page.locator('.markdown-body iframe, .markdown-body script').count() == 0
            page.evaluate("() => { window.previewReceived = []; socket.addEventListener('message', e => window.previewReceived.push(e.data)); }")
            record('ready', rendered=True)
            for marker in expected:
                page.wait_for_function("marker => document.querySelector('h1')?.textContent.includes(marker)", arg=marker)
                assert '日本語' in page.locator('.markdown-body').inner_text()
                page.wait_for_function("() => document.querySelector('.katex') !== null && document.querySelector('.language-mermaid svg') !== null")
                record('update', marker=marker, rendered=True)
            assert not external, f'Unexpected remote page resources: {external}'
            assert 'FixturePrivate' not in ''.join(page.evaluate('() => window.previewReceived'))
            chromium.close()
        return
    with socket.create_connection((parsed.hostname, parsed.port), timeout=10) as connection:
        key = base64.b64encode(os.urandom(16)).decode('ascii')
        connection.sendall((f'GET / HTTP/1.1\r\nHost: 127.0.0.1:{parsed.port}\r\n'
                            f'Origin: {origin}\r\n'
                            f'Upgrade: websocket\r\nConnection: Upgrade\r\n'
                            f'Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n').encode())
        reader = connection.makefile('rb')
        assert reader.readline().startswith(b'HTTP/1.1 101 ')
        while reader.readline() != b'\r\n':
            pass
        record('ready', rendered=False)
        for marker in expected:
            while True:
                header = reader.read(2)
                assert len(header) == 2, 'WebSocket closed before the update'
                length = header[1] & 127
                if length == 126:
                    length = int.from_bytes(reader.read(2), 'big')
                elif length == 127:
                    length = int.from_bytes(reader.read(8), 'big')
                message = json.loads(reader.read(length))
                assert 'FixturePrivate' not in json.dumps(message), 'Hidden buffer was broadcast'
                if message.get('type') == 'update' and marker in message.get('content', ''):
                    assert '日本語' in message['content']
                    record('update', marker=marker, rendered=False)
                    break


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--browser', action='store_true')
    parser.add_argument('--client', help=argparse.SUPPRESS)
    args = parser.parse_args()
    if args.client:
        client(args.client, args.browser)
        return
    if sys.platform != 'linux':
        parser.error('Run under Linux / WSL.')
    arch = {'x86_64': 'amd64', 'aarch64': 'arm64'}[platform.machine()]
    versions = json.loads((REPO / 'installer/versions.json').read_text())
    version = versions['neovim'][arch]
    commit = json.loads((REPO / 'configs/nvim/lazy-lock.json').read_text())['live-preview.nvim']['commit']
    with tempfile.TemporaryDirectory(prefix='dotfiles-markdown-test-') as temp:
        root = Path(temp)
        archive = root / 'nvim.tar.gz'
        Runner(root / 'commands.log').download(version['url'], archive, version['sha256'])
        with tarfile.open(archive) as bundle:
            bundle.extractall(root, filter='data')
        nvim = next(root.glob('nvim-linux-*/bin/nvim'))
        plugin = root / 'live-preview.nvim'
        subprocess.run(['git', 'init', '-q', str(plugin)], check=True)
        subprocess.run(['git', '-C', str(plugin), 'fetch', '--quiet', '--depth=1',
                        'https://github.com/brianhuster/live-preview.nvim.git', commit], check=True, timeout=120)
        subprocess.run(['git', '-C', str(plugin), 'checkout', '--quiet', 'FETCH_HEAD'], check=True)
        home, binaries = root / 'home', root / 'bin'
        home.mkdir()
        binaries.mkdir()
        context = SimpleNamespace(
            repo=REPO, arch=arch, home=home, data=home / '.local/share/dotfiles', temp=root,
            versions=versions, runner=Runner(root / 'assets.log'),
            backup=Backup(home / '.local/state/assets-backup', home),
        )
        if versions['markdown_preview'].get('mermaid_bundle'):
            install_archive(context, 'node', {'node': 'bin/node', 'npm': 'bin/npm', 'npx': 'bin/npx'})
        install_preview_assets(context)
        opener = binaries / 'explorer.exe'
        opener.write_text(f'#!{sys.executable}\nimport json, os, sys\nfrom pathlib import Path\n'
                          'with Path(os.environ["MD_TEST_OPENED"]).open("a") as out:\n'
                          '    out.write(json.dumps(sys.argv[1:]) + "\\n")\n')
        opener.chmod(0o755)
        environment = dict(os.environ)
        # Keep the installed browser cache visible after isolating HOME/XDG.
        environment.setdefault('PLAYWRIGHT_BROWSERS_PATH',
                               str(Path(os.environ.get('XDG_CACHE_HOME', Path.home() / '.cache')) / 'ms-playwright'))
        environment.update(
            HOME=str(home), XDG_CONFIG_HOME=str(home / '.config'),
            XDG_DATA_HOME=str(home / '.local/share'), XDG_STATE_HOME=str(home / '.local/state'),
            XDG_CACHE_HOME=str(home / '.cache'), NVIM_APPNAME='nvim',
            PATH=str(binaries) + os.pathsep + os.environ.get('PATH', ''),
            WSL_DISTRO_NAME='dotfiles-test', DISPLAY='', WAYLAND_DISPLAY='',
            MD_TEST_ROOT=str(root), MD_TEST_REPO=str(REPO), MD_TEST_PLUGIN=str(plugin),
            MD_TEST_PYTHON=sys.executable, MD_TEST_BROWSER='1' if args.browser else '0',
            MD_TEST_EVENTS=str(root / 'events.jsonl'), MD_TEST_OPENED=str(root / 'opened.jsonl'),
            GIT_CONFIG_GLOBAL='/dev/null', GIT_CONFIG_NOSYSTEM='1',
        )
        subprocess.run([str(nvim), '--headless', '-u', 'NONE', '-i', 'NONE', '-l',
                        str(REPO / 'tests/nvim-markdown-preview.lua')], env=environment, check=True, timeout=120)
    print('Markdown preview passed: local server, UTF-8/assets, edit/save updates and stop'
          + ('; real Chromium rendering verified.' if args.browser else '.'))


if __name__ == '__main__':
    main()
