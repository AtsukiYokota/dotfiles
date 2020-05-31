 #!/bin/bash

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles=$(cd "$(dirname $0)"; cd ..; pwd)

python3 $dotfiles/.vim/dein/repos/github.com/ycm-core/YouCompleteMe/install.py --clang-completer
