"""Install checked browser assets without modifying the plugin checkout."""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import tarfile
import tempfile


def _relative(value):
    path = PurePosixPath(value)
    if path.is_absolute() or not path.parts or any(part in ('..', '.') for part in path.parts) or '\\' in value:
        raise ValueError(f'Invalid preview asset path: {value}')
    return path


def _digest(data):
    return hashlib.sha256(data).hexdigest()


def _copy_archive(archive, spec, destination):
    """Read only explicitly selected regular members; do not run npm scripts."""
    files = spec['files']
    directories = spec.get('directories', {})
    seen = set()
    selected = {}
    total = 0
    with tarfile.open(archive) as bundle:
        for member in bundle:
            target = files.get(member.name)
            if target is None:
                for source, output in directories.items():
                    if member.name.startswith(source.rstrip('/') + '/') and not member.isdir():
                        suffix = member.name[len(source.rstrip('/')) + 1:]
                        target = str(_relative(output) / _relative(suffix))
                        break
            if target is None:
                continue
            relative = str(_relative(target))
            if not member.isfile() or member.size > 16 * 1024 * 1024:
                raise ValueError(f'Unexpected preview asset member: {member.name}')
            total += member.size
            if total > 64 * 1024 * 1024 or relative in selected:
                raise ValueError('Unexpected preview asset archive size or duplicate path.')
            stream = bundle.extractfile(member)
            if stream is None:
                raise ValueError(f'Missing preview asset contents: {member.name}')
            with stream:
                content = stream.read()
            output = destination / relative
            if output.exists():
                raise ValueError(f'Duplicate preview asset target: {relative}')
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_bytes(content)
            selected[relative] = _digest(content)
            seen.add(member.name)
    if set(files) - seen:
        raise ValueError('Preview archive lacks required files: ' + ', '.join(sorted(set(files) - seen)))
    for output in directories.values():
        if not any(name.startswith(output.rstrip('/') + '/') for name in selected):
            raise ValueError(f'Preview archive lacks required directory: {output}')
    return selected


def _verify(directory, spec):
    path = directory / 'manifest.json'
    if path.is_symlink() or not path.is_file():
        raise RuntimeError(f'Unrecognized preview asset installation: {directory}')
    manifest = json.loads(path.read_text(encoding='utf-8'))
    expected = _digest(json.dumps(spec, sort_keys=True).encode())
    if manifest.get('version') != spec['version'] or manifest.get('sources_sha256') != expected or manifest.get('root') != str(directory):
        raise RuntimeError(f'Preview asset manifest does not match reviewed sources: {directory}')
    files = manifest.get('files', {})
    if not files:
        raise RuntimeError('Preview asset manifest is empty.')
    required = {target for package in spec['packages'].values() for target in package['files'].values()}
    if spec.get('mermaid_bundle'):
        required.add('static/mermaid/mermaid.min.js')
    if required - files.keys():
        raise RuntimeError('Preview asset manifest lacks required assets.')
    for relative, item in files.items():
        source = directory / str(_relative(relative))
        if source.is_symlink() or not source.is_file() or not source.resolve().is_relative_to(directory.resolve()):
            raise RuntimeError(f'Missing or redirected preview asset: {source}')
        if item.get('path') != str(source) or _digest(source.read_bytes()) != item.get('sha256'):
            raise RuntimeError(f'Preview asset checksum mismatch: {source}')
    return manifest


def _build_mermaid(ctx, specification, workspace, destination):
    build = workspace / 'mermaid-build'
    build.mkdir()
    for name, digest in specification['files'].items():
        if name not in ('package.json', 'package-lock.json', 'mermaid-entry.js'):
            raise ValueError(f'Unexpected Mermaid build input: {name}')
        source = ctx.repo / 'configs/markdown-preview' / name
        content = source.read_bytes()
        if _digest(content) != digest:
            raise RuntimeError(f'Mermaid build input checksum mismatch: {source}')
        (build / name).write_bytes(content)
    node = ctx.data / 'tools/node' / ctx.versions['node']['version']
    binary = node / 'bin/node'
    if not binary.is_file():
        raise RuntimeError('Install the dotfiles Node module before Markdown preview assets.')
    npm = node / 'lib/node_modules/npm/bin/npm-cli.js'
    user_config = workspace / 'empty.npmrc'
    global_config = workspace / 'empty-global.npmrc'
    user_config.write_text('')
    global_config.write_text('')
    environment = {
        'PATH': str(node / 'bin') + os.pathsep + os.environ.get('PATH', ''),
        'NODE_OPTIONS': '', 'NODE_PATH': '', 'ESBUILD_BINARY_PATH': '',
        'NPM_CONFIG_USERCONFIG': str(user_config), 'NPM_CONFIG_GLOBALCONFIG': str(global_config),
        'NPM_CONFIG_CACHE': str(workspace / 'npm-cache'),
    }
    ctx.runner.run([str(binary), str(npm), 'ci', '--prefix', str(build), '--ignore-scripts',
                    '--no-audit', '--no-fund', '--include=dev', '--include=optional', '--global=false'], env=environment)
    output = destination / 'static/mermaid/mermaid.min.js'
    output.parent.mkdir(parents=True, exist_ok=True)
    ctx.runner.run([str(binary), str(build / 'node_modules/esbuild/bin/esbuild'),
                    str(build / 'mermaid-entry.js'), '--bundle', '--format=iife', '--minify',
                    '--target=es2022', '--outfile=' + str(output)], env=environment)
    digest = _digest(output.read_bytes())
    if digest != specification['sha256']:
        raise RuntimeError('Built Mermaid bundle checksum differs from the reviewed bundle.')
    return {'static/mermaid/mermaid.min.js': digest}


def install_preview_assets(ctx):
    spec = ctx.versions['markdown_preview']
    if not re.fullmatch(r'[A-Za-z0-9._-]+', spec['version']):
        raise ValueError('Invalid preview asset version.')
    directory = ctx.data / 'preview-assets' / spec['version']
    if directory.is_symlink() or not directory.resolve().is_relative_to(ctx.home.resolve()):
        raise ValueError(f'Preview assets must remain inside home: {directory}')
    if not directory.exists():
        directory.parent.mkdir(parents=True, exist_ok=True)
        # Stage beside the version directory so publication is an atomic rename.
        with tempfile.TemporaryDirectory(prefix='.preview-assets-', dir=directory.parent) as temporary:
            staged = Path(temporary) / 'bundle'
            staged.mkdir()
            hashes = {}
            for name, package in spec['packages'].items():
                archive = Path(temporary) / (name + '.tgz')
                ctx.runner.download(package['url'], archive, package['sha256'])
                hashes.update(_copy_archive(archive, package, staged))
            if spec.get('mermaid_bundle'):
                hashes.update(_build_mermaid(ctx, spec['mermaid_bundle'], Path(temporary), staged))
            manifest = {
                'version': spec['version'], 'root': str(directory),
                'sources_sha256': _digest(json.dumps(spec, sort_keys=True).encode()),
                'files': {relative: {'path': str(directory / relative), 'sha256': digest}
                          for relative, digest in sorted(hashes.items())},
            }
            (staged / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
            staged.rename(directory)
    manifest = _verify(directory, spec)
    # Expose only a complete, checked manifest; preserve the previous selection.
    ctx.backup.link(directory / 'manifest.json', ctx.data / 'preview-assets.json')
    return manifest
