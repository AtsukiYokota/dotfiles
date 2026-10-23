# Neovim

`neovim`モジュールでNeovim、lazy.nvim、補完用の言語サーバー、Nerd Fontを導入します。
端末では`nvim`または`vi`で起動します。

## 基本操作

| 操作 | キー・コマンド |
|---|---|
| 挿入モードから戻る | `jj`またはEsc |
| コマンド入力 | `;`または`:` |
| ウィンドウ移動 | Ctrl+h / j / k / l |
| ウィンドウのサイズ変更 | Shift+矢印 |
| コメント切り替え | `gcc`、選択範囲は`gc` |
| 定義・宣言・参照 | `gd` / `gD` / `gr` |
| シンボルの説明 | `K` |
| 名前変更 | `\rn` |
| コードアクション | `\ca` |
| CP932で開き直す | `:ReopenWinFile` |
| ANSI制御文字の除去 | `:DeleteAnsi` |

UTF-8、2スペースのインデント、行番号、マウス、OSクリップボードを設定しています。
日本語の表示幅は`ambiwidth=double`、Nerd Font Monoのアイコン領域は1セルです。
保存時には行末の空白を取り除きます。Markdownも対象です。

## 補完・整形

英数字・`_`の入力で補完候補を表示します。
Tab / Shift+Tabで選び、Enterで確定します。候補を選んでいないときのEnterは改行です。
手動の補完はCtrl+gに続けてSpace、ファイルパス補完はCtrl+gに続けてCtrl+fを押します。
LSPが接続されていないファイルでは、バッファ内の単語を補完します。

`:Format`は編集中のバッファをファイル種別に応じて整形します。
C/C++とPythonにはROS 2の整形設定を使い、それ以外は整形機能を持つ接続済みLSPを使います。
`:RosFormat`はROS用の整形を明示的に実行するコマンドです。
整形後の内容を保存するには`:write`を実行します。
ROS用の前提と対応範囲は[ROS用コード整形](ros-formatting.md)を参照してください。

| 診断 | コマンド |
|---|---|
| 言語サーバーの実行ファイル・導入モジュール・接続状態 | `:DotfilesLsp` |
| NeovimのLSP診断 | `:checkhealth vim.lsp` |
| プラグイン一覧 | `:Lazy` |

Pythonにはbasedpyright、C/C++にはclangdを使います。
C/C++のプロジェクトには`compile_commands.json`を用意してください。
ROSの環境変数はNeovimを起動したシェルから引き継ぎます。
`rust`モジュールはrust-analyzer、`latex`モジュールはTexlabを追加します。

## プレビュー

| ファイル | 開始・表示 | 停止 |
|---|---|---|
| Markdown / HTML | `:LivePreview start` | `:LivePreview close` |
| TeX | `:TexPreview`、PDFを開くには`:TexView` | `:TexPreviewStop` |
| PlantUML | `:PlantumlPreview` | `:PlantumlStop` |

TeXには`latex`、PlantUMLには`diagrams`モジュールが必要です。
保存後の再コンパイル、日本語・英語の文書、ビューアーの使い方は[エディタのプレビュー](editor-preview.md)を参照してください。

## プラグイン・外観

lazy.nvim、gruvbox.nvim、lualine.nvim、gitsigns.nvim、live-preview.nvim、plantuml-syntax、vimtexを使用します。
LSPと補完にはNeovim組込みの機能を使います。
アイコンが四角になる場合は、端末でNerd Fontが選択されているか確認してください。
設定方法は[外観・フォント](appearance.md)に記載しています。

通常起動ではプラグインのダウンロードや更新を行いません。
インストーラーは`lazy-lock.json`に記録されたコミットを取得します。
設定の配置後にプラグインだけを導入し直す場合は、リポジトリ内で次を実行します。

```sh
nvim --headless -u NONE -i NONE -l "$PWD/configs/nvim/bootstrap.lua"
```

更新には`:Lazy update`を使います。
動作確認後に`lazy-lock.json`の差分を保存すると、ほかの環境でも同じ構成を再現できます。
