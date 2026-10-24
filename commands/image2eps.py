#!/usr/bin/python3
"""Convert PNG/JPEG to a white-backed RGB EPS without changing ImageMagick policy."""
import argparse
import os
from pathlib import Path
import sys
import tempfile

MAX_EXIF_BYTES = 1024 * 1024


def check_exif(image):
    data = image.info.get('exif', b'')
    # Bound EXIF work and reject the repeated prefix behind CVE-2026-96643.
    # Normal JPEG EXIF has one prefix; normal PNG EXIF is normalized by Pillow.
    if len(data) > MAX_EXIF_BYTES or data.startswith(b'Exif\x00\x00' * 2):
        raise ValueError('Refusing oversized or malformed EXIF metadata.')


def convert(source: Path, destination: Path, expected_format: str):
    try:
        from PIL import Image, ImageOps
    except ImportError as error:
        raise RuntimeError('Pillow is required: sudo apt install python3-pil') from error

    if destination.exists() or destination.is_symlink():
        raise FileExistsError(f'Refusing to overwrite: {destination}')
    if expected_format not in ('PNG', 'JPEG'):
        raise ValueError('Only PNG and JPEG inputs are supported.')
    # Restrict decoder selection before inspecting any untrusted file contents.
    # A filename extension does not keep Image.open from invoking FPX/TIFF/etc.
    with Image.open(source, formats=[expected_format]) as original:
        if original.format != expected_format:
            raise ValueError(f'Expected {expected_format}, found {original.format}: {source}')
        check_exif(original)
        # PNG can place eXIf after IDAT. Read those chunks before EXIF parsing;
        # the cap bounds parsing work, not the decoder's initial chunk read.
        original.load()
        check_exif(original)
        foreground = ImageOps.exif_transpose(original).convert('RGBA')
        background = Image.new('RGBA', foreground.size, 'white')
        background.alpha_composite(foreground)
        rgb = background.convert('RGB')
    destination.parent.mkdir(parents=True, exist_ok=True)
    # Commit without replacing any existing file, including a concurrently created one.
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(prefix='.image2eps-', suffix='.eps', dir=destination.parent, delete=False) as output:
            temporary = Path(output.name)
            rgb.save(output, format='EPS')
        os.link(temporary, destination)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--format', choices=('png', 'jpg'), required=True)
    parser.add_argument('input', type=Path, help='Input path, with or without its PNG/JPG extension')
    parser.add_argument('output', nargs='?', type=Path, help='Output path; .eps is appended if omitted')
    args = parser.parse_args(argv)
    source = args.input
    known = ('.png',) if args.format == 'png' else ('.jpg', '.jpeg')
    if not source.exists() and source.suffix.lower() not in known:
        source = Path(str(source) + '.' + args.format)
    destination = args.output
    if destination is None:
        destination = Path('eps') / (source.stem + '.eps') if args.format == 'png' else source.with_suffix('.eps')
    elif destination.suffix.lower() != '.eps':
        destination = Path(str(destination) + '.eps')
    try:
        convert(source, destination, 'PNG' if args.format == 'png' else 'JPEG')
    except (OSError, RuntimeError, ValueError) as error:
        print(f'image2eps: {error}', file=sys.stderr)
        return 1
    print(destination)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
