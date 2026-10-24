#!/usr/bin/env python3
"""Explicit ROS workspace builds and compilation database generation for clangd."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import uuid


class WorkspaceError(Exception):
    """Unsafe input, unavailable dependency or workspace operation failure."""


def workspace_path(value):
    path = Path(value).expanduser().resolve()
    if not path.is_dir():
        raise WorkspaceError(f'Workspace directory does not exist: {path}')
    return path


def child_path(workspace, value, *, allow_leaf_symlink=False):
    """Resolve lexical '..' without following links that could leave the workspace."""
    path = Path(value).expanduser()
    path = Path(os.path.abspath(path if path.is_absolute() else workspace / path))
    if not path.is_relative_to(workspace) or path == workspace:
        raise WorkspaceError(f'Path must be below the workspace: {path}')
    relative = path.relative_to(workspace)
    if '.git' in relative.parts:
        raise WorkspaceError(f'Refusing a path inside .git: {path}')
    current = workspace
    for part in relative.parts:
        current /= part
        if current.is_symlink() and not (allow_leaf_symlink and current == path):
            raise WorkspaceError(f'Symlink paths are not supported here: {current}')
    return path


def digest(content):
    return hashlib.sha256(content).hexdigest()


def read_json(path):
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except (OSError, UnicodeError, ValueError) as error:
        raise WorkspaceError(f'Cannot read JSON from {path}: {error}') from error


def databases(build, output):
    if not build.is_dir():
        raise WorkspaceError(f'Build directory does not exist: {build}')
    result = []
    def walk_error(error):
        raise WorkspaceError(f'Cannot inspect the complete build tree: {error}')

    for directory, dirs, names in os.walk(build, followlinks=False, onerror=walk_error):
        base = Path(directory)
        dirs[:] = sorted(name for name in dirs if not (base / name).is_symlink()
                         and name != '.git')
        if 'compile_commands.json' not in names:
            continue
        path = base / 'compile_commands.json'
        if path == output or path.is_symlink() or not path.is_file():
            continue
        if not path.resolve().is_relative_to(build):
            raise WorkspaceError(f'Compilation database escapes the build directory: {path}')
        result.append(path)
    # colcon-cmake can also generate a build-root aggregate. Its retained entries
    # must not override fresher package databases after a partial rebuild.
    if len(result) > 1 and build / 'compile_commands.json' in result:
        result.remove(build / 'compile_commands.json')
    return sorted(result)


def valid_string(value):
    return isinstance(value, str) and bool(value) and '\0' not in value


def normalized_entry(entry, source, workspace):
    if not isinstance(entry, dict) or not all(valid_string(entry.get(key))
                                            for key in ('directory', 'file')):
        raise WorkspaceError(f'Invalid directory/file in {source}')
    directory = Path(entry['directory'])
    # CMake emits absolute working directories. Relative paths are resolved against
    # the containing database, never the caller's current working directory.
    if not directory.is_absolute():
        directory = source.parent / directory
    directory = directory.resolve()
    file = Path(entry['file'])
    file = (file if file.is_absolute() else directory / file).resolve()
    if not directory.is_relative_to(workspace) or not file.is_relative_to(workspace):
        raise WorkspaceError(f'Compilation entry points outside the workspace: {source}')
    arguments, command = entry.get('arguments'), entry.get('command')
    if arguments is not None:
        if not isinstance(arguments, list) or not arguments or not all(
                isinstance(arg, str) and '\0' not in arg for arg in arguments):
            raise WorkspaceError(f'Invalid compiler arguments in {source}')
        if not arguments[0]:
            raise WorkspaceError(f'Empty compiler executable in {source}')
    if command is not None and not valid_string(command):
        raise WorkspaceError(f'Invalid compiler command in {source}')
    if arguments is None and command is None:
        raise WorkspaceError(f'Missing compiler command/arguments in {source}')
    if not directory.is_dir() or not file.is_file():
        return None  # Removed sources or old package directories are not indexed.
    result = {'directory': str(directory), 'file': str(file)}
    if arguments is not None:
        result['arguments'] = arguments
    if command is not None:
        result['command'] = command
    if 'output' in entry:
        if not valid_string(entry['output']):
            raise WorkspaceError(f'Invalid output filename in {source}')
        target = Path(entry['output'])
        target = (target if target.is_absolute() else directory / target).resolve()
        if not target.is_relative_to(workspace):
            raise WorkspaceError(f'Compiler output points outside the workspace: {source}')
        result['output'] = str(target)
    return result


def atomic_write(path, content):
    """Replace one file atomically; leave no partial file after write failures."""
    staged = None
    try:
        with tempfile.NamedTemporaryFile(prefix='.ros-workspace-', dir=path.parent,
                                         delete=False) as stream:
            staged = Path(stream.name)
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        staged.chmod(0o644)
        os.replace(staged, path)
    finally:
        if staged is not None and staged.exists():
            staged.unlink()


def output_snapshot(output):
    if output.is_symlink():
        return ('symlink', os.readlink(output))
    if output.exists():
        if not output.is_file():
            raise WorkspaceError(f'Output is not a regular file: {output}')
        return ('file', digest(output.read_bytes()))
    return ('absent', None)


def output_state(build):
    path = build / '.dotfiles-compile-commands.json'
    if path.is_symlink():
        raise WorkspaceError(f'Refusing a symlink ownership file: {path}')
    value = read_json(path) if path.exists() else {'version': 1, 'outputs': {}}
    if (not isinstance(value, dict) or value.get('version') != 1
            or not isinstance(value.get('outputs'), dict)
            or not all(isinstance(key, str) and isinstance(item, str)
                       for key, item in value['outputs'].items())):
        raise WorkspaceError(f'Invalid ownership file: {path}')
    return path, value


def output_permission(build, output, force):
    state_path, state = output_state(build)
    snapshot = output_snapshot(output)
    owned = snapshot[0] == 'file' and state['outputs'].get(str(output)) == snapshot[1]
    if snapshot[0] != 'absent' and not owned and not force:
        raise WorkspaceError(f'Existing output was not created by this helper or has changed: {output}\n'
                             'Use --output for another location, or --force to back it up and replace it.')
    return state_path, state, snapshot, owned


def write_database(workspace, build, output, force=False):
    state_path, state, before, owned = output_permission(build, output, force)
    sources = databases(build, output)
    if not sources:
        raise WorkspaceError('No compilation databases found. Build with ros-workspace build first; '
                             'Python-only packages do not produce C/C++ compilation databases.')
    entries, seen = [], set()
    for source in sources:
        data = read_json(source)
        if not isinstance(data, list):
            raise WorkspaceError(f'Compilation database must contain a JSON array: {source}')
        for item in data:
            entry = normalized_entry(item, source, workspace)
            if entry is None:
                continue
            command = ('arguments', tuple(entry['arguments'])) if 'arguments' in entry else (
                'command', entry['command'])
            key = (entry['file'], entry['directory'], command)
            if key not in seen:
                entries.append(entry)
                seen.add(key)
    if not entries:
        raise WorkspaceError('No valid, existing C/C++ source files found; previous output was preserved.')
    entries.sort(key=lambda value: (value['file'], value['directory'],
                                   json.dumps(value, ensure_ascii=False, sort_keys=True)))
    content = (json.dumps(entries, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
    output.parent.mkdir(parents=True, exist_ok=True)
    # Recheck path components and output immediately before publishing.
    child_path(workspace, output, allow_leaf_symlink=True)
    if output_snapshot(output) != before:
        raise WorkspaceError(f'Output changed while collecting commands; retry after inspection: {output}')
    if before[0] != 'absent' and not owned:
        stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
        backup = output.with_name(output.name + f'.backup-{stamp}-{uuid.uuid4().hex[:8]}')
        if output.is_symlink():
            backup.symlink_to(os.readlink(output))
        else:
            shutil.copy2(output, backup, follow_symlinks=False)
        print(f'Backup: {backup}')
    atomic_write(output, content)
    state['outputs'][str(output)] = digest(content)
    atomic_write(state_path, (json.dumps(state, indent=2) + '\n').encode('utf-8'))
    print(f'{output}: {len(entries)} compile commands from {len(sources)} databases.')
    return 0


def build_workspace(args, workspace, build, output):
    # Refuse unmanaged output before running a potentially expensive build.
    output_permission(build, output, args.force)
    install = child_path(workspace, args.install_base)
    log = child_path(workspace, args.log_base)
    if build == install or build == log or install == log:
        raise WorkspaceError('Build, install and log directories must be different.')
    executable = shutil.which('colcon')
    if executable is None:
        raise WorkspaceError('colcon is unavailable. Install the ROS module and load ros_env first.')
    extra = list(args.colcon_args)
    if extra and extra[0] == '--':
        extra.pop(0)
    reserved = ('--build-base', '--install-base', '--log-base')
    if any(value.split('=', 1)[0] in reserved for value in extra):
        raise WorkspaceError('Pass build/install/log paths before --, using the helper options.')
    if (extra.count('--cmake-args') > 1
            or any(value.startswith('--cmake-args=') for value in extra)
            or any('CMAKE_EXPORT_COMPILE_COMMANDS' in value for value in extra)):
        raise WorkspaceError('Use at most one --cmake-args; compile command export is managed by this helper.')
    if '--cmake-args' in extra:
        extra.insert(extra.index('--cmake-args') + 1, '-DCMAKE_EXPORT_COMPILE_COMMANDS=ON')
    else:
        extra += ['--cmake-args', '-DCMAKE_EXPORT_COMPILE_COMMANDS=ON']
    command = [executable, '--log-base', str(log), 'build', '--build-base', str(build),
               '--install-base', str(install), '--symlink-install', *extra]
    result = subprocess.run(command, cwd=workspace, check=False)
    if result.returncode:
        print('Build failed; the workspace compilation database was not changed.', file=sys.stderr)
        return result.returncode if result.returncode > 0 else 128 - result.returncode
    if not databases(build, output):
        print('Build succeeded without a C/C++ compilation database (for example, Python-only packages).\n'
              'Previous output, if any, was preserved.')
        return 0
    return write_database(workspace, build, output, args.force)


def initialize(workspace, repo):
    target = workspace / 'justfile'
    source = repo / 'configs/projects/ros.justfile'
    if not source.is_file():
        raise WorkspaceError('ROS justfile template is missing; reinstall the just module.')
    try:
        with target.open('x', encoding='utf-8', newline='\n') as stream:
            stream.write(source.read_text(encoding='utf-8'))
    except FileExistsError as error:
        raise WorkspaceError(f'Existing justfile was preserved: {target}') from error
    print(f'Created {target}. Review it, load ros_env, then run just --list.')
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1],
                        help=argparse.SUPPRESS)
    commands = parser.add_subparsers(dest='operation', required=True)
    for name, help_text in (('build', 'Build with colcon, then publish compile_commands.json'),
                            ('compdb', 'Merge existing build databases without building'),
                            ('init', 'Create a ROS justfile without replacing existing files')):
        command = commands.add_parser(name, help=help_text)
        command.add_argument('--workspace', default='.', help='Existing workspace root (default: current directory)')
        if name != 'init':
            command.add_argument('--build-base', default='build', help='Build directory inside the workspace')
            command.add_argument('--output', default='compile_commands.json', help='Output path inside the workspace')
            command.add_argument('--force', action='store_true', help='Back up and replace unmanaged/edited output')
        if name == 'build':
            command.add_argument('--install-base', default='install')
            command.add_argument('--log-base', default='log')
            command.add_argument('colcon_args', nargs=argparse.REMAINDER,
                                 help='Extra colcon build arguments after --')
    args = parser.parse_args(argv)
    try:
        workspace = workspace_path(args.workspace)
        if args.operation == 'init':
            return initialize(workspace, args.repo.resolve())
        build = child_path(workspace, args.build_base)
        output = child_path(workspace, args.output, allow_leaf_symlink=True)
        if output == build or build.is_relative_to(output) or output == build / '.dotfiles-compile-commands.json':
            raise WorkspaceError('Output must not replace the build directory or ownership file.')
        if args.operation == 'build':
            return build_workspace(args, workspace, build, output)
        return write_database(workspace, build, output, args.force)
    except (WorkspaceError, OSError) as error:
        print(f'ros-workspace: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
