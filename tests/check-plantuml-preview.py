#!/usr/bin/env python3
"""Exercise the pinned real PlantUML locally, without installing OS packages."""
import json
import os
from pathlib import Path
import shlex
import shutil
import subprocess
import sys
import tempfile

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
        source = root / '日本語 with spaces.puml'
        include = root / 'messages.iuml'
        include.write_text('A -> B: 日本語 English\n', encoding='utf-8')
        diagram = '@startuml\n!include messages.iuml\n@enduml\n'
        source.write_text(diagram, encoding='utf-8')
        output = root / 'preview.png'
        command = [sys.executable, str(ROOT / 'commands/plantuml-render.py'), str(source), str(output)]
        subprocess.run(command, env=environment, check=True, timeout=75)
        initial = output.read_bytes()
        with Image.open(output) as image:
            width, height = image.size
            assert width > 50 and height > 50
        include.write_text('A -> B: 保存した更新 / saved change\n', encoding='utf-8')
        subprocess.run(command, env=environment, check=True, timeout=75)
        assert output.read_bytes() != initial, 'the preview did not reflect the changed include'
        source.write_text(diagram + diagram, encoding='utf-8')
        subprocess.run(command, env=environment, check=True, timeout=75)
        with Image.open(output) as image:
            assert image.height >= height * 2, 'multiple diagrams were lost'
        successful = output.read_bytes()
        source.write_text('@startuml\nnot a valid diagram &*&\n@enduml\n', encoding='utf-8')
        failed = subprocess.run(command, env=environment, capture_output=True, text=True, timeout=75)
        assert failed.returncode != 0, 'syntax error was accepted'
        assert output.read_bytes() == successful, 'compiler error overwrote the previous preview'
    print('Real PlantUML: UTF-8/Japanese, relative includes, changed content, multiple diagrams and error retention passed.')


if __name__ == '__main__':
    main()
