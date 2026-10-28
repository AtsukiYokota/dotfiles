#!/usr/bin/env python3
"""Preserve wsl.conf while enabling Windows process and PATH interoperability.

The installer previews ``patch_config`` as an ordinary user. The privileged
entry point accepts only the expected digest and always edits /etc/wsl.conf.
"""
from __future__ import annotations

import argparse
from contextlib import contextmanager
from datetime import datetime, timezone
import errno
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import sys
import uuid

CONFIG = Path('/etc/wsl.conf')
MAX_BYTES = 1024 * 1024
KEYS = {'enabled': 'enabled', 'appendwindowspath': 'appendWindowsPath'}


def patch_config(content: bytes) -> bytes:
    """Change only the two interop values, retaining unrelated bytes/comments."""
    if not isinstance(content, bytes) or len(content) > MAX_BYTES or b'\x00' in content:
        raise ValueError('wsl.conf must be a UTF-8 text file of at most 1 MiB.')
    try:
        text = content.decode('utf-8-sig')
    except UnicodeDecodeError as error:
        raise ValueError('wsl.conf must contain valid UTF-8 text.') from error
    if '\r' in text.replace('\r\n', ''):
        raise ValueError('Unsupported bare carriage return in wsl.conf.')
    bom = b'\xef\xbb\xbf' if content.startswith(b'\xef\xbb\xbf') else b''
    newline = '\r\n' if '\r\n' in text else '\n'
    lines = text.splitlines(keepends=True)
    section = None
    interop_start = None
    interop_end = len(lines)
    managed = {}
    for index, line in enumerate(lines):
        body = line.rstrip('\r\n')
        if not body.strip() or body.lstrip().startswith(('#', ';')):
            continue
        heading = re.fullmatch(r'[ \t]*\[([^\[\]]+)\][ \t]*(?:[#;].*)?', body)
        if heading:
            if section == 'interop':
                interop_end = index
            section = heading[1].strip().casefold()
            if not section:
                raise ValueError('Empty section in wsl.conf.')
            if section == 'interop':
                if interop_start is not None:
                    raise ValueError('Duplicate [interop] sections in wsl.conf; resolve them before installation.')
                interop_start = index
            continue
        assignment = re.fullmatch(r'([ \t]*)([^=\s\[\]#;]+)([ \t]*=[ \t]*)(.*)', body)
        if not assignment or section is None:
            raise ValueError(f'Malformed wsl.conf entry on line {index + 1}.')
        if section != 'interop' or assignment[2].casefold() not in KEYS:
            continue
        key = assignment[2].casefold()
        if key in managed:
            raise ValueError(f'Duplicate {KEYS[key]} in [interop]; resolve it before installation.')
        managed[key] = index
        # Interop values are booleans, so an inline comment is unambiguous.
        value = re.fullmatch(r'(.*?)([ \t]*(?:[#;].*)?)', assignment[4])
        if value[1].strip().casefold() not in ('true', 'false'):
            raise ValueError(f'Invalid boolean for {KEYS[key]} in wsl.conf.')
        ending = line[len(body):]
        lines[index] = ''.join(assignment.group(1, 2, 3)) + 'true' + value[2] + ending
    if interop_start is None:
        if lines and not lines[-1].endswith('\n'):
            lines[-1] += newline
        lines.extend(['[interop]' + newline, 'enabled=true' + newline, 'appendWindowsPath=true' + newline])
    else:
        missing = [name + '=true' + newline for key, name in KEYS.items() if key not in managed]
        if missing:
            if interop_end and not lines[interop_end - 1].endswith('\n'):
                lines[interop_end - 1] += newline
            lines[interop_end:interop_end] = missing
    return bom + ''.join(lines).encode('utf-8')


def _snapshot(path, *, directory=None):
    """Read one regular file without following a target symlink or FIFO."""
    flags = os.O_RDONLY | getattr(os, 'O_NOFOLLOW', 0) | getattr(os, 'O_NONBLOCK', 0)
    try:
        descriptor = os.open(path, flags, dir_fd=directory)
    except FileNotFoundError:
        return None, None
    except OSError as error:
        if error.errno == errno.ELOOP:
            raise ValueError('Refusing a symbolic link for wsl.conf.') from error
        raise
    try:
        before = os.fstat(descriptor)
        if not stat.S_ISREG(before.st_mode) or before.st_nlink != 1:
            raise ValueError('wsl.conf must be a regular file with no hard links.')
        if before.st_size > MAX_BYTES:
            raise ValueError('wsl.conf exceeds the 1 MiB limit.')
        with os.fdopen(descriptor, 'rb', closefd=False) as source:
            content = source.read(MAX_BYTES + 1)
        after = os.fstat(descriptor)
        if len(content) > MAX_BYTES:
            raise ValueError('wsl.conf exceeds the 1 MiB limit.')
        if _identity(before) != _identity(after):
            raise RuntimeError('wsl.conf changed while being read; review and rerun the installer.')
        return content, after
    finally:
        os.close(descriptor)


def _identity(info):
    if info is None:
        return None
    return (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns,
            info.st_ctime_ns, info.st_mode, info.st_uid, info.st_gid)


def read_config(path=CONFIG) -> bytes | None:
    """Read existing configuration; absence is represented by None."""
    return _snapshot(Path(path))[0]


def fingerprint(content: bytes | None) -> str:
    return 'missing' if content is None else hashlib.sha256(content).hexdigest()


@contextmanager
def _parent_directory(path):
    if not path.is_absolute() or path.parent.resolve() != path.parent:
        raise ValueError('wsl.conf must have an absolute path without symlinked parents.')
    import fcntl
    descriptor = os.open(path.parent, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        # Serialize this helper's writers without adding a mutable lock file.
        fcntl.flock(descriptor, fcntl.LOCK_EX)
        yield descriptor
    finally:
        os.close(descriptor)


def _write_file(directory, name, content, *, info=None, mode=0o600):
    descriptor = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                         0o600, dir_fd=directory)
    with os.fdopen(descriptor, 'wb') as target:
        target.write(content)
        target.flush()
        if info is not None:
            os.fchown(target.fileno(), info.st_uid, info.st_gid)
            mode = stat.S_IMODE(info.st_mode)
        os.fchmod(target.fileno(), mode)
        os.fsync(target.fileno())


def apply_config(path, expected_sha256: str) -> dict:
    """Apply a reviewed patch atomically, after checking for concurrent edits."""
    if expected_sha256 != 'missing' and not re.fullmatch(r'[0-9a-f]{64}', expected_sha256):
        raise ValueError('Expected SHA-256 must be 64 lowercase hex digits or missing.')
    path = Path(path)
    with _parent_directory(path) as directory:
        original, info = _snapshot(path.name, directory=directory)
        if fingerprint(original) != expected_sha256:
            raise RuntimeError('wsl.conf changed since the preview; review and rerun the installer.')
        updated = patch_config(original if original is not None else b'')
        if updated == original:
            return {'changed': False, 'backup': None, 'restart_required': False}
        suffix = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ') + '-' + uuid.uuid4().hex
        temporary = '.' + path.name + '.dotfiles-' + suffix
        backup = None
        try:
            _write_file(directory, temporary, updated, info=info, mode=0o644)
            if original is not None:
                backup = path.name + '.dotfiles-backup-' + suffix
                _write_file(directory, backup, original)
            current, current_info = _snapshot(path.name, directory=directory)
            if current != original or _identity(current_info) != _identity(info):
                raise RuntimeError('wsl.conf changed during installation; no replacement was performed.')
            if original is None:
                # An exclusive link also protects a newly created target from
                # another writer appearing after the last existence check.
                os.link(temporary, path.name, src_dir_fd=directory, dst_dir_fd=directory,
                        follow_symlinks=False)
                os.unlink(temporary, dir_fd=directory)
            else:
                os.replace(temporary, path.name, src_dir_fd=directory, dst_dir_fd=directory)
            os.fsync(directory)
        finally:
            try:
                os.unlink(temporary, dir_fd=directory)
            except FileNotFoundError:
                pass
        return {'changed': True, 'backup': str(path.parent / backup) if backup else None,
                'restart_required': True}


def _is_wsl():
    # Do not trust caller-provided WSL_* environment variables under sudo.
    for path in ('/proc/sys/kernel/osrelease', '/proc/version'):
        try:
            if 'microsoft' in Path(path).read_text(encoding='utf-8').lower():
                return True
        except OSError:
            pass
    return Path('/proc/sys/fs/binfmt_misc/WSLInterop').is_file()


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', required=True)
    parser.add_argument('--expected-sha256', required=True)
    args = parser.parse_args(argv)
    if sys.platform != 'linux' or os.geteuid() != 0 or not _is_wsl():
        raise ValueError('This helper requires root inside WSL and only updates /etc/wsl.conf.')
    print(json.dumps(apply_config(CONFIG, args.expected_sha256)))
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (OSError, ValueError, RuntimeError) as error:
        print(f'Error: {error}', file=sys.stderr)
        raise SystemExit(1)
