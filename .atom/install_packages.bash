#!/bin/bash

dotfiles=$(cd "$dirname $0)"; pwd)
atom_config_dir=$dotfiles/.atom

apm install npm-install -g
apm install --packages-file ${atom_config_dir}/packages.txt
