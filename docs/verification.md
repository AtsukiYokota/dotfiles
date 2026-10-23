# インストールと動作の確認

Ubuntu 24.04に導入した環境を、実際に使うユーザーの端末で確認する手順です。
全モジュールを試す場合は上から順に進め、選択導入の場合は対象モジュールの節だけを実行してください。
正常時の表示を判定の目安として記載しています。実機での結果は、インストール先で確認してください。

## クリーン環境から全モジュールを導入する

全モジュールを選べるのは、ネイティブのUbuntu Desktop 24.04・amd64・GNOMEセッションです。
arm64ではChrome、WSLではネイティブ用モジュールが選択対象から外れます。
以下はGNOMEの端末から一般ユーザーで実行します。

```bash
sudo apt update
sudo apt install -y git
git clone --branch master https://github.com/AtsukiYokota/dotfiles.git ~/dotfiles
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
alias ls grep
type cd
```

`nvim`・`starship`・`uv`は通常`~/.local/bin/`、`ros2`は`/opt/ros/jazzy/bin/`にあります。
このリポジトリが導入するNeovim・Starshipなどの版は[versions.json](../installer/versions.json)で確認できます。
`uv tool list`には`basedpyright`、`cmake-language-server`、`autopep8`、`ruff`が表示されます。

プロンプトにはユーザー名・ホスト名・作業ディレクトリが表示されます。
`cd ~`で移動すると、隠しファイルを含む一覧が自動表示されます。
`alias ls grep`では`ls -avF --color=auto`と`grep --color=always --exclude-dir=.git`を確認します。

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

同じUbuntuの新しい端末Bで受信します。

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

`DotfilesLsp`で`clangd`・`basedpyright`・`cmake`が`available`、クライアント一覧に`basedpyright`があれば接続できています。
`texlab`・`bashls`・`jsonls`などは標準の自動導入対象ではないため、`missing`でもインストール失敗とは限りません。

続いてプラグインと診断を確認します。

```vim
:Lazy
:checkhealth lazy vim.lsp
```

`Lazy`の一覧にプラグインがインストールされていることを確認します。
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

## tmuxの操作とクリップボードを確認する

tmuxの外にある通常端末で、新しい確認用サーバーを起動します。
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
| ペイン間を移動 | Alt+矢印 |
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
Dockは下側に表示されます。テーマはアプリを開き直すか、ログアウト・ログインして確認してください。
libadwaita・Snap・Flatpakのアプリなど、GTKテーマを受け付けないアプリは同じ外観にならない場合があります。

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

問題を共有するときは、OSとCPU、選択モジュール、失敗したコマンド、関連するログ部分を添えると切り分けやすくなります。
`tests/check-neovim.py`などの開発用テストは一時HOMEでリポジトリを検証するため、ここで案内した実ユーザー環境の確認とは目的が異なります。
