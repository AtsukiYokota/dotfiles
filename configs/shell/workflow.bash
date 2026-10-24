# Loaded after Starship, local preferences and the ROS base environment.
# z / zi complement the existing cd-and-list function.
if [[ ${DOTFILES_ENABLE_ZOXIDE:-1} == 1 ]] && command -v zoxide >/dev/null 2>&1; then
  eval "$(zoxide init bash)"
fi

# Atuin ships its Bash preexec integration. Keep Readline's ordinary arrow keys.
if [[ ${DOTFILES_ENABLE_ATUIN:-1} == 1 && ${TERM:-dumb} != dumb && -t 0 && -t 1 ]] \
    && command -v atuin >/dev/null 2>&1; then
  eval "$(atuin init bash --disable-up-arrow)"
fi

# direnv must be the last prompt hook. Each .envrc still requires direnv allow.
if [[ ${DOTFILES_ENABLE_DIRENV:-1} == 1 ]] && command -v direnv >/dev/null 2>&1; then
  eval "$(direnv hook bash)"
fi
