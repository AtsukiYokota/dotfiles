 #!/bin/bash

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles=$(cd "$(dirname $0)"; cd ..; pwd)

python3 $dotfiles/.vim/bundle/YouCompleteMe/install.py --clang-completer
