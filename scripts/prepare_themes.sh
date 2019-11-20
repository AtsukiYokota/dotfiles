#!/bin/bash -eu

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles=$(cd "$(dirname $0)"; cd ..; pwd)

sudo add-apt-repository -y ppa:noobslab/macbuntu
sudo apt -y update
sudo apt install -y macbuntu-os-icons-v1804 macbuntu-os-ithemes-v1804 slingscold albert plank macbuntu-os-plank-theme-v1804 gnome-tweak-tool libreoffice-style-sifr
wget -O mac-fonts.zip http://drive.noobslab.com/data/Mac/macfonts.zip
sudo unzip mac-fonts.zip -d /usr/share/fonts; rm mac-fonts.zip
sudo fc-cache -f -v
