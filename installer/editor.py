"""Retire only the previous known theme cache after successful plugin bootstrap."""
import os
import subprocess


def _legacy_origin(origin):
    origin = origin.strip().rstrip('/')
    if origin.endswith('.git'):
        origin = origin[:-4]
    return origin in {
        'https://github.com/maxmx03/solarized.nvim',
        'git@github.com:maxmx03/solarized.nvim',
        'ssh://git@github.com/maxmx03/solarized.nvim',
    }


def retire_obsolete_theme(ctx):
    """Back up Solarized's old cache; caller must first bootstrap Gruvbox fully."""
    def report(message):
        message = '  Neovim theme cache: ' + message
        print(message, flush=True)
        with (ctx.backup.directory / 'install.log').open('a', encoding='utf-8') as output:
            output.write(message + '\n')

    if os.environ.get('NVIM_APPNAME', 'nvim') != 'nvim':
        report('custom NVIM_APPNAME; leaving existing caches unchanged.')
        return False
    # ctx.data is XDG_DATA_HOME/dotfiles, whereas Neovim uses XDG_DATA_HOME/nvim.
    root = ctx.data.parent / 'nvim/lazy'
    old = root / 'solarized.nvim'
    new = root / 'gruvbox.nvim'
    if not old.exists() and not old.is_symlink():
        report('no previous Solarized cache.')
        return False
    if (old.is_symlink() or not old.is_dir() or not (old / '.git').is_dir()
            or not old.parent.resolve().is_relative_to(ctx.home.resolve())):
        report('Solarized path is not a recognized local checkout; kept unchanged.')
        return False
    if (new.is_symlink() or not new.is_dir() or not (new / 'lua/gruvbox.lua').is_file()
            or not new.resolve().is_relative_to(ctx.home.resolve())):
        report('Gruvbox is not installed in the expected directory; kept Solarized.')
        return False
    try:
        origin = ctx.runner.capture(['git', '-C', str(old), 'remote', 'get-url', 'origin'])
    except (OSError, subprocess.CalledProcessError):
        report('cannot verify the previous theme origin; kept unchanged.')
        return False
    if not _legacy_origin(origin):
        report('Solarized origin does not match the previous managed theme; kept unchanged.')
        return False
    ctx.backup.retire(old)
    report('moved previous Solarized checkout, including local edits, into this installation backup.')
    return True
