#!/bin/bash

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles="$scripts"

# -- install -----------------------------------------------
$dotfiles/scripts/install.sh

