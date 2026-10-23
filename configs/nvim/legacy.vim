" Non-plugin settings inherited from origin/ubuntu2004:.vimrc.
" Shared by Neovim and the Vim fallback. No downloads or plugin dependencies.
set nocompatible

" US keyboard and clipboard.
nnoremap ; :
vnoremap ; :
vnoremap : :
set clipboard=unnamedplus

syntax enable
filetype plugin indent on
if exists('+linespace')
  set linespace=0
endif
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
if exists('+t_vb')
  set t_vb=
endif
set novisualbell
set autoindent
set smartindent
set expandtab
set smarttab
set listchars=tab:»-,trail:-,extends:»,precedes:«,nbsp:%,eol:↲
let &tabstop = 2
let &shiftwidth = &tabstop

function! DotfilesWhitespaceHighlight() abort
  highlight ZenkakuSpace cterm=underline ctermfg=lightblue guibg=#666666
endfunction
call DotfilesWhitespaceHighlight()
augroup DotfilesWhitespace
  autocmd!
  autocmd BufNewFile,BufRead * match ZenkakuSpace /　/
  autocmd ColorScheme * call DotfilesWhitespaceHighlight()
  " This intentionally includes Markdown's trailing spaces, as in the old vimrc.
  autocmd BufWritePre * :%s/\s\+$//ge
augroup END

inoremap <silent> jj <ESC>
cnoremap <expr> / getcmdtype() == '/' ? '\/' : '/'
cnoremap <expr> ? getcmdtype() == '?' ? '\?' : '?'

nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l
nnoremap <S-Left>  <C-w><<CR>
nnoremap <S-Right> <C-w>><CR>
nnoremap <S-Up>    <C-w>-<CR>
nnoremap <S-Down>  <C-w>+<CR>
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

" Keep w!!; quote the filename so paths containing spaces also work.
cmap w!! w !sudo tee > /dev/null <C-r>=shellescape(expand('%:p'))<CR>
set mouse=a
if exists('+ttymouse')
  set ttymouse=sgr
endif

augroup DotfilesFiletypes
  autocmd!
  autocmd BufRead,BufNewFile *.cmake,CMakeLists.txt setfiletype cmake
  autocmd BufRead,BufNewFile *.launch,*.urdf,*.xacro setfiletype xml
  autocmd BufRead,BufNewFile .tmux.conf setfiletype tmux
augroup END

command! ReopenWinFile edit ++enc=cp932
" Correct the old literal <1b> pattern and invalid trailing g$ flag.
command! DeleteAnsi %s/\e\[[0-9;]*m//ge

function! Preserve(command) abort
  let l:search = @/
  let l:view = winsaveview()
  try
    execute a:command
  finally
    let @/ = l:search
    call winrestview(l:view)
  endtry
endfunction

function! Autopep8() abort
  if !executable('autopep8')
    echoerr 'autopep8 is not installed. Install the dotfiles Python tools first.'
    return
  endif
  " Preserve both aggressive passes; failed formatters must not replace text.
  let l:formatted = systemlist('autopep8 --aggressive --aggressive -', join(getline(1, '$'), "\n") . "\n")
  if v:shell_error
    echoerr 'autopep8 failed: ' . join(l:formatted, "\n")
    return
  endif
  let l:view = winsaveview()
  try
    call setline(1, empty(l:formatted) ? [''] : l:formatted)
    if line('$') > max([1, len(l:formatted)])
      execute (max([1, len(l:formatted)]) + 1) . ',$delete _'
    endif
  finally
    call winrestview(l:view)
  endtry
endfunction
command! AutoPep8 call Autopep8()
