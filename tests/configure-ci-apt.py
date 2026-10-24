#!/usr/bin/env python3
"""Use public Ubuntu archives in disposable GitHub Actions runners.

Azure's mirror can trickle package data until the job times out. Keep the
runner's official archive/security fallbacks and all repository verification.
See https://github.com/actions/runner-images/issues/14823.
This helper is not part of the dotfiles installer.
"""
import os
from pathlib import Path
import re


AZURE = re.compile(r'(?<!\S)https?://azure\.archive\.ubuntu\.com/ubuntu/?(?=\s|$)')
ARCHIVE = 'https://archive.ubuntu.com/ubuntu/'


def public_source(text):
    return AZURE.sub(ARCHIVE, text)


def public_mirrors(text):
    lines = text.splitlines(keepends=True)
    remaining = [line for line in lines if not AZURE.match(line.lstrip())]
    if any(line.strip() and not line.lstrip().startswith('#') for line in remaining):
        return ''.join(remaining)
    # A mirror list containing only Azure still needs a usable source.
    return public_source(text)


def configure(apt):
    changed = []
    for relative, transform in (
        ('apt-mirrors.txt', public_mirrors),
        ('sources.list', public_source),
        ('sources.list.d/ubuntu.sources', public_source),
    ):
        path = apt / relative
        if not path.is_file():
            continue
        old = path.read_text(encoding='utf-8')
        new = transform(old)
        if old != new:
            path.write_text(new, encoding='utf-8')
            changed.append(relative)
    return changed


def main():
    if os.environ.get('GITHUB_ACTIONS') != 'true' or os.geteuid() != 0:
        raise SystemExit('This helper requires root inside GitHub Actions.')
    changed = configure(Path('/etc/apt'))
    print('CI APT: ' + (', '.join(changed) if changed else 'no Azure override needed'))


if __name__ == '__main__':
    main()
