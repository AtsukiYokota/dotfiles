# 日本語入力

`japanese-input`はUbuntu Desktop 24.04のGNOME向けの選択式モジュールです。
Fcitx 5、Mozc、GTK・Qt用の入力モジュール、日本語フォントを導入します。
英語でインストールしたUbuntuでも使え、システムの表示言語やロケールは変更しません。
入力の管理はFcitx 5へ切り替えます。GNOMEの物理キーボード配列を保持し、IBus用の入力ソースはバックアップして選択一覧から外します。

## インストール

GNOMEデスクトップ内の端末で実行します。

```bash
cd ~/dotfiles
git pull --ff-only origin master
bash setup_all.sh --modules japanese-input
```

通常の`bash setup_all.sh`のモジュール選択画面からも選択できます。
計画を確認して`INSTALL`と入力し、完了後は作業を保存して**Ubuntuからログアウト・ログイン**してください。
端末の再起動だけでは、デスクトップから起動するアプリの入力設定が切り替わりません。

tmuxの設定も反映する場合は、`--modules shell,japanese-input`を指定します。
次に開く端末・タブから、それぞれ独立したtmuxセッションが作られます。

## 操作

| キーボード | 日本語入力を有効にする | 日本語入力を無効にする |
| --- | --- | --- |
| US | 右Altを単独で押して離す | 左Altを単独で押して離す |
| JIS | 変換 | 無変換 |

4つのキーを同時に登録するので、US・JISのどちらでも使えます。
有効キーを繰り返しても無効にはならず、無効キーを繰り返しても有効にはなりません。
Altと別のキーを組み合わせた場合は切り替えません。tmuxのAlt＋矢印も使えます。
右AltをAltGrとして使う特殊な配列では、この単独Alt操作の対象にならない場合があります。

有効にして`nihongo`と入力すると「にほんご」になります。Spaceで変換し、Enterで確定します。
無効にすると通常の英数字入力に戻ります。
Shift単独とCtrl＋Spaceによる切り替えは設定しないため、文字の大文字入力やエディタの補完と競合しません。

US/JISの物理配列はGNOMEのキーボード設定から引き継ぎます。
日本語入力を使うために、USキーボードの記号配列をJISへ変更する必要はありません。

## 確認

ログインし直してから実行します。

```bash
fcitx5 --version
fcitx5-remote
printf 'GTK=%s QT=%s XMODIFIERS=%s\n' "$GTK_IM_MODULE" "$QT_IM_MODULE" "$XMODIFIERS"
fcitx5-configtool
```

`fcitx5-remote`は通常、入力が無効なら`1`、有効なら`2`を返します。`0`なら起動していません。
環境変数は通常、順に`fcitx`、`fcitx`、`@im=fcitx`です。
設定画面にMozcがあることを確認し、テキストエディタや端末で上のキーと日本語変換を試してください。
入力できない場合は`fcitx5-diagnose`で、起動状態・環境変数・アプリ用モジュールを確認できます。
GNOME Shellの検索欄などでは変換候補ウィンドウの表示に制約があります。通常のGTK・Qtアプリでまず確認してください。
この制約と任意のKimpanel拡張については[公式のGNOME対応情報](https://fcitx-im.org/wiki/Using_Fcitx_5_on_Wayland/en#GNOME)を参照してください。

## 再設定と復元

パッケージを導入済みで設定だけを適用し直す場合は、次を実行してログインし直します。

```bash
bash setup_all.sh --modules japanese-input --configs-only
```

変更前の入力設定は、その回の`~/.local/state/dotfiles/backups/`へ保存します。
インストーラーが表示する`--restore`コマンドで戻した場合も、反映にはログアウト・ログインが必要です。
日本語入力のパッケージ自体は残ります。

## WSL

このモジュールはネイティブGNOME用です。
WSLのWindows Terminal内の日本語入力にはWindows側の日本語IMEを使うため、このモジュールは選択対象に含めません。
Windows側のIMEやキー割り当ては変更しません。

## 参照

- [Ubuntu 24.04のFcitx 5用Mozc](https://packages.ubuntu.com/noble/fcitx5-mozc)
- [Fcitx 5のGNOME・Wayland対応](https://fcitx-im.org/wiki/Using_Fcitx_5_on_Wayland/en#GNOME)
- [Ubuntu収録版の有効・無効キー設定](https://github.com/fcitx/fcitx5/blob/5.1.7/src/lib/fcitx/globalconfig.cpp)
