#!/usr/bin/env bash
convert $1.png  \( +clone -alpha opaque -fill white -colorize 100% \) +swap -geometry +0+0 -compose Over -composite -alpha off eps2:eps/$1.eps
