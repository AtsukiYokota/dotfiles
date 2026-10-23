#!/usr/bin/env bash
# Fetch repositories below a directory; working trees are changed only with -p.
set -euo pipefail

usage() {
  printf '%s\n' 'Usage: fetchall.sh [-f | -p] [-y] [directory]' \
    'Default: git fetch --prune in each repository and linked worktree.' \
    '-p  Pull the configured upstream with --ff-only; skip dirty/detached trees.' \
    '-y  Approve pulls without per-repository prompts (required without a TTY).'
}

mode=fetch
explicit_mode=
approve=0
while getopts ':fpyh' option; do
  case $option in
    f|p)
      if [[ -n $explicit_mode && $explicit_mode != "$option" ]]; then
        printf 'Choose either -f or -p.\n' >&2
        exit 2
      fi
      explicit_mode=$option
      [[ $option == f ]] && mode=fetch || mode=pull ;;
    y) approve=1 ;;
    h) usage; exit 0 ;;
    *) usage >&2; exit 2 ;;
  esac
done
shift "$((OPTIND - 1))"
(( $# <= 1 )) || { usage >&2; exit 2; }
if [[ $mode == pull && $approve == 0 && ! -t 0 ]]; then
  printf 'Pull requires a terminal confirmation, or explicit -p -y.\n' >&2
  exit 2
fi
root=$(cd -- "${1:-.}" && pwd -P)
[[ -t 0 ]] || export GIT_TERMINAL_PROMPT=0

# Store the NUL-separated list so a find error is detected before Git operations.
listing=$(mktemp "${TMPDIR:-/tmp}/dotfiles-fetchall.XXXXXXXX")
trap 'rm -f -- "$listing"' EXIT
find "$root" -name .git \( -type d -o -type f \) -print0 -prune > "$listing"
result=0
count=0
while IFS= read -r -d '' marker; do
  repository=${marker%/.git}
  count=$((count + 1))
  if ! actual=$(git -C "$repository" rev-parse --show-toplevel 2>/dev/null) || [[ $actual != "$repository" ]]; then
    printf 'SKIP invalid Git worktree: %s\n' "$repository" >&2
    result=1
    continue
  fi
  if [[ $mode == pull ]]; then
    if ! git -C "$repository" symbolic-ref --quiet HEAD >/dev/null; then
      printf 'SKIP detached HEAD: %s\n' "$repository" >&2
      result=1
      continue
    fi
    if ! changes=$(git -C "$repository" status --porcelain --untracked-files=normal); then
      printf 'SKIP unreadable worktree: %s\n' "$repository" >&2
      result=1
      continue
    fi
    if [[ -n $changes ]]; then
      printf 'SKIP dirty worktree: %s\n' "$repository" >&2
      result=1
      continue
    fi
    if ! git -C "$repository" rev-parse --verify '@{upstream}' >/dev/null 2>&1; then
      printf 'SKIP no configured upstream: %s\n' "$repository" >&2
      result=1
      continue
    fi
    if [[ $approve == 0 ]]; then
      printf 'Pull %s with --ff-only? [y/N] ' "$repository"
      IFS= read -r answer </dev/tty || answer=
      if [[ $answer != y && $answer != Y ]]; then
        printf 'SKIP declined: %s\n' "$repository"
        continue
      fi
    fi
    printf 'PULL %s\n' "$repository"
    git -C "$repository" pull --ff-only || result=1
  else
    printf 'FETCH %s\n' "$repository"
    git -C "$repository" fetch --prune || result=1
  fi
done < "$listing"
if (( count == 0 )); then
  printf 'No Git worktrees found below %s.\n' "$root"
fi
exit "$result"
