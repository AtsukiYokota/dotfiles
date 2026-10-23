# Ubuntu 24.04のtmux操作

従来のTerminator風ショートカットと`Ctrl+x`のprefixを維持した。
コピーと貼り付けには端末自身の`Ctrl+Shift+c` / `Ctrl+Shift+v`を使え、tmuxの履歴を扱うときはcopy modeを使う。
対象はUbuntu 24.04のtmux 3.4で、ネイティブ環境とWSLの両方に同じ設定を配置する。

## 起動と終了

新しい端末や端末のタブごとに、独立したtmuxセッションを作成する。
セッション名にはtmuxが番号を割り当てる。一方の端末でペインを分割したりウィンドウを切り替えたりしても、他方の作業画面には影響しない。
tmux内では入れ子に起動せず、非対話シェル、`bash -ic`によるコマンド実行、端末に接続していないシェル、`TERM=dumb`も対象外とする。

`Ctrl+x`を押して離し、`d`を押すとデタッチして外側のBashへ戻る。
tmux内の作業は続く。続きの作業へ戻る場合は、外側のBashで`tmux list-sessions`を実行して名前を確認し、`tmux attach -t 0`のように指定して再接続する。
新しい端末を開くと別のセッションが作られる。以前の`main`など、既存のセッションはそのまま残る。
外側のBashで`exit`を実行すると、そのシェルを終了する。

自動起動を無効にする場合は`~/.bashrc.local`へ次を記述し、新しい端末を開く。
[個別設定の記入例](../configs/shell/bashrc.local.example)も参照。

```bash
DOTFILES_AUTO_TMUX=0
```

Neovimが導入されていれば、Bashの`vi`は`nvim`のエイリアスになる。
たとえば`vi robot.py`でPythonファイルを開ける。

## コピーと貼り付け

通常のシェル画面では、マウスでドラッグして離すだけで選択範囲をコピーする。
tmuxの内部バッファに保存するとともに、利用できるOSのクリップボードへ転送する。
コピー後は端末の`Ctrl+Shift+v`で貼り付ける。
Neovimなどがマウス入力を受け取っている場合は、そのアプリの選択操作になるため、tmuxの履歴を選択したいときは先に`Ctrl+x`、`c`を押す。

端末自身の選択機能を使う場合は、GNOME Terminalでは`Shift`を押しながらドラッグし、`Ctrl+Shift+c`でコピーする。
GNOME TerminalとWindows Terminalの`Ctrl+Shift+c` / `Ctrl+Shift+v`は端末が処理するため、tmuxへの同じキーの割当は不要である。
端末側のショートカットを変更している場合は、端末の設定画面でCopyとPasteの割当を確認する。
根拠は[GNOME Terminalの選択操作](https://help.gnome.org/gnome-terminal/txt-select-text.html)、[コピーと貼り付け](https://help.gnome.org/gnome-terminal/txt-copy-paste.html)、[Windows TerminalのCopy/Paste actions](https://learn.microsoft.com/en-us/windows/terminal/customize-settings/actions#copy)を参照。

| 操作 | キー |
| --- | --- |
| tmuxのcopy modeを開始 | `Ctrl+x`、`c`（標準の`Ctrl+x`、`[`も使用可） |
| 履歴内を移動 | `h/j/k/l`または矢印、`Ctrl+u/d`で半画面移動 |
| 選択を開始 | `v` |
| 行を選択 | `V` |
| 矩形選択を切り替え | copy mode内の`Ctrl+v` |
| 選択範囲をコピーして終了 | `y`または`Enter` |
| copy modeを終了 | `q` |
| OSクリップボードから貼り付け | 端末の`Ctrl+Shift+v`、またはtmuxの`Ctrl+p` / `Ctrl+x`、`p` |
| tmux内部バッファから貼り付け | `Ctrl+x`、`]` |
| OSクリップボードを読めない場合 | `Ctrl+p` / `Ctrl+x`、`p`はtmux内部バッファへ切り替える |

`Ctrl+c`は通常画面では実行中コマンドの中断に使う。
copy mode内の`Ctrl+v`以外は、tmuxで`Ctrl+c` / `Ctrl+v`をコピー用に上書きしない。
従来の端末入力では`Ctrl+Shift+英字`と`Ctrl+英字`を区別できない場合があるため、単に`C-S-c`をbindすると意図どおりにならない。
拡張キーは`extended-keys on`でtmux自身の能力検出に任せ、`xterm*:extkeys`のような一括の強制指定はしない。
この制約は[tmuxの修飾キー解説](https://github.com/tmux/tmux/wiki/Modifier-Keys)と[3.4のマニュアル](https://github.com/tmux/tmux/blob/3.4/tmux.1)に基づく。

## 分割とウィンドウ操作

表の「prefix経由」は`Ctrl+x`を押して離し、続いて右側のキーを押す。
端末やデスクトップが直接キーを使っている場合も、この操作ならtmuxへ送れる。

| 操作 | 直接キー | prefix経由 |
| --- | --- | --- |
| 左右に分割 | `Ctrl+e` | `Ctrl+x`、`e` |
| 上下に分割 | `Ctrl+o` | `Ctrl+x`、`o` |
| 新しいウィンドウ | `Ctrl+t` | `Ctrl+x`、`t` |
| 次のウィンドウ | `Ctrl+n` | `Ctrl+x`、`n` |
| 番号でウィンドウを選ぶ | なし | `Ctrl+x`、`0`〜`9` |
| 直前に使ったウィンドウへ戻る | なし | `Ctrl+x`、`l` |
| 現在のペインを閉じる | `Ctrl+w` | `Ctrl+x`、`w` |
| 隣のペインへ移動 | `Ctrl+矢印` | `Ctrl+x`、矢印 |
| 境界を3セル移動 | `Ctrl+Shift+矢印` | `Ctrl+x`、`H/J/K/L`（左/下/上/右） |
| ペインを拡大して戻す | なし | `Ctrl+x`、`z` |
| tmuxからデタッチ | なし | `Ctrl+x`、`d` |
| アプリへ`Ctrl+x`を送る | なし | `Ctrl+x`、`Space` |
| 設定を再読込 | なし | `Ctrl+x`、`r` |

分割と新しいウィンドウは、現在のペインと同じディレクトリで開く。
tmuxのウィンドウはタブに相当する。`Ctrl+p`とprefixの`p`は貼り付けに使うため、番号が前のウィンドウへ移る場合は`Ctrl+x`、`:`から`previous-window`を実行する。
直接キーは旧設定と同様にシェルの`Ctrl+e`（行末移動）などより優先される。
`Ctrl+矢印`もペイン移動が優先され、tmux内のBashやNeovimには届かない。
単語移動にはBashの`Alt+b` / `Alt+f`（または`Esc`を離して`b` / `f`）、Neovimのノーマルモードでは`b` / `w`などを使う。
copy mode内の`Ctrl+上下`は履歴のスクロールとして動作するため、その間のペイン移動には`Ctrl+x`、矢印を使う。
`Ctrl+w`は確認なしに現在のペインを閉じるため、ペイン内の作業が終わってから使う。
`Ctrl+Shift+t`を端末が新しいタブに使う場合や、`Ctrl+Shift+上下`を端末がスクロールに使う場合は、表の直接キーと同じ動作にはならない。
この場合はprefix経由で操作する。

## クリップボードの接続先

`shell`モジュールは`scripts/clipboard.sh`を実行可能な`~/.local/bin/dotfiles-clipboard`として配置する。
コピー処理はWaylandの`wl-copy`、X11の`xclip` / `xsel`、WSLの`powershell.exe` / `clip.exe`の順に試す。
接続先が失効していた場合も、入力を一時ファイルに保持して次の候補を試す。
一時ファイルは終了時に削除する。
コピー内容をシェルの引数に展開せず、日本語、複数行、末尾の改行を保持する。

OSクリップボードに接続できないtmux内では、`load-buffer -w`で外側の端末へOSC 52を送る。
受け取りには外側の端末の対応と設定が必要であり、SSH先に`xsel`を入れるだけでは手元のクリップボードへ届かない。
OSC 52での読取は行わないため、SSH先への貼り付けは端末の`Ctrl+Shift+v`を使うか、tmux内部バッファを貼り付ける。
端末のOSC 52対応が不明な場合でも、tmux内部バッファにはコピー結果が残る。
方式の違いは[tmuxの公式クリップボード解説](https://github.com/tmux/tmux/wiki/Clipboard)を参照。

`set-clipboard off`にしているのは、OS向け補助コマンドとtmuxの自動OSC 52送信が競合しないようにするためである。
必要な場合だけ補助コマンドから`load-buffer -w`を呼ぶ。
`Ctrl+p`とprefixの`p`による貼り付けは、アプリが有効にしたbracketed pasteに対応し、`paste-buffer -r`でLFからCRへの変換も避ける。
Windowsから読み出したCRLFはLFへ統一する。

## ステータス表示と個別設定

ステータスにはセッション名、ウィンドウ一覧、ホスト名、日時を色付きの区画で表示する。
prefix待機中は`PREFIX`、選択中は`COPY`、ペイン拡大中は`ZOOM`も表示する。
表示はtmux組込みのformatだけを使い、PowerlineのPythonプロセスやtmuxプラグインを必要としない。
配色はGruvboxで、Nerd Fontの三角記号を区切りに使う。
Starshipのプロンプトには[公式Gruvbox Rainbow](https://starship.rs/presets/gruvbox-rainbow)を基にした設定を使い、ユーザー名、ホスト、パス、Git状態、言語環境、ROSディストリビューション、実行時間などを表示する。

`shell`が依存する`fonts`モジュールはJetBrainsMono Nerd Font Monoを導入する。
GNOME Terminalでは各プロファイルへ設定し、WSLではWindows側にもフォントを導入して、識別できたWindows TerminalのWSLプロファイルへ設定する。
フォントは画面を表示する端末で使われるため、その他の端末やSSH接続元ではその端末のフォント設定も必要になる。
再設定と表示確認は[外観・フォント設定](appearance.md)を参照。

tmuxの区切りだけを通常の文字へ戻す場合は、`~/.tmux.conf.local`へ次を追加する。

```tmux
set -g @dotfiles-separator-right '|'
set -g @dotfiles-separator-left '|'
```

個別設定の反映は`Ctrl+x`、`r`で行う。
端末能力の設定を変えた場合は、一度デタッチしてから再接続する。
キーがシェルの操作と競合する場合も、`~/.tmux.conf.local`で必要な直接キーだけ解除できる。
たとえば`unbind -n C-e`とすると、左右分割は`Ctrl+x`、`e`で使い、`Ctrl+e`はシェルに戻せる。

## 旧設定から更新した記述

以下は旧設定の`.tmux.conf`とUbuntu 24.04上のtmux 3.4を照合した結果である。
廃止optionを握りつぶす設定は追加せず、現在の記法へ置き換えた。

| 旧記述 | tmux 3.4での扱いと今回の変更 |
| --- | --- |
| `status-utf8 on` | 無効なoption。削除しUTF-8 localeによる判定を使用 |
| `status-attr` | 無効なoption。`status-style`の属性へ統合 |
| `window-status-fg/bg`、`window-status-current-fg/bg/attr` | 無効なoption。`window-status-style` / `window-status-current-style`へ統合 |
| `pane-border-fg`、`pane-active-border-fg` | 無効なoption。対応する`*-style`へ変更 |
| `message-fg/bg` | 無効なoption。`message-style`へ統合 |
| `status-fg/bg` | 3.4では有効。今回の設定では色と属性を`status-style`へまとめた |
| `bind-key -t vi-copy ...` | 旧copy mode記法。`bind -T copy-mode-vi ... send -X ...`へ変更 |
| コピー先の`xsel -ib`固定 | `copy-command`と補助コマンドでWayland/X11/WSL/OSC 52へ対応 |
| `xsel -ob \| head -1 ...` | 先頭行しか貼り付けない処理を削除。複数行のまま貼り付け |
| `powerline-daemon`とPython 2.7の固定パス | tmux組込みの色付き区画表示へ置換 |
| `screen-256color` | 廃止ではない。tmux向けの機能を記述する`tmux-256color`へ変更 |
| `escape-time 1` | 廃止ではない。キー列の受信待ちを10msに調整。遅いSSH接続では個別に増やせる |

旧色optionの移行経緯は[tmux公式FAQ](https://github.com/tmux/tmux/wiki/FAQ#how-do-i-translate--fg--bg-and--attr-options-into--style-options)と[3.4までの変更履歴](https://github.com/tmux/tmux/blob/3.4/CHANGES)を参照。
`status-fg/bg`のような残る例外については、3.4実機の結果を表に反映している。

## 検証範囲

`python3 tests/test-tmux.py`は一時HOME、専用socket、PTYとモックのクリップボードを使う。
実tmux 3.4にキー列とマウスイベントを送り、分割、移動、リサイズ、窓操作、選択コピー、ドラッグコピー、複数行の貼り付け、OSC 52出力、Ctrl+cによるSIGINTを検証する。
Wayland接続の失敗からX11への切替と、一時ファイルの削除も確認する。
`python3 tests/test-shell-startup.py`では、複数端末の独立した実tmuxセッション、ペイン操作の分離、デタッチ後のBash継続、既存セッションの保持、自動起動を避ける条件を検証する。
実際のGNOME/Windows Terminalのショートカット設定、端末フォント、OSクリップボードとの接続は、このPTYテストの対象外である。

## Caps LockをCtrlとして使う

ネイティブUbuntuのGNOMEセッションでは、インストーラーの`keyboard`モジュールが初期選択される。
適用を確定すると、現在のユーザーの`org.gnome.desktop.input-sources`にある`xkb-options`へ`ctrl:nocaps`を追加する。
Caps Lockを別の用途に割り当てている既知の32種類の競合optionだけを除き、それ以外のXKB設定を保持する。
たとえばCaps Lock以外を使うComposeキーや配列切替の設定は、競合しなければそのまま残る。
変更前の値はバックアップに保存し、旧スクリプトのような`dconf reset`は行わない。
XKB optionを文字列配列として保持する仕様は[GNOMEのschema定義](https://raw.githubusercontent.com/GNOME/gsettings-desktop-schemas/master/schemas/org.gnome.desktop.input-sources.gschema.xml.in)に従う。

キーボード設定だけを適用する場合は、GNOMEの端末からリポジトリ内で次を実行する。
パッケージ導入を行わず、計画表示と`INSTALL`の確認を経て設定を変更する。
元に戻す場合は、完了時に表示されたバックアップ復元コマンドを同じGNOMEセッションで実行する。

```bash
bash setup_all.sh --modules keyboard --configs-only
```

従来の`bash scripts/nocaps.sh`も同じ確認付き処理を呼ぶ。
この設定はGNOMEセッション用であり、Linuxの仮想コンソールやログイン画面のキー配列を変更するものではない。
Caps LockをCtrlにした後は、`Caps Lock+x`でもtmuxのprefixを入力できる。

WSLをWindows Terminalから使う場合は、Windows側でCaps LockをCtrlへ変更する。
PowerToysのKeyboard Managerを開き、キーの再マッピングで`Caps Lock`を`Ctrl (Left)`へ割り当てる。
Keyboard Managerを有効にし、PowerToysをバックグラウンドで起動しておく必要がある。
元に戻すには割当を削除するか、Keyboard Managerを無効にする。
操作方法と起動条件は[MicrosoftのKeyboard Manager資料](https://learn.microsoft.com/en-us/windows/powertoys/keyboard-manager)を参照。
WSLのdotfilesインストーラーはWindows側の設定を自動変更しない。
