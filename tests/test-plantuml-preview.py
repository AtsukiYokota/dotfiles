#!/usr/bin/env python3
"""Offline preview tests: UTF-8 stdin, includes' cwd, atomic output and cancellation."""
import importlib.util
import io
import os
from pathlib import Path
import signal
import shutil
import subprocess
import sys
import tempfile
import time
import unittest

from PIL import Image

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('plantuml_render', ROOT / 'commands/plantuml-render.py')
renderer = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(renderer)


def png(width=10, height=5, color='red'):
    with Image.new('RGB', (width, height), color) as image:
        encoded = io.BytesIO()
        image.save(encoded, format='PNG')
        return encoded.getvalue()


class PreviewTests(unittest.TestCase):
    def setUp(self):
        scratch = tempfile.TemporaryDirectory(prefix='dotfiles-preview-')
        self.addCleanup(scratch.cleanup)
        self.root = Path(scratch.name)
        self.source = self.root / '日本語 $(literal) source.puml'
        self.source.write_text('@startuml\nA -> B: 日本語 English\n@enduml\n', encoding='utf-8')
        self.output = self.root / 'preview.png'

    @unittest.skipUnless(sys.platform == 'linux', 'uses the Ubuntu system interpreter')
    def test_deployed_helper_uses_apt_python_when_virtualenv_shadows_path(self):
        # python3-pil belongs to /usr/bin/python3. A project virtualenv must
        # not change the interpreter chosen by the installed preview helper.
        virtualenv_bin = self.root / 'venv/bin'
        virtualenv_bin.mkdir(parents=True)
        shadow_python = virtualenv_bin / 'python3'
        shadow_python.write_text('#!/bin/sh\nexit 71\n', encoding='utf-8')
        shadow_python.chmod(0o755)
        helper = self.root / 'dotfiles-plantuml-render'
        shutil.copyfile(ROOT / 'commands/plantuml-render.py', helper)
        helper.chmod(0o755)
        environment = dict(os.environ, PATH=str(virtualenv_bin) + os.pathsep + os.environ['PATH'])
        result = subprocess.run([str(helper), '--help'], env=environment,
                                text=True, capture_output=True, timeout=10)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('source output', result.stdout)

    def test_multiple_diagrams_keep_all_images_and_do_not_embed_source(self):
        renderer.publish_png(png() + png(12, 8, 'blue'), self.output)
        with Image.open(self.output) as image:
            self.assertEqual(image.size, (12, 5 + 24 + 8))
            self.assertEqual(image.getpixel((6, 1)), (255, 0, 0))
            self.assertEqual(image.getpixel((6, 32)), (0, 0, 255))
            self.assertEqual(image.info, {})

    def test_bad_or_truncated_output_preserves_last_success(self):
        self.output.write_bytes(b'previous successful image')
        for broken in (b'', b'not png', png()[:-5], png() + b'extra text'):
            with self.subTest(output=broken[:12]):
                with self.assertRaises(ValueError):
                    renderer.publish_png(broken, self.output)
                self.assertEqual(self.output.read_bytes(), b'previous successful image')
        self.assertEqual(list(self.root.glob('.preview-*')), [])

    @unittest.skipUnless(sys.platform == 'linux', 'requires Unix subprocess groups')
    def test_utf8_source_and_relative_working_directory(self):
        compiler = self.root / 'fake plantuml'
        compiler.write_text('#!/usr/bin/env python3\nimport os,sys\n'
                            f'assert os.getcwd() == {str(self.root)!r}\n'
                            "assert sys.stdin.buffer.read().decode('utf-8').find('日本語 English') >= 0\n"
                            "assert '-charset' in sys.argv and 'UTF-8' in sys.argv\n"
                            f'sys.stdout.buffer.write({png()!r})\n', encoding='utf-8')
        compiler.chmod(0o755)
        renderer.render(self.source, self.output, executable=str(compiler))
        with Image.open(self.output) as image:
            self.assertEqual(image.size, (10, 5))

    @unittest.skipUnless(sys.platform == 'linux', 'requires Unix subprocess groups')
    def test_compiler_error_keeps_previous_image(self):
        compiler = self.root / 'failing-plantuml'
        compiler.write_text('#!/bin/sh\necho "Syntax error at line 2" >&2\nexit 1\n', encoding='utf-8')
        compiler.chmod(0o755)
        self.output.write_bytes(b'previous')
        with self.assertRaisesRegex(RuntimeError, 'Syntax error at line 2'):
            renderer.render(self.source, self.output, executable=str(compiler))
        self.assertEqual(self.output.read_bytes(), b'previous')

    @unittest.skipUnless(sys.platform == 'linux', 'requires Unix subprocess groups')
    def test_stopping_helper_terminates_the_compiler(self):
        compiler = self.root / 'plantuml'
        pidfile = self.root / 'compiler.pid'
        compiler.write_text('#!/usr/bin/env python3\nimport os,time\n'
                            f'open({str(pidfile)!r}, "w").write(str(os.getpid()))\n'
                            'time.sleep(60)\n', encoding='utf-8')
        compiler.chmod(0o755)
        env = dict(os.environ, PATH=str(self.root) + os.pathsep + os.environ['PATH'])
        process = subprocess.Popen([sys.executable, str(ROOT / 'commands/plantuml-render.py'), str(self.source), str(self.output)],
                                   env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        self.addCleanup(lambda: process.poll() is None and process.kill())
        deadline = time.monotonic() + 5
        while not pidfile.exists() and time.monotonic() < deadline:
            time.sleep(0.05)
        self.assertTrue(pidfile.exists(), 'compiler never started')
        compiler_pid = int(pidfile.read_text())
        process.send_signal(signal.SIGTERM)
        process.communicate(timeout=5)
        self.assertEqual(process.returncode, 130)
        with self.assertRaises(ProcessLookupError):
            os.kill(compiler_pid, 0)
        self.assertFalse(self.output.exists())


if __name__ == '__main__':
    unittest.main()
