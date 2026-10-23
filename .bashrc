# Interactive supplement, sourced by a managed block in the distribution's ~/.bashrc.
case $- in
  *i*) ;;
  *) return ;;
esac
[[ ${_DOTFILES_BASH_LOADED:-0} == 1 ]] && return
_DOTFILES_BASH_LOADED=1

HISTCONTROL=ignoreboth
HISTSIZE=10000
HISTFILESIZE=20000
shopt -s histappend checkwinsize

case ":${PATH}:" in
  *":$HOME/.local/bin:"*) ;;
  *) export PATH="$HOME/.local/bin:$PATH" ;;
esac
[[ -r $HOME/.cargo/env ]] && source "$HOME/.cargo/env"
if [[ -r ${XDG_CONFIG_HOME:-$HOME/.config}/dotfiles/node.env ]]; then
  source "${XDG_CONFIG_HOME:-$HOME/.config}/dotfiles/node.env"
fi

if command -v dircolors >/dev/null 2>&1; then
  if [[ -r $HOME/.dircolors ]]; then
    eval "$(dircolors -b "$HOME/.dircolors")"
  else
    eval "$(dircolors -b)"
  fi
fi
if ! shopt -oq posix && ! declare -p BASH_COMPLETION_VERSINFO >/dev/null 2>&1; then
  if [[ -r /usr/share/bash-completion/bash_completion ]]; then
    source /usr/share/bash-completion/bash_completion
  fi
fi

alias ls='ls -avF --color=auto'
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias grep='grep --color=always --exclude-dir=.git'
alias rank='sort | uniq -c | sort -nr'
# Keep a working vi when only the shell module has been installed.
command -v nvim >/dev/null 2>&1 && alias vi='nvim'

# Retain the original interactive cd-and-list workflow, including hidden files.
cd() {
  builtin cd "$@" || return
  command ls -avF --color=auto
}

# Fallback for configuration-only installs or terminals without Starship.
case ${TERM:-dumb} in
  *color*|xterm*|screen*|tmux*)
    PS1='\[\e[32m\]\u@\h\[\e[0m\]:\[\e[34m\]\w\[\e[0m\]\$ ' ;;
  *) PS1='\u@\h:\w\$ ' ;;
esac
if [[ ${TERM:-dumb} != dumb ]] && command -v starship >/dev/null 2>&1; then
  export STARSHIP_CONFIG=${STARSHIP_CONFIG:-${XDG_CONFIG_HOME:-$HOME/.config}/starship.toml}
  eval "$(starship init bash)"
fi

# Generic directory bookmarks; names cannot escape the private state directory.
mark() {
  local name=${1:-default} state=${XDG_STATE_HOME:-$HOME/.local/state}/dotfiles/marks
  if (( $# > 1 )) || [[ ! $name =~ ^[[:alnum:]_-]+$ ]]; then
    printf 'Usage: mark [name: letters, digits, underscore, hyphen]\n' >&2
    return 2
  fi
  mkdir -p -- "$state" || return
  pwd -P > "$state/$name"
}

cmark() {
  local name=${1:-default} state=${XDG_STATE_HOME:-$HOME/.local/state}/dotfiles/marks destination
  if (( $# > 1 )) || [[ ! $name =~ ^[[:alnum:]_-]+$ ]]; then
    printf 'Usage: cmark [name: letters, digits, underscore, hyphen]\n' >&2
    return 2
  fi
  if [[ ! -r $state/$name ]] || ! IFS= read -r destination < "$state/$name"; then
    printf 'No bookmark named %s. Run mark first.\n' "$name" >&2
    return 1
  fi
  builtin cd -- "$destination"
}

[[ -r $HOME/.rosrc ]] && source "$HOME/.rosrc"
if [[ -r ${XDG_CONFIG_HOME:-$HOME/.config}/dotfiles/formatting.bash ]]; then
  source "${XDG_CONFIG_HOME:-$HOME/.config}/dotfiles/formatting.bash"
fi
# Keep machine-specific paths, workspace selection and preferences out of Git.
[[ -r $HOME/.bashrc.local ]] && source "$HOME/.bashrc.local"

# Only the installed ROS base is auto-loaded; overlays require ros_env WORKSPACE.
if [[ ${DOTFILES_AUTO_ROS:-1} == 1 ]] && declare -F ros_env >/dev/null; then
  if [[ -r ${DOTFILES_ROS_ROOT:-/opt/ros}/${DOTFILES_ROS_DISTRO:-jazzy}/setup.bash ]]; then
    ros_env
  fi
fi

# Start/reattach the main session for terminal shells. Detaching returns to this
# shell; nested shells, bash -ic commands and dumb terminals do not attach.
# Set DOTFILES_AUTO_TMUX=0 in ~/.bashrc.local to opt out on this machine.
if [[ ${DOTFILES_AUTO_TMUX:-1} == 1 && -z ${TMUX:-} && -z ${BASH_EXECUTION_STRING:-} \
      && ${TERM:-dumb} != dumb && -t 0 && -t 1 ]] && command -v tmux >/dev/null 2>&1; then
  tmux new-session -A -s main
fi
