# Neovimへの設定移行

Neovim 0.11.3以上を使う。導入する安定版はインストーラーで固定する。
`configs/nvim/legacy.vim`に、`origin/ubuntu2004:.vimrc`のプラグイン以外の設定を継承した。
Vimを使う場合も、リポジトリの`.vimrc`へのシンボリックリンクから同じ設定を読み込む。

## 継承した操作と設定

| 対象 | 継承内容 |
|---|---|
| 入力・移動 | `jj`でEsc、`;`でコマンド入力、Ctrl+h/j/k/lでウィンドウ移動、Shift+矢印でサイズ変更 |
| 検索 | ignorecase/smartcase、逐次検索と強調表示、n/N/*/#/g*/g#後の中央表示、選択文字列の検索、検索欄の`/`と`?`のエスケープ |
| 表示 | 行番号、折り返し、j/kの表示行単位移動、不可視文字、全角空白の強調、UTF-8、ambiwidth=double |
| インデント | 2スペース、expandtab、smarttab、autoindent、smartindent、shiftround、textwidth=0 |
| 編集 | バッファ保持、switchbuf、ブロック選択のvirtualedit、括弧対応、コメント入力用`/**`、マウス、クリップボード |
| 保存 | backup・writebackup・swap無効、全ファイルの行末空白除去、`w!!`によるsudo保存 |
| コマンド | `ReopenWinFile`でCP932再読込、`DeleteAnsi`、`Preserve()`、`AutoPep8` |
| ファイル種別 | CMake、ROSのlaunch/urdf/xacro XML、tmux |

行末空白除去はMarkdownにも適用する。`AutoPep8`の`--aggressive --aggressive`も維持し、実行は手動のままとする。
Neovimにない`ttymouse`などの端末オプションだけ存在確認で分岐した。
`w!!`では空白を含むファイル名を引用し、`DeleteAnsi`は旧設定の誤ったエスケープ表記を修正した。
AutoPep8は実行ファイルの欠落や整形失敗で本文を失わないよう、成功した出力だけを反映する。

## プラグインと開発支援

| 旧構成 | 新構成 |
|---|---|
| Vundle/dein | lazy.nvim、Gitコミットを記録した`lazy-lock.json` |
| YCM/CoCと各補完拡張 | Neovim組込みLSPクライアントと補完。`vim.lsp.config`/`vim.lsp.enable`で設定 |
| Solarized | `maxmx03/solarized.nvim`、暗色・背景透過 |
| Airline | lualine。ブランチ、ファイル名、改行形式、文字コード、種別、進捗、位置を表示 |
| GitGutter | gitsigns |
| caw | Neovim標準の`gc`/`gcc`によるコメント操作 |
| Markdown preview/MathJax | live-preview.nvim。`:LivePreview start`、`:LivePreview close`。数式はKaTeX |
| CMake/Rust/TOML構文プラグイン | Neovim標準のファイル種別・構文設定 |
| vim-clang-format | 手動の`:ClangFormat`。プロジェクトの`.clang-format`を優先し、未指定時はGoogleスタイル |
| VimTeX / PlantUML構文 | 引き続き利用し、取得コミットを固定 |
| vim-shot-f | 追加プラグインを外し、標準のf/F/t/Tを利用 |

Markdownプレビューは明示したコマンドで開始し、ローカルアドレス`127.0.0.1`で待ち受ける。
Node.jsやnpmによるプレビュー用ビルドは不要。
VimTeXのプラグイン自体は小さいため共通導入するが、TeXエンジン・latexmkは任意モジュールとする。
TeX未導入時はコンパイルできない。従来のpLaTeX→dvipdfmx設定とビューアー引数は維持する。

言語サーバーはプラグインとは別にインストールする。
clangd、basedpyright、cmake-language-serverを標準の開発構成で使い、rust-analyzer、texlab、Bash/JSON/YAML/HTML/CSS用サーバーは、PATH上にある場合だけ有効にする。
Pythonの補完には`basedpyright-langserver`を使用する。ROS用パスは固定せず、Neovimを起動したシェルの環境を引き継ぐ。
C/C++はプロジェクトの`compile_commands.json`を用意する。colconではパッケージごとのビルドディレクトリや`.clangd`でその場所を指定できる。

補完候補はTab/Shift+Tabで移動し、選択した候補をEnterで確定する。手動の補完要求はCtrl+Space。
LSP接続時の`gd`は定義、`gD`は宣言、`gr`は参照、`K`は説明を表示する。
`<Leader>rn`は名前変更、`<Leader>ca`はコードアクション。Leaderは変更せず、既定のバックスラッシュを使う。
`:Format`はLSPによる手動整形、`:DotfilesLsp`は言語サーバーの導入状況、`:checkhealth vim.lsp`は接続診断に使える。

ROS 2 Jazzy用の整形には`:RosFormat`を使う。
シェルの4つの整形関数と同じ`ros-format`を呼び、現在のC/C++・Pythonバッファだけを変更する。保存は`:write`で行う。
既存の`:ClangFormat`と`:AutoPep8`は、それぞれ従来の用途・オプションで引き続き利用できる。
ROS用の適用範囲と検査方法は[ROS用コード整形](ros-formatting.md)を参照。

## 導入・更新とオフライン起動

通常起動ではGit clone、プラグインの自動導入、更新チェックを行わない。
lazy.nvimがなくても編集設定と導入済み言語サーバーを読み込み、導入コマンドを一度表示する。
明示的な導入は、設定の配置後に次のコマンドで行う。リポジトリの場所は実際のパスに置き換える。

```sh
nvim --headless -u NONE -i NONE -l /path/to/dotfiles/configs/nvim/bootstrap.lua
```

bootstrapはlazy.nvimを含めてロックファイルのコミットを取得し、全取得結果のHEADを検証する。
更新するときは`:Lazy update`を実行し、起動と必要な機能を確認したうえで`lazy-lock.json`の差分を保存する。
元のロックファイルを復元してbootstrapを再実行すれば、その構成を再現できる。
初期ロックのコミットは2026-10-23に各公式Gitリポジトリで確認した。lazy.nvimはstableタグの実コミットを記録している。

オフライン起動の検証には、既存設定に触れない一時HOME/XDGディレクトリを用意し、以下を実行する。

```sh
nvim --headless -i NONE --cmd 'set loadplugins' -u /path/to/dotfiles/configs/nvim/init.lua \
  -l /path/to/dotfiles/tests/nvim-smoke.lua
```

この検証は旧設定・キー割当の継承、実ファイル保存時の空白除去、ANSI制御文字の除去、CP932の再読込、初回起動でプラグインを取得しないことを確認する。
GUI・クリップボード・TeXビューアー・ブラウザープレビューは、ネイティブUbuntuとWSLで別途確認する。

導入済みプラグインは、同じ起動方法で`tests/nvim-plugins.lua`を指定して読み込みを確認する。
クリップボードは共通の`dotfiles-clipboard`を利用する。システムのクリップボードを読めないtmux環境では、tmuxの内部バッファから貼り付ける。

参照: [Neovim LSP](https://neovim.io/doc/user/lsp/)、[lazy.nvimのロックファイル](https://lazy.folke.io/usage/lockfile)、[live-preview.nvim](https://github.com/brianhuster/live-preview.nvim)、[Solarized](https://github.com/maxmx03/solarized.nvim)、[gitsigns](https://github.com/lewis6991/gitsigns.nvim)、[lualine](https://github.com/nvim-lualine/lualine.nvim)。
