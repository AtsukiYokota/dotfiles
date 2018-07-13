" -- Standard Settings --
set guifont=SF\ Mono\ 13
set linespace=0
let                 &encoding = 'utf-8'
let &fileencoding = &encoding
let &ambiwidth = 'double'

set ignorecase          " 大文字小文字を区別しない
set smartcase           " 検索文字に大文字がある場合は大文字小文字を区別
set incsearch           " インクリメンタルサーチ
set hlsearch            " 検索マッチテキストをハイライト (2013-07-03 14:30 修正）

" バックスラッシュやクエスチョンを状況に合わせ自動的にエスケープ
cnoremap <expr> / getcmdtype() == '/' ? '\/' : '/'
cnoremap <expr> ? getcmdtype() == '?' ? '\?' : '?'

set shiftround          " '<'や'>'でインデントする際に'shiftwidth'の倍数に丸める
set infercase           " 補完時に大文字小文字を区別しない
set virtualedit=block
set hidden              " バッファを閉じる代わりに隠す（Undo履歴を残すため）
set switchbuf=useopen   " 新しく開く代わりにすでに開いてあるバッファを開く
set showmatch           " 対応する括弧などをハイライト表示する
set matchtime=3         " 対応括弧のハイライト表示を3秒にする

" 対応括弧に'<'と'>'のペアを追加
set matchpairs& matchpairs+=<:>
" inoremap ""  ""<left>
" inoremap $$  $$<left>
" inoremap ''  ''<left>
" inoremap ()  ()<left>
" inoremap <>  <><left>
" inoremap []  []<left>
"
inoremap {<Enter> {}<Left><CR><ESC><S-o>

vnoremap :  :s/
vnoremap >  >gv
vnoremap <  <gvnoremap {}  {}<left>
nnoremap + <c-a>
nnoremap - <c-x>

 " バックスペースでなんでも消せるようにする
set backspace=indent,eol,start

" クリップボードをデフォルトのレジスタとして指定。後にYankRingを使うので
" 'unnamedplus'が存在しているかどうかで設定を分ける必要がある
if has('unnamedplus')
    " set clipboard& clipboard+=unnamedplus " 2013-07-03 14:30 unnamed 追加
        set clipboard& clipboard+=unnamedplus,unnamed
        else
            " set clipboard& clipboard+=unnamed,autoselect 2013-06-24 10:00
            " autoselect 削除
                set clipboard& clipboard+=unnamed
                endif

                " Swapファイル？Backupファイル？前時代的すぎ
                " なので全て無効化する
set nowritebackup
set nobackup
set noswapfile
set list                " 不可視文字の可視化
set number              " 行番号の表示
set wrap                " 長いテキストの折り返し
set textwidth=0         " 自動的に改行が入るのを無効化

" 前時代的スクリーンベルを無効化
set t_vb=
set novisualbell

" デフォルト不可視文字は美しくないのでUnicodeで綺麗に
set listchars=tab:»-,trail:-,extends:»,precedes:«,nbsp:%,eol:↲

highlight ZenkakuSpace cterm=underline ctermfg=lightblue guibg=#666666
au BufNewFile,BufRead * match ZenkakuSpace /　/

inoremap <silent> jj <ESC>

" カーソル下の単語を * で検索
vnoremap <silent> * "vy/\V<C-r>=substitute(escape(@v, '\/'), "\n", '\\n','g')<CR><CR>

" 検索後にジャンプした際に検索単語を画面中央に持ってくる
nnoremap n nzz
nnoremap N Nzz
nnoremap * *zz
nnoremap # #zz
nnoremap g* g*zz
nnoremap g# g#zz

" j, k による移動を折り返されたテキストでも自然に振る舞うように変更
nnoremap j gj
nnoremap k gk

" vを二回で行末まで選択
vnoremap v $h

" TABにて対応ペアにジャンプ
nnoremap <Tab> %
vnoremap <Tab> %

" Ctrl + hjkl でウィンドウ間を移動
nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l

" Shift + 矢印でウィンドウサイズを変更
nnoremap <S-Left>  <C-w><<CR>
nnoremap <S-Right> <C-w>><CR>
nnoremap <S-Up>    <C-w>-<CR>
nnoremap <S-Down>  <C-w>+<CR>

" T + ? で各種設定をトグル
nnoremap [toggle] <Nop>
nmap T [toggle]
nnoremap <silent> [toggle]s :setl spell!<CR>:setl spell?<CR>
nnoremap <silent> [toggle]l :setl list!<CR>:setl list?<CR>
nnoremap <silent> [toggle]t :setl expandtab!<CR>:setl expandtab?<CR>
nnoremap <silent> [toggle]w :setl wrap!<CR>:setl wrap?<CR>

" w!! でスーパーユーザーとして保存（sudoが使える環境限定）
cmap w!! w !sudo tee > /dev/null %

" :e などでファイルを開く際にフォルダが存在しない場合は自動作成
function! s:mkdir(dir, force)
  if !isdirectory(a:dir) && (a:force ||
          \ input(printf('"%s" does not exist. Create? [y/N]', a:dir)) =~?
          '^y\%[es]$')
              call mkdir(iconv(a:dir, &encoding, &termencoding), 'p')
                endif
                endfunction

                " vim起動時のみカレントディレクトリを開いたファイルの親ディレクトリに指定
                function! s:ChangeCurrentDir(directory, bang)
                    if a:directory == ''
                            lcd %:p:h
                                else
                                        execute 'lcd' . a:directory
                                            endif

                                                if a:bang == ''
                                                        pwd
                                                            endif
                                                            endfunction

                                                            "~/.vimrc.localが存在する場合のみ設定を読み込む
                                                            let s:local_vimrc = expand('~/.vimrc.local')
                                                            if filereadable(s:local_vimrc)
                                                                execute 'source ' . s:local_vimrc
                                                            endif

set nocompatible               " be iMproved
filetype off                   " required!
set rtp+=~/.vim/bundle/vundle/
call vundle#rc()
" let Vundle manage Vundle
" required!
Bundle 'gmarik/vundle'
" My Bundles here:
"
" original repos on github
Bundle 'tpope/vim-fugitive'
Bundle 'Lokaltog/vim-easymotion'
Bundle 'rstacruz/sparkup', {'rtp': 'vim/'}
Bundle 'tpope/vim-rails.git'
" vim-scripts repos
Bundle 'L9'
Bundle 'FuzzyFinder'
" non github repos
Bundle 'https://github.com/davidhalter/jedi-vim.git'
" ...
Bundle 'Valloric/YouCompleteMe'
Bundle 'tyru/caw.vim'
Bundle 'plasticboy/vim-markdown'
Bundle 'suan/vim-instant-markdown'
Bundle 'altercation/vim-colors-solarized'
Bundle 'vim-airline/vim-airline'
Bundle 'vim-airline/vim-airline-themes'
Bundle 'chenzhiwo/ycm-extra-conf-ros'
Bundle 'scrooloose/nerdtree'
Bundle 'Shougo/neocomplcache'
Bundle 'Shougo/neosnippet'
Bundle 'Shougo/neosnippet-snippets'
filetype plugin indent on     " required!
"
" Brief help
" :BundleList          - list configured bundles
" :BundleInstall(!)    - install(update) bundles
" :BundleSearch(!) foo - search(or refresh cache first) for foo
" :BundleClean(!)      - confirm(or auto-approve) removal of unused bundles
"
" see :h vundle for more details or wiki for FAQ
"" -- YouCompleteMe Plugin Configs --
let g:ycm_autoclose_preview_window_after_insertion = 1
let g:ycm_complete_in_comments = 1
let g:ycm_complete_in_strings = 1
let g:ycm_echo_current_diagnostic = 0
let g:ycm_enable_diagnostic_highlighting = 0
let g:ycm_enable_diagnostic_signs = 0
let g:ycm_filetype_blacklist = {'markdown':1, 'tex':1, 'latex':1}
let g:ycm_filetype_whitelist = {'c':1, 'cpp':1, 'python':1}
let g:ycm_global_ycm_extra_conf = '~/dotfiles/.vim/config/.ycm_better_conf.py'
let g:ycm_key_invoke_completion = '<c-c>'
let g:ycm_key_list_previous_completion = [         '<c-k>']
let g:ycm_key_list_select_completion   = ['<tab>', '<c-j>']
let g:ycm_min_num_of_chars_for_completion = 1
let g:ycm_seed_identifiers_with_syntax = 1
let g:ycm_show_diagnostic_ui = 1
let g:ycm_global_ycm_extra_conf = '/home/yokota/.vim/bundle/YouCompleteMe/third_party/ycmd/cpp/ycm/.ycm_extra_conf.py'
let g:ycm_use_ultisnips_completer = 0
"NOTE: comments after Bundle command are not allowed..
set clipboard=unnamedplus
" -- Syntax Highlighting ---------------------------------------
let g:solarized_termcolors = 16
let g:solarized_termtrans  =  1
let g:solarized_degrade    =  0
let g:solarized_bold       =  1
let g:solarized_italic     =  1
let g:solarized_underline  =  1
let g:solarized_contrast   = 'normal'
let g:solarized_visibility = 'normal'
syntax enable
set background=light
colorscheme solarized
highlight MatchParen ctermbg=none
highlight LineNr     ctermbg=none

let g:vim_markdown_folding_disabled=1
nnoremap <silent><C-e> :NERDTreeToggle<CR>

" Plugin key-mappings.
imap <C-k>     <Plug>(neosnippet_expand_or_jump)
smap <C-k>     <Plug>(neosnippet_expand_or_jump)
xmap <C-k>     <Plug>(neosnippet_expand_target)

" SuperTab like snippets behavior.
"imap <expr><TAB>
" \ pumvisible() ? "\<C-n>" :
" \ neosnippet#expandable_or_jumpable() ?
" \    "\<Plug>(neosnippet_expand_or_jump)" : "\<TAB>"
smap <expr><TAB> neosnippet#expandable_or_jumpable() ?
\ "\<Plug>(neosnippet_expand_or_jump)" : "\<TAB>"

" For conceal markers.
if has('conceal')
  set conceallevel=2 concealcursor=niv
endif

"set snippet file dir
let g:neosnippet#snippets_directory='~/.vim/bundle/neosnippet-snippets/neosnippets/'

" unicode symbols
let g:airline_symbols = {}
let g:airline_left_sep = '»'
let g:airline_left_sep = '▶'
let g:airline_right_sep = '«'
let g:airline_right_sep = '◀'
let g:airline_symbols.crypt = '🔒'
let g:airline_symbols.linenr = '␊'
let g:airline_symbols.linenr = '␤'
let g:airline_symbols.linenr = '¶'
let g:airline_symbols.maxlinenr = '☰'
let g:airline_symbols.maxlinenr = ''
let g:airline_symbols.branch = '⎇'
let g:airline_symbols.paste = 'ρ'
let g:airline_symbols.paste = 'Þ'
let g:airline_symbols.paste = '∥'
let g:airline_symbols.spell = 'Ꞩ'
let g:airline_symbols.notexists = '∄'
let g:airline_symbols.whitespace = 'Ξ'
let g:airline_linecolumn_prefix = ''
let g:airline#extensions#hunks#non_zero_only = 1
let g:airline#extensions#whitespace#enabled = 0
let g:airline#extensions#branch#enabled = 0
let g:airline#extensions#readonly#enabled = 0
let g:airline_section_b =
      \ '%{airline#extensions#branch#get_head()}' .
      \ '%{""!=airline#extensions#branch#get_head()?("  " . g:airline_left_alt_sep . " "):""}' .
      \ '%t%( %M%)'
let g:airline_section_c = ''
let s:sep = " %{get(g:, 'airline_right_alt_sep', '')} "
let g:airline_section_x =
      \ '%{strlen(&fileformat)?&fileformat:""}'.s:sep.
      \ '%{strlen(&fenc)?&fenc:&enc}'.s:sep.
      \ '%{strlen(&filetype)?&filetype:"no ft"}'
let g:airline_section_y = '%3p%%'
let g:airline_section_z = get(g:, 'airline_linecolumn_prefix', '').'%3l:%-2v'
let g:airline_inactive_collapse = 0
function! AirLineForce()
  let w:airline_render_left = 1
  let w:airline_render_right = 1
endfunction
" augroup AirLineForce
"   autocmd!
"   autocmd VimEnter * call add(g:airline_statusline_funcrefs, function('AirLineForce'))
" augroup END
let g:airline_theme='solarized'
set t_Co=16

inoremap /**  /**<cr><left><left><bs><right><right><cr><bs>/<up>

let               &tabstop = 2
let &shiftwidth = &tabstop
set autoindent
set smartindent
set expandtab
set smarttab

autocmd BufRead,BufNewFile *.cmake    let &filetype = 'cmake'
autocmd BufRead,BufNewFile *.launch   let &filetype = 'xml'
autocmd BufRead,BufNewFile .tmux.conf let &filetype = 'tmux'

autocmd BufWritePre * :%s/\s\+$//ge
