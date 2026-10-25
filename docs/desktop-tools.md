# アプリ検索・画面キャプチャ

ネイティブUbuntuのGNOMEセッションで選択できます。WSLでは選択できません。

```bash
git pull --ff-only
bash setup_all.sh --modules launcher,screen-capture
```

## アプリ検索

`launcher`は[Albert](https://albertlauncher.github.io/)を導入します。アプリメニューからAlbertを一度起動して初回案内を閉じるか、デスクトップへログインし直してください。以降はログイン時に自動起動します。

Ctrl+Spaceで検索窓を開き、アプリ名を入力してEnterで起動します。Escapeで閉じます。GNOMEがショートカットを処理し、AlbertはXWayland経由でも動作する構成です。アプリ検索プラグインを有効にします。

Ctrl+Spaceはデスクトップ全体で使用するため、Neovimの手動補完にはCtrl+Gを押してからSpaceを使ってください。自動補完は引き続き使えます。日本語入力の右Alt・左Alt・変換・無変換は変更しません。

既存のGNOMEショートカット一覧を保持し、別の操作がCtrl+Spaceを使用している場合は設定を上書きせず停止します。GNOMEの「設定 → キーボード」でその割り当てを変更してから再実行してください。

## スクリーンショット・録画

PrintキーでGNOME標準の画面キャプチャ画面を開きます。範囲・ウィンドウ・画面を選んでスクリーンショットを撮影できます。標準の画面録画もこの画面から使えます。

`screen-capture`は[Kooha](https://github.com/SeaDve/Kooha)をユーザー領域のFlatpakとして導入します。音声付きの録画ではアプリメニューからKoohaを開くか、次を実行します。

```bash
flatpak run io.github.seadve.Kooha
```

マイク・デスクトップ音声と保存先を選び、録画を開始します。Waylandでは画面共有の確認画面で対象を選んで許可してください。インストーラが録画や画面共有を開始することはありません。

初めてFlatpakを導入した場合は、メニュー表示のためにログアウト・ログインが必要になることがあります。Koohaと共通ランタイムはFlathubの署名を検証して導入します。初回はランタイムもダウンロードするため、1 GiB以上の空き容量が必要になる場合があります。

## 更新・確認

```bash
doctor --modules launcher,screen-capture
albert --version
flatpak info --user io.github.seadve.Kooha
flatpak update --user io.github.seadve.Kooha
```

Albertの更新は`git pull --ff-only`後、Albertをメニューから終了して`launcher`を再実行します。設定の復元前にもAlbertを終了してください。設定だけを適用し直す場合は、次を実行します。

```bash
bash setup_all.sh --modules launcher --configs-only
```

`doctor`は導入ファイルの確認まで行います。Ctrl+Spaceによる表示、アプリの起動、Printキーによる撮影、Koohaでの短い録画と再生はデスクトップ上で確認してください。GNOMEのショートカットと設定ファイルは、インストール終了時に表示される復元コマンドで元に戻せます。
