 #!/bin/bash

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles=$(cd "$(dirname $0)"; cd ..; pwd)

cd $scripts

cp $dotfiles/configs/coc/coc-settings.json ~/.vim/

cd $dotfiles/.vim/bundle/coc.nvim/
./install.sh
cd $dotfiles

sudo apt install -y openjdk-8-jdk

vi -c CocInstall coc-json -c qa
vi -c CocInstall coc-html -c qa
vi -c CocInstall coc-css -c qa
vi -c CocInstall coc-rls -c qa
vi -c CocInstall coc-yaml -c qa
vi -c CocInstall coc-python -c qa
vi -c CocInstall coc-xml -c qa
