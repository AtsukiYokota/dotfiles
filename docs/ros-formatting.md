# ROS 2 Jazzy用コード整形

4つの関数はROS 2 Jazzy向けの共通コマンド`ros-format`を使う。
関数を実行すると対象ファイルを書き換える。保存時やシェル起動時の自動実行は行わない。

| 関数 | 対象 | 例 |
| --- | --- | --- |
| `clang_autoformat` | 指定したC/C++ファイル | `clang_autoformat src/node.cpp include/node.hpp` |
| `recursive_clang_autoformat` | 指定ディレクトリ以下のC/C++ | `recursive_clang_autoformat "$HOME/ros2_ws/src"` |
| `pep8_autoformat` | 指定したPythonファイル | `pep8_autoformat "src/my package/node.py"` |
| `recursive_pep8_autoformat` | 指定ディレクトリ以下のPython | `recursive_pep8_autoformat "$HOME/ros2_ws/src"` |

再帰関数のパスを省略した場合は、カレントディレクトリを対象とする。
複数のファイル・ディレクトリを指定できる。再帰関数以外へのディレクトリ指定はエラーになる。
`~`を引用符で囲むとホームディレクトリへ展開されないため、空白を含むパスでは`"$HOME/ros2 workspace/src"`のように書く。

## 整形規則と依存

C/C++では`ament_uncrustify`のJazzy用設定を使う。
`clang_autoformat`という名前は操作の互換性のために残しているが、実際の処理はuncrustifyで行う。
Jazzyのパッケージに含まれる設定の選択と、整形結果が安定するまでの反復処理もamentに任せる。
対象拡張子は`.c`、`.cc`、`.cpp`、`.cxx`、`.h`、`.hh`、`.hpp`、`.hxx`。
`.c`と`.h`はC、その他はC++として処理する。C++ヘッダーは公式規約に合わせて`.hpp`を使う。
[Jazzyのコード規約](https://docs.ros.org/en/jazzy/The-ROS2-Project/Contributing/Code-Style-Language-Versions.html)、[ament_uncrustifyの実装](https://github.com/ament/ament_lint/blob/jazzy/ament_uncrustify/ament_uncrustify/main.py)を参照。

Pythonではautopep8を使い、インデントを含むPEP 8の整形を行う。
最大行長は、Jazzyの`ament_flake8`が実際に検査する99文字に合わせた。
公式文章は100文字までとしているが、配布される検査設定を優先している。
ユーザー・プロジェクトのautopep8設定は読み込まず、`--aggressive`も使わない。
整形前後のPython構文木を比較し、空白修正や順序を保った`import a, b`の分割以外で構文木が変わる結果は適用しない。
[JazzyのPython規約](https://docs.ros.org/en/jazzy/The-ROS2-Project/Contributing/Code-Style-Language-Versions.html#python)、[ament_flake8設定](https://github.com/ament/ament_lint/blob/jazzy/ament_flake8/ament_flake8/configuration/ament_flake8.ini)、[autopep8の仕様](https://github.com/hhatto/autopep8#more-advanced-usage)を参照。

インストーラーのROS 2構成には、`ros-jazzy-ament-uncrustify`、`ros-jazzy-ament-cpplint`、`ros-jazzy-ament-flake8`、`ros-jazzy-ament-pep257`とPython構成のautopep8を含める。
C/C++の整形前には`ros_env`を実行する。別のROSディストリビューションが有効な場合は、新しいシェルでJazzyを読み込む。
必要な実行ファイルがなければ、導入・環境読込の案内を出して終了する。整形コマンド自身はパッケージをインストールしない。

## プレビューと対象の選択

```bash
# 差分の有無を確認する。変更ありは終了値1、変更なしは0。
recursive_clang_autoformat --check "$HOME/ros2_ws/src"
recursive_pep8_autoformat --check "$HOME/ros2_ws/src"

# ファイルを変更せずunified diffを表示する。正常に確認できれば終了値0。
recursive_pep8_autoformat --dry-run "$HOME/ros2_ws/src"

# 内容を書き換える。
recursive_clang_autoformat "$HOME/ros2_ws/src"
recursive_pep8_autoformat "$HOME/ros2_ws/src"

# 既定の除外を解除しつつ、vendorだけを除く。
recursive_clang_autoformat --include-excluded --exclude vendor "$HOME/ros2_ws/src"

# 追加の除外パターンは引用符で囲み、必要に応じて繰り返す。
recursive_pep8_autoformat --exclude 'test/fixtures/*' --exclude 'generated_*.py' .
```

既定では`build`、`install`、`log`、`logs`、`devel`、`.git`、`.hg`、`.svn`、`.venv`、`venv`、`env`、`.tox`、`.nox`、`__pycache__`、各種Pythonキャッシュ、`node_modules`、`vendor`、`third_party`、`third-party`、`external`、`generated`、`cmake-build-*`を除外する。
走査対象のディレクトリに`AMENT_IGNORE`または`COLCON_IGNORE`があれば、そのディレクトリ以下も除外する。
`--include-excluded`はこれらの既定除外を解除するが、`--exclude`で追加した条件は維持する。
追加パターンはパス要素の名前、または指定ルートからの相対パスに照合する。
ファイルとディレクトリのシンボリックリンクは、明示指定や除外解除をした場合もたどらない。

整形処理はすべて一時コピーで行い、全対象の処理が成功してから元ファイルを置換する。
formatterの失敗、Pythonの構文エラー、処理中に検出した元ファイルの変更があれば適用しない。
書き込みはファイル単位の置換で行い、通常の書き込みエラーでは置換済みファイルも元へ戻す。
ファイルシステム障害で復元まで失敗した場合は、元データを残した一時ファイルのパスを表示する。
強制終了や電源断に対する、複数ファイル全体のトランザクションは保証しない。
実行権限は保持し、内容を変更したファイルの更新時刻は更新する。

`--check`はこのformatterが変更するかどうかの確認であり、すべての規約を満たすという判定ではない。
名前の付け方、API設計、コメント、docstring、Pythonの引用符やimportの並び順などはformatterだけでは保証できない。
一行関数など、公式のuncrustify設定が維持する書き方もある。
必要に応じて対象パッケージで次の検査を行い、最後にビルドとテストを実行する。

```bash
ros_env
ament_uncrustify src/my_cpp_package
ament_cpplint src/my_cpp_package
ament_flake8 src/my_python_package
ament_pep257 src/my_python_package
ros_test
```

## Neovimからの実行

`:Format`はファイルの種類に応じて整形する。C/C++・Pythonではシェル関数と同じ`ros-format`を使い、その他の言語では対応するLSPの整形機能を使う。
`:RosFormat`でも現在のC/C++・Pythonバッファを同じ規則で整形できる。未保存の内容も対象になる。
失敗時はバッファを変更せず、成功後もディスクへの保存は`:write`で行う。
C/C++では`ros_env`を実行したシェルからNeovimを起動する。
`:ClangFormat`はプロジェクトの`.clang-format`を使いたい場合の独立したコマンド。`:AutoPep8`は`--aggressive`を2回指定するため、ROS 2向けには`:Format`を使う。

## 検証方法

`python3 tests/test-ros-format.py`は、依存ツールを模した実行ファイルで対象選択、失敗時の内容保持、書き込み失敗からの復元、シェル引数を検査する。
`python3 tests/check-ros-format.py`は、ハッシュを検証したJazzyのament_lintソースとautopep8のwheel、展開したUbuntuのuncrustifyパッケージを一時領域で実行する。
後者はネットワーク接続を使うが、OS・ROS・Pythonパッケージのインストールは行わない。
Neovim側の入力・出力と失敗時のバッファ保持は`tests/nvim-smoke.lua`から専用テストを読み込んで検査する。
