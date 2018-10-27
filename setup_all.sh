#!/bin/bash

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles="$scripts"

libpkgs="clang-4.0"
devpkgs="build-essential clang cmake git llvm python-dev python-flake8 python3-dev npm"
devenvs="rxvt-unicode-256color tmux"
texpkgs="dvipsk-ja gv latexmk pstoedit texlive-full texlive-fonts-extra texlive-fonts-recommended texlive-lang-cjk xdvik-ja"

sudo apt upgrade && sudo apt update && sudo apt dist-upgrade
sudo apt install -y $libpkgs
sudo apt install -y $devpkgs
sudo apt install -y $devenvs
sudo apt install -y $texpkgs
sudo apt install -y inkscape

# -- Terminator -------------------------------------------------------
# sudo apt -y install terminator

# -- Vim -------------------------------------------------------
sudo apt-add-repository -y ppa:jonathonf/vim
sudo apt update
sudo apt install -y vim-gnome && sudo apt -y remove vim-tiny

# -- git settings -------------------------------------------------------
git config --global user.name "AtsukiYokota"
git config --global user.email "atsuki.yokota@gmail.com"
git config --global core.editor 'vim -c "set fenc=utf-8"'
git config --global color.diff auto
git config --global color.status auto
git config --global color.branch auto

# -- Atom -------------------------------------------------------
sudo add-apt-repository -y  ppa:webupd8team/atom
sudo apt update
sudo apt install -y atom

# -- Compilers -------------------------------------------------
sudo add-apt-repository -y ppa:jonathonf/gcc-7.udo
sudo apt update
sudo apt install -y gcc-7 g++-7

# -- Slack(requirement:Ubuntu16.04 or newer version to use snap)-
# curl -s https://packagecloud.io/install/repositories/slacktechnologies/slack/script.deb.sh | sudo bash
# sudo apt install -y slack

# -- GoogleChrome -------------------------------------------------
cd ~/Downloads
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i ./google-chrome*.deb
sudo apt-get -fy install
cd $dotfiles

# -- kazam -------------------------------------------------
sudo add-apt-repository -y ppa:kazam-team/unstable-series
sudo apt update
sudo apt install -y python3-cairo python3-xlib kazam

# -- install -----------------------------------------------
$dotfiles/scripts/install.sh

# -- ROS ---------------------------------------------------
$dotfiles/scripts/setup_ros.sh
