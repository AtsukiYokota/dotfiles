[[ $- != *i* ]] && return

eval `dircolors ~/.dircolors`

HISTCONTROL=ignoreboth

shopt -s histappend

    HISTSIZE=4096
HISTFILESIZE=4096

shopt -s checkwinsize

[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

if test -z "${debian_chroot:-}" && test -r /etc/debian_chroot
then
  debian_chroot=$(cat /etc/debian_chroot)
fi

if ! shopt -oq posix
then
  if test -f /usr/share/bash-completion/bash_completion
  then
    . /usr/share/bash-completion/bash_completion
  elif test -f /etc/bash_completion
  then
    . /etc/bash_completion
  fi
fi

gitinfo()
{
  if git status &> /dev/null
  then
    git_branch=$(git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/\1/')
    echo -e "$git_branch[$(git status -s | wc -l)]"
  else
    echo "norepo"
  fi
}

bgjobs()
{
  if test $(jobs | wc -l) != 0
  then
    echo ", jobs[$(jobs | wc -l)]"
  fi
}


cyan="\[\e[0;36m\]"
green="\[\e[0;32m\]"
yellow="\[\e[0;33m\]"

face="$cyan( ^q^) < \[\e[0m\]\$(gitinfo)\$(bgjobs) $cyan)"

export PS1="\n$face\n${debian_chroot:+($debian_chroot)}$green\u@\H: $yellow\w\[\e[0m\]\$ "


export LANG=C
export LC_MESSAGE=C
export LC_TIME=en_US.UTF-8
export LESSCHARSET=utf-8
export locale=en_US.UTF-8

case $TERM in
    linux) LANG=C ;;
    *) LANG=ja_JP.UTF-8 ;;
esac

export marked="$HOME/marked"

if test -e /opt/ros; then source ~/.rosrc; fi


cd()
{
  builtin cd "$@" && ls -avF --color=auto
}

alias ls='ls -avF --color=auto'
# alias sl='ls'
alias ks='ls'

alias cdm='echo "move marked path: $(cat $marked/unnamed)"; cd $(cat $marked/unnamed)'

alias alpha='for each in $(echo {a..z}); do echo $each; done'
alias grep='grep --color=always --exclude-dir=.git'
alias ps='ps aux --sort=start_time'
alias rank='sort | uniq -c | sort -nr'
alias tmux='tmux -2u'

compare()
{
  if which colordiff &> /dev/null
  then
    alias diff='colordiff'
  fi

  diff -Bbyw $@ | less -R
}

update()
{
  sudo apt update && sudo apt upgrade
}

cxx()
{
  compiler="g++-7"
  version="-std=c++17"
  options="-Wall -Wextra"
  boost_links="-lboost_system -lboost_thread -lboost_date_time"
  other_links="-ldl -lstdc++fs"

  $compiler $@ $version $options $boost_links $other_links
}

mark()
{
  file="unnamed"
  info="[mark] following path marked"

  mkdir -p $marked || exit 1

  for opt in "$@"
  do
    case "$@" in
      "-c" | "--catkin" )
        file="catkin"
        info="$info as catkin workspace"
        break;;
    esac
  done

  echo "$info: $(pwd | tee $marked/$file)";
}

source /opt/ros/kinetic/setup.bash
export PYTHONPATH=/home/yokota/.local/lib/python2.7/site-packages:$PYTHONPATH
export PATH=$PATH:/home/yokota/.local/bin:/home/yokota/bin

alias cdr="cd ~/Dropbox"
alias cdt="cd ~/Dropbox/works/toybox"
alias cdw="cd ~/Dropbox/works"
alias cdx="cd ~/Dropbox/works/tex"
alias l="ls"
alias png2eps="~/bin/png2eps.sh"
alias jpg2eps="~/bin/jpg2eps.sh"
alias fetchall="~/bin/fetchall.sh"
alias sshm="ssh yokota@150.69.46.178"
alias sshm6="ssh yokota@150.69.46.178 -p26"
# alias sshm6gui="ssh -Y -C yokota@150.69.46.178 -p26"
alias sshm6gui="ssh -Y yokota@150.69.46.178 -p26"
alias vimrc="vi ~/.vimrc"
alias bashrc="vi ~/.bashrc"
alias gpu="watch -n 0.1 nvidia-smi"
export PATH=/usr/local/cuda-9.0/bin:${PATH}
export LD_LIBRARY_PATH=/usr/local/cuda-9.0/lib64:${LD_LIBRARY_PATH}
export PATH=$PATH:/home/yokota/mixcell/QTCode
export PYTHONPATH=$PYTHONPATH:/home/yokota/mixcell/source_code
