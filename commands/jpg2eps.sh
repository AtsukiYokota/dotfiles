#!/usr/bin/env bash
convert $1.jpg  \( +clone -alpha opaque -fill white -colorize 100% \) +swap -geometry +0+0 -compose Over -composite -alpha off eps2:$2.eps
