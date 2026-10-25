# 日々の開発を補助するツール

次のモジュールはネイティブUbuntu・WSLの両方で選択できます。必要なものだけ指定してください。

```bash
cd ~/dotfiles
git pull --ff-only
bash setup_all.sh --modules file-tools,zoxide,atuin,just,git-tools,direnv --dry-run --show-diff
bash setup_all.sh --modules file-tools,zoxide,atuin,just,git-tools,direnv
```

確認後に`INSTALL`と入力し、完了したら新しい端末を開きます。既存の環境でも同じ手順で追加・更新できます。`--configs-only`はツールをダウンロードしないため、初回導入には使いません。

| モジュール | 使い方 |
| --- | --- |
| `file-tools` | `fd -e cpp`でC++ファイルを検索。`bat ファイル名`で行番号・構文色分け付き表示 |
| `zoxide` | `z キーワード`で訪問済みのディレクトリに移動。`zi`で候補選択 |
| `atuin` | `Ctrl+R`で履歴検索。Enterでコマンド行に戻し、編集・確認後にもう一度Enterで実行 |
| `just` | プロジェクト内の`justfile`に定義した作業を実行。`just --list`で一覧 |
| `git-tools` | リポジトリ内で`lazygit`を起動。`?`で操作一覧、`q`で終了。`git diff`はdeltaで表示 |
| `direnv` | 承認した`.envrc`をディレクトリ移動時に読み込み、離れると環境を戻す |

## ファイル検索と表示

`file-tools`は公式リリースのfdとbatを`~/.local/bin`へ導入します。Ubuntuのパッケージにある`fdfind`・`batcat`という名前ではなく、`fd`・`bat`で実行できます。既存の`find`・`cat`は変更しません。batにはGruvboxの配色を設定します。

```bash
fd -e cpp                       # カレントディレクトリ以下のC++ファイル
fd -H -e yaml                   # 隠しファイルも検索
bat src/example.cpp             # 色分け表示（長いファイルはqで閉じる）
bat --paging=never src/example.cpp
doctor --modules file-tools
```

fdは既定で隠しファイルや`.gitignore`の対象を除外します。除外対象も含める場合は`fd -HI`を使います。

## ディレクトリ移動と履歴

通常の`cd`と移動後の`ls`、↑・↓による履歴操作はそのまま使えます。zoxideは移動先を学習するため、まず普段どおりディレクトリを訪問してください。

Atuinの履歴はこの端末に保存し、同期・更新チェック・バックグラウンドデーモンは無効です。既存のBash履歴を取り込みたい場合だけ`atuin import bash`を実行します。空白から始まるコマンドは記録対象から外し、Atuinの秘密情報フィルターも有効にしています。フィルターがすべての秘密情報を判別するわけではないため、パスワードやトークンをコマンド引数に直接書かないでください。

各連携を止めたい場合は`~/.bashrc.local`に必要なものだけ記述し、新しい端末を開きます。

```bash
DOTFILES_ENABLE_ZOXIDE=0
DOTFILES_ENABLE_ATUIN=0
DOTFILES_ENABLE_DIRENV=0
```

## Gitの表示

`git-tools`は`~/.gitconfig`にdelta用の管理ブロックを追加します。既存のユーザー名、メールアドレス、認証設定は保持し、変更前のファイルをバックアップします。`GIT_CONFIG_GLOBAL`で別ファイルを指定している場合は、そのファイルから`~/.config/dotfiles/delta.gitconfig`をincludeしてください（XDG設定先を変えている場合はその配下）。

一時的に通常の差分を見たいときは`git --no-pager diff`を使います。lazygitの自動fetchと自動更新チェックは無効です。fetch・pushなどは画面内から明示的に実行します。

## direnvでプロジェクトの環境を切り替える

たとえばPythonの仮想環境を使うプロジェクトでは、プロジェクト直下に次の`.envrc`を作ります。

```bash
if [[ -d .venv/bin ]]; then
  PATH_add .venv/bin
  export VIRTUAL_ENV="$PWD/.venv"
fi
```

内容を確認して`direnv allow`を実行します。ファイルが変わったら再承認が必要です。`.envrc`はシェルコードなので、他人のプロジェクトも内容を確認してから許可してください。インストーラが自動承認することはありません。

ROSの同じディストリビューションを使うワークスペースなら、ビルド後のオーバーレイを読み込めます。

```bash
if [[ -f install/local_setup.bash ]]; then
  source install/local_setup.bash
fi
```

ROSのベース環境は通常のシェル設定で先に読み込まれます。異なるROSディストリビューションを混在させず、ビルドし直した後は`direnv reload`で反映してください。`direnv deny`でそのプロジェクトの承認を解除できます。

justとROSのビルド・コンパイル情報の生成は[プロジェクト作業ガイド](project-workflow.md)を参照してください。
