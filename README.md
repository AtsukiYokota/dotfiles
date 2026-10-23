# dotfiles — Ubuntu 24.04 / ROS 2 Jazzy

Ubuntu 24.04のネイティブ環境とWSL向けの開発環境です。
最初に必要なモジュールを選び、追加される依存関係と設定変更を確認してから、一括で導入します。
Neovimは従来のVimの操作設定を引き継ぎ、lazy.nvimでプラグインを管理します。

## 導入

リポジトリをLinux側のホームディレクトリに置き、一般ユーザーで実行します。
WSLでは `/mnt/c` より `~/dotfiles` などのLinuxファイルシステム上を推奨します。
設定はこのリポジトリへのリンクを使うため、導入後もディレクトリを残してください。

```sh
git clone --branch master https://github.com/AtsukiYokota/dotfiles.git ~/dotfiles
cd ~/dotfiles
bash setup_all.sh
```

矢印キーまたは `j` / `k` で移動し、Spaceで選択、Enterで確認画面へ進みます。
確認画面で `INSTALL` と入力すると開始します。Enterだけなら中止します。
パッケージ導入などの管理者権限が必要な処理ではsudoを使います。
小さい端末やcursesを使えない環境では番号選択に切り替わります。`--plain` でも指定できます。

```sh
# モジュール一覧
bash setup_all.sh --list-modules

# プレビューだけ。ファイル変更・通信・sudoは行いません
bash setup_all.sh --modules shell,neovim,ros-desktop,latex --dry-run

# モジュールを明示して導入（通常は確認画面あり）
bash setup_all.sh --modules shell,neovim,ros-desktop,latex

# スクリプトから確認を省略する場合
bash setup_all.sh --modules shell,neovim,ros2 --yes

# パッケージ・プラグインを導入せず設定だけ配置
bash setup_all.sh --modules shell,neovim --configs-only
```

PythonはUbuntu標準の `/usr/bin/python3` 3.12以上を使います。
Conda、venv、pyenvのPythonでインストーラーを動かさないようにしています。
Ubuntu 24.04以外ではプレビューだけ利用できます。対応CPUはamd64とarm64です。

## 選べるモジュール

初期選択は `shell,cpp,python,neovim,ros2` です。依存モジュールは自動で追加します。
ネイティブGNOMEのセッションでは `keyboard` も初期選択に含めます。不要なら選択を外せます。

| ID | 内容 |
|---|---|
| `shell` | Bash、Starship、tmux、ripgrep、fzf、Git・整形補助コマンド、Wayland/X11/WSLクリップボード |
| `cpp` | Ubuntu提供のC/C++コンパイラー、CMake、Ninja、clangd、clang-format、ctags |
| `python` | uv、分離した環境のbasedpyright、cmake-language-server、autopep8、Ruff |
| `neovim` | 安定版Neovim、lazy.nvim、LSP・補完。shell/cpp/pythonを含む |
| `ros2` | ROS 2 Jazzyのros-base、ros-dev-tools、ament整形・検査、rosdep初期化。shell/cpp/pythonを含む |
| `ros-desktop` | ros2にRViz・デモ等を追加。WSLではWSLg等の表示環境が必要 |
| `rust` | Rust、rustfmt、Clippy、rust-analyzer |
| `node` | Node.js 24 LTS、npm。グローバル導入先は `~/.local` |
| `latex` | 日本語TeX、LuaLaTeX、latexmk、biber、`.latexmkrc` |
| `diagrams` | PlantUML、Graphviz、日本語フォント、PNG/JPEG→EPS変換 |
| `desktop` | Inkscape、VLC、GNOME Tweaks、フォント。ネイティブ用 |
| `keyboard` | Caps LockをCtrlに変更。ネイティブGNOME用、元の設定を保存 |
| `vscode` | 公式SnapのVS Code。ネイティブ用 |
| `chrome` | GoogleのAPT配布版。ネイティブamd64用 |
| `macos-theme` | WhiteSurテーマ・アイコン・カーソル、Dock。ネイティブGNOME用 |
| `ssh-server` | OpenSSHサーバー。選択時はSSHの待ち受けサービスが導入される |

APTパッケージはUbuntu Nobleと公式配布元が提供する更新版を使います。
ROSのPythonとの整合性を保つため、システムPythonを置換せず、pipによるシステム領域への上書きも行いません。
PlantUMLはUbuntu提供の旧版を使わず、公式JARとJava 21を導入します。
単体配布ツールは[versions.json](installer/versions.json)で検証した版とSHA-256を固定し、プラグインもコミットを固定しています。
自動的なOSリリース更新や `full-upgrade` は行いません。
APTが既存パッケージの削除を要求した場合は停止します。古いOS状態による依存関係の問題は、システム更新として解消してから再実行してください。

## ROS 2 / WSL

Ubuntu 24.04にはJazzyを導入します。他のUbuntuバージョンを推測して処理することはありません。
公式の `ros2-apt-source` パッケージでAPT配布元を設定し、`noble-updates` と `noble-backports` の有効化を確認します。
旧 `ros-latest.list` / `ros2.list` が有効な場合は、重複を避けるため変更前に停止します。
移行条件は[ROS 2公式のUbuntu導入手順](https://docs.ros.org/en/jazzy/Installation/Ubuntu-Install-Debs.html)を参照してください。

新しいシェルで、存在する `/opt/ros/jazzy/setup.bash` を読み込みます。
ROS 1や別ディストリビューションの環境がすでに有効な場合は混在を拒否します。
作業場所に `src` があれば次の関数を使えます。任意の場所から使う場合は `ROS_WORKSPACE` を指定します。

```sh
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws
ros_deps                         # src内の依存をrosdepで導入
ros_build --cmake-args -DCMAKE_EXPORT_COMPILE_COMMANDS=ON
ros_env ~/ros2_ws                 # ビルド済みoverlayを現在のシェルへ読み込み
ros_test
ros_clean --yes                  # colconの印があるbuild/install/logだけ削除
```

固定のIP、NTPサーバー、ROS_MASTER_URI、研究室のパスは設定しません。
WSLではWindows側のVS CodeとWSL拡張を使う構成を想定し、Linux用VS Code・Chrome・デスクトップテーマは選択対象から外します。
SSHサーバーを選ぶ場合はsystemdが必要です。GUI・USB・他機器とのROS通信はホストの表示・ネットワーク設定にも依存します。

従来の整形関数も使えます。C/C++は関数名を残し、内部でJazzyの `ament_uncrustify` を使います。
Pythonは `autopep8` で99文字幅を指定し、文法構造を変えない範囲で整えます。
`--dry-run` は差分表示、`--check` は未整形の検出だけを行います。指定なしではファイルを書き換えます。

```sh
clang_autoformat src/node.cpp include/node.hpp
recursive_clang_autoformat ~/ros2_ws/src/my_package
pep8_autoformat scripts/node.py
recursive_pep8_autoformat ~/ros2_ws/src/my_package --check
```

再帰処理は生成物・venv・外部コードなどを既定で除外します。対象の指定方法と規約検査は[ROS 2の整形](docs/ros-formatting.md)を参照してください。
命名・コメント・docstringなど、整形だけでは直せない規約はamentの検査で確認します。

## Neovimと普段の操作

`nvim` で起動します。`jj` → Esc、`;` → コマンド、Ctrl+h/j/k/lでウィンドウ移動、2スペース、検索・保存時の処理などを引き継いでいます。
プラグインはlualine、gitsigns、live-preview.nvim等へ置換し、補完とLSPはNeovim標準機能を使います。
対応表・追加キー・言語サーバー・更新手順は[エディター移行記録](docs/editor-migration.md)にまとめています。
ROS 2向けには `:RosFormat` で現在のバッファを整形できます。保存は `:write` で行い、従来の `:ClangFormat` / `:AutoPep8` も残しています。

初回のプラグイン取得はインストーラーが明示的に行います。通常のエディター起動時にGit cloneや自動更新はしません。
`--no-plugins` で取得を省略した場合も基本の編集設定を利用できます。
tmuxのprefixは従来どおり `Ctrl+x` です。ログイン時のtmux自動起動は既定で無効です。

対話シェルでは `cd` 後に自動で一覧を表示し、`ls -avF --color=auto` と `grep --color=always --exclude-dir=.git` の挙動を引き継ぎます。
パイプ先に色コードが不要な場合は `command grep` または `grep --color=never` を使えます。
プロンプトはStarship、tmuxのステータスは組み込み機能で色付きセグメントを表示します。追加フォントなしで使えます。
従来のペイン・タブ操作、Ctrl+Shift+C/Vとtmuxのコピー操作の使い分けは[ターミナル操作](docs/terminal-workflow.md)にまとめています。

Caps LockをCtrlにするには `keyboard` を選びます。`bash scripts/nocaps.sh` から設定だけ適用することもできます。
確認後に変更し、Caps Lockと競合しないXKBオプションは残します。バックアップから復元できます。
WSLのWindows TerminalではWindows側のキー設定が必要です。[PowerToys Keyboard Manager](https://learn.microsoft.com/windows/powertoys/keyboard-manager)でCaps LockをCtrlへ割り当ててください。

個別設定は `~/.bashrc.local` に書きます。
[記入例](configs/shell/bashrc.local.example)から、ROS workspace、tmux自動起動など必要な項目だけをコピーしてください。
Gitの名前・メールアドレスは各環境で設定します。

`fetchall` は現在位置配下のGitリポジトリをfetchします。pullは `fetchall -p` で明示し、fast-forwardできる場合だけ実行します。
`png2eps figure.png` は `eps/figure.eps`、`jpg2eps photo.jpg output.eps` は指定先へ変換します。既存ファイルは上書きしません。

LaTeXは従来のpLaTeX→dvipdfmxを既定とし、`latexmk -lualatex file.tex` でLuaLaTeXも使えます。
プロジェクト内の `.latexmkrc` を優先して用途別に調整できます。

## Mac風デスクトップ

Ubuntu 24.04のGNOMEセッション内で `macos-theme` を選択します。
[WhiteSur GTK](https://github.com/vinceliuice/WhiteSur-gtk-theme)、[WhiteSur icons](https://github.com/vinceliuice/WhiteSur-icon-theme)、[WhiteSur cursors](https://github.com/vinceliuice/WhiteSur-cursors)を組み合わせます。
ソースをコミットとSHA-256で固定し、一時領域でビルドしてからユーザー領域へ配置します。

WhiteSur-Dark、アイコン、カーソル、暗色設定、左側のウィンドウ操作ボタンを設定します。
Ubuntu Dockの設定が利用できる場合は、下側・幅を広げない配置・アイコン48pxにします。
導入元のスクリプトは一時HOMEで動かし、sudoを使わせません。

GNOME ShellのトップバーやGDMログイン画面は変更しません。
libadwaita、Flatpak、Snapのアプリまで同じ見た目になるとは限りません。
libadwaitaのCSS上書きや拡張機能の強制導入は含めず、GTKテーマを受け付けるアプリを中心に適用します。
反映されない場合は対象アプリを開き直すか、一度ログアウトしてください。

## ログ・バックアップ・復元

変更前のファイルとリンク、外観・キーボード設定を `~/.local/state/dotfiles/backups/<日時>/` に保存します。
実行ログ、モジュール選択、導入したAPTパッケージ一覧、固定版の情報も同じ場所に記録します。
XDG環境変数を指定した場合はその場所を使いますが、配置先はホーム配下に限定します。

```sh
bash setup_all.sh --restore ~/.local/state/dotfiles/backups/<日時>
```

`RESTORE` と入力すると設定を戻します。
導入後にファイルや外観設定が変更されていれば、復元処理は上書きせず停止します。
シンボリックリンクの復元ではリンク自体を戻します。リンク先リポジトリの履歴は巻き戻しません。
APT/Snapパッケージ、配布元、ユーザー用ツール、プラグイン、ビルド済みテーマは残ります。
OS全体を戻す操作ではありません。

導入が途中で停止した場合は、ログを確認して原因を解消し、同じモジュールを再実行できます。
同じ設定を重複追記せず、既存の固定版ツール・テーマは検証して再利用します。
古い個人設定を変更したコピーがある場合は自動削除せず残すため、移行後の `.bashrc` と `.bashrc.local` を確認してください。

## 旧構成との関係

[全ブランチの調査](docs/ubuntu-24.04-audit.md)を踏まえ、ROS 1、Python 2、Node 10、Vundle/dein・YCM/CoC、Powerline用Python設定、旧テーマ導入処理、固定NTP設定、同梱PlantUML jarを現行構成から撤去しました。
`master`はUbuntu 24.04用です。旧masterの先端は`ubuntu16`として残し、`ubuntu1804`、`ubuntu2004`、`mac_mojave10.14`も過去の構成として保持します。
Git履歴の書き換えは行いません。過去のスクリプトが `/etc` に加えたNTP等の設定は、新インストーラーでは自動復元しません。

使わなくなったMacブランチは保守対象から外せます。ただし、履歴に認証情報らしい値があるため失効確認を先に行います。
ブランチを削除してもLinux側を含む過去履歴からは消えません。到達関係と整理手順は[旧Macブランチの扱い](docs/branch-retirement.md)を参照してください。

## 検証

Ubuntu 24.04上で以下を実行できます。設定変更を伴うテストは一時HOMEを使います。

```sh
python3 tests/check-syntax.py
python3 tests/test-installer.py
python3 tests/test-cli.py
python3 tests/test-terminal-setup.py
python3 tests/test-ros-format.py
bash tests/test-shell.sh
python3 tests/test-tmux.py
bash tests/test-commands.sh
python3 tests/test-fetchall-pty.py
python3 tests/test-image2eps.py   # python3-pilが必要
python3 tests/check-neovim.py --plugins
python3 tests/check-ros-format.py
python3 tests/check-theme.py --portable-deps
```

Neovim検証は固定版バイナリーを一時領域へダウンロードし、オフライン起動、プラグインの初回導入・再導入、全プラグインの読み込みを確認します。
ROS整形の実ツール検証はJazzyのamentソースとautopep8を取得し、Ubuntuのuncrustifyを一時展開して実行します。OSへのパッケージ導入は行いません。
APT/Snapの一括導入、実ROS workspaceのビルド、ネイティブGNOMEでの見た目と実機クリップボードは別途確認が必要です。

WhiteSur検証はソースの実ビルドまで行い、GNOMEセッションは模擬します。`--portable-deps` は不足するビルドツールを一時展開し、OSへインストールしません。
同じ基本チェックをGitHub ActionsのUbuntu 24.04ジョブでも実行する構成です。

単体ツールを更新するときは公式リリースのURL・SHA-256と `installer/versions.json` を更新します。WhiteSurは `installer/theme.py` のコミットとハッシュを組で更新し、ビルド検証を再実行してください。Neovimのプラグイン更新は移行記録の手順を使います。
