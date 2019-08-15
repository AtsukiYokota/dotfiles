#!/bin/bash

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles=$(cd "$(dirname $0)"; cd ..; pwd)

java -jar $dotfiles/utils/plantuml.jar -tpng $@
xdg-open ${@%%.*}.png
