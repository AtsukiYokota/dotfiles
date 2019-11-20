#!/bin/bash

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles="$scripts"

devpkgs="build-essential clang cmake git llvm python-dev python-flake8 python3-dev npm python-pip python3-pip curl"
devenvs="rxvt-unicode-256color tmux xsel tree ncdu glances vlc openssh-client openssh-server"
texpkgs="dvipsk-ja gv latexmk pstoedit texlive-full texlive-fonts-extra texlive-fonts-recommended texlive-lang-cjk xdvik-ja"

curl -sL install-node.now.sh/lts | bash

sudo apt -y update; sudo apt -y upgrade; sudo apt -y dist-upgrade
sudo apt install -y $devpkgs
sudo apt install -y $devenvs
sudo apt install -y $texpkgs
sudo apt install -y inkscape

# -- General settings -------------------------------------------------------
$dotfiles/scripts/nocaps.sh

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

# -- VS Code -------------------------------------------------------
cd ~/Downloads
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo install -o root -g root -m 644 microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt install -y apt-transport-https
sudo apt update
sudo apt install -y code
cd $dotfiles

# -- GoogleChrome -------------------------------------------------
cd ~/Downloads
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i ./google-chrome*.deb
sudo apt-get -fy install
cd $dotfiles

# -- kazam -------------------------------------------------
sudo apt install -y kazam

# -- themes -----------------------------------------------
$dotfiles/scripts/prepare_themes.sh

# -- PlantUML -----------------------------------------------
sudo apt install -y default-jdk graphviz fonts-takao fonts-ipafont fonts-ipaexfont
cd $dotfiles
mkdir utils
wget 'https://downloads.sourceforge.net/project/plantuml/plantuml.jar?r=http%3A%2F%2Fplantuml.com%2Fstarting&ts=1538667739&use_mirror=jaist' -O $dotfiles/utils/plantuml.jar

# -- NTP(For Kyutech cntl NTP server) -----------------------------------------------
$dotfiles/scripts/setup_kyutech_cntl_ntp.sh

# -- upgrade pip ----------------------------------------
python -m pip install --upgrade pip
python3 -m pip install --upgrade pip

# -- upgrade pip ----------------------------------------
python -m pip install --upgrade pip
python3 -m pip install --upgrade pip

# -- install -----------------------------------------------
$dotfiles/scripts/install.sh

# -- ROS ---------------------------------------------------
$dotfiles/scripts/setup_ros.sh melodic

