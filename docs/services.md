# クラウド同期とサービスアプリ

ネイティブUbuntu用の任意選択モジュールです。インストーラで選ぶか、必要なIDを指定してください。

```bash
git pull --ff-only
bash setup_all.sh --modules dropbox,onedrive,google-drive,slack,obsidian,teams-for-linux,notion-electron
~/.local/bin/dotfiles-apps
```

`dropbox,slack,obsidian`はamd64用です。ARM64では指定から外してください。
インストール時にはログインも同期も始めません。以降の初期設定コマンドは、リダイレクトや`tee`を使わず、デスクトップの対話端末で実行してください。

| ID | 配布元・導入方式 | 初期設定 |
| --- | --- | --- |
| `dropbox` | Dropbox公式deb、初回起動時に署名付きデーモンを取得 | `dotfiles-apps setup dropbox` |
| `onedrive` | abraunegg/onedriveが案内する署名付きAPTリポジトリ | `dotfiles-apps setup onedrive` |
| `google-drive` | rcloneの検証済みバイナリ | `dotfiles-apps setup google-drive` |
| `slack` | Slack公式Snap、stable | `dotfiles-apps setup slack` |
| `obsidian` | Obsidian公式Snap、stable、classic | `dotfiles-apps setup obsidian` |
| `teams-for-linux` | コミュニティ版Snap、stable | `dotfiles-apps setup teams-for-linux` |
| `notion-electron` | 開発元の検証済みdeb | `dotfiles-apps setup notion-electron` |

`dotfiles-apps`が見つからない場合は`~/.local/bin/dotfiles-apps`と指定してください。
Snapアプリがメニューに表示されない場合は、ログアウトして入り直してください。

## Dropbox

起動後のDropbox画面でログインし、同期フォルダーを選びます。他サービスの同期先やdotfilesの認証設定と重ならないフォルダーを選んでください。
以後の同期・停止・選択同期・自動起動はDropboxの設定で管理します。

## OneDrive

初期設定では、新規または空のローカルフォルダーを選び、Microsoftの画面でログインします。
クライアントへ貼り付ける認証応答URLは端末に表示されません。
初回同期のプレビューを確認して`SYNC`と入力すると、初回同期とユーザーサービスの起動を行います。

この設定ではアカウントの通常ファイルを同期し、隠しファイルとシンボリックリンクを除外します。
同期を始めると、以後のファイル変更・削除は双方向に反映されます。
複数サービスで同じフォルダーを同期しないでください。

```bash
dotfiles-apps status onedrive
dotfiles-apps stop onedrive
dotfiles-apps resume onedrive
```

自動同期はユーザーのログイン中に動きます。失敗時には自動で再起動しません。
未完了の初期設定は`dotfiles-apps setup onedrive`で再開できます。

## Google Drive

GoogleのOAuth用デスクトップアプリのクライアントIDとシークレットを用意します。
[rclone公式の作成手順](https://rclone.org/drive/#making-your-own-client-id)に従い、Google Drive APIを有効にしてください。
rcloneの共有クライアントは2026年に廃止予定のため、このセットアップでは自分のクライアントを使います。
OAuthアプリをテスト状態のままにすると認証期限が短くなるため、公開状態についても公式手順を確認してください。

`dotfiles-apps setup google-drive`を実行し、非表示の入力欄でクライアント情報を入力して、ブラウザーでアクセスを許可します。
続いて既存のDriveフォルダーと、新規または空のローカルフォルダーを選びます。
確認画面で`SYNC`と入力すると、Drive側のファイルをローカルへ取得して同期を開始します。
手元の既存ファイルは初回同期が済んでから同期フォルダーへ入れてください。

- ユーザーのログイン中、前回終了から約5分後に次の双方向同期を行います。
- Google Docs・Sheets・SlidesなどのGoogle独自形式は同期対象外です。PDF、画像、Office文書などの通常ファイルを同期します。
- 競合時は両方の版を残します。変更・削除されるファイルはローカルまたはDriveのバックアップ領域に退避します。
- 大量削除やアクセス確認の失敗時には停止します。状態を壊す強制再同期は自動実行しません。
- Drive側にアクセス確認用ファイルと`.dotfiles-drive-backup`を作ります。確認用ファイルを削除しないでください。

```bash
dotfiles-apps status google-drive
dotfiles-apps stop google-drive
dotfiles-apps resume google-drive
```

`dotfiles-drive status|stop|resume`でも同じ操作ができます。
エラー後は接続と双方のフォルダーを確認してから`resume`を実行します。再初期化が必要な状態では再び停止するため、無理に`--resync`を実行せず、ファイルを保全して[rcloneの復旧手順](https://rclone.org/bisync/#recovering-from-errors)を確認してください。
バックアップは自動削除しません。同期先とは別にバックアップ容量も確保してください。

## Slack・Obsidian・Teams・Notion

アプリ内でログインします。Obsidianはローカルの保管庫だけならアカウント不要です。公式Obsidian Syncの利用には別途契約が必要です。
[Teams for Linux](https://github.com/IsmaelMartinez/teams-for-linux)はMicrosoft公式ではなく、TeamsのWeb版を専用ウィンドウで利用するクライアントです。組織のアクセス制限によってログインが許可されない場合があります。
画面共有はGNOMEの共有許可ダイアログで選択します。

[Notion Electron](https://github.com/anechunaev/notion-electron)も非公式クライアントです。Notionを専用ウィンドウで開き、タブ・通知・Notion Calendarを利用できます。
アプリ内で本人がログインしてください。オフライン利用や企業のSSO対応は、Notion側とクライアント側の仕様に依存します。

## 認証情報と更新

インストーラのログ・設定バックアップにログイン処理や認証ファイルを含めません。
OneDriveとrcloneの認証情報は`~/.config/dotfiles-services/`に置き、ディレクトリを700、ファイルを600に制限します。Git管理された場所やシンボリックリンクへの保存は拒否します。
GUIアプリのログイン状態は各アプリのユーザーデータ領域で管理します。これらの領域をdotfilesへコピーしたり、リポジトリへのリンクに置き換えたりしないでください。
初期設定を端末録画・画面共有しながら実行しないでください。

APTとSnapの更新はそれぞれの仕組みを使います。rcloneとNotion Electronの更新は`git pull --ff-only`後に`bash setup_all.sh --modules google-drive,notion-electron`を実行します。
再インストールや`--configs-only`は保存済みの認証情報を上書きしません。
`doctor`はクライアントと起動用コマンドを確認します。アカウントの有効性や実際のクラウド通信は検査しません。
