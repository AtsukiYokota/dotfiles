#!/usr/bin/env python3
"""Pillow conversion checks using generated tiny images and temporary output only."""
import importlib.util
import os
from pathlib import Path
import sys
import tempfile
import unittest

from PIL import Image

REPO = Path(__file__).resolve().parents[1]
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location('image2eps', REPO / 'commands/image2eps.py')
image2eps = importlib.util.module_from_spec(spec)
spec.loader.exec_module(image2eps)


class ImageConversionTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='dotfiles-eps-')
        self.root = Path(self.temporary.name)

    def tearDown(self):
        self.temporary.cleanup()

    def test_transparent_png_becomes_white_rgb_eps(self):
        source = self.root / 'transparent image.png'
        destination = self.root / 'output dir' / 'result.eps'
        Image.new('RGBA', (1, 1), (255, 0, 0, 0)).save(source)
        image2eps.convert(source, destination, 'PNG')
        contents = destination.read_text(encoding='ascii')
        self.assertTrue(contents.startswith('%!PS-Adobe'))
        self.assertIn('%%BoundingBox: 0 0 1 1', contents)
        self.assertIn('false 3 colorimage', contents)
        self.assertIn('ffffff', contents.lower())
        self.assertEqual(list(destination.parent.glob('.image2eps-*')), [])

    def test_jpeg_legacy_basenames_and_extension(self):
        source = self.root / 'photo with spaces.jpg'
        Image.new('RGB', (2, 3), 'blue').save(source)
        destination = self.root / 'result with spaces'
        self.assertEqual(image2eps.main(['--format', 'jpg', str(source.with_suffix('')), str(destination)]), 0)
        self.assertTrue(Path(str(destination) + '.eps').is_file())

    def test_png_legacy_default_output_directory(self):
        source = self.root / 'chart.v1.png'
        Image.new('RGB', (1, 1), 'red').save(source)
        previous = Path.cwd()
        try:
            os.chdir(self.root)
            self.assertEqual(image2eps.main(['--format', 'png', 'chart.v1']), 0)
        finally:
            os.chdir(previous)
        self.assertTrue((self.root / 'eps/chart.v1.eps').is_file())

    def test_existing_output_is_never_overwritten(self):
        source = self.root / 'input.png'
        destination = self.root / 'existing.eps'
        Image.new('RGB', (1, 1), 'red').save(source)
        destination.write_bytes(b'keep existing file')
        self.assertEqual(image2eps.main(['--format', 'png', str(source), str(destination)]), 1)
        self.assertEqual(destination.read_bytes(), b'keep existing file')

    def test_invalid_image_creates_no_output(self):
        source = self.root / 'broken.png'
        destination = self.root / 'broken.eps'
        source.write_bytes(b'not an image')
        self.assertEqual(image2eps.main(['--format', 'png', str(source), str(destination)]), 1)
        self.assertFalse(destination.exists())

    def test_wrong_image_format_is_rejected(self):
        source = self.root / 'actually jpeg.png'
        Image.new('RGB', (1, 1), 'red').save(source, format='JPEG')
        destination = self.root / 'wrong.eps'
        self.assertEqual(image2eps.main(['--format', 'png', str(source), str(destination)]), 1)
        self.assertFalse(destination.exists())

    def test_destination_created_during_conversion_is_preserved(self):
        source = self.root / 'input.png'
        destination = self.root / 'concurrent.eps'
        Image.new('RGB', (1, 1), 'red').save(source)
        real_link = image2eps.os.link

        def concurrent_link(temporary, output):
            destination.write_bytes(b'concurrent writer')
            return real_link(temporary, output)

        image2eps.os.link = concurrent_link
        try:
            self.assertEqual(image2eps.main(['--format', 'png', str(source), str(destination)]), 1)
        finally:
            image2eps.os.link = real_link
        self.assertEqual(destination.read_bytes(), b'concurrent writer')
        self.assertEqual(list(self.root.glob('.image2eps-*')), [])


if __name__ == '__main__':
    unittest.main(verbosity=2)
