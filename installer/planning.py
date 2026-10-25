"""Read-only installation plans; never refresh repositories or execute user tools."""
from __future__ import annotations

from dataclasses import dataclass
import difflib
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import shutil
import subprocess

from catalog import packages_for


@dataclass(frozen=True)
class FileOperation:
    kind: str
    target: Path
    source: Path | None = None
    content: str | None = None
    mode: int | None = None


def _managed_block(text, begin, end, body):
    if (text.count(begin) != text.count(end) or text.count(begin) > 1
            or (begin in text and text.index(begin) > text.index(end))):
        raise ValueError(f'Malformed managed block: {begin}')
    pattern = re.compile(re.escape(begin) + r'.*?' + re.escape(end) + r'\n?', re.S)
    return pattern.sub('', text).rstrip() + '\n\n' + begin + '\n' + body + '\n' + end + '\n'


def file_operations(repo, home, config, modules):
    """The common deployment recipe, shared by the preview and actual installer."""
    operations = []

    def link(source, target):
        operations.append(FileOperation('link', target, source=source))

    def write(target, content, mode=None):
        operations.append(FileOperation('write', target, content=content, mode=mode))

    # Wrappers refer to the checkout, exactly like the other dotfiles links.
    def wrapper(name, source):
        write(home / '.local/bin' / name,
              '#!/usr/bin/env bash\nset -euo pipefail\nexec /usr/bin/python3 '
              + shlex.quote(str(repo / 'commands' / source)) + ' --repo '
              + shlex.quote(str(repo)) + ' "$@"\n', 0o755)

    wrapper('doctor', 'doctor.py')
    if set(modules).intersection({'cpp', 'ros2', 'just'}):
        wrapper('ros-workspace', 'ros-workspace.py')
    if 'shell' in modules:
        from actions import LEGACY_BASHRC_SHA256
        bashrc = home / '.bashrc'
        if bashrc.is_symlink() and (bashrc.resolve() == repo / '.bashrc' or not bashrc.exists()):
            skeleton = Path('/etc/skel/.bashrc')
            current = skeleton.read_text(encoding='utf-8') if skeleton.exists() else ''
        else:
            current = bashrc.read_text(encoding='utf-8') if bashrc.exists() else ''
        if hashlib.sha256(current.encode('utf-8')).hexdigest() in LEGACY_BASHRC_SHA256:
            skeleton = Path('/etc/skel/.bashrc')
            current = skeleton.read_text(encoding='utf-8') if skeleton.exists() else ''
        write(bashrc, _managed_block(current, '# >>> dotfiles managed >>>', '# <<< dotfiles managed <<<',
                                    'source ' + shlex.quote(str(repo / '.bashrc'))))
        profile = home / '.profile'
        current = profile.read_text(encoding='utf-8') if profile.exists() else ''
        write(profile, _managed_block(current, '# >>> dotfiles PATH >>>', '# <<< dotfiles PATH <<<',
                                      'case ":$PATH:" in *":$HOME/.local/bin:"*) ;; *) PATH="$HOME/.local/bin:$PATH" ;; esac\nexport PATH'))
        for name in ('.inputrc', '.dircolors', '.tmux.conf', '.rosrc'):
            link(repo / name, home / name)
        link(repo / 'configs/starship.toml', config / 'starship.toml')
        for name in ('formatting.bash', 'workflow.bash'):
            link(repo / 'configs/shell' / name, config / 'dotfiles' / name)
        for source, name in (('commands/ros-format.py', 'ros-format'),
                             ('scripts/clipboard.sh', 'dotfiles-clipboard'), ('commands/fetchall.sh', 'fetchall')):
            write(home / '.local/bin' / name, (repo / source).read_text(encoding='utf-8'), 0o755)
    if 'neovim' in modules:
        link(repo / 'configs/nvim', config / 'nvim')
        link(repo / '.vimrc', home / '.vimrc')
    if 'latex' in modules:
        link(repo / '.latexmkrc', home / '.latexmkrc')
    if 'diagrams' in modules:
        for source, name in (('png2eps.sh', 'png2eps'), ('jpg2eps.sh', 'jpg2eps'),
                             ('image2eps.py', 'image2eps.py'), ('plantuml-render.py', 'dotfiles-plantuml-render')):
            write(home / '.local/bin' / name, (repo / 'commands' / source).read_text(encoding='utf-8'), 0o755)
    return operations


def all_file_operations(repo, home, config, modules):
    from workflow_tools import workflow_operations
    from desktop_extras import launcher_file_operations
    return (file_operations(repo, home, config, modules) + workflow_operations(repo, home, config, modules)
            + launcher_file_operations(repo, home, config, modules))


def apply_file_operations(ctx):
    for operation in all_file_operations(ctx.repo, ctx.home, ctx.config, ctx.modules):
        if operation.kind == 'link':
            ctx.backup.link(operation.source, operation.target)
        elif operation.kind == 'write':
            ctx.backup.write_text(operation.target, operation.content)
        else:
            raise ValueError(f'Unknown file operation: {operation.kind}')
        if operation.mode is not None:
            operation.target.chmod(operation.mode)


def _safe_text(path, limit=128 * 1024):
    if not path.is_file() or path.stat().st_size > limit:
        return None
    with path.open('rb') as source:
        content = source.read(limit + 1)
    if len(content) > limit or b'\0' in content:
        return None
    try:
        return content.decode('utf-8')
    except UnicodeError:
        return None


def redact(text):
    """Best-effort redaction, not a promise that arbitrary personal config is public."""
    result, in_key = [], False
    sensitive = re.compile(r'(?i)(password|passwd|token|secret|credential|authorization|api[_-]?key|private[_ -]?key|user\.email|email\s*=|https?://[^/\s]+:[^/\s]+@)')
    email = re.compile(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}')
    for line in text.splitlines():
        if '-----BEGIN ' in line and 'PRIVATE KEY-----' in line:
            in_key = True
        hidden = in_key or sensitive.search(line) or email.search(line)
        result.append('[redacted sensitive line]' if hidden else line)
        if in_key and '-----END ' in line and 'PRIVATE KEY-----' in line:
            in_key = False
    return '\n'.join(result)


def config_report(operations, home, show_diff=False):
    result = []
    for operation in operations:
        path = operation.target
        item = {'path': str(path), 'kind': operation.kind, 'status': 'NEW', 'diff': []}
        if not path.parent.resolve().is_relative_to(home.resolve()):
            item.update(status='BLOCKED', note='parent resolves outside home')
            result.append(item)
            continue
        desired = operation.content
        exists = path.exists() or path.is_symlink()
        if operation.kind == 'link':
            if path.is_symlink() and path.resolve() == operation.source.resolve():
                item.update(status='CURRENT', note='already linked; git pull changes linked source immediately')
            elif exists:
                item['status'] = 'REPLACE LINK' if path.is_symlink() else 'REPLACE'
            if operation.source.is_dir():
                item['note'] = 'directory link; existing directory is backed up as a whole'
            elif show_diff:
                desired = _safe_text(operation.source)
        elif exists:
            current = _safe_text(path)
            item['status'] = ('CURRENT' if not path.is_symlink() and current == desired else 'UPDATE')
        if operation.mode is not None and item['status'] == 'CURRENT' and (path.stat().st_mode & 0o777) != operation.mode:
            item.update(status='MODE', note=f'executable mode -> {operation.mode:04o}')
        if show_diff and item['status'] not in ('CURRENT', 'MODE'):
            if path.is_symlink() and not path.resolve().is_relative_to(home.resolve()):
                item['note'] = 'contents of links outside home are omitted'
            else:
                current = _safe_text(path) if exists else ''
                if current is not None and desired is not None:
                    lines = list(difflib.unified_diff(redact(current).splitlines(), redact(desired).splitlines(),
                                                    fromfile='current', tofile='planned', lineterm='', n=2))
                    item['diff'] = lines[:80]
                    if len(lines) > 80:
                        item['diff'].append('... diff truncated after 80 lines ...')
                elif exists or desired is None:
                    item['note'] = 'directory, binary, or large file: content diff omitted'
        result.append(item)
    return result


def read_command(argv):
    """Only local OS package readers; no PATH binaries, shells, sudo or networking."""
    if argv[0] not in ('/usr/bin/apt-cache', '/usr/bin/apt-get', '/usr/bin/dpkg-query'):
        raise ValueError('Unsupported preview command')
    if argv[0] == '/usr/bin/apt-get' and '--simulate' not in argv:
        raise ValueError('APT preview must be simulated')
    result = subprocess.run(argv, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                            encoding='utf-8', errors='replace', timeout=30,
                            env={**os.environ, 'LC_ALL': 'C', 'LANG': 'C', 'APT_CONFIG': '/dev/null'})
    if result.returncode:
        raise RuntimeError(f'{Path(argv[0]).name}: local metadata lookup failed (exit {result.returncode})')
    return result.stdout


def parse_policy(text):
    result, package = {}, None
    for line in text.splitlines():
        if line and not line[0].isspace() and line.endswith(':'):
            package = line[:-1]
            result[package] = {}
        elif package and line.strip().startswith(('Installed:', 'Candidate:')):
            key, value = line.strip().split(':', 1)
            result[package][key.lower()] = None if value.strip() == '(none)' else value.strip()
    return result


def parse_packages(text):
    result = {}
    for block in re.split(r'\n\s*\n', text):
        fields = dict(line.split(': ', 1) for line in block.splitlines()
                      if line and not line[0].isspace() and ': ' in line)
        if 'Package' in fields and 'Version' in fields:
            result[(fields['Package'], fields['Version'])] = fields
    return result


def target_codename(versions):
    match = re.search(r'\.(noble|resolute)_', versions.get('ros_source', {}).get('url', ''))
    return match[1] if match else None


def host_codename():
    try:
        fields = dict(line.split('=', 1) for line in Path('/etc/os-release').read_text().splitlines() if '=' in line)
        return fields.get('VERSION_CODENAME', '').strip('"') if fields.get('ID', '').strip('"') == 'ubuntu' else None
    except OSError:
        return None


def apt_report(modules, versions, arch, *, capture=read_command, current_codename=None, current_arch=None):
    result = {'packages': [], 'changes': [], 'unknown': [], 'download_bytes': None, 'installed_delta_bytes': None,
              'complete': False, 'note': 'Local APT cache only; repositories are not refreshed before confirmation.'}
    if current_codename is None:
        current_codename = host_codename()
    if current_arch is None:
        import platform
        current_arch = {'x86_64': 'amd64', 'aarch64': 'arm64'}.get(platform.machine())
    target = target_codename(versions)
    if not target or target != current_codename or arch != current_arch:
        result['unknown'].append('APT cache belongs to a different/unknown Ubuntu release or CPU; amounts and candidate versions UNKNOWN')
        return result
    packages = set(packages_for(modules)) | {'software-properties-common', 'gnupg'}
    if 'ros2' in modules:
        distro = 'jazzy' if target == 'noble' else 'lyrical'
        packages.update({f'ros-{distro}-desktop' if 'ros-desktop' in modules else f'ros-{distro}-ros-base', 'ros-dev-tools'})
    if 'chrome' in modules:
        packages.add('google-chrome-stable')
    cache_args = ['-o', 'Dir::Cache::pkgcache=', '-o', 'Dir::Cache::srcpkgcache=']
    try:
        policy = parse_policy(capture(['/usr/bin/apt-cache', *cache_args, 'policy', *sorted(packages)]))
        known = []
        for name in sorted(packages):
            entry = policy.get(name, {})
            old, new = entry.get('installed'), entry.get('candidate')
            status = 'UNKNOWN' if not new else ('NEW' if not old else ('CURRENT' if old == new else 'UPDATE'))
            result['packages'].append({'name': name, 'installed': old, 'candidate': new, 'status': status})
            if new:
                known.append(name)
            else:
                result['unknown'].append(f'{name}: no local candidate (repository/universe may not yet be enabled)')
        if not known:
            return result
        simulation = capture(['/usr/bin/apt-get', '--simulate', '--no-remove', '--no-install-recommends',
                              '-o', 'Debug::NoLocking=1', *cache_args, 'install', *known])
        for line in simulation.splitlines():
            match = re.match(r'^Inst\s+(\S+)(?:\s+\[([^]]+)\])?\s+\((\S+)', line)
            if match:
                result['changes'].append({'name': match[1], 'installed': match[2], 'candidate': match[3]})
        if any(line.startswith('Remv ') for line in simulation.splitlines()):
            result['unknown'].append('APT simulation requested removals; the installer forbids removals')
            return result
        changes = result['changes']
        if not changes:
            result.update(download_bytes=0, installed_delta_bytes=0, complete=not result['unknown'])
            return result
        records = parse_packages(capture(['/usr/bin/apt-cache', *cache_args, 'show',
                                          *(f'{item["name"]}={item["candidate"]}' for item in changes)]))
        installed = {}
        inventory = capture(['/usr/bin/dpkg-query', '-W', '-f=${binary:Package}\t${Version}\t${Installed-Size}\t${db:Status-Status}\n'])
        for line in inventory.splitlines():
            values = line.split('\t')
            if len(values) == 4 and values[3] == 'installed' and values[2].isdigit():
                installed[values[0]] = int(values[2]) * 1024
        download, delta = 0, 0
        for item in changes:
            name = item['name']
            record = records.get((name.split(':')[0], item['candidate']), {})
            size, expanded = record.get('Size', ''), record.get('Installed-Size', '')
            if size.isdigit() and expanded.isdigit():
                download += int(size)
                delta += int(expanded) * 1024 - installed.get(name, installed.get(name.split(':')[0] + ':' + arch, 0))
            else:
                result['unknown'].append(f'{name}: missing archive/installed size metadata')
        result.update(download_bytes=download, installed_delta_bytes=delta, complete=not result['unknown'])
    except (OSError, RuntimeError, subprocess.SubprocessError) as error:
        result['unknown'].append(str(error))
    return result


def _read_json(path):
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        return {}


def user_tools_report(modules, versions, home, data, arch, no_plugins=False):
    result = []
    selections = [('shell', 'starship'), ('python', 'uv'), ('neovim', 'neovim'), ('node', 'node'),
                  ('latex', 'texlab'), ('rust', 'rustup'), ('fonts', 'nerd_font'), ('diagrams', 'plantuml'),
                  ('ibis-office', 'ibis_office'), ('zoxide', 'zoxide'), ('atuin', 'atuin'), ('just', 'just'),
                  ('git-tools', 'lazygit'), ('git-tools', 'delta'), ('direnv', 'direnv'), ('file-tools', 'fd'), ('file-tools', 'bat')]
    for module, name in selections:
        if module not in modules or name not in versions:
            continue
        version = versions[name]
        if not isinstance(version, dict):
            continue
        artifact = version.get(arch, version)
        directory_name = {'nerd_font': 'nerd-font', 'ibis_office': 'ibis-office'}.get(name, name)
        root = data / 'tools' / directory_name
        expected = str(version['version'])
        directory = root / expected
        installed = sorted(path.name for path in root.iterdir() if path.is_dir()) if root.is_dir() else []
        marker = directory / '.dotfiles-sha256'
        current = False
        try:
            current = marker.is_file() and marker.read_text(encoding='ascii').strip() == artifact.get('sha256')
        except (OSError, UnicodeError):
            pass
        result.append({'name': name, 'installed': ', '.join(installed) or 'not managed/unknown', 'candidate': expected,
                       'status': 'CACHED' if current else ('CHECK' if expected in installed else 'INSTALL'),
                       'download_bytes': 0 if current else artifact.get('size'),
                       'installed_bytes': 0 if current else artifact.get('installed_size'),
                       'note': 'managed cache metadata only; PATH binaries are not executed'})
    npm = dict(versions.get('npm_language_servers', {})) if 'node' in modules else {}
    if 'python' in modules:
        npm['basedpyright'] = versions['basedpyright']
    for name, expected in npm.items():
        installed = _read_json(home / '.local/lib/node_modules' / name / 'package.json').get('version')
        result.append({'name': name, 'installed': installed or 'not installed/unknown', 'candidate': expected,
                       'status': 'CURRENT' if installed == expected else 'INSTALL/UPDATE', 'download_bytes': None,
                       'note': 'npm resolves dependencies again; cache/network requirement unknown'})
    if 'neovim' in modules:
        for name, package in versions.get('markdown_preview', {}).get('packages', {}).items():
            result.append({'name': 'preview/' + name, 'installed': 'validated during installation', 'candidate': package['version'],
                           'status': 'VERIFY', 'download_bytes': package.get('size'), 'note': 'archive plus locked Mermaid dependencies'})
    extras = []
    if 'launcher' in modules:
        artifact = versions['albert'][arch]
        result.append({'name': 'Albert (system DEB)', 'installed': 'checked by APT during installation',
                       'candidate': versions['albert']['version'], 'status': 'VERIFY/INSTALL',
                       'download_bytes': artifact.get('size'), 'installed_bytes': artifact.get('installed_size')})
        extras.append('Albert DEB dependencies: final APT plan is resolved after the verified package is downloaded')
    if 'screen-capture' in modules:
        extras.append('Kooha stable Flatpak and shared GNOME runtime: candidate versions/download/disk sizes require Flathub metadata; may need over 1 GiB on a first install')
    if 'python' in modules:
        extras.append('uv Python tools: candidate versions/dependency sizes require registry access')
    if 'rust' in modules:
        extras.append('Rust toolchain/components: download and expanded sizes unknown')
    if 'neovim' in modules:
        extras.append('locked Mermaid npm build dependencies and temporary node_modules: sizes unknown')
        if not no_plugins:
            extras.append('Neovim plugins: Git fetch/checkout sizes unknown')
    if 'vscode' in modules:
        extras.append('VS Code Snap: candidate version/download/retained revisions require Snap metadata refresh')
    if 'macos-theme' in modules:
        extras.append('WhiteSur archives, wallpapers and build output: sizes unknown')
    if 'ros2' in modules:
        extras.append('ROS repository bootstrap and rosdep indexes: sizes unknown')
    return {'tools': result, 'unknown': extras}


def disk_space(path):
    parent = path.absolute()
    while not parent.exists() and parent != parent.parent:
        parent = parent.parent
    try:
        return shutil.disk_usage(parent).free
    except OSError:
        return None


def human_size(amount):
    if amount is None:
        return 'UNKNOWN'
    sign = '-' if amount < 0 else ''
    amount = abs(amount)
    for unit in ('B', 'KiB', 'MiB', 'GiB', 'TiB'):
        if amount < 1024 or unit == 'TiB':
            return f'{sign}{amount:.1f} {unit}'
        amount /= 1024


def show_details(repo, home, config, data, modules, versions, arch, platform,
                 configs_only=False, no_plugins=False, show_diff=False):
    """Print a bounded plan and return the complete structured local report."""
    report = {'configurations': [], 'apt': None, 'user_tools': None}
    print('\nConfiguration targets (read-only preview):')
    try:
        operations = all_file_operations(repo, home, config, modules)
        if 'node' in modules and not configs_only:
            operations.append(FileOperation('write', config / 'dotfiles/node.env',
                                            content='export NPM_CONFIG_PREFIX="$HOME/.local"\n'))
        report['configurations'] = config_report(operations, home, show_diff)
        for item in report['configurations']:
            path = Path(item['path'])
            label = '~/' + str(path.relative_to(home)) if path.is_relative_to(home) else str(path)
            print(f'  {item["status"]:<12} {label}')
            if item.get('note'):
                print('    ' + item['note'])
            for line in item['diff']:
                print('    ' + line)
    except (OSError, ValueError, RuntimeError) as error:
        report['configuration_error'] = str(error)
        print(f'  UNKNOWN: configuration preview unavailable: {error}')
    if not show_diff:
        print('  Add --show-diff to inspect bounded text diffs. Existing file contents are hidden by default.')
    else:
        print('  Sensitive-looking lines are redacted, but review this local output before sharing it.')
    dynamic = set(modules).intersection({'fonts', 'keyboard', 'japanese-input', 'macos-theme', 'ibis-office', 'launcher'})
    if dynamic:
        print('  Session/application-dependent settings are evaluated during installation: ' + ', '.join(sorted(dynamic)))
        print('  GNOME, IME, Windows Terminal, font registration and app launcher diffs are not available in this offline preview.')
    if configs_only:
        print('\nDownloads: 0 (configuration-only mode). Configuration backup space depends on existing targets.')
        return report
    print('\nPackage update candidates (local cache, including selected dependencies):')
    apt = report['apt'] = apt_report(modules, versions, arch)
    for item in apt['packages']:
        print(f'  {item["status"]:<8} {item["name"]}: {item["installed"] or "not installed"} -> {item["candidate"] or "UNKNOWN"}')
    direct = {item['name'] for item in apt['packages']}
    dependencies = [item for item in apt['changes'] if item['name'] not in direct]
    for item in dependencies[:25]:
        print(f'  DEP      {item["name"]}: {item["installed"] or "not installed"} -> {item["candidate"]}')
    if len(dependencies) > 25:
        print(f'  ... {len(dependencies) - 25} additional dependency changes included in the estimate')
    print('  ' + apt['note'])
    for note in apt['unknown'][:12]:
        print('  UNKNOWN: ' + note)
    if len(apt['unknown']) > 12:
        print(f'  ... {len(apt["unknown"]) - 12} more packages without complete metadata')
    users = report['user_tools'] = user_tools_report(modules, versions, home, data, arch, no_plugins)
    print('\nDirect downloads (managed metadata; no tool binaries executed):')
    for item in users['tools']:
        print(f'  {item["status"]:<14} {item["name"]}: {item["installed"]} -> {item["candidate"]}')
        if item.get('download_bytes') is not None or item.get('installed_bytes') is not None:
            print(f'    archive={human_size(item.get("download_bytes"))}, tool payload={human_size(item.get("installed_bytes"))}')
    print('\nDownload / disk estimates:')
    qualifier = '' if apt['complete'] else 'known subtotal only; incomplete: '
    print(f'  APT archive download: {qualifier}{human_size(apt["download_bytes"])} (before archive-cache reuse)')
    print(f'  APT installed-size change: {qualifier}{human_size(apt["installed_delta_bytes"])}')
    known_bytes = sum(item['download_bytes'] for item in users['tools'] if isinstance(item['download_bytes'], int))
    known_installed = sum(item['installed_bytes'] for item in users['tools'] if isinstance(item.get('installed_bytes'), int))
    unknown = [item['name'] for item in users['tools'] if item['download_bytes'] is None]
    print('  Direct archive download, known subtotal: ' + human_size(known_bytes))
    print('  Direct tool payload, known subtotal (before existing-file reuse): ' + human_size(known_installed))
    if unknown:
        print('  Archive download UNKNOWN: ' + ', '.join(unknown))
    for note in users['unknown']:
        print('  UNKNOWN: ' + note)
    print('  Full download / peak disk requirement: UNKNOWN; incomplete estimates are not a space guarantee.')
    # Do not call tempfile.gettempdir(): its discovery can create probe files.
    temporary = Path(os.environ.get('TMPDIR') or os.environ.get('TEMP') or '/tmp')
    print(f'  Free space: system={human_size(disk_space(Path("/")))}, home={human_size(disk_space(home))}, temporary={human_size(disk_space(temporary))}')
    print('  Allow extra space for unpacking/builds, npm/uv caches, old tool versions and configuration backups; these can use separate filesystems.')
    print('  Actual package candidates may change after the confirmed installation refreshes repositories.')
    return report
