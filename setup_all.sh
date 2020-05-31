#!/bin/bash

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles="$scripts"

devpkgs="build-essential clang cmake git llvm flake8 python3-dev python3-pip curl"
devenvs="rxvt-unicode-256color tmux xsel tree ncdu glances vlc openssh-client openssh-server ctags"
texpkgs="gv latexmk pstoedit texlive-full texlive-fonts-extra texlive-fonts-recommended texlive-lang-cjk xdvik-ja"

sudo apt install -y $devpkgs
sudo apt install -y $devenvs
sudo apt install -y $texpkgs
sudo apt install -y inkscape

sudo apt -y update; sudo apt -y upgrade; sudo apt -y dist-upgrade

# -- General settings -------------------------------------------------------
# $dotfiles/scripts/nocaps.sh

# -- Vim -------------------------------------------------------
sudo apt-add-repository -y ppa:jonathonf/vim
sudo apt -y update
sudo apt install -y vim-gnome && sudo apt -y remove vim-tiny

# -- git settings -------------------------------------------------------
git config --global user.name "AtsukiYokota"
git config --global user.email "atsuki.yokota@gmail.com"
git config --global core.editor 'vim -c "set fenc=utf-8"'
git config --global color.diff auto
git config --global color.status auto
git config --global color.branch auto

# -- Rust ---------------------------------------------------
curl https://sh.rustup.rs -sSf | sh

# -- nodejs npm ---------------------------------------------------
sudo curl -sL https://deb.nodesource.com/setup_10.x | sudo bash
sudo apt install -y nodejs

# -- VS Code -------------------------------------------------------
sudo snap install --classic code

# -- GoogleChrome -------------------------------------------------
cd ~/Downloads
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i ./google-chrome*.deb
sudo apt-get -fy install
cd $dotfiles

# -- kazam -------------------------------------------------
sudo apt install -y kazam

# -- albert -------------------------------------------------
echo 'deb http://download.opensuse.org/repositories/home:/manuelschneid3r/xUbuntu_20.04/ /' | sudo tee /etc/apt/sources.list.d/home:manuelschneid3r.list
sudo wget -nv https://download.opensuse.org/repositories/home:manuelschneid3r/xUbuntu_20.04/Release.key -O "/etc/apt/trusted.gpg.d/home:manuelschneid3r.asc"
sudo apt update
sudo apt install albert

# -- themes -----------------------------------------------
$dotfiles/scripts/prepare_themes.sh

# -- PlantUML -----------------------------------------------
sudo apt install -y default-jdk graphviz fonts-takao fonts-ipafont fonts-ipaexfont
cd $dotfiles
mkdir utils
wget 'https://downloads.sourceforge.net/project/plantuml/plantuml.jar?r=http%3A%2F%2Fplantuml.com%2Fstarting&ts=1538667739&use_mirror=jaist' -O $dotfiles/utils/plantuml.jar

# -- NTP(For Kyutech cntl NTP server) -----------------------------------------------
# $dotfiles/scripts/setup_kyutech_cntl_ntp.sh

# -- upgrade pip ----------------------------------------
python3 -m pip install --upgrade pip

# -- install -----------------------------------------------
$dotfiles/scripts/install.sh

# -- ROS ---------------------------------------------------
# $dotfiles/scripts/setup_ros.sh melodic

