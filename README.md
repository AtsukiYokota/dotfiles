# dotfiles

[![Ubuntu dotfiles checks](https://github.com/AtsukiYokota/dotfiles/actions/workflows/check.yml/badge.svg)](https://github.com/AtsukiYokota/dotfiles/actions/workflows/check.yml)

Ubuntu 24.04向けの開発環境セットアップです。ネイティブUbuntuとWSLに対応し、必要なモジュールを選んで導入できます。

## インストール

Ubuntu 24.04のamd64・arm64に対応しています。UbuntuのBashから、一般ユーザーで実行してください。

```bash
sudo apt update
sudo apt install -y git
git clone --branch master https://github.com/AtsukiYokota/dotfiles.git ~/dotfiles
cd ~/dotfiles
bash setup_all.sh
```

矢印キーで移動、Spaceで選択、Enterで内容を確認します。`INSTALL`と入力すると導入を開始します。
番号による選択を使う場合は`bash setup_all.sh --plain`を実行してください。`a`で利用可能な全モジュールを選べます。

設定はリポジトリへのリンクを使います。導入後も`~/dotfiles`を残してください。
WSLでもリポジトリはLinux側のホームに置きます。

## モジュール

初期選択は`shell,cpp,python,neovim,ros2`です。依存モジュールは自動で追加されます。
ネイティブGNOMEでは`keyboard`も初期選択に含まれます。

| ID | 内容 |
| --- | --- |
| `fonts` | JetBrainsMono Nerd Font Mono、端末フォント設定 |
| `shell` | Bash、Starship、tmux、検索・クリップボード・Git補助 |
| `cpp` | C/C++コンパイラー、CMake、Ninja、clangd、clang-format |
| `python` | uv、basedpyright、CMake言語サーバー、autopep8、Ruff |
| `neovim` | Neovim、lazy.nvim、LSP・補完 |
| `ros2` | ROS 2 Jazzy、colcon、rosdep、ament整形・検査 |
| `ros-desktop` | RViz、ROSデモ |
| `rust` | Rust、rustfmt、Clippy、rust-analyzer |
| `node` | Node.js LTS、npm、Bash・JSON・YAML・HTML・CSS・JS/TS用LSP |
| `latex` | 日本語TeX、LuaLaTeX、latexmk、Texlab、PDFライブプレビュー |
| `diagrams` | PlantUML、Graphviz、画像のライブプレビュー・EPS変換 |
| `desktop` | Inkscape、VLC、フォント |
| `keyboard` | Caps LockをCtrlへ変更 |
| `japanese-input` | Fcitx 5＋Mozc、日本語入力の有効・無効キー |
| `vscode` | VS Code |
| `chrome` | Google Chrome |
| `macos-theme` | WhiteSurテーマ・アイコン・カーソル・壁紙、Dock自動非表示 |
| `ssh-server` | OpenSSHサーバー |

`desktop,keyboard,japanese-input,vscode,chrome,macos-theme`はネイティブ用です。`chrome`はamd64用、`keyboard,japanese-input,macos-theme`はGNOMEセッションが必要です。
WSLのGUIにはWSLgなどの表示環境を使います。`ssh-server`を選ぶとSSH待ち受けサービスを導入します。
WSLは自動検出し、ネイティブ専用モジュールを選択対象から外します。GNOMEのデスクトップ設定も適用しません。
`neovim`を選ぶと、言語サーバーの実行に必要な`node`も自動で導入します。
`shell`には`fonts`が含まれ、対応する端末のNerd Fontも設定します。

選択内容をコマンドで指定することもできます。

```bash
bash setup_all.sh --modules shell,neovim,ros-desktop,latex --dry-run
bash setup_all.sh --modules shell,neovim,ros-desktop,latex
```

## インストール後

新しい端末を開き、[セットアップ確認ガイド](docs/verification.md)に沿って動作を確認してください。
クリーン環境での全モジュール導入、ROS通信・ビルド、Neovim、tmux、各追加ツールの確認手順を掲載しています。
端末や端末のタブごとに、新しいtmuxセッションを自動で開きます。Neovimは`vi`でも起動できます。
プロンプトはGruvbox Rainbow、NeovimとtmuxもGruvboxの配色です。

個別設定は`~/.bashrc.local`に記述します。[記入例](configs/shell/bashrc.local.example)を参照してください。
ログと変更前の設定は`~/.local/state/dotfiles/backups/`に保存します。設定の復元コマンドは導入完了時に表示されます。

- [ターミナル操作](docs/terminal-workflow.md)
- [外観・フォント設定と既存環境への反映](docs/appearance.md)
- [日本語入力](docs/japanese-input.md)
- [NeovimのTeX・Markdown・PlantUMLプレビューと整形](docs/editor-preview.md)
- [ROS 2コード整形](docs/ros-formatting.md)
