#!/usr/bin/env python3
"""Format ROS 2 Jazzy C/C++ or Python without exposing originals to formatters.

File mode writes by default. --check and --dry-run never write source files.
--stdin formats one editor buffer to stdout without touching its named file.
"""
from __future__ import annotations

import argparse
import ast
from dataclasses import dataclass
import difflib
import fnmatch
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import tempfile


EXTENSIONS = {
    'cpp': {'.c', '.cc', '.cpp', '.cxx', '.h', '.hh', '.hpp', '.hxx'},
    'python': {'.py'},
}
DEFAULT_EXCLUDES = {
    'build', 'install', 'log', 'logs', 'devel', '.git', '.hg', '.svn',
    '.venv', 'venv', 'env', '.tox', '.nox', '__pycache__', '.mypy_cache',
    '.pytest_cache', '.ruff_cache', 'node_modules', 'vendor', 'third_party',
    'third-party', 'external', 'generated', 'cmake-build-*',
}
IGNORE_MARKERS = ('AMENT_IGNORE', 'COLCON_IGNORE')


class FormatError(Exception):
    """An input, dependency, formatter or write failure."""


@dataclass
class Change:
    path: Path
    before: bytes
    after: bytes
    identity: tuple


def identity(path):
    info = path.lstat()
    return (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns, info.st_mode)


def has_symlink(path):
    return any(part.is_symlink() for part in (path, *path.parents))


def excluded(path, relative, args):
    patterns = set(args.exclude)
    if not args.include_excluded:
        patterns.update(DEFAULT_EXCLUDES)
    # A bare name matches any path component; a path glob matches root-relative paths.
    if any(fnmatch.fnmatchcase(relative.as_posix(), pattern)
           or any(fnmatch.fnmatchcase(part, pattern) for part in relative.parts)
           for pattern in patterns):
        return True
    return (not args.include_excluded and path.is_dir()
            and any((path / marker).exists() for marker in IGNORE_MARKERS))


def collect_files(args):
    selected = set()
    for argument in args.paths:
        root = Path(os.path.abspath(argument))
        if has_symlink(root):
            print(f'Skipping symlink path: {root}', file=sys.stderr)
            continue
        if not root.exists():
            raise FormatError(f'Path does not exist: {root}')
        if excluded(root, root, args):
            continue
        if root.is_file():
            if root.suffix not in EXTENSIONS[args.language]:
                raise FormatError(f'Unsupported {args.language} extension: {root}')
            selected.add(root)
            continue
        if not root.is_dir():
            raise FormatError(f'Not a regular file or directory: {root}')
        if not args.recursive:
            raise FormatError(f'Directory requires --recursive: {root}')
        for directory, dirs, files in os.walk(root, followlinks=False, onerror=_walk_error):
            directory = Path(directory)
            dirs[:] = sorted(name for name in dirs
                             if not (directory / name).is_symlink()
                             and not excluded(directory / name,
                                              (directory / name).relative_to(root), args))
            for name in sorted(files):
                path = directory / name
                if (path.suffix in EXTENSIONS[args.language] and not path.is_symlink()
                        and path.is_file() and not excluded(path, path.relative_to(root), args)):
                    selected.add(path)
    return sorted(selected)


def _walk_error(error):
    raise FormatError(str(error))


def find_formatter(language):
    name = 'ament_uncrustify' if language == 'cpp' else 'autopep8'
    if language == 'cpp' and os.environ.get('ROS_DISTRO', 'jazzy') != 'jazzy':
        raise FormatError('This formatter targets ROS 2 Jazzy. Open a fresh shell and run ros_env.')
    executable = shutil.which(name)
    if executable is None:
        hint = ('Install ros-jazzy-ament-uncrustify, then run ros_env '
                '(or source /opt/ros/jazzy/setup.bash).'
                if language == 'cpp' else 'Install autopep8 with the dotfiles python module.')
        raise FormatError(f'{name} is unavailable. {hint}')
    return executable


def run_formatter(command, allowed=(0,)):
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            timeout=120, check=False)
    if result.returncode not in allowed:
        detail = (result.stderr + result.stdout).decode('utf-8', errors='replace').strip()
        raise FormatError(f'{Path(command[0]).name} failed ({result.returncode}):\n{detail[-8000:]}')


def python_tree(content):
    class SplitImports(ast.NodeTransformer):
        def visit_Import(self, node):
            # `import a, b` -> two imports is a PEP 8 formatting fix with the same order.
            return [ast.Import(names=[name]) for name in node.names]

    return ast.dump(SplitImports().visit(ast.parse(content)), include_attributes=False)


def format_content(content, filename, language, executable, work):
    # Only a temporary copy is ever passed to an external formatter.
    staged = work / ('input' + Path(filename).suffix)
    staged.write_bytes(content)
    if language == 'cpp':
        # Use Jazzy's own config and convergence loop, including its version-specific cfg.
        # .h is treated as C, as in ament; C++ headers should use .hpp.
        dialect = 'C' if staged.suffix in {'.c', '.h'} else 'CPP'
        command = [executable, '--language', dialect]
        # ament returns 1 for a successful reformat with differences, as well as errors.
        # A second read-only check must succeed before accepting the temporary result.
        run_formatter([*command, '--reformat', '--', str(staged)], allowed=(0, 1))
        run_formatter([*command, '--', str(staged)])
    else:
        try:
            before_tree = python_tree(content)
        except (SyntaxError, ValueError) as error:
            raise FormatError(f'{filename}: invalid Python input: {error}') from error
        empty_config = work / 'empty.ini'
        empty_config.write_text('', encoding='utf-8')
        run_formatter([executable, '--ignore-local-config', '--global-config', str(empty_config),
                       '--max-line-length', '99', '--in-place', str(staged)])
        try:
            after_tree = python_tree(staged.read_bytes())
        except (SyntaxError, ValueError) as error:
            raise FormatError(f'{filename}: formatter produced invalid Python: {error}') from error
        if before_tree != after_tree:
            raise FormatError(f'{filename}: refusing a Python syntax-tree change; originals retained.')
    result = staged.read_bytes()
    if content.strip() and not result.strip():
        raise FormatError(f'{filename}: formatter unexpectedly removed all content; originals retained.')
    return result


def ensure_unchanged(change):
    if (has_symlink(change.path) or identity(change.path) != change.identity
            or change.path.read_bytes() != change.before):
        raise FormatError(f'File changed during formatting; refusing to overwrite: {change.path}')


def stage_replacement(path, content):
    descriptor, name = tempfile.mkstemp(prefix='.ros-format-', dir=path.parent)
    target = Path(name)
    try:
        with os.fdopen(descriptor, 'wb') as stream:
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        shutil.copystat(path, target, follow_symlinks=False)
        return target
    except BaseException:
        target.unlink(missing_ok=True)
        raise


def write_changes(changes):
    """Prepare all writes first, replace per file, and roll back ordinary I/O failures."""
    prepared = []
    committed = []
    try:
        for change in changes:
            ensure_unchanged(change)
            updated = stage_replacement(change.path, change.after)
            prepared.append([change, updated, None])
            backup = stage_replacement(change.path, change.before)
            prepared[-1][2] = backup
            os.utime(updated, None)  # Changed contents must be visible to build tools.
        for change, updated, backup in prepared:
            ensure_unchanged(change)
            os.replace(updated, change.path)
            committed.append((change, backup))
    except BaseException:
        for change, backup in reversed(committed):
            try:
                os.replace(backup, change.path)
            except OSError:
                # Retain the recoverable original if the filesystem itself blocks rollback.
                print(f'Rollback failed. Original retained at: {backup}', file=sys.stderr)
                for entry in prepared:
                    if entry[2] == backup:
                        entry[2] = None
        raise
    finally:
        for _, updated, backup in prepared:
            updated.unlink(missing_ok=True)
            if backup is not None:
                backup.unlink(missing_ok=True)


def arguments(argv):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--language', choices=EXTENSIONS, required=True)
    parser.add_argument('--recursive', '-r', action='store_true', help='Walk directories; default path is .')
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--check', action='store_true', help='No writes; exit 1 if formatting differs')
    mode.add_argument('--dry-run', action='store_true', help='Print a unified diff without writes; exit 0')
    mode.add_argument('--stdin', action='store_true', help='Format stdin to stdout for an editor buffer')
    parser.add_argument('--filename', help='Buffer filename for --stdin (never read or written)')
    parser.add_argument('--exclude', action='append', default=[], metavar='GLOB',
                        help='Extra directory name or root-relative path glob to exclude; repeatable')
    parser.add_argument('--include-excluded', action='store_true',
                        help='Disable default directory/AMENT_IGNORE/COLCON_IGNORE exclusions')
    parser.add_argument('paths', nargs='*')
    args = parser.parse_args(argv)
    if args.stdin:
        if args.paths or args.recursive or not args.filename:
            parser.error('--stdin needs --filename, and cannot be combined with paths or --recursive')
        if Path(args.filename).suffix not in EXTENSIONS[args.language]:
            parser.error('--filename must use an extension supported by --language')
    elif not args.paths:
        if args.recursive:
            args.paths = ['.']
        else:
            parser.error('provide files, or use --recursive [directory]')
    return args


def main(argv=None):
    args = arguments(argv)
    try:
        files = [] if args.stdin else collect_files(args)
        if not args.stdin and not files:
            print('No matching files (check exclusions or use --include-excluded).')
            return 0
        executable = find_formatter(args.language)
        with tempfile.TemporaryDirectory(prefix='ros-format-') as temporary:
            work = Path(temporary)
            if args.stdin:
                result = format_content(sys.stdin.buffer.read(), args.filename,
                                        args.language, executable, work)
                sys.stdout.buffer.write(result)
                return 0
            changes = []
            for path in files:
                original_identity = identity(path)
                if not stat.S_ISREG(original_identity[-1]):
                    raise FormatError(f'Not a regular file: {path}')
                content = path.read_bytes()
                formatted = format_content(content, path.name, args.language, executable, work)
                if content != formatted:
                    changes.append(Change(path, content, formatted, original_identity))
            if args.dry_run:
                for change in changes:
                    print(''.join(difflib.unified_diff(
                        change.before.decode('utf-8', errors='replace').splitlines(keepends=True),
                        change.after.decode('utf-8', errors='replace').splitlines(keepends=True),
                        fromfile=str(change.path), tofile=str(change.path) + ' (formatted)')), end='')
            elif args.check:
                for change in changes:
                    print(f'Would reformat: {change.path}')
            else:
                write_changes(changes)
                for change in changes:
                    print(f'Formatted: {change.path}')
            print(f'{len(files)} files checked; {len(changes)} '
                  + ('would change.' if args.check or args.dry_run else 'changed.'))
            return 1 if args.check and changes else 0
    except (FormatError, OSError, subprocess.TimeoutExpired) as error:
        print(f'ros-format: {error}', file=sys.stderr)
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
