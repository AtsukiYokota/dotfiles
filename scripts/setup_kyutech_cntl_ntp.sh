#!/bin/bash -eu

scripts=$(cd "$(dirname $0)"; pwd)
dotfiles=$(cd "$(dirname $0)"; cd ..; pwd)

sudo apt install -y ntp
sudo cp $dotfiles/configs/ntp/ntp.conf /etc/ntp.conf
sudo systemctl restart ntp

# Please execute the following command to check if the setting is complete.
# $ sudo ntpq -pw
