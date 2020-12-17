if !&compatible
  set nocompatible
endif

" Reset augroup
augroup MyAutoCmd
  autocmd!
augroup END

" dein settings {{{
let s:dein_dir = expand('~/.vim/dein')
let s:dein_repo_dir = s:dein_dir . '/repos/github.com/Shougo/dein.vim'

" dein installation check {{{
if &runtimepath !~# '/dein.vim'
  if !isdirectory(s:dein_repo_dir)
    execute '!git clone https://github.com/Shougo/dein.vim' s:dein_repo_dir
  endif
  execute 'set runtimepath^=' . s:dein_repo_dir
endif
" }}}

" Load plugins and make cache
let s:toml_file = expand('~/.vim') . '/dein.toml'
if dein#load_state(s:dein_dir)
  call dein#begin(s:dein_dir)
  call dein#load_toml(s:toml_file)
  call dein#end()
  call dein#save_state()
endif
" Auto plugin install
if has('vim_starting') && dein#check_install()
  call dein#install()
endif
" }}}


" Standard settings {{{

" For US keyboard
nnoremap ; :
vnoremap ; :
vnoremap : :

" Clipboard
set clipboard=unnamedplus

" Common settings
syntax enable
filetype plugin indent on
set linespace=0
let &encoding = 'utf-8'
let &fileencoding = &encoding
let &ambiwidth = 'double'
set backspace=indent,eol,start
set nowritebackup
set nobackup
set noswapfile
set list
set number
set wrap
set textwidth=0
set ignorecase
set smartcase
set incsearch
set hlsearch
set shiftround
set infercase
set virtualedit=block
set hidden
set switchbuf=useopen
set showmatch
set matchtime=3
set matchpairs& matchpairs+=<:>
set t_vb=
set novisualbell
set autoindent
set smartindent
set expandtab
set smarttab
set listchars=tab:»-,trail:-,extends:»,precedes:«,nbsp:%,eol:↲

let &tabstop = 2
let &shiftwidth = &tabstop

highlight ZenkakuSpace cterm=underline ctermfg=lightblue guibg=#666666
au BufNewFile,BufRead * match ZenkakuSpace /　/

" ESC alias
inoremap <silent> jj <ESC>


" Auto escape
cnoremap <expr> / getcmdtype() == '/' ? '\/' : '/'
cnoremap <expr> ? getcmdtype() == '?' ? '\?' : '?'

" Window
nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l
nnoremap <S-Left>  <C-w><<CR>
nnoremap <S-Right> <C-w>><CR>
nnoremap <S-Up>    <C-w>-<CR>
nnoremap <S-Down>  <C-w>+<CR>

" Search word under cursor
vnoremap <silent> * "vy/\V<C-r>=substitute(escape(@v, '\/'), "\n", '\\n','g')<CR><CR>

nnoremap n nzz
nnoremap N Nzz
nnoremap * *zz
nnoremap # #zz
nnoremap g* g*zz
nnoremap g# g#zz
nnoremap j gj
nnoremap k gk

inoremap /**  /**<cr><left><left><bs><right><right><cr><bs>/<up>

" }}}


" Force write
cmap w!! w !sudo tee > /dev/null %

" tmux settings
set mouse=a
set ttymouse=sgr

" File type
autocmd BufRead,BufNewFile *.cmake        let &filetype = 'cmake'
autocmd BufRead,BufNewFile CMakeLists.txt let &filetype = 'cmake'
autocmd BufRead,BufNewFile *.launch       let &filetype = 'xml'
autocmd BufRead,BufNewFile *.urdf         let &filetype = 'xml'
autocmd BufRead,BufNewFile *.xacro        let &filetype = 'xml'
autocmd BufRead,BufNewFile .tmux.conf     let &filetype = 'tmux'


" Remove end of line space
autocmd BufWritePre * :%s/\s\+$//ge

" Useful commands
:command ReopenWinFile e ++enc=cp932
command! DeleteAnsi %s/<1b>\[[0-9;]*m//g$
function! Preserve(command)
    " Save the last search.
    let search = @/
    " Save the current cursor position.
    let cursor_position = getpos('.')
    " Save the current window position.
    normal! H
    let window_position = getpos('.')
    call setpos('.', cursor_position)
    " Execute the command.
    execute a:command
    " Restore the last search.
    let @/ = search
    " Restore the previous window position.
    call setpos('.', window_position)
    normal! zt
    " Restore the previous cursor position.
    call setpos('.', cursor_position)
endfunction

function! Autopep8()
    call Preserve(':silent %!autopep8 --aggressive --aggressive -')
endfunction

:command AutoPep8 call Autopep8()<CR>
