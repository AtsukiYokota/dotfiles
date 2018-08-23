#!/bin/bash -eu

dotfiles=$(cd "$(dirname $0)"; pwd)

sudo npm install -g instant-markdown-d
$dotfiles/.atom/install_packages.bash

ln -s $dotfiles/.vim ~/

for f in $dotfiles/.??*
do
  test $f = $dotfiles/.git && continue
  test $f = $dotfiles/.gitignore && continue
  ln -sf $f $HOME
done

mkdir -p $dotfiles/.vim/bundle

if [ ! -e $dotfiles/.vim/bundle/vundle ];
then
  git clone https://github.com/gmarik/vundle.git $dotfiles/.vim/bundle/vundle
fi

vi -c PluginInstall -c qa
