"""Module installation actions, invoked only after the reviewed plan is accepted."""
import json
import hashlib
import os
from pathlib import Path
import re
import shlex
import shutil
import subprocess
import tarfile
import tempfile

from catalog import packages_for

LEGACY_BASHRC_SHA256 = {
    'a58e2f8e331a7d014d269e7ba40f3ebc0433b8de8b47f4eb27c8cc203a0dcb63',
    '02f2221f9b3121d39b1a1c968e713a52f7d838c28c230e071bcc7cf984c71f1a',
    '45041f3ecbe67009188eebe5b46c58ef0aaa66f558b3357912dbe6dff5cf3035',
    '19e67e0f859c7f26535cd1b37b6d004a44d3ad5bb250a8eb2750b2113cb5888c',
}


def existing_chrome_source(directory=Path('/etc/apt/sources.list.d')):
    """Reuse vendor-managed sources, avoiding duplicate Signed-By declarations."""
    for path in sorted(directory.glob('*')):
        if path.suffix not in ('.list', '.sources') or not path.is_file():
            continue
        text = '\n'.join(line for line in path.read_text(encoding='utf-8').splitlines()
                         if not line.lstrip().startswith('#'))
        url = r'https?://dl\.google\.com/linux/chrome(?:-stable)?/deb/?(?:\s|$)'
        if path.suffix == '.list':
            if any(line.strip().startswith('deb ') and re.search(url, line) for line in text.splitlines()):
                return path
        else:
            for block in re.split(r'\n\s*\n', text):
                if re.search(r'^Enabled:\s*no\s*$', block, re.M | re.I):
                    continue
                if re.search(r'^Types:.*\bdeb\b', block, re.M) and re.search(url, block):
                    return path
    return None


def install_archive(ctx, name, binaries, *, flat=False):
    version = ctx.versions[name]
    artifact = version[ctx.arch]
    directory = ctx.data / 'tools' / name / version['version']
    marker = directory / '.dotfiles-sha256'
    if directory.is_symlink() or not directory.resolve().is_relative_to(ctx.home.resolve()):
        raise ValueError(f'Tool installation must stay inside home: {directory}')
    if not directory.exists():
        archive = ctx.temp / (name + '.tar')
        ctx.runner.download(artifact['url'], archive, artifact['sha256'])
        extracted = ctx.temp / (name + '-extract')
        extracted.mkdir()
        with tarfile.open(archive) as bundle:
            bundle.extractall(extracted, filter='data')
        roots = list(extracted.iterdir())
        if flat:
            root = extracted
        elif len(roots) == 1 and roots[0].is_dir():
            root = roots[0]
        else:
            raise RuntimeError(f'Unexpected archive layout: {name}')
        for relative in binaries.values():
            if not (root / relative).is_file():
                raise RuntimeError(f'Missing binary in {name}: {relative}')
        directory.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(root), str(directory))
        marker.write_text(artifact['sha256'], encoding='ascii')
    elif not marker.is_file() or marker.read_text(encoding='ascii') != artifact['sha256']:
        raise RuntimeError(f'Unrecognized existing installation; inspect it before retrying: {directory}')
    for binary, relative in binaries.items():
        ctx.backup.link(directory / relative, ctx.home / '.local/bin' / binary)
    return directory


def deploy_configs(ctx):
    home, repo = ctx.home, ctx.repo
    if 'fonts' in ctx.modules:
        from fonts import configure_fonts
        configure_fonts(ctx)
    if 'shell' in ctx.modules:
        bashrc = home / '.bashrc'
        # Replace old dotfiles links, but never edit the repository through a symlink.
        if bashrc.is_symlink():
            target = bashrc.resolve()
            if target == repo / '.bashrc' or not bashrc.exists():
                skeleton = Path('/etc/skel/.bashrc')
                current = skeleton.read_text(encoding='utf-8') if skeleton.exists() else ''
            else:
                current = bashrc.read_text(encoding='utf-8')
        else:
            current = bashrc.read_text(encoding='utf-8') if bashrc.exists() else ''
        if hashlib.sha256(current.encode('utf-8')).hexdigest() in LEGACY_BASHRC_SHA256:
            skeleton = Path('/etc/skel/.bashrc')
            current = skeleton.read_text(encoding='utf-8') if skeleton.exists() else ''
        begin, end = '# >>> dotfiles managed >>>', '# <<< dotfiles managed <<<'
        pattern = re.compile(re.escape(begin) + r'.*?' + re.escape(end) + r'\n?', re.S)
        if current.count(begin) != current.count(end) or current.count(begin) > 1:
            raise RuntimeError('Malformed dotfiles block in ~/.bashrc; inspect it before installation.')
        current = pattern.sub('', current).rstrip() + '\n\n'
        block = f'{begin}\nsource {shlex.quote(str(repo / ".bashrc"))}\n{end}\n'
        ctx.backup.write_text(bashrc, current + block)
        # Login shells need user tools even when the shell module is sourced later.
        profile = home / '.profile'
        text = profile.read_text(encoding='utf-8') if profile.exists() else ''
        pbegin, pend = '# >>> dotfiles PATH >>>', '# <<< dotfiles PATH <<<'
        ppattern = re.compile(re.escape(pbegin) + r'.*?' + re.escape(pend) + r'\n?', re.S)
        if text.count(pbegin) != text.count(pend) or text.count(pbegin) > 1:
            raise RuntimeError('Malformed dotfiles PATH block in ~/.profile.')
        text = ppattern.sub('', text).rstrip() + '\n\n'
        text += pbegin + '\ncase ":$PATH:" in *":$HOME/.local/bin:"*) ;; *) PATH="$HOME/.local/bin:$PATH" ;; esac\nexport PATH\n' + pend + '\n'
        ctx.backup.write_text(profile, text)
        for name in ('.inputrc', '.dircolors', '.tmux.conf', '.rosrc'):
            ctx.backup.link(repo / name, home / name)
        ctx.backup.link(repo / 'configs/starship.toml', ctx.config / 'starship.toml')
        ctx.backup.link(repo / 'configs/shell/formatting.bash', ctx.config / 'dotfiles/formatting.bash')
        formatter = home / '.local/bin/ros-format'
        ctx.backup.write_text(formatter, (repo / 'commands/ros-format.py').read_text(encoding='utf-8'))
        formatter.chmod(0o755)
        clipboard = home / '.local/bin/dotfiles-clipboard'
        ctx.backup.write_text(clipboard, (repo / 'scripts/clipboard.sh').read_text(encoding='utf-8'))
        clipboard.chmod(0o755)
        fetchall = home / '.local/bin/fetchall'
        ctx.backup.write_text(fetchall, (repo / 'commands/fetchall.sh').read_text(encoding='utf-8'))
        fetchall.chmod(0o755)
    if 'neovim' in ctx.modules:
        ctx.backup.link(repo / 'configs/nvim', ctx.config / 'nvim')
        ctx.backup.link(repo / '.vimrc', home / '.vimrc')
    if 'latex' in ctx.modules:
        ctx.backup.link(repo / '.latexmkrc', home / '.latexmkrc')
    if 'keyboard' in ctx.modules:
        from keyboard import configure_keyboard
        configure_keyboard(ctx)
    if 'japanese-input' in ctx.modules:
        from japanese_input import configure_japanese_input
        configure_japanese_input(ctx)
    if 'ibis-office' in ctx.modules:
        from office import configure_office
        configure_office(ctx)
    if 'diagrams' in ctx.modules:
        for source, binary in (('png2eps.sh', 'png2eps'), ('jpg2eps.sh', 'jpg2eps'), ('image2eps.py', 'image2eps.py'),
                               ('plantuml-render.py', 'dotfiles-plantuml-render')):
            target = home / '.local/bin' / binary
            ctx.backup.write_text(target, (repo / 'commands' / source).read_text(encoding='utf-8'))
            target.chmod(0o755)


def install_plantuml(ctx):
    version = ctx.versions['plantuml']
    directory = ctx.data / 'tools/plantuml' / version['version']
    if directory.is_symlink() or not directory.resolve().is_relative_to(ctx.home.resolve()):
        raise ValueError(f'PlantUML installation must stay inside home: {directory}')
    jar = directory / 'plantuml.jar'
    if jar.exists() or jar.is_symlink():
        if jar.is_symlink() or hashlib.sha256(jar.read_bytes()).hexdigest() != version['sha256']:
            raise RuntimeError(f'Unrecognized existing PlantUML installation: {jar}')
    else:
        downloaded = ctx.temp / 'plantuml.jar'
        ctx.runner.download(version['url'], downloaded, version['sha256'])
        directory.mkdir(parents=True, exist_ok=True)
        # Publish on the destination filesystem only after a complete copy.
        staged = None
        try:
            with tempfile.NamedTemporaryFile(dir=directory, prefix='.plantuml-', delete=False) as output:
                staged = Path(output.name)
                with downloaded.open('rb') as source:
                    shutil.copyfileobj(source, output)
            staged.replace(jar)
        finally:
            if staged is not None:
                staged.unlink(missing_ok=True)
    java = f'/usr/lib/jvm/java-21-openjdk-{ctx.arch}/bin/java'
    wrapper = ctx.home / '.local/bin/plantuml'
    ctx.backup.write_text(wrapper, '#!/usr/bin/env bash\nset -euo pipefail\nexec '
                          + shlex.quote(java) + ' -Djava.awt.headless=true -jar '
                          + shlex.quote(str(jar)) + ' "$@"\n')
    wrapper.chmod(0o755)


def install_node_language_servers(ctx, node):
    """Use this installation's Node even before the user's new shell loads PATH."""
    prefix = ctx.home / '.local'
    for directory in (prefix, prefix / 'bin', prefix / 'lib/node_modules'):
        if not directory.resolve().is_relative_to(ctx.home.resolve()):
            raise ValueError(f'npm installation must stay inside home: {directory}')
    # Upstream typescript-language-server requires TypeScript 6's tsserver;
    # TypeScript 7 is a different implementation and no longer ships that binary.
    packages = [f'{package}@{version}' for package, version in ctx.versions['npm_language_servers'].items()]
    ctx.runner.run([str(node / 'bin/node'), str(node / 'lib/node_modules/npm/bin/npm-cli.js'),
                    'install', '--global', '--prefix', str(prefix), '--no-audit', '--no-fund', *packages],
                   env={'PATH': str(node / 'bin') + os.pathsep + os.environ.get('PATH', ''),
                        'NPM_CONFIG_PREFIX': str(prefix)})


def prepare_apt(ctx):
    run = ctx.runner.run
    run(['sudo', '-v'])
    run(['sudo', 'apt-get', 'update'])
    run(['sudo', 'apt-get', 'install', '-y', '--no-remove', '--no-install-recommends', 'ca-certificates', 'curl', 'git', 'software-properties-common', 'gnupg'])
    run(['sudo', 'add-apt-repository', '--yes', '--no-update', 'universe'])
    if 'ros2' in ctx.modules:
        policy = ctx.runner.capture(['apt-cache', 'policy'])
        if 'resolute-updates' not in policy or 'resolute-backports' not in policy:
            raise RuntimeError('ROS requires resolute-updates and resolute-backports. Enable them in Ubuntu Software & Updates or /etc/apt/sources.list.d/ubuntu.sources, then rerun. No distribution upgrade was performed.')
        version = ctx.versions['ros_source']
        archive = ctx.temp / 'ros2-apt-source.deb'
        ctx.runner.download(version['url'], archive, version['sha256'])
        # apt's sandbox user must be able to read the temporary package.
        os.chmod(ctx.temp, 0o755)
        os.chmod(archive, 0o644)
        run(['sudo', 'apt-get', 'install', '-y', '--no-remove', str(archive)])
    chrome_source = existing_chrome_source() if 'chrome' in ctx.modules else None
    if chrome_source:
        print(f'  Reusing existing Google Chrome repository: {chrome_source}')
    if 'chrome' in ctx.modules and not chrome_source:
        # Scoped keyring; never add vendor keys to the global trusted keyring.
        key = ctx.temp / 'google.asc'
        run(['curl', '--fail', '--show-error', '--location', '--proto', '=https', '--proto-redir', '=https', '--output', str(key), 'https://dl.google.com/linux/linux_signing_key.pub'])
        ring = ctx.temp / 'google-chrome.gpg'
        run(['gpg', '--batch', '--yes', '--dearmor', '--output', str(ring), str(key)])
        run(['sudo', 'install', '-m', '644', str(ring), '/usr/share/keyrings/google-chrome.gpg'])
        source = ctx.temp / 'google-chrome.sources'
        source.write_text('Types: deb\nURIs: https://dl.google.com/linux/chrome-stable/deb/\nSuites: stable\nComponents: main\nArchitectures: amd64\nSigned-By: /usr/share/keyrings/google-chrome.gpg\n', encoding='utf-8')
        # Match Chrome's postinst paths, so it updates this entry instead of adding another.
        run(['sudo', 'install', '-m', '644', str(source), '/etc/apt/sources.list.d/google-chrome.sources'])
    run(['sudo', 'apt-get', 'update'])
    packages = packages_for(ctx.modules)
    if 'ros2' in ctx.modules:
        packages += ['ros-lyrical-desktop' if 'ros-desktop' in ctx.modules else 'ros-lyrical-ros-base', 'ros-dev-tools']
    if 'chrome' in ctx.modules:
        packages.append('google-chrome-stable')
    run(['sudo', 'apt-get', 'install', '-y', '--no-remove', '--no-install-recommends', *packages])


def install_modules(ctx):
    prepare_apt(ctx)
    for index, name in enumerate(ctx.modules, 1):
        print(f'\n[{index}/{len(ctx.modules)}] {name}', flush=True)
        if name == 'fonts':
            from fonts import install_fonts
            install_fonts(ctx)
        elif name == 'shell':
            install_archive(ctx, 'starship', {'starship': 'starship'}, flat=True)
        elif name == 'python':
            install_archive(ctx, 'uv', {'uv': 'uv', 'uvx': 'uvx'})
            uv = ctx.home / '.local/bin/uv'
            for package in ('basedpyright', 'cmake-language-server', 'autopep8', 'ruff'):
                # uv-managed tools live separately from the interpreter used by ROS.
                ctx.runner.run([str(uv), 'tool', 'install', '--upgrade', '--python', '/usr/bin/python3', package])
            ctx.runner.run([str(uv), 'tool', 'list'])
        elif name == 'neovim':
            install_archive(ctx, 'neovim', {'nvim': 'bin/nvim'})
        elif name == 'node':
            node = install_archive(ctx, 'node', {'node': 'bin/node', 'npm': 'bin/npm', 'npx': 'bin/npx'})
            # Avoid writes to the versioned Node directory for global npm tools.
            ctx.backup.write_text(ctx.config / 'dotfiles/node.env', 'export NPM_CONFIG_PREFIX="$HOME/.local"\n')
            install_node_language_servers(ctx, node)
        elif name == 'latex':
            install_archive(ctx, 'texlab', {'texlab': 'texlab'}, flat=True)
        elif name == 'rust':
            version = ctx.versions['rustup']
            binary = ctx.temp / 'rustup-init'
            ctx.runner.download(version[ctx.arch]['url'], binary, version[ctx.arch]['sha256'])
            binary.chmod(0o755)
            ctx.runner.run([str(binary), '-y', '--no-modify-path', '--profile', 'minimal', '--default-toolchain', version['toolchain'], '--component', 'rustfmt', '--component', 'clippy', '--component', 'rust-analyzer'])
        elif name == 'ros2':
            if not Path('/etc/ros/rosdep/sources.list.d/20-default.list').exists():
                ctx.runner.run(['sudo', 'rosdep', 'init'])
            ctx.runner.run(['rosdep', 'update', '--rosdistro', 'lyrical'])
        elif name == 'diagrams':
            install_plantuml(ctx)
        elif name == 'ibis-office':
            from office import install_office
            install_office(ctx)
        elif name == 'vscode':
            try:
                ctx.runner.capture(['snap', 'list', 'code'])
            except subprocess.CalledProcessError:
                ctx.runner.run(['sudo', 'snap', 'install', 'code', '--classic'])
            else:
                print('  VS Code is already installed; updates remain managed by Snap.')
        elif name == 'macos-theme':
            from theme import install_theme
            install_theme(ctx)
    deploy_configs(ctx)
    if 'neovim' in ctx.modules and not ctx.no_plugins:
        ctx.runner.run([str(ctx.home / '.local/bin/nvim'), '--headless', '-u', 'NONE', '-i', 'NONE', '-l', str(ctx.repo / 'configs/nvim/bootstrap.lua')])
        from editor import retire_obsolete_theme
        retire_obsolete_theme(ctx)
    installed = ctx.runner.capture(['dpkg-query', '-W', '-f=${binary:Package}\t${Version}\n'])
    (ctx.backup.directory / 'apt-packages.txt').write_text(installed + '\n', encoding='utf-8')
    (ctx.backup.directory / 'versions.json').write_text(json.dumps(ctx.versions, indent=2) + '\n', encoding='utf-8')
