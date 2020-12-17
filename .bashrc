# ~/.bashrc: executed by bash(1) for non-login shells.
# see /usr/share/doc/bash/examples/startup-files (in the package bash-doc)
# for examples

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# don't put duplicate lines or lines starting with space in the history.
# See bash(1) for more options
HISTCONTROL=ignoreboth

# append to the history file, don't overwrite it
shopt -s histappend

# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=1000
HISTFILESIZE=2000

# check the window size after each command and, if necessary,
# update the values of LINES and COLUMNS.
shopt -s checkwinsize

# If set, the pattern "**" used in a pathname expansion context will
# match all files and zero or more directories and subdirectories.
#shopt -s globstar

# make less more friendly for non-text input files, see lesspipe(1)
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# set variable identifying the chroot you work in (used in the prompt below)
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi

# set a fancy prompt (non-color, unless we know we "want" color)
case "$TERM" in
    xterm-color|*-256color) color_prompt=yes;;
esac

# uncomment for a colored prompt, if the terminal has the capability; turned
# off by default to not distract the user: the focus in a terminal window
# should be on the output of commands, not on the prompt
#force_color_prompt=yes

if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
  # We have color support; assume it's compliant with Ecma-48
  # (ISO/IEC-6429). (Lack of such support is extremely rare, and such
  # a case would tend to support setf rather than setaf.)
  color_prompt=yes
    else
  color_prompt=
    fi
fi

if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt

# If this is an xterm set the title to user@host:dir
case "$TERM" in
xterm*|rxvt*)
    PS1="\[\e]0;${debian_chroot:+($debian_chroot)}\u@\h: \w\a\]$PS1"
    ;;
*)
    ;;
esac

# enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    #alias dir='dir --color=auto'
    #alias vdir='vdir --color=auto'

    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# colored GCC warnings and errors
#export GCC_COLORS='error=01;31:warning=01;35:note=01;36:caret=01;32:locus=01:quote=01'

# some more ls aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Add an "alert" alias for long running commands.  Use like so:
#   sleep 10; alert
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# Alias definitions.
# You may want to put all your additions into a separate file like
# ~/.bash_aliases, instead of adding them here directly.
# See /usr/share/doc/bash-doc/examples in the bash-doc package.

if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

# enable programmable completion features (you don't need to enable
# this, if it's already enabled in /etc/bash.bashrc and /etc/profile
# sources /etc/bash.bashrc).
if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi


# tmux powerline shell settings
function _update_ps1()
{
  PS1="$(~/.local/bin/powerline-shell $?)"
}
if [ "$TERM" != "linux" ]; then
      PROMPT_COMMAND="_update_ps1; $PROMPT_COMMAND"
fi


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

# 初回シェル時のみ tmux実行
if [ $SHLVL = 1 ]; then
  tmux
fi

# source /opt/ros/melodic/setup.bash
# export PYTHONPATH=$PYTHONPATH:/home/yokota/.local/lib/python2.7/site-packages
export PATH=$PATH:/home/yokota/.local/bin:/home/yokota/bin

alias cdr="cd ~/Dropbox"
alias cdt="cd ~/Dropbox/works/toybox"
alias cdw="cd ~/Dropbox/works"
alias cdp="cd ~/Dropbox/works/papers"
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
alias jasper="~/Documents/Jasper/Jasper"
export PATH=/usr/local/cuda-9.0/bin:${PATH}
export LD_LIBRARY_PATH=/usr/local/cuda-9.0/lib64:${LD_LIBRARY_PATH}
export PATH=$PATH:/home/yokota/Dropbox/works/mixcell/QTCode
export PYTHONPATH=$PYTHONPATH:/home/yokota/Dropbox/works/mixcell/source_code
export JAVA_HOME=$(readlink -f /usr/bin/javac | sed "s:/bin/javac::")
export PATH=/usr/lib/llvm-6.0/bin:$PATH

# HALCON
export HALCONARCH=x64-linux
export HALCONROOT=/opt/halcon
export HALCONEXAMPLES=/opt/halcon/examples
export HALCONIMAGES=/opt/halcon/images
export PATH=${PATH}:${HALCONROOT}/bin/${HALCONARCH}
if [ $LD_LIBRARY_PATH ] ; then
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:${HALCONROOT}/lib/${HALCONARCH}
else
export LD_LIBRARY_PATH=${HALCONROOT}/lib/${HALCONARCH}
fi
