# 外観と端末の設定

`shell`はStarshipのGruvbox RainbowプロンプトとGruvbox配色のtmuxを設定します。
`neovim`もGruvboxを使います。`fonts`は`JetBrainsMono Nerd Font Mono`を導入し、`shell`の依存として自動選択されます。
`macos-theme`はネイティブGNOMEにWhiteSur、下端で表示するDock、Big Sur風の壁紙を設定します。

## 導入済みの環境に反映する

Neovimを終了し、Ubuntuのデスクトップ上の端末で実行します。

```bash
cd ~/dotfiles
git pull --ff-only origin ubuntu24
bash setup_all.sh --modules shell,neovim,macos-theme
```

導入内容を確認し、`INSTALL`と入力します。
フォント・プラグイン・壁紙も取得するため、初回の反映では`--configs-only`を付けません。
C/C++・Python・Node.jsなど、Neovimの依存モジュールも自動選択されます。
既存のROS 2・Rust・LaTeXを再導入する必要はありません。

WSLではWindows TerminalからUbuntuを開き、次を実行します。
GNOMEのDock・壁紙はWSLの対象外です。

```bash
cd ~/dotfiles
git pull --ff-only origin ubuntu24
bash setup_all.sh --modules shell,neovim
```

完了後、既存のtmux内では設定とBashを読み込み直します。
`exec bash -l`はNeovimなどを終了してから実行してください。

```bash
tmux source-file ~/.tmux.conf
exec bash -l
```

tmuxの外では新しい端末を開きます。
Windows Terminalは、開いている全ウィンドウを終了して起動し直すと、新しいフォントを確実に読み込めます。
Neovimも起動し直してください。

必要なファイルを導入済みで、設定だけを再適用するときは次を使えます。

```bash
bash setup_all.sh --modules shell,neovim,macos-theme --configs-only
```

WSLでは`macos-theme`を外します。このモードは新しいフォント・壁紙・プラグインやLSPを取得しません。

## Nerd Fontとアイコン

Nerd Fontは、プログラミング用フォントにファイル種別などのアイコンを追加したものです。
Lazyの記号が四角になる場合は、フォントが未導入か、端末で選択されていない可能性があります。
[Gruvbox RainbowもNerd Fontの導入と端末での有効化を前提としています](https://starship.rs/presets/gruvbox-rainbow)。

インストーラーは次を自動設定します。

| 環境 | 設定内容 |
| --- | --- |
| UbuntuのGNOME | ユーザー用フォントを導入し、等幅フォントと既存のGNOME Terminalプロファイルを`JetBrainsMono Nerd Font Mono 11`に変更 |
| WSL + Windows Terminal | Windowsユーザーにもフォントを登録し、対象のWSLプロファイルのフォントを`JetBrainsMono NFM`に変更 |

WSLからのWindows連携を無効化している場合や、別の端末を使う場合は、インストーラーの案内に従って端末側のフォントを選択してください。
Windows Terminalの設定場所は「設定 → Ubuntuのプロファイル → 外観 → フォントフェイス」です。
設定項目は[Windows Terminal公式資料](https://learn.microsoft.com/en-us/windows/terminal/customize-settings/profile-appearance#font-face)を参照してください。

Ubuntu側のフォントは次で確認できます。

```bash
fc-match 'JetBrainsMono Nerd Font Mono'
printf '\ue0b0 \uf120 \U000f0335\n'
vi
```

フォント名とアイコンが表示され、Neovimの`:Lazy`でも記号を確認できれば設定できています。
`fc-match`はUbuntu側の確認であり、Windows Terminal側のフォント選択までは検証しません。
NeovimではNerd Fontの記号を1文字幅に調整し、日本語向けの幅設定を保持しています。

## Dockと壁紙

Dockは普段は非表示で、カーソルを画面下端へ動かすと表示します。
アプリが開いていないときも隠し、ウィンドウの表示領域を確保します。

壁紙には[WhiteSur作者のBig Sur風作品](https://github.com/vinceliuice/WhiteSur-wallpapers)を使います。
Apple純正画像ではありません。ライト用とダーク用の画像を登録し、GNOMEの外観モードに合わせて切り替えます。
初期設定はダークです。画像とライセンスは固定した版から取得し、ハッシュを検証します。

```bash
gsettings get org.gnome.shell.extensions.dash-to-dock dock-fixed
gsettings get org.gnome.shell.extensions.dash-to-dock autohide
gsettings get org.gnome.shell.extensions.dash-to-dock intellihide
gsettings get org.gnome.desktop.background picture-uri-dark
```

順に`false`、`true`、`false`、導入した画像のURIが表示されます。
テーマが反映されないアプリは開き直し、必要ならログアウト・ログインしてください。

## tmuxとvi

端末や端末のタブを開くたびに、独立したtmuxセッションを作成します。
セッション名はtmuxが番号を割り当てます。同じ端末内に作業画面を追加する場合は`Ctrl+t`を使います。
`Ctrl+x`を押して離し、`d`を押すとtmuxから離れて通常のBashへ戻れます。
その場で自動接続を繰り返すことはありません。
既存の`main`などは維持します。作業を再開したい場合は、外側のBashで`tmux list-sessions`を実行して名前を確認し、`tmux attach -t 0`のように指定してください。
新しい端末を開いた場合は、既存の作業とは別のセッションになります。

自動起動を止める場合は`~/.bashrc.local`に次を記載し、新しいBashを起動します。

```bash
DOTFILES_AUTO_TMUX=0
```

`vi`はNeovimを起動するシェルエイリアスです。`vi file.py`のように使えます。
操作一覧は[端末の操作](terminal-workflow.md)を参照してください。

## 設定を戻す

Ubuntu側の設定は通常の[バックアップ復元](verification.md#ログと失敗時の確認)で戻せます。
Windows Terminalの設定はWindows側にも別途保存します。
対応するUbuntu側バックアップの`windows-terminal-backups.txt`に、Windows側のmanifestの場所を記録しています。

Windows側の設定も戻すときは、WSL内でそのmanifestパスを指定します。

```bash
powershell.exe -NoProfile -ExecutionPolicy Bypass \
  -File "$(wslpath -w "$HOME/dotfiles/scripts/setup-windows-fonts.ps1")" \
  -Action RestoreSettings -ManifestPath 'C:\Users\ユーザー名\AppData\Local\dotfiles\backups\ID\manifest.json'
```

導入後に設定を編集している場合は上書きを避けて停止します。導入したフォントファイルは残ります。
