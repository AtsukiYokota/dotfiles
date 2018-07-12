#!/bin/bash

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles="$scripts"

libpkgs="clang-4.0"
devpkgs="build-essential clang cmake git llvm python-dev python-flake8 python3-dev"
devenvs="rxvt-unicode-256color tmux"
texpkgs="dvipsk-ja gv latexmk pstoedit texlive-full texlive-fonts-extra texlive-fonts-recommended texlive-lang-cjk xdvik-ja"

sudo apt update && sudo apt dist-upgrade
sudo apt -y install $libpkgs
sudo apt -y install $devpkgs
sudo apt -y install $devenvs
sudo apt -y install $texpkgs

sudo apt -y install inkscape

# source $dotfiles/install.sh

# -- Terminator -------------------------------------------------------
sudo apt install terminator

# -- Vim -------------------------------------------------------
sudo apt-add-repository -y ppa:jonathonf/vim
sudo apt update && sudo apt install -y vim-gnome && sudo apt -y remove vim-tiny

# -- git settings -------------------------------------------------------
git config --global user.name "AtsukiYokota"
git config --global user.email "atsuki.yokota@gmail.com"
git config --global core.editor 'vim -c "set fenc=utf-8"'
git config --global color.diff auto
git config --global color.status auto
git config --global color.branch auto

# -- Atom -------------------------------------------------------
sudo add-apt-repository ppa:webupd8team/atom
sudo apt update && sudo apt install -y atom

# -- Compilers -------------------------------------------------
sudo add-apt-repository -y ppa:jonathonf/gcc-7.1
sudo apt update && sudo apt install -y gcc-7 g++-7

# -- Slack(requirement:Ubuntu16.04 or newer version to use snap)-
sudo snap install slack --classic

# -- GoogleChrome -------------------------------------------------
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -y -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
sudo apt update && sudo apt install google-chrome-stable

# -- kazam -------------------------------------------------
sudo add-apt-repository ppa:kazam-team/unstable-series
sudo apt update && sudo apt install kazam python3-cairo python3-xlib
