# インストールと動作の確認

Ubuntu 24.04に導入した環境を、実際に使うユーザーの端末で確認する手順です。
全モジュールを試す場合は上から順に進め、選択導入の場合は対象モジュールの節だけを実行してください。
正常時の表示を判定の目安として記載しています。実機での結果は、インストール先で確認してください。

## クリーン環境から全モジュールを導入する

全モジュールを選べるのは、ネイティブのUbuntu Desktop 24.04・amd64・GNOMEセッションです。
arm64ではChromeとibisOffice、WSLではネイティブ用モジュールが選択対象から外れます。
以下はGNOMEの端末から一般ユーザーで実行します。

```bash
sudo apt update
sudo apt install -y git
git clone --branch ubuntu24 https://github.com/AtsukiYokota/dotfiles.git ~/dotfiles
cd ~/dotfiles

cat /etc/os-release
dpkg --print-architecture
printf 'Desktop: %s\n' "$XDG_CURRENT_DESKTOP"
df -h "$HOME" /
```

Ubuntuのバージョンが`24.04`、アーキテクチャが`amd64`、Desktopに`GNOME`が含まれることを確認します。
LaTeXを含む全導入ではダウンロード量が多くなるため、空き容量も確認してください。

端末の出力全体を残してインストーラーを起動します。`script`はUbuntu標準のutil-linuxに含まれます。

```bash
install_log="$HOME/dotfiles-install-$(date +%Y%m%d-%H%M%S).log"
printf '全体ログ: %s\n' "$install_log"
script -q -e -c 'bash setup_all.sh --plain' "$install_log"
printf '終了コード: %s\n' "$?"
```

番号選択画面で`a`とEnterを押し、全選択にします。もう一度Enterで計画を確認し、`INSTALL`と入力します。
最後に`Installation complete.`が表示され、終了コードが`0`なら次へ進みます。
SSHサーバーも選択するため、SSH待ち受けサービスが導入されます。
途中で失敗した場合は「ログと失敗時の確認」を参照してください。

## 新しいBashでコマンドと設定を確認する

インストール完了後は新しい端末を開きます。
設定には二重読込防止があるため、既存シェルで`source ~/.bashrc`を繰り返すだけでは更新が反映されない場合があります。

```bash
command -v ros2 nvim tmux starship uv clangd basedpyright-langserver
nvim --version | head -n 1
tmux -V
starship --version
uv tool list
alias ls grep vi
type cd
```

`nvim`・`starship`・`uv`は通常`~/.local/bin/`、`ros2`は`/opt/ros/jazzy/bin/`にあります。
このリポジトリが導入するNeovim・Starshipなどの版は[versions.json](../installer/versions.json)で確認できます。
`uv tool list`には`basedpyright`、`cmake-language-server`、`autopep8`、`ruff`が表示されます。

プロンプトはGruvbox Rainbow配色で、ユーザー名・ホスト名・作業ディレクトリが表示されます。
`cd ~`で移動すると、隠しファイルを含む一覧が自動表示されます。
`alias ls grep`では`ls -avF --color=auto`と`grep --color=always --exclude-dir=.git`を確認します。
`vi`は`nvim`を指します。Nerd Fontと外観の確認・再設定は[外観と端末の設定](appearance.md)を参照してください。

## ROS 2の環境と通信を確認する

### Jazzyと開発ツールを確認する

```bash
printenv ROS_DISTRO ROS_VERSION ROS_PYTHON_VERSION
ros2 --help
ros2 pkg prefix rclcpp
ros2 pkg prefix rclpy
rosdep --version
rosdep resolve rclcpp --rosdistro jazzy
colcon --help
```

環境変数は順に`jazzy`、`2`、`3`、パッケージ位置は通常`/opt/ros/jazzy`です。
rosdepの解決結果には`ros-jazzy-rclcpp`、colconのヘルプには`build`・`test`・`test-result`が表示されます。
ROS環境が読み込まれていない場合は`ros_env`を実行して再確認します。

Jazzyの`ros2`コマンドには`--version`がありません。CLIパッケージの版は次のコマンドで確認します。

```bash
dpkg-query -W ros-jazzy-ros2cli
```

[公式の環境確認手順](https://github.com/ros2/ros2_documentation/blob/jazzy/source/Tutorials/Beginner-CLI-Tools/Configuring-ROS2-Environment.rst)、[Jazzy CLIの引数](https://github.com/ros2/ros2cli/blob/jazzy/ros2cli/ros2cli/cli.py)を参照。

### 同じUbuntuの2端末で送受信する

`ros2`モジュールだけでも実行できます。端末Aで次を実行し、そのまま動かしておきます。

```bash
ros2 topic pub --rate 1 /dotfiles_check std_msgs/msg/String "{data: 'dotfiles ok'}"
```

同じUbuntuの別の作業画面Bで受信します。
新しい端末・端末のタブを開くか、tmux内で`Ctrl+t`を押してウィンドウBを作成してください。

```bash
ros2 topic echo /dotfiles_check std_msgs/msg/String --once
```

Bに`data: dotfiles ok`が表示されて終了すれば、ローカルの送受信を確認できています。
AはCtrl+Cで停止します。別PCやロボットとの通信は、LANやWSLのネットワークを含む別の確認が必要です。

受信できない場合は両端末で次を実行し、ROSの環境とドメインが一致しているか確認します。

```bash
printf 'DISTRO=%s DOMAIN=%s RMW=%s DISCOVERY=%s\n' \
  "${ROS_DISTRO:-unset}" "${ROS_DOMAIN_ID:-0}" \
  "${RMW_IMPLEMENTATION:-default}" "${ROS_AUTOMATIC_DISCOVERY_RANGE:-SUBNET}"
ros2 doctor --report
```

`RMW_IMPLEMENTATION`はROS通信実装の選択です。未設定なら既定値を使います。
`DISCOVERY=OFF`では同じPC上でも相手を自動発見できません。
RMWを変更してノード一覧が更新されない場合は`ros2 daemon stop`後に再確認します。
[ROS通信実装の切り替え](https://github.com/ros2/ros2_documentation/blob/jazzy/source/How-To-Guides/Working-with-multiple-RMW-implementations.rst)、[発見範囲の設定](https://github.com/ros2/ros2_documentation/blob/jazzy/source/Tutorials/Advanced/Improved-Dynamic-Discovery.rst)を参照。

### C++・Pythonパッケージをビルドする

ホームに一意な確認用workspaceを作ります。以下はそのまま順に実行できます。

```bash
workspace=$(mktemp -d "$HOME/dotfiles-smoke.XXXXXX")
mkdir -p "$workspace/src"
cd "$workspace/src"
ros2 pkg create --build-type ament_cmake --license Apache-2.0 \
  --node-name hello_cpp dotfiles_smoke_cpp --dependencies rclcpp
ros2 pkg create --build-type ament_python --license Apache-2.0 \
  --node-name hello_py dotfiles_smoke_py --dependencies rclpy
cd "$workspace"
ROS_WORKSPACE="$workspace" ros_build
ros_env "$workspace"
ros2 run dotfiles_smoke_cpp hello_cpp
ros2 run dotfiles_smoke_py hello_py
ROS_WORKSPACE="$workspace" ros_test
```

ビルドでは2パッケージが成功し、実行時にはそれぞれ`hello world dotfiles_smoke_cpp package`、`Hi from dotfiles_smoke_py.`と表示されます。
テスト結果の目安は`0 errors, 0 failures`です。生成されたcopyrightテストのskipは正常です。
この手順はビルド・パッケージ検索・実行の確認で、生成プログラム自身はROS通信を行いません。

workspaceは確認後も残ります。作業を終えたらこの端末を閉じると、確認用workspaceの環境も解除できます。
[パッケージ作成CLIとテンプレート](https://github.com/ros2/ros2cli/tree/jazzy/ros2pkg/ros2pkg)に基づく手順です。

### RVizを起動する

`ros-desktop`を選んだ場合に実行します。

```bash
rviz2
```

ウィンドウとGridが表示され、視点を動かせればGUI起動を確認できています。
まだロボットのTFなどを流していない場合、Global Statusの警告だけで導入失敗とは判断しません。
WSLでは[WSLg](https://learn.microsoft.com/en-us/windows/wsl/tutorials/gui-apps)が必要です。自動設定された`DISPLAY`や`WAYLAND_DISPLAY`を固定IPで上書きしないでください。

## NeovimのプラグインとLSPを確認する

新しい端末でリポジトリのPythonファイルを開きます。`-R`は読み取り専用で開く指定です。

```bash
cd ~/dotfiles
nvim -R installer/main.py
```

数秒待ち、Pythonコードが表示されているバッファで次を実行します。

```vim
:DotfilesLsp
:lua vim.print(vim.tbl_map(function(c) return c.name end, vim.lsp.get_clients({bufnr=0})))
```

`DotfilesLsp`で`basedpyright`が`attached`、`Completion: LSP`と表示されればPythonの補完に接続できています。
他の言語のサーバーが`available (not attached)`なのは正常です。その言語のファイルを開くと接続します。

| 選択モジュール | 自動導入されるLSP |
| --- | --- |
| `cpp` | `clangd` |
| `python` | `basedpyright`、`cmake` |
| `node`（`neovim`の依存にも含まれる） | `bashls`、`jsonls`、`yamlls`、`html`、`cssls`、`ts_ls` |
| `rust` | `rust_analyzer` |
| `latex` | `texlab` |

全モジュールを導入した場合は11個とも`attached`または`available`になり、`missing`は残りません。
`rust`や`latex`を選んでいない場合、そのLSPが`missing`でも異常ではありません。
表示には実行ファイルの場所と導入モジュールも含まれます。

補完の表示とキー操作は、確認用の新規ファイルで試します。

```bash
nvim /tmp/dotfiles-completion-check.py
```

挿入モードで`import os`と入力し、次の行に`os.pa`と入力して少し待ちます。
`path`などの候補が表示されたら、`Tab`で選択し、`Enter`で確定します。
候補を選択せずに`Enter`を押すと、通常の改行になります。

| 操作 | 挿入モードでのキー |
| --- | --- |
| 補完を手動で要求 | `Ctrl+g`を押して離し、`Space` |
| 次・前の候補を選択 | `Tab` / `Shift+Tab` |
| 選択した候補を確定 | `Enter` |
| ファイルパスを補完 | `Ctrl+g`を押して離し、`Ctrl+f` |

英数字・`_`の入力でもLSPの補完候補を自動表示します。
LSPがないテキストファイルでは、開いているバッファ内の単語を候補にします。
`Ctrl+Space`も使えますが、IMEなどが先に処理する環境では`Ctrl+g`、`Space`を使ってください。
tmuxの直接キーと競合するため、候補の移動には`Ctrl+n/p`ではなく`Tab` / `Shift+Tab`を使います。

Python/C++のファイルで`Completion: buffer words`のままなら、`:set filetype?`と`:checkhealth vim.lsp`を確認します。
Pythonは`python`、C++は`cpp`がファイル種別です。LSPのログは`:lua vim.cmd.edit(vim.lsp.log.get_filename())`で開けます。
ROSのPython補完には、`ros_env`で必要なワークスペースを読み込んだシェルからNeovimを起動してください。
C++のプロジェクト固有のヘッダーや型の補完には`compile_commands.json`が必要です。
colconでは`ros_build --cmake-args -DCMAKE_EXPORT_COMPILE_COMMANDS=ON`で生成し、対象パッケージの`.clangd`で[CompilationDatabase](https://clangd.llvm.org/config#compilationdatabase)にビルドディレクトリを指定します。

続いてプラグインと診断を確認します。

```vim
:Lazy
:checkhealth lazy vim.lsp
```

`Lazy`の`Total: 7 plugins`が想定の構成です。LSPと補完はNeovim組込み機能なので、この数には入りません。
一覧は`q`で閉じてから、`checkhealth`を実行してください。
遅延読み込み対象の`Not Loaded`表示は正常です。
`checkhealth`ではエラーの対象を確認し、使わない任意ツールの警告と区別します。
クライアント一覧をもう一度調べるときは、診断画面ではなくPythonコードのバッファへ戻ってください。
確認だけなら`:Lazy sync`や`:Lazy update`は不要です。

`--no-plugins`などでプラグイン取得を省略した場合は、Neovimを終了してから明示的に導入できます。

```bash
nvim --headless -u NONE -i NONE -l "$HOME/dotfiles/configs/nvim/bootstrap.lua"
```

[Neovim LSP](https://neovim.io/doc/user/lsp/)、[checkhealth](https://neovim.io/doc/user/health/)、[lazy.nvimの操作](https://lazy.folke.io/usage)を参照。

### インストール済みの環境へ反映する

Neovimを終了し、リポジトリを更新して必要なモジュールを再実行します。
全モジュールを導入済みの場合、今回のLSPと補完の更新は次で反映できます。

```bash
cd ~/dotfiles
git pull --ff-only origin ubuntu24
bash setup_all.sh --modules neovim,rust,latex
```

導入内容を確認し、`INSTALL`と入力します。C/C++・Python・Node.js・シェルの依存は自動で追加されます。
RustやLaTeXが不要な環境では、その名前をリストから外してください。
既存のパッケージを利用しながら不足するツールを導入し、設定の変更前にはバックアップを作ります。
`--configs-only`は言語サーバーを導入しないため、この更新には使いません。

完了後は新しい端末を開き、Neovimを起動し直してください。
既存のtmuxペインを使う場合は、Neovimを終了した状態で`exec bash -l`を実行してから起動します。
新しい設定の`:DotfilesLsp`で、対象ファイルのサーバーが`attached`になることを確認してください。

## tmuxの操作とクリップボードを確認する

新しい端末や端末のタブごとに、独立したtmuxセッションが自動起動し、`echo "$TMUX"`に値が表示されます。
2つの端末で次を実行すると、それぞれ異なるセッションIDと名前が表示されます。

```bash
tmux display-message -p '#{session_id}:#{session_name}'
```

片方でペインを分割しても、もう片方の画面は変わりません。
以下の独立した確認用サーバーを使う場合は、先に`Ctrl+x`を押して離し、`d`で通常のBashに戻ります。
既存の作業セッションを変更せず、現在の設定ファイルを読み込ませるためのコマンドです。

```bash
tmux -L "dotfiles-check-$$" -f "$HOME/.tmux.conf" new-session -s check
```

tmuxの中で実行します。

```bash
tmux show-options -gv prefix
tmux show-options -gv mouse
tmux show-options -sv set-clipboard
printf '%s\n' "$TERM"
```

順に`C-x`、`on`、`off`、`tmux-256color`が表示されます。
この構成ではクリップボード用の補助コマンドを使うため、`set-clipboard off`で正常です。
以下の操作も確認してください。`Ctrl+x → e`はCtrl+xを押して離し、次にeを押す意味です。

| 操作 | キー |
| --- | --- |
| 左右に分割 | Ctrl+x → e |
| 上下に分割 | Ctrl+x → o |
| 新しいウィンドウ | Ctrl+x → t |
| 次のウィンドウ | Ctrl+x → n |
| ペイン間を移動 | Ctrl+矢印 |
| コピー範囲を選択 | ドラッグして離す |
| 貼り付け | 端末のCtrl+Shift+V、またはCtrl+x → p |

次の確認は現在のクリップボードを検証用文字列へ置き換えます。

```bash
printf 'dotfiles clipboard test: 日本語\n' | dotfiles-clipboard copy
dotfiles-clipboard paste
```

同じ文字列が表示され、端末のCtrl+Shift+Vでも貼り付けられることを確認します。
SSH先でOSC 52だけを使う場合はOSクリップボードを読み出せないため、端末側の貼り付けで確認します。
作成した各ペインで`exit`すると、確認用セッションを終了できます。

tmuxは通常サーバー起動時に設定を読みます。既存サーバーへ設定を反映したい場合は、その中で`tmux source-file ~/.tmux.conf`を実行します。
[tmuxの設定読み込み](https://github.com/tmux/tmux/wiki/Getting-Started#the-configuration-file)、[操作の詳細](terminal-workflow.md)を参照。

## 追加モジュールを確認する

選択したモジュールだけを確認してください。全モジュール導入では表のすべてが対象です。

| 対象 | 確認コマンド・操作 | 確認する内容 |
| --- | --- | --- |
| Rust | `rustc --version`、`cargo --version`、`rustfmt --version`、`cargo clippy --version`、`rust-analyzer --version` | それぞれの版が表示される |
| Node.js | `node --version`、`npm --version`、`node -e 'console.log("node ok")'` | Node 24系、npmの版、`node ok` |
| Pythonツール | `uv tool list`、`autopep8 --version`、`ruff --version` | 選択したツールの導入と起動 |
| LaTeX | `latexmk -v`、`platex --version`、`uplatex --version`、`lualatex --version`、`biber --version` | 各コマンドの版 |
| Diagrams | `plantuml -version`、`dot -V` | PlantUML・Java・Graphvizの版 |
| デスクトップ | `inkscape`、`vlc`をアプリ一覧から起動 | ウィンドウが開く |
| VS Code | `snap list code`、`code --version`、`code` | Snap登録、版、ウィンドウ |
| Chrome | `google-chrome --version`、`google-chrome` | 版とウィンドウ |
| SSHサーバー | `systemctl status ssh.socket ssh.service`、`ss -ltn 'sport = :22'` | socketまたはserviceが稼働し、ポート22が`LISTEN` |

Ubuntu 24.04では通常、`ssh.socket`が待ち受けを管理します。接続前に`ssh.service`が稼働していなくても、それだけでは異常ではありません。
仕組みは[UbuntuのSSH socket activationの説明](https://discourse.ubuntu.com/t/sshd-now-uses-socket-based-activation-ubuntu-22-10-and-later/30189)を参照してください。
別端末からのSSH接続まで確認するには、LANのアドレスとファイアウォール設定も必要です。

### ROS用の整形を確認する

実ファイルを触らず、一時ディレクトリにサンプルを作ります。

```bash
format_dir=$(mktemp -d)
printf 'int main(){return 0;}\n' > "$format_dir/check.cpp"
printf 'value=1\n' > "$format_dir/check.py"
clang_autoformat "$format_dir/check.cpp"
pep8_autoformat "$format_dir/check.py"
recursive_clang_autoformat "$format_dir" --check
recursive_pep8_autoformat "$format_dir" --check
```

最後の2コマンドが`0 would change.`を報告し、終了コード0なら、整形と再確認が通っています。
名前やdocstringなどの規約検査は[ROS 2コード整形](ros-formatting.md)を参照してください。

### 日本語LaTeXでPDFを作る

```bash
tex_dir=$(mktemp -d)
cat > "$tex_dir/check.tex" <<'TEX'
\documentclass{jsarticle}
\begin{document}
日本語の表示を確認します。
\end{document}
TEX
(cd "$tex_dir" && latexmk -pdfdvi -interaction=nonstopmode check.tex)
test -s "$tex_dir/check.pdf" && printf 'PDF: %s\n' "$tex_dir/check.pdf"
```

表示されたPDFを開き、日本語の本文を確認します。
Neovimでこの`.tex`を開いて`:TexPreview`を実行し、本文を変更して`:w`で保存します。PDFの表示も更新されればライブプレビューが動作しています。停止は`:TexPreviewStop`です。

### PlantUMLで画像を作る

```bash
diagram_dir=$(mktemp -d)
cat > "$diagram_dir/check.puml" <<'UML'
@startuml
Alice -> Bob: 動作確認
@enduml
UML
plantuml -tpng "$diagram_dir/check.puml"
test -s "$diagram_dir/check.png" && printf 'PNG: %s\n' "$diagram_dir/check.png"
png2eps "$diagram_dir/check.png" "$diagram_dir/check.eps"
test -s "$diagram_dir/check.eps" && printf 'EPS: %s\n' "$diagram_dir/check.eps"
```

PNGを開き、矢印と日本語ラベルを確認します。EPSも生成されれば画像変換まで確認できています。
Neovimでこの`.puml`を開いて`:PlantumlPreview`を実行し、ラベルを変更して`:w`で保存します。画像も更新されることを確認し、`:PlantumlStop`で停止します。
プレビューの環境条件・エンジン選択・整形コマンドは[Neovimのプレビューと整形](editor-preview.md)を参照してください。

### Markdownをブラウザでプレビューする

Neovimで`.md`を開いて`:MarkdownPreview`を実行します。日本語を含む見出しや本文を変更し、`:w`で保存してください。
ブラウザを手動で再読込せずに変更が表示されることを確認します。停止は`:MarkdownPreviewStop`です。

### ibisOfficeを追加して起動する

ネイティブUbuntu 24.04のamd64環境で、必要に応じて追加できます。

```bash
cd ~/dotfiles
git pull --ff-only origin ubuntu24
bash setup_all.sh --modules ibis-office
```

計画を確認して`INSTALL`と入力します。完了後、アプリメニューの「ibisOffice」、または次のコマンドで起動します。

```bash
~/.local/bin/ibis-office
```

文書を作成・保存して開き直し、日本語の表示を確認してください。ファイルを開く既定のアプリは変更しません。
初回起動時にアプリ自身がメニューへの登録を提案した場合は、登録済みなので省略できます。
導入する版は[versions.json](../installer/versions.json)の`ibis_office`で確認できます。
対応機能や使い方は[ibisOfficeの公式案内](https://github.com/ibisjp/ibis-office)を参照してください。

更新するときも、アプリを終了してから上記の`git pull`とモジュール導入を再実行してください。
アプリ内更新で実行ファイルが変わり、再導入時に`Unrecognized existing ibisOffice file`と表示される場合は、現在の版をバックアップとして移動してから、リポジトリで指定する版を導入できます。
ibisOfficeを終了し、次を実行します。

```bash
cd ~/dotfiles &&
app_version=$(python3 -c 'import json; print(json.load(open("installer/versions.json"))["ibis_office"]["version"])') &&
app_dir="${XDG_DATA_HOME:-$HOME/.local/share}/dotfiles/tools/ibis-office/$app_version" &&
mv -T -- "$app_dir" "$app_dir.manual-$(date +%Y%m%d-%H%M%S)" &&
  bash setup_all.sh --modules ibis-office
```

### GNOMEの外観とCaps Lockを確認する

`macos-theme`と`keyboard`を導入したネイティブGNOMEの端末で実行します。

```bash
gsettings get org.gnome.desktop.interface gtk-theme
gsettings get org.gnome.desktop.interface icon-theme
gsettings get org.gnome.desktop.interface cursor-theme
gsettings get org.gnome.desktop.interface color-scheme
gsettings get org.gnome.desktop.input-sources xkb-options
```

順に`WhiteSur-Dark`、`WhiteSur-dark`、`WhiteSur-cursors`、`prefer-dark`、`ctrl:nocaps`を含む配列が目安です。
Caps Lockを押しながらLを押し、端末がクリアされればCtrlとして動作しています。
Dockは普段は隠れ、画面下端にカーソルを動かすと表示されます。
壁紙はWhiteSurのBig Sur風画像です。[外観の確認コマンド](appearance.md#dockと壁紙)も参照してください。
テーマはアプリを開き直すか、ログアウト・ログインして確認してください。
libadwaita・Snap・Flatpakのアプリなど、GTKテーマを受け付けないアプリは同じ外観にならない場合があります。

### 日本語入力を確認する

日本語入力モジュールを選んだ場合は、ログアウト・ログインしてから[日本語入力の確認](japanese-input.md#確認)も実施してください。

## ログと失敗時の確認

全体ログは導入時に表示した`~/dotfiles-install-日時.log`です。
インストーラーの記録は通常`~/.local/state/dotfiles/backups/日時/`に保存されています。
直近の記録は次のコマンドで開けます。

```bash
backup_root="${XDG_STATE_HOME:-$HOME/.local/state}/dotfiles/backups"
backup_dir=$(find "$backup_root" -mindepth 1 -maxdepth 1 -type d -print | sort | tail -n 1)
printf '確認するバックアップ: %s\n' "$backup_dir"
cat "$backup_dir/selection.json"
tail -n 80 "$backup_dir/install.log"
```

`selection.json`は選んだモジュールの記録であり、導入完了の証明ではありません。
失敗したコマンドとその直前の出力を全体ログ・`install.log`で確認します。
原因を直した後、同じモジュールを再選択して実行できます。

設定を導入前へ戻す場合は、対象の日時を確認したうえで次を実行します。
`RESTORE`の確認があり、パッケージ・配布元・ユーザー用ツールは残ります。

```bash
cd ~/dotfiles
bash setup_all.sh --restore "$backup_dir"
```

WSLで変更したWindows Terminalの設定は別バックアップです。[Windows側の復元手順](appearance.md#設定を戻す)を参照してください。

問題を共有するときは、OSとCPU、選択モジュール、失敗したコマンド、関連するログ部分を添えると切り分けやすくなります。
`tests/check-neovim.py`などの開発用テストは一時HOMEでリポジトリを検証するため、ここで案内した実ユーザー環境の確認とは目的が異なります。
