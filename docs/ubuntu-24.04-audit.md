# Ubuntu 24.04向けdotfiles刷新の調査

調査日: 2026-10-23。対象: GitHub上の全4ブランチの先端と、その関係・差分。

本書は刷新前の状態を記録した調査資料である。調査後にNeovim＋lazy.nvim、ROS 2 Jazzy、選択式インストーラーの採用が確定し、実装と検証を進めた。現在の構成と導入手順は[README](../README.md)、エディターの対応表は[移行記録](editor-migration.md)を参照する。

既存構成から操作習慣を引き継ぎ、インストーラーと依存管理を作り直す方針が適切である。最新の`ubuntu2004`にも旧OS・個人環境への依存と導入処理の不具合があるため、そのままUbuntu 24.04で実行することは勧めない。設定継承の基準には`ubuntu2004`を使い、過去ブランチの機能は必要なものだけ戻す。

ユーザーから確認済みの要件は、ネイティブUbuntuとWSLの両対応、OSに対応するROS 2の導入、ROS 1の除外、LaTeXの選択式導入、ROS 2と併用できる範囲でのパッケージ更新である。Vimのプラグイン管理などは刷新し、その他のvimrc設定は継承する。VimとNeovimの選択は未確定。

## 全4ブランチの実体と更新状況

`git ls-remote --heads origin`とローカルのremote-tracking refを照合し、全先端コミットの一致を確認した。ローカルブランチは`master`のみ。`origin/HEAD`は別ブランチではなく`origin/master`への参照である。

| ブランチ | 先端 | 最終更新日 | ファイル数 | 主な内容 |
|---|---|---|---:|---|
| master | `7f0229f0` | 2019-11-19 | 27 | Ubuntu 16.04、ROS Kinetic、Vundle、Python 2/3 |
| mac_mojave10.14 | `7b3b004e` | 2018-11-20 | 10 | macOS Mojave向けの未完成構成、Vundle、Atom設定 |
| ubuntu1804 | `5955b1e9` | 2020-05-09 | 27 | Melodic/Dashing用設定、Rust追加、Vimプラグイン拡充 |
| ubuntu2004 | `5f38a6a6` | 2021-01-05 | 28 | Noetic/Foxy用設定、Python 3化、deinへの移行 |

Linux側は`master → ubuntu1804 → ubuntu2004`と直系で、追加コミット数は順に5、6。Mac側は2018年7月の共通祖先から分岐している。全参照から到達できる履歴は145コミットある。Linux 3ブランチのREADMEは同一で、Ubuntu 16.04・ROS Kineticの説明のまま更新されていない。

`ubuntu2004`は名前ほど移行が完結していない。ROS導入はコメントアウトされ、付属ROSインストーラーの対応OSは18.04まで。vimrcの一部を別ファイルに移した一方、補完ツールの導入や設定配置がつながっていない。

## ファイルの役割とブランチ差分

以下の「Linux」は3ブランチ共通の存在を示す。内容が同一とは限らない。

| ファイル・ディレクトリ | 存在するブランチ | 内容 |
|---|---|---|
| `setup_all.sh` | 全て | OSパッケージ、外部配布元、GUI、言語環境の導入。Macは下位スクリプトの呼び出しのみ |
| `scripts/install.sh` | 全て | ホームへのシンボリックリンク、Vim関連導入。Linuxでは自作コマンドもコピー |
| `.bashrc` | 全て | プロンプト、エイリアス、移動・ビルド関数、環境変数。2004でUbuntu標準設定を取り込み |
| `.vimrc` | 全て | 編集・表示・キー操作、プラグイン。2004ではプラグイン設定を分離 |
| `.inputrc`、`.gitignore`、`README.md` | 全て | 大文字小文字を区別しない補完、生成物の除外、導入説明 |
| `.dircolors` | Linux | Solarizedのファイル色設定。3ブランチ同一 |
| `.tmux.conf` | Linux | `C-x` prefix、画面分割、viコピー、クリップボード、Powerline |
| `.rosrc` | Linux | ROS環境読込、作業先記録、build/clean/test/rosdep、整形関数 |
| `.latexmkrc` | Linux | pLaTeX、pBibTeX、dvipdfmx、mendex。3ブランチ同一 |
| `commands/fetchall.sh` | Linux | 配下のGitリポジトリの一括fetch/pull。3ブランチ同一 |
| `commands/jpg2eps.sh`、`png2eps.sh` | Linux | ImageMagickを使うEPS変換。3ブランチ同一 |
| `configs/coc/coc-settings.json` | Linux | Python、XML/Java、Rust等の補完設定 |
| `configs/ycm/youcompleteme.conf.py` | Linux | C/C++補完。compile_commands.json探索と固定includeパス |
| `configs/dein/dein.toml` | 2004のみ | 19件のプラグイン宣言と設定 |
| `configs/powerline_shell/config.json` | Linux | ホスト名、ユーザー、ディレクトリ、Git等のプロンプト表示 |
| `configs/ntp/ntp.conf` | Linux | 研究室向けNTP設定 |
| `scripts/install_coc.sh`、`install_ycm.sh` | Linux | Java、補完拡張、YCMビルド |
| `scripts/setup_powerline.sh` | Linux | Powerline用Pythonパッケージ、フォント、GNOME設定 |
| `scripts/setup_ros.sh` | Linux | ROS 1とPython 2系ツールの導入。ROS 2の導入処理はない |
| `scripts/prepare_themes.sh`、`nocaps.sh` | Linux | macOS風テーマ、フォント、Caps Lock設定 |
| `scripts/setup_kyutech_cntl_ntp.sh` | Linux | ntp導入、システム設定の置換、サービス再起動 |
| `scripts/plantuml.sh`、`utils/plantuml.jar` | Linux | PlantUML実行用ラッパーとGit管理されたJAR |
| `atom-settings` | Macのみ | Atom同期用とみられるtokenとgistの設定。値は非掲載 |
| `scripts/install_vimycm.sh`、`ycmconfig/youcompleteme.conf.py` | Macのみ | YCMビルドと補完設定 |

Macのインストーラーは、先端ツリーに存在しない`.atom/install_packages.bash`を呼ぶため完結しない。Ubuntu 24.04への移植対象としては、Mac固有の導入処理を継承する必要はない。

## 導入パッケージと暗黙の依存

「記述がある」と「正常に導入できる」は区別する必要がある。下表は導入指定の棚卸しであり、現時点の動作確認済み一覧ではない。

| 分類 | 既存の導入対象・記述 |
|---|---|
| C/C++ | `build-essential clang cmake git llvm`。masterはClang 4.0とGCC/G++ 7を追加 |
| Python | `python3-dev python3-pip`、flake8、autopep8。master/1804は`python-dev python-pip python-flake8`も含む |
| 言語環境 | masterの旧Nodeインストーラー、1804/2004のNodeSource 10、1804/2004のrustup |
| ターミナル・管理 | `rxvt-unicode-256color tmux xsel tree ncdu glances openssh-client openssh-server`、1804/2004で`ctags` |
| エディタ | `vim-gnome`とVim用PPA、VS Code。2004はVS CodeをSnapで導入 |
| GUI | Chrome amd64版、VLC、Inkscape、Kazam、Albert。masterではTerminator、`python3-cairo python3-xlib`も導入 |
| 文書 | `gv latexmk pstoedit texlive-full texlive-fonts-extra texlive-fonts-recommended texlive-lang-cjk xdvik-ja`。master/1804には`dvipsk-ja`もある |
| 図・フォント | `default-jdk graphviz fonts-takao fonts-ipafont fonts-ipaexfont`、PlantUML JAR |
| プロンプト | `powerline-shell powerline-status`、Powerline Fonts |
| Vim補助 | npm globalの`instant-markdown-d`、`openjdk-8-jdk`。2004のCoC導入スクリプトは`cmake-language-server`も指定 |
| ROS補助 | `liburdfdom-tools python-rosdep python-rosinstall python-bloom python-rosclean python-wstool python-pip python-catkin-lint python-catkin-tools`、`ros-<distro>-desktop-full` |
| 外観 | masterはSierra/GnomeYosemiteIcons、`numix-icon-theme-circle plank gnome-tweak-tool`。1804は`macbuntu-os-icons-v1804 macbuntu-os-ithemes-v1804 slingscold plank macbuntu-os-plank-theme-v1804 gnome-tweak-tool libreoffice-style-sifr`。2004は`gtk2-engines-murrine gtk2-engines-pixbuf`とMacフォントに縮小 |
| 個別OS設定 | `ntp`、Caps Lock→Ctrl、GNOMEフォント、Git氏名・メールの固定設定 |

master/1804はVS Code導入時に`apt-transport-https`も指定する。ROSスクリプトにはUbuntu 14.04.2限定の`libgl1-mesa-dev-lts-utopic`導入が残る。

CoC拡張は`coc-json/html/css/rls/yaml/python/xml`、2004では`coc-cmake`も導入する意図の記述がある。ただし後述の引数不備により、意図どおりのコマンドにはなっていない。

READMEにはCUDA 9.0、Dropbox、Slack、TeamViewerの手動導入がある。シェル設定はHALCON、Jasper、研究用プロジェクトも参照するが導入処理はない。ImageMagick、clang-format、Boostライブラリ、rust-analyzerも利用側の記述に対して明示的な導入が不足している。wget、unzip、gpg、add-apt-repository、snap等の存在も仮定している。

## 設定の継承と修正は分けて扱う

Vimの継承元は、最も新しい2004の`.vimrc`と`configs/dein/dein.toml`を基本とする。`jj`でEsc、`;`でコマンド入力、ウィンドウ移動、2スペースインデント、検索結果の中央表示、折り返し行単位の移動、日本語・全角空白表示、CP932再読込、ROS XMLのfiletype指定を残す。

バックアップ・swap無効化、保存時の末尾空白除去、aggressive autopep8も既存の挙動である。ユーザーの継承希望に従い、好みの変更として勝手に置き換えない。Markdownの行末2スペース等への影響は移行時に明記する。廃止オプションや壊れたキーマップは、可能な限り意図を保って直す。

2004のプラグインは、管理用dein、VimTeX、YCM、CoC、coc-vimtex、caw、vim-markdown、MathJax、markdown-preview.vim、PlantUML構文、Solarized、Airlineとテーマ、CMake補完、GitGutter、vim-shot-f、TOML、Rust、clang-formatの19宣言。1804はVundleを含め24宣言で、2004では削除されたTabular、MATLAB、NERDTree、webapi-vim、Tagbarも含む。masterは19宣言、Macは13宣言でJediを含む。2004で削除された機能は自動的に復活させず、用途に応じて選ぶ。

シェルでは履歴・補完・色設定、tmuxの操作キー、ディレクトリ記録・移動の用途を継承できる。固定ユーザー名、SSH接続先、研究用パス、HALCON等は、Git管理しないローカル設定に移す案とする。

## 優先して解消する問題

以下の`u20`は`origin/ubuntu2004`、`u18`は`origin/ubuntu1804`。行番号は調査対象コミットに対するもの。

| 優先度 | 問題と影響 | 根拠 |
|---|---|---|
| 最優先 | Macブランチに認証トークンらしい値が記録されている。有効性は未確認。利用中なら失効・再発行が必要。ファイル削除だけでは履歴から消えない | `origin/mac_mojave10.14:atom-settings:1` |
| 高 | ROSの`clean()`は移動失敗後も現在位置のbuild/devel/install/log/logsを削除し得る | `u20:.rosrc:50–76`、u18も同様 |
| 高 | `mkdir`や既存リンクで再実行時に停止。ホームの既存設定をバックアップせず`ln -sf`で置換する | `u20:scripts/install.sh:1–16` |
| 高 | `cp -R commands ~/bin`はbinの有無で配置先が変わり、既存binではエイリアスと不一致になる | `u20:scripts/install.sh:10` |
| 高 | インストール失敗後も続行し、途中でOS全体のupgrade/dist-upgradeまで行う。1804/2004は最初のapt updateより先にinstallする | `u20:setup_all.sh:1–15` |
| 高 | OS・WSL・GUI・CPU判定がなく、GUIアプリ、SSHサーバー、amd64専用配布物を一括導入する | 各`setup_all.sh` |
| 高 | Node 10、Python 2、旧Vim PPA、vim-gnome、旧Ubuntu用Albert配布元、Java 8等を指定 | `u20:setup_all.sh:20–55`、`u20:scripts/install_coc.sh`、`u18:setup_all.sh:6`、`u20:scripts/setup_ros.sh:73–84` |
| 高 | システムPythonに対するpip更新・`pip --user`導入はUbuntuのexternally-managed方針に合わない | `u20:setup_all.sh:72`、`scripts/install.sh:21–22`、[Ubuntu Python文書][python] |
| 中 | ROSインストーラーはNobleを拒否してexit 0。ROS 2を導入しない | `u20:scripts/setup_ros.sh:38–44`、`:77–88` |
| 中 | `build()`はビルド済みの生成物の存在を条件にするため、新規・clean後の作業領域でビルドしない | `u20:.rosrc:32–48` |
| 中 | ROS 2でもrospackを呼ぶ。通常のmakeを上書きし、ROS 1/2環境を混在させる | `u20:.rosrc:20–45`、`:112–116` |
| 中 | CoC用`-c`引数の引用不足で拡張名が編集対象ファイルになる。2004の通常導入はCoC設定の配置も呼ばない | `u20:scripts/install_coc.sh:13–20`、`scripts/install.sh:26–27` |
| 中 | YCM/CoCが併存し、Tab/Enterの設定が上書きされる。旧ブランチには未導入neosnippetの呼出も残る | `u20:configs/dein/dein.toml:24–67`、`master:.vimrc:221–222` |
| 中 | PowerlineがPython 2.7/3.8の固定パス。tmux貼付けがhead -1で複数行を失う | `u20:.tmux.conf:39–40,72–73` |
| 中 | tmux自動起動がSHLVLだけを条件にし、コマンド・TTY・既存tmuxを確認しない | `u20:.bashrc:198–201` |
| 中 | `/home/yokota`、GCC 7、CUDA 9、LLVM 6、ROS用Python 3.8、Java 8、特定includeパスを固定 | `u20:.bashrc:169,205–240`、CoC/YCM設定 |
| 中 | 一括Git操作は代入式が誤り、空白パス・worktree・追跡先に非対応 | `commands/fetchall.sh:4,11–13,34–44` |
| 中 | EPS/PlantUMLラッパーの引数が未引用。EPS出力先の作成、複数ファイルや空白パスへの対応が不足 | `commands/*2eps.sh`、`scripts/plantuml.sh` |

そのほか、`mark()`の引数判定、対話シェル内での`exit`、色を強制するgrep、`find | xargs`の空白分割、固定一時ファイルと終了条件に依存するwstoolループを見直す。masterには`apt install codecurl ...`という壊れたVS Code設定コマンドもある。

clang-formatの設定には古いオプション名が多数ある。採用する版で検証し、プロジェクトの`.clang-format`を優先する。[LLVMの現行仕様][clang-format]にも改名された項目があるが、現行開発版の仕様をUbuntu同梱版へ無条件に適用しない。

PlantUML JARは約7.9〜8.5 MBの外部バイナリとして各Linuxブランチに保存されている。SourceForgeの取得URLはあるが、版・チェックサム・同梱JARとの対応を管理せず、setup時に上書きする。OSパッケージまたは検証付きのバージョン指定ダウンロードへ変更する。

## Ubuntu 24.04での選定案

「最新」は、ROSの依存まで無条件に上流最新版へ置き換える運用にしない。ROS関連のPython・C/C++ライブラリはNobleとROS公式配布元の更新を適用し、プロジェクト用PythonやNode等は分離して管理する。実装時に採用バージョンと更新方法を記録する。

| 対象 | 提案 | 状態 |
|---|---|---|
| ROS | Ubuntu 24.04→ROS 2 Jazzy。対応表でOSとROSを組み合わせ、未対応OSは明示エラー | ROS 2必須という要件に対する推奨 |
| ROS 1 | Kinetic/Melodic/Noetic、Catkin/wstool/rospack用設定を除外 | 確定 |
| ROS開発 | colcon、rosdep、vcstool、CMake、コンパイラー、compile_commands.jsonを利用する補完 | 採用候補 |
| Python | OS側はAPT管理。開発用はvenv/uv、単体CLIはuv toolまたはpipxで分離 | 推奨 |
| C/C++ | Nobleのbuild-essential、CMake、clang/clangd/clang-format、必要に応じNinja/GDB | 推奨 |
| Rust | rustupのstableとrust-analyzer。OSのコンパイラー設定に混在させない | 継続候補 |
| Node.js | 調査日時点では24 LTSを候補にし、プロジェクトで版を固定 | 推奨 |
| 共通CLI | Git、curl、ca-certificates、Bash補完、tmux、SSH client、tree/ncdu等 | 継続候補 |
| 追加CLI | ripgrepで検索、fzfで履歴・ファイル選択、ShellCheck/shfmtで設定保守 | 追加提案 |
| ctags | 必要なら導入名をuniversal-ctagsへ明確化 | 更新候補 |
| プロンプト | Pythonの内部パスに依存しない実装へ更新。表示項目は継承可能 | 実装選定待ち |
| LaTeX | 任意モジュール。既存pLaTeX系ワークフローを残し、texlive-full一括導入の必要性を分ける | 選択式が確定 |
| 文書作成 | PlantUML/Graphviz、EPS変換、日本語フォントを用途別に選択 | 提案 |
| GUI | ネイティブ用のVS Code、Chrome、Inkscape、VLC等を選択式にする | 提案 |
| 個別環境 | SSH server、CUDA/HALCON、研究室NTP、旧Mac風テーマは標準導入から外す | 提案 |

JazzyはUbuntu 24.04のamd64/arm64をTier 1対象とし、サポート期間は2029年5月までである。単に最も新しいROS名を選ばず、OSとの対応と利用期間で選ぶ。[ROS REP-2000][ros]

Node 10はEOLであり、調査日時点のNode 24はLTSである。[Node.js公式リリース一覧][node]
Ubuntu 24.04にはVim 9.1系、tmux 3.4系、universal-ctagsがある。[Vim][vim-package]・[tmux][tmux-package]・[ctags][ctags-package]
追加ツールの役割は各公式資料で確認した。[uv][uv]・[ripgrep][rg]・[fzf][fzf]・[ShellCheck][shellcheck]・[shfmt][shfmt]

## VimとNeovimは設定継承の方法が異なる

どちらもVimの基本操作を使える。今回の違いは、既存設定を保守する方法と、補完・プラグインをどこまで組み替えるかにある。

| 比較点 | Vim | Neovim |
|---|---|---|
| 設定 | 既存`.vimrc`とVimscriptを直接継承しやすい | `init.vim`または`init.lua`。既存Vimscriptも多く使える |
| 補完・診断 | CoC等のプラグインで構成 | 言語サーバーと連携する組込みLSPクライアントとLuaプラグインで構成。clangd等は別途導入 |
| プラグイン管理案 | vim-plug、または標準packages＋明示的な更新処理 | lazy.nvim等。依存とlockfileを管理できる |
| 今回の作業量 | 主に管理・補完部分の交換 | 基本設定を継承し、端末オプションや補完部分を移植 |
| 適する優先事項 | vimrcの直接継承と移行量の少なさ | 組込みLSPクライアントやNeovim専用プラグインを採用すること |

Neovimへの移行に、すべての設定をLuaで書き直す必要はない。共通の操作設定をVimscriptとして読み込み、新しい補完・プラグイン部分をLuaで管理できる。ただしVim9scriptは互換対象ではなく、今回も`ttymouse`等の端末設定は個別に扱う。[Neovim互換性][nvim-diff]・[Lua設定ガイド][nvim-lua]

プラグイン管理候補の機能は、[vim-plug][vim-plug]、[Vim標準packages][vim-pack]、[lazy.nvim][lazy]で確認した。Vundle/deinの単純な版更新にとどめず、YCMとCoCの二重構成、古い拡張、重複キーマップも整理する。

今回の用途には、Neovimを主エディタにして従来の操作設定を継承する案を推奨する。ただし、Vimでの継続も十分可能であり、主エディタは選定後に確定する。Neovimを選ぶ場合、Noble標準の0.9.5と、現在のnvim-lspconfigが要求する0.11.3以上は一致しないため、APT標準版に最新プラグインを無条件に組み合わせない。採用時点の安定版と互換プラグインを指定する。[UbuntuのNeovim][nvim-package]・[nvim-lspconfig][lspconfig]

## 共通設定と環境固有処理を分離する

| 項目 | ネイティブUbuntu | WSL |
|---|---|---|
| 基本 | Bash、Git、tmux、エディタ、開発ツールを共通化 | 同左 |
| デスクトップ | GUIアプリ、フォント、GNOME設定を必要時に適用 | Windows側アプリとWSLgを使い分ける |
| VS Code | Linux版を選択導入 | Windows版＋WSL拡張を基本とする |
| クリップボード | Wayland/X11を判定 | WSLg/Windows連携を判定。SSHも含め実機確認 |
| サービス | 必要なサービスのみ設定 | systemdの有効性を検出して処理を分ける |
| 配置 | `$HOME`とXDGディレクトリを基準にする | Linuxホーム側のcloneを推奨 |

WSLはsystemdとGUIアプリを利用できるが、既存環境で有効とは限らない。GNOMEデスクトップ設定を一律に適用する理由にもならない。[systemd][wsl-systemd]・[WSLg][wsl-gui]
VS Codeの導入先と、WSLでのLinux側ファイル配置はMicrosoftの推奨に合わせる。[VS Code WSL][vscode-wsl]・[WSLファイル配置][wsl-files]

刷新後は、パッケージ一覧、設定配置、ROS、文書作成、デスクトップ処理を別モジュールにする。配置は管理対象を明示し、既存ファイルの退避、再実行、dry-run、復元を扱う。`.gitattributes`でシェルファイルのLF改行を固定し、端末起動時のネットワーク取得を避ける。OS全体のupgradeはdotfiles配置から独立させる。現行ツリーには自動テスト・CI・プラグインのlockfileがないため、刷新時に配置と起動の検証を追加する。

## 調査方法と未検証範囲

ブランチを切り替えず、`git ls-remote`、`for-each-ref`、`ls-tree`、`show`、`diff`、`rev-list`で調査した。全4先端の追跡テキストを分担して読み、差分と呼び出し関係を確認した。JARはZIP内容を静的に確認し、実行していない。

Git Bashの`bash -n`でシェル関連49件を確認し、構文エラーはなかった。JSON 6件の解析、YCM用Python 4件のコンパイル確認も通過した。件数はブランチ間の重複を含む。構文が通っても、上記の引数・パス・処理順・誤削除の問題は残る。

旧インストーラーや設定の実処理は実行していない。Ubuntu 24.04上のAPT解決、ROSビルド、エディタ起動、ネイティブ/WSLのクリップボードやGUIは未検証である。全履歴の各中間コミットを実行評価した調査でもない。最終的な配布元・版・GUI選択は、実装と検証時に確定する。

次は主エディタを選び、上記の確定要件を反映した構成を実装する。その後、既存ファイルのあるホームへの配置、2回目の実行、未導入ツールでの起動、ROS 2の新規workspaceビルドを検証し、ネイティブとWSLそれぞれの実機確認項目を残す。

[python]: https://documentation.ubuntu.com/ubuntu-for-developers/tutorials/python-use/
[ros]: https://raw.githubusercontent.com/ros-infrastructure/rep/master/rep-2000.rst
[node]: https://nodejs.org/en/about/previous-releases
[vim-package]: https://launchpad.net/ubuntu/noble/+package/vim-gtk3
[tmux-package]: https://launchpad.net/ubuntu/noble/+package/tmux
[ctags-package]: https://launchpad.net/ubuntu/noble/+package/universal-ctags
[nvim-package]: https://launchpad.net/ubuntu/noble/+package/neovim
[uv]: https://docs.astral.sh/uv/
[rg]: https://github.com/BurntSushi/ripgrep
[fzf]: https://github.com/junegunn/fzf
[shellcheck]: https://github.com/koalaman/shellcheck
[shfmt]: https://github.com/mvdan/sh
[clang-format]: https://clang.llvm.org/docs/ClangFormatStyleOptions.html
[nvim-diff]: https://raw.githubusercontent.com/neovim/neovim/master/runtime/doc/vim_diff.txt
[nvim-lua]: https://raw.githubusercontent.com/neovim/neovim/master/runtime/doc/lua-guide.txt
[vim-plug]: https://github.com/junegunn/vim-plug
[vim-pack]: https://vimhelp.org/repeat.txt.html#packages
[lazy]: https://lazy.folke.io/
[lspconfig]: https://github.com/neovim/nvim-lspconfig
[wsl-systemd]: https://learn.microsoft.com/en-us/windows/wsl/systemd
[wsl-gui]: https://learn.microsoft.com/en-us/windows/wsl/tutorials/gui-apps
[vscode-wsl]: https://code.visualstudio.com/docs/remote/wsl
[wsl-files]: https://learn.microsoft.com/en-us/windows/wsl/filesystems
