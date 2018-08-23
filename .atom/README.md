# Atomパッケージ管理
## パッケージリストを保存
```
apm list --installed --bare packages.list > packages.txt
```

## パッケージリストからインストール
```
apm install --packages-file packages.txt
```
または
```
./install_packages.bash
```
