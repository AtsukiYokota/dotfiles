# プロジェクトの作業補助

`just`モジュールはjustとROSワークスペース用の`ros-workspace`を導入する。
`ros-workspace`は`cpp`・`ros2`モジュールにも含まれる。
インストール時やディレクトリ移動時に、プロジェクトのファイルを自動作成したりビルドしたりはしない。

## ROSのビルドとC++補完

ワークスペースのルートでROS環境を読み込んで実行する。

```bash
cd ~/ros2_ws
ros_env
ros-workspace build
```

colconの`--symlink-install`とCMakeの`CMAKE_EXPORT_COMPILE_COMMANDS=ON`を有効にしてビルドし、成功後に各パッケージのコンパイル情報をルートの`compile_commands.json`へまとめる。
clangdがこのファイルを見つけることで、プロジェクトのヘッダー検索パスやマクロ、言語標準を使える。
ROSを含まない通常のCMakeプロジェクトでも、既に生成したデータベースの集約は利用できる。

```bash
# 特定のパッケージをビルドする。-- より後ろはcolconへ渡す。
ros-workspace build -- --packages-select my_package

# CMakeへ追加の設定を渡す。
ros-workspace build -- --cmake-args -DCMAKE_BUILD_TYPE=Debug

# 既存のbuild/以下にあるデータベースだけを集約する。
ros-workspace compdb

# 保存先やビルドディレクトリを指定する。
ros-workspace build --build-base build-debug --install-base install-debug --log-base log-debug
ros-workspace compdb --build-base build-debug --output editor/compile_commands.json
```

通常はルートの`compile_commands.json`を使う。別の場所へ出力した場合は、clangdにもそのディレクトリを指定する必要がある。
NeovimをROS環境読込み後のシェルから起動する。既に起動中のLSPへ反映されない場合は、Neovimを開き直す。

集約では同じコンパイル情報を重複させず、今回ビルドしなかったパッケージも既存の`build/`内の情報から含める。
消えたソースは除外する。ビルドに失敗した場合や、データベースが不正な場合は、従来のルートのファイルを維持する。
PythonだけのワークスペースはC/C++用データベースを作らない。
この補助はワークスペース内のファイルを対象とし、外側を参照するエントリや、ビルドディレクトリのシンボリックリンクは受け付けない。

手動作成済みのファイルやシンボリックリンクは、そのままでは上書きしない。
初回にこの補助へ切り替える場合は、内容を確認してから次を実行する。

```bash
ros-workspace compdb --force
```

既存のファイルまたはシンボリックリンクを、同じディレクトリの`compile_commands.json.backup-日時-識別子`へ保存してから置き換える。
以後は内容が変更されていない生成ファイルだけを更新する。所有情報は`build/.dotfiles-compile-commands.json`へ保存するため、`build/`を削除した場合は再び`--force`が必要になる。
`build/`、`install/`、`log/`、生成した`compile_commands.json`とバックアップはプロジェクトのGit管理から除外する。

コンパイル情報にはローカルパスが含まれるため、別PC向けにはコピーせず、そのPC上で再生成する。
CMakeによる生成はMakefile/Ninjaのビルドで利用できる。
[CMakeの公式仕様](https://cmake.org/cmake/help/latest/variable/CMAKE_EXPORT_COMPILE_COMMANDS.html)、[clangdのプロジェクト設定](https://clangd.llvm.org/installation#project-setup)、[colconのビルドオプション](https://colcon.readthedocs.io/en/released/reference/verb/build.html)を参照。

## justの作業メニュー

必要なプロジェクトで、明示的にひな形を作成する。既存の`justfile`は変更しない。

```bash
cd ~/ros2_ws
ros-workspace init
just --list
```

ひな形には次の作業を含める。プロジェクトに合わせて`justfile`を編集し、Gitで共有できる。

| コマンド | 内容 |
| --- | --- |
| `just build` | ビルドし、成功後にコンパイル情報を集約 |
| `just build --packages-select my_package` | 指定パッケージをビルド |
| `just compdb` | コンパイル情報の集約だけを実行 |
| `just test` | colconのテストと結果表示 |
| `just list` | ワークスペース内のパッケージ一覧 |

justは通常、`justfile`が置かれたディレクトリを作業ディレクトリとして実行する。
シェル引数は位置引数で受け渡すので、空白や日本語を含む値は通常のコマンドと同じように引用する。
ROSの環境は呼出し元のシェルから引き継ぎ、ひな形では特定のROSディストリビューションを勝手に読み込まない。
外部から取得した`justfile`は、実行前に内容を確認する。
[justの作業ディレクトリ](https://just.systems/man/en/working-directory.html)を参照。
