#!/bin/bash -eu

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles=$(cd "$(dirname $0)"; cd ..; pwd)

mkdir ~/.themes
cd ~/.themes

git clone https://github.com/B00merang-Project/macOS-Sierra/

sudo add-apt-repository -y ppa:numix/ppa
sudo apt update

sudo apt install -y numix-icon-theme-circle
curl https://raw.githubusercontent.com/ActusOS/GnomeYosemiteIcons/master/download_from_github.sh | sh

sudo apt install -y plank
sudo apt install -y gnome-tweak-tool

cd $dotfiles
