 #!/bin/bash

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles=$(cd "$(dirname $0)"; cd ..; pwd)

python3 $dotfiles/.vim/bundle/YouCompleteMe/install.py --clang-completer --system-libclang
# python2 $dotfiles/.vim/bundle/YouCompleteMe/install.py --all --system-libclang
