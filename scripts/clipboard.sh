#!/usr/bin/env bash
# Install as ~/.local/bin/dotfiles-clipboard. Text travels through stdin/files, not arguments.
set -euo pipefail

is_wsl() { [[ -n ${WSL_DISTRO_NAME:-}${WSL_INTEROP:-} ]]; }

copy() (
  local temporary
  temporary=$(mktemp "${TMPDIR:-/tmp}/dotfiles-clipboard.XXXXXXXX")
  trap 'rm -f -- "$temporary"' EXIT
  cat > "$temporary"
  # A stale display socket must not consume stdin and prevent the next backend.
  # Redirect tool stdout too: xclip can otherwise keep tmux's copy pipe open.
  if [[ -n ${WAYLAND_DISPLAY:-} ]] && command -v wl-copy >/dev/null 2>&1 &&
      wl-copy < "$temporary" >/dev/null 2>&1; then
    return
  fi
  if [[ -n ${DISPLAY:-} ]] && command -v xclip >/dev/null 2>&1 &&
      xclip -selection clipboard -in < "$temporary" >/dev/null 2>&1; then
    return
  fi
  if [[ -n ${DISPLAY:-} ]] && command -v xsel >/dev/null 2>&1 &&
      xsel --clipboard --input < "$temporary" >/dev/null 2>&1; then
    return
  fi
  if is_wsl && command -v powershell.exe >/dev/null 2>&1 &&
      powershell.exe -NoLogo -NoProfile -NonInteractive -Command '[Console]::InputEncoding = [System.Text.UTF8Encoding]::new($false); Set-Clipboard -Value ([Console]::In.ReadToEnd())' < "$temporary" >/dev/null 2>&1; then
    return
  fi
  if is_wsl && command -v clip.exe >/dev/null 2>&1 && command -v iconv >/dev/null 2>&1 &&
      { iconv -f UTF-8 -t UTF-16LE < "$temporary" | clip.exe; } >/dev/null 2>&1; then
    return
  fi
  if [[ -n ${TMUX:-} ]] && command -v tmux >/dev/null 2>&1; then
    # tmux targets the attached terminal. OSC 52 support depends on that terminal.
    tmux load-buffer -w - < "$temporary"
  else
    printf 'No working clipboard backend. Use terminal Copy, install wl-clipboard/xsel, or use tmux with an OSC 52 capable terminal.\n' >&2
    return 1
  fi
)

paste() (
  local temporary
  temporary=$(mktemp "${TMPDIR:-/tmp}/dotfiles-clipboard.XXXXXXXX")
  trap 'rm -f -- "$temporary"' EXIT
  if [[ -n ${WAYLAND_DISPLAY:-} ]] && command -v wl-paste >/dev/null 2>&1 &&
      wl-paste --no-newline > "$temporary" 2>/dev/null; then
    cat -- "$temporary"; return
  fi
  if [[ -n ${DISPLAY:-} ]] && command -v xclip >/dev/null 2>&1 &&
      xclip -selection clipboard -out > "$temporary" 2>/dev/null; then
    cat -- "$temporary"; return
  fi
  if [[ -n ${DISPLAY:-} ]] && command -v xsel >/dev/null 2>&1 &&
      xsel --clipboard --output > "$temporary" 2>/dev/null; then
    cat -- "$temporary"; return
  fi
  if is_wsl && command -v powershell.exe >/dev/null 2>&1 &&
      powershell.exe -NoLogo -NoProfile -NonInteractive -Command '[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false); [Console]::Write((Get-Clipboard -Raw))' > "$temporary" 2>/dev/null; then
    sed 's/\r$//' "$temporary"; return
  fi
  printf 'No readable system clipboard. Use the terminal paste action.\n' >&2
  return 1
)

tmux_paste() (
  local target=$1 buffer=dotfiles-clipboard-$$ temporary
  [[ $target =~ ^%[0-9]+$ ]] || { printf 'Expected a tmux pane ID (%%number).\n' >&2; return 2; }
  temporary=$(mktemp "${TMPDIR:-/tmp}/dotfiles-clipboard.XXXXXXXX")
  trap 'rm -f -- "$temporary"' EXIT
  if paste > "$temporary" 2>/dev/null; then
    tmux load-buffer -b "$buffer" "$temporary"
    tmux paste-buffer -p -r -d -b "$buffer" -t "$target"
  else
    # OSC 52 does not provide clipboard reads; keep the internal tmux buffer usable.
    tmux paste-buffer -p -r -t "$target"
  fi
)

case ${1:-} in
  copy) [[ $# == 1 ]] && copy ;;
  paste) [[ $# == 1 ]] && paste ;;
  tmux-paste) [[ $# == 2 ]] && tmux_paste "$2" ;;
  *) printf 'Usage: dotfiles-clipboard {copy|paste|tmux-paste PANE}\n' >&2; exit 2 ;;
esac
