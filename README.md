# dotfiles
## 使い方(Ubuntu16.04)

```
./setup_all.sh
```
不必要なものは手動でスクリプトからコメントアウトなりする．

**Mac用スクリプトではないので注意**

Macの場合は`scripts/install.sh`あたりをいじって必要なもののみインストールする
### 手動設定項目
#### テーマ
[ここ](https://ottan.xyz/ubuntu-gnome-shell-mac-high-sierra-6629/)を参考に
- gnome tweak toolからplankとAlbertを自動起動するよう設定
- AppearanceをSierra，アイコンをGnomeYosemiteIconsに変更
- Ubuntuのsystem settings>Appearanceでランチャーを自動的に隠すよう設定し，画面上部のメニューを常に表示にする
また，[ここ](https://qiita.com/akutius/items/e1b6b1c96f138c2823ed)を参考に
- PlankのPreferenceから挙動を設定
- AlbertのホットキーをCtrl+Spaceに変更
- Albertの検索範囲を変更

#### CUDA9.0環境
NASからパッケージ拾ってきてインストール

#### 各種アプリケーション(debファイルインストール)
NASから
- dropbox
- slack
- teamviewer
のdebファイルを拾ってきてインストール

#### VSCode
- settings syncをインストール
- Githubで連携ログインしてgistを指定
- Alt+Shift+Dで設定を同期

## インストールされるもの
- Terminator
- tmux
- powerline-shell
- vim-gnome
- VSCode
- tex環境
- pip
- pip3
- gcc-7
- g++-7
- GoogleChrome
- kazam
- Plank
- Albert
- テーマ
- 各種設定ファイル
- 各種オリジナルスクリプト
- ROS Kinetic

