#!/bin/bash -eu

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles=$(cd "$(dirname $0)"; cd ..; pwd)

mkdir $dotfiles/.vim
ln -s $dotfiles/.vim ~/
cp $dotfiles/configs/dein/dein.toml ~/.vim

cp -R $dotfiles/commands ~/bin

for f in $dotfiles/.??*
do
  test $f = $dotfiles/.git && continue
  test $f = $dotfiles/.gitignore && continue
  ln -sf $f $HOME
done

$scripts/setup_powerline.sh

python3 -m pip install --user flake8
python3 -m pip install --user autopep8

sudo npm install -g instant-markdown-d

# $scripts/install_ycm.sh
# $scripts/install_coc.sh
