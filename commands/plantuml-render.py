#!/usr/bin/python3
"""Render a saved UTF-8 PlantUML source into one atomic local preview image."""
from __future__ import annotations

import argparse
import io
import os
from pathlib import Path
import signal
import struct
import subprocess
import sys
import tempfile

from PIL import Image

PNG = b'\x89PNG\r\n\x1a\n'
MAX_PIXELS = 40_000_000
MAX_OUTPUT = 64 * 1024 * 1024


def split_pngs(data: bytes) -> list[bytes]:
    """PlantUML -pipe writes one complete PNG after another for multiple diagrams."""
    images = []
    position = 0
    while position < len(data):
        start = position
        if data[position:position + 8] != PNG:
            raise ValueError('PlantUML did not return a complete PNG image.')
        position += 8
        while True:
            if position + 12 > len(data):
                raise ValueError('PlantUML returned a truncated PNG image.')
            size = struct.unpack('>I', data[position:position + 4])[0]
            kind = data[position + 4:position + 8]
            position += 12 + size
            if position > len(data):
                raise ValueError('PlantUML returned a truncated PNG chunk.')
            if kind == b'IEND':
                images.append(data[start:position])
                break
    if not images:
        raise ValueError('No diagram was produced. Check @startuml and @enduml.')
    return images


def publish_png(data: bytes, output: Path):
    if len(data) > MAX_OUTPUT:
        raise ValueError('The diagram is too large for live preview (64 MiB).')
    images = []
    try:
        for encoded in split_pngs(data):
            with Image.open(io.BytesIO(encoded)) as image:
                if image.width * image.height > MAX_PIXELS:
                    raise ValueError('The diagram is too large for live preview (40 million pixels).')
                images.append(image.convert('RGBA'))
        gap = 24
        width = max(image.width for image in images)
        height = sum(image.height for image in images) + gap * (len(images) - 1)
        if width * height > MAX_PIXELS:
            raise ValueError('The combined diagrams are too large for live preview (40 million pixels).')
        with Image.new('RGB', (width, height), 'white') as combined:
            top = 0
            for image in images:
                combined.paste(image, ((width - image.width) // 2, top), image)
                top += image.height + gap
            staged = None
            try:
                with tempfile.NamedTemporaryFile(dir=output.parent, prefix='.preview-', suffix='.png', delete=False) as handle:
                    staged = Path(handle.name)
                    combined.save(handle, format='PNG')
                staged.replace(output)
            finally:
                if staged is not None:
                    staged.unlink(missing_ok=True)
    finally:
        for image in images:
            image.close()


def render(source: Path, output: Path, *, executable='plantuml', timeout=60):
    source = source.resolve(strict=True)
    content = source.read_text(encoding='utf-8-sig')
    # Argument lists and stdin keep filenames, Japanese text, and shell characters literal.
    command = [executable, '-tpng', '-charset', 'UTF-8', '-nometadata', '-pipe',
               '-SdefaultFontName=Noto Sans CJK JP']
    process = subprocess.Popen(command, cwd=source.parent, stdin=subprocess.PIPE,
                               stdout=subprocess.PIPE, stderr=subprocess.PIPE, start_new_session=True)
    try:
        result, errors = process.communicate(content.encode('utf-8'), timeout=timeout)
    finally:
        if process.poll() is None:
            # Cancel the compiler as well when Neovim stops its helper process.
            os.killpg(process.pid, signal.SIGTERM)
            try:
                process.wait(timeout=2)
            except subprocess.TimeoutExpired:
                os.killpg(process.pid, signal.SIGKILL)
                process.wait(timeout=2)
    if process.returncode != 0:
        detail = errors.decode('utf-8', errors='replace').strip()
        raise RuntimeError(detail or f'PlantUML compilation failed (exit {process.returncode}).')
    publish_png(result, output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    # vim.system:kill(SIGTERM) must reach the running JVM instead of orphaning it.
    def cancelled(_signum, _frame):
        raise KeyboardInterrupt
    signal.signal(signal.SIGTERM, cancelled)
    try:
        render(args.source, args.output)
    except KeyboardInterrupt:
        return 130
    except (OSError, ValueError, RuntimeError, subprocess.TimeoutExpired) as error:
        print(str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
