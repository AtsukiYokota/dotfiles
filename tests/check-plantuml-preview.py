#!/usr/bin/env python3
"""Exercise the pinned real PlantUML locally, without installing OS packages."""
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path
import shlex
import shutil
import subprocess
import sys
import tempfile
import threading

from PIL import Image

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
from runtime import Runner


def main():
    java = shutil.which('java')
    if sys.platform != 'linux' or not java:
        raise RuntimeError('Run on Linux with Java 21+ and python3-pil available.')
    version = json.loads((ROOT / 'installer/versions.json').read_text())['plantuml']
    with tempfile.TemporaryDirectory(prefix='dotfiles-plantuml-test-') as temporary:
        root = Path(temporary)
        jar = root / 'plantuml.jar'
        Runner(root / 'commands.log').download(version['url'], jar, version['sha256'])
        compiler = root / 'plantuml'
        compiler.write_text('#!/bin/sh\nexec ' + shlex.quote(java) + ' -Djava.awt.headless=true -jar '
                            + shlex.quote(str(jar)) + ' "$@"\n', encoding='utf-8')
        compiler.chmod(0o755)
        environment = dict(os.environ, PATH=str(root) + os.pathsep + os.environ['PATH'])
        for name in ('JAVA_TOOL_OPTIONS', '_JAVA_OPTIONS', 'JDK_JAVA_OPTIONS'):
            environment[name] = '-DPLANTUML_SECURITY_PROFILE=INSECURE'
        project = root / 'project: with spaces'
        project.mkdir()
        source = project / '日本語 with spaces.puml'
        include = project / 'messages.iuml'
        include.write_text('A -> B: 日本語 English\n', encoding='utf-8')
        diagram = '@startuml\n!include <C4/C4_Context>\nA -> B: 日本語 English\n@enduml\n'
        source.write_text(diagram, encoding='utf-8')
        output = root / 'preview.png'
        command = [sys.executable, str(ROOT / 'commands/plantuml-render.py'), str(source), str(output)]
        subprocess.run(command, env=environment, check=True, timeout=75)
        initial = output.read_bytes()
        with Image.open(output) as image:
            width, height = image.size
            assert width > 50 and height > 50
        source.write_text(diagram.replace('日本語 English', '保存した更新 / saved change'), encoding='utf-8')
        subprocess.run(command, env=environment, check=True, timeout=75)
        assert output.read_bytes() != initial, 'the preview did not reflect the saved source'
        source.write_text(diagram + diagram, encoding='utf-8')
        subprocess.run(command, env=environment, check=True, timeout=75)
        with Image.open(output) as image:
            assert image.height >= height * 2, 'multiple diagrams were lost'
        successful = output.read_bytes()
        source.write_text('@startuml\nnot a valid diagram &*&\n@enduml\n', encoding='utf-8')
        failed = subprocess.run(command, env=environment, capture_output=True, text=True, timeout=75)
        assert failed.returncode != 0, 'syntax error was accepted'
        assert output.read_bytes() == successful, 'compiler error overwrote the previous preview'
        outside = root / 'private.iuml'
        outside.write_text('A -> B: FixturePrivate\n', encoding='utf-8')
        (project / 'outside.iuml').symlink_to(outside)
        requests = []
        class FixtureHandler(BaseHTTPRequestHandler):
            def do_GET(self):
                requests.append(self.path)
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'A -> B: FixtureRemote\n')
            def log_message(self, *_args):
                pass
        with ThreadingHTTPServer(('127.0.0.1', 0), FixtureHandler) as server:
            worker = threading.Thread(target=server.serve_forever, daemon=True)
            worker.start()
            try:
                url = f'http://127.0.0.1:{server.server_port}/messages.iuml'
                for forbidden in ('messages.iuml', '../private.iuml', 'outside.iuml', url):
                    source.write_text(f'@startuml\n!include {forbidden}\n@enduml\n', encoding='utf-8')
                    failed = subprocess.run(command, env=environment, capture_output=True, text=True, timeout=75)
                    assert failed.returncode != 0, f'Forbidden include accepted: {forbidden}'
                    assert output.read_bytes() == successful, 'forbidden include replaced the preview'
                assert not requests, 'PlantUML preview fetched a remote resource'
            finally:
                server.shutdown()
                worker.join(timeout=5)
    print('Real PlantUML: UTF-8/Japanese, bundled standard library, saved changes, multiple diagrams, '
          'error retention and blocked file/network includes passed.')


if __name__ == '__main__':
    main()
