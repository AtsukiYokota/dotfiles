"""Optional workflow tools: verified binaries and reversible user configuration."""
import hashlib
import json
from pathlib import Path
import re
import shutil
import tempfile

TOOL_MODULES = {
    'zoxide': ('zoxide',), 'atuin': ('atuin',), 'just': ('just',),
    'git-tools': ('lazygit', 'delta'), 'direnv': ('direnv',),
}


def workflow_operations(repo, home, config, modules):
    from planning import FileOperation
    operations = []
    if 'atuin' in modules:
        operations.append(FileOperation('link', config / 'atuin/config.toml',
                                        source=repo / 'configs/atuin/config.toml'))
    if 'git-tools' in modules:
        delta = config / 'dotfiles/delta.gitconfig'
        operations.extend([
            FileOperation('link', delta, source=repo / 'configs/git/delta.gitconfig'),
            FileOperation('link', config / 'lazygit/config.yml', source=repo / 'configs/lazygit/config.yml'),
        ])
        target = home / '.gitconfig'
        text = target.read_text(encoding='utf-8') if target.exists() else ''
        begin, end = '# >>> dotfiles delta >>>', '# <<< dotfiles delta <<<'
        if text.count(begin) != text.count(end) or text.count(begin) > 1 or (begin in text and text.index(begin) > text.index(end)):
            raise ValueError('Malformed dotfiles delta block in ~/.gitconfig.')
        text = re.sub(re.escape(begin) + r'.*?' + re.escape(end) + r'\n?', '', text, flags=re.S).rstrip()
        block = f'{begin}\n[include]\n    path = {json.dumps(str(delta), ensure_ascii=False)}\n{end}\n'
        operations.append(FileOperation('write', target, content=(text + '\n\n' if text else '') + block))
    return operations


def install_binary(ctx, name):
    """Publish a raw release binary only after verification, without shell installers."""
    version = ctx.versions[name]
    artifact = version[ctx.arch]
    directory = ctx.data / 'tools' / name / version['version']
    binary = directory / name
    if directory.is_symlink() or not directory.resolve().is_relative_to(ctx.home.resolve()):
        raise ValueError(f'Tool installation must stay inside home: {directory}')
    if directory.exists():
        if binary.is_symlink() or not binary.is_file() or hashlib.sha256(binary.read_bytes()).hexdigest() != artifact['sha256']:
            raise RuntimeError(f'Unrecognized existing installation; inspect it before retrying: {directory}')
    else:
        downloaded = ctx.temp / (name + '.binary')
        ctx.runner.download(artifact['url'], downloaded, artifact['sha256'])
        directory.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='.' + name + '-', dir=directory.parent) as temporary:
            staging = Path(temporary) / 'release'
            staging.mkdir()
            shutil.copyfile(downloaded, staging / name)
            (staging / name).chmod(0o755)
            (staging / '.dotfiles-sha256').write_text(artifact['sha256'], encoding='ascii')
            staging.rename(directory)
    ctx.backup.link(binary, ctx.home / '.local/bin' / name)
    return directory


def install_tools(ctx, module=None):
    from actions import install_archive
    modules = [module] if module else ctx.modules
    for selected in modules:
        for name in TOOL_MODULES.get(selected, ()):
            if name == 'direnv':
                install_binary(ctx, name)
            else:
                install_archive(ctx, name, {name: name}, flat=name in ('zoxide', 'just', 'lazygit'))


def record_installation(state, modules, platform, arch):
    """Record only successful complete installs, accumulating prior selections."""
    path = state / 'installed.json'
    if path.is_symlink():
        raise ValueError('The installation receipt must not be a symbolic link.')
    old = {}
    if path.is_file():
        try:
            old = json.loads(path.read_text(encoding='utf-8'))
        except (OSError, ValueError):
            old = {}
    previous = old.get('modules', []) if isinstance(old, dict) else []
    previous = previous if isinstance(previous, list) and all(isinstance(item, str) for item in previous) else []
    from catalog import MODULES
    receipt = {'version': 1, 'modules': sorted((set(previous) | set(modules)) & MODULES.keys()),
               'platform': platform, 'arch': arch}
    with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=state, prefix='.installed-', delete=False) as output:
        temporary = Path(output.name)
        json.dump(receipt, output, indent=2)
        output.write('\n')
    try:
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)
