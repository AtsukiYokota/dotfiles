#!/bin/bash -eu

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles=$(cd "$(dirname $0)"; cd ..; pwd)

git clone https://github.com/powerline/fonts.git --depth=1
cd fonts/
./install.sh
cd ..
rm -rf fonts/

gsettings set org.gnome.desktop.interface monospace-font-name 'Ubuntu Mono derivative Powerline 14'
python -m pip install --user powerline-shell
python -m pip install --user powerline-status

mkdir -p ~/.config/powerline-shell && powerline-shell --generate-config > ~/.config/powerline-shell/config.json

cp $dotfiles/configs/powerline_shell/config.json ~/.config/powerline-shell/config.json
