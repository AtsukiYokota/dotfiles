#!/bin/bash -eu

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles=$(cd "$(dirname $0)"; cd ..; pwd)

sudo apt install -y gtk2-engines-murrine gtk2-engines-pixbuf

wget -O mac-fonts.zip http://drive.noobslab.com/data/Mac/macfonts.zip
sudo unzip mac-fonts.zip -d /usr/share/fonts; rm mac-fonts.zip
sudo fc-cache -f -v
