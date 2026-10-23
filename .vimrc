" Vim fallback: keep the same editing settings without Neovim-only plugins.
let s:dotfiles_root = fnamemodify(resolve(expand('<sfile>:p')), ':h')
execute 'source' fnameescape(s:dotfiles_root . '/configs/nvim/legacy.vim')
