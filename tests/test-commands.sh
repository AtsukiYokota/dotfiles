#!/usr/bin/env bash
# Real local repositories only: no network, global Git configuration or user files.
set -euo pipefail
repo=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
scratch=$(mktemp -d "${TMPDIR:-/tmp}/dotfiles-commands.XXXXXXXX")
scratch=$(cd -- "$scratch" && pwd -P)
cleanup() {
  if [[ -n $scratch && $scratch != / && ${scratch##*/} == dotfiles-commands.* ]]; then
    rm -rf -- "$scratch"
  fi
}
trap cleanup EXIT
export HOME="$scratch/home" GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
export GIT_ALLOW_PROTOCOL=file GIT_TERMINAL_PROMPT=0
export GIT_AUTHOR_NAME='Dotfiles Test' GIT_AUTHOR_EMAIL='test@example.invalid'
export GIT_COMMITTER_NAME="$GIT_AUTHOR_NAME" GIT_COMMITTER_EMAIL="$GIT_AUTHOR_EMAIL"
export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=/dev/null
export GIT_TEMPLATE_DIR="$scratch/template"
mkdir -p "$HOME" "$GIT_TEMPLATE_DIR" "$scratch/collection"
checks=0
pass() { checks=$((checks + 1)); printf 'ok %s - %s\n' "$checks" "$1"; }
fail() { printf 'not ok - %s\n' "$1" >&2; exit 1; }
expect_failure() {
  if "$@" > "$scratch/failure.log" 2>&1; then fail "unexpected success: $*"; fi
}
run_fetchall() { bash "$repo/commands/fetchall.sh" "$@" < /dev/null; }

git init -q --bare --initial-branch=main "$scratch/upstream.git"
git clone -q "$scratch/upstream.git" "$scratch/seed" 2>/dev/null
printf 'initial\n' > "$scratch/seed/file"
git -C "$scratch/seed" add file
git -C "$scratch/seed" commit -qm initial
git -C "$scratch/seed" push -qu origin main
first=$(git -C "$scratch/seed" rev-parse HEAD)
project="$scratch/collection/project with spaces"
worktree="$scratch/collection/linked worktree"
git clone -q "$scratch/upstream.git" "$project"
git -C "$project" worktree add -q --track -b linked "$worktree" origin/main
[[ -f $worktree/.git ]] || fail 'fixture is not a linked worktree'
printf 'next\n' >> "$scratch/seed/file"
git -C "$scratch/seed" commit -qam next
git -C "$scratch/seed" push -q
second=$(git -C "$scratch/seed" rev-parse HEAD)
run_fetchall "$scratch/collection" > "$scratch/fetch.log" 2>&1
[[ $(grep -c '^FETCH ' "$scratch/fetch.log") == 2 ]] || fail 'worktree discovery'
[[ $(git -C "$project" rev-parse origin/main) == "$second" ]] || fail 'fetch did not update remote ref'
[[ $(git -C "$project" rev-parse HEAD) == "$first" && $(git -C "$worktree" rev-parse HEAD) == "$first" ]] || fail 'default fetch changed local branches'
pass 'default fetch discovers spaced repositories and .git-file worktrees without changing HEAD'

git -C "$scratch/seed" push -q origin HEAD:obsolete
run_fetchall "$scratch/collection" > /dev/null 2>&1
git -C "$scratch/seed" push -q origin --delete obsolete
run_fetchall "$scratch/collection" > /dev/null 2>&1
if git -C "$project" rev-parse --verify refs/remotes/origin/obsolete >/dev/null 2>&1; then fail 'fetch did not prune'; fi
pass 'default fetch prunes deleted remote branches'

expect_failure run_fetchall -p "$scratch/collection"
grep -F 'terminal confirmation' "$scratch/failure.log" >/dev/null || fail 'non-TTY diagnostic'
[[ $(git -C "$project" rev-parse HEAD) == "$first" ]] || fail 'unconfirmed pull changed HEAD'
pass 'noninteractive pull requires explicit -y before changing any repository'
run_fetchall -py "$scratch/collection" > "$scratch/pull.log" 2>&1
[[ $(git -C "$project" rev-parse HEAD) == "$second" && $(git -C "$worktree" rev-parse HEAD) == "$second" ]] || fail 'fast-forward pull'
pass 'explicit approved pulls fast-forward both normal and linked worktrees'

printf 'untracked\n' > "$project/private file"
git -C "$worktree" switch -q --detach
printf 'third\n' >> "$scratch/seed/file"
git -C "$scratch/seed" commit -qam third
git -C "$scratch/seed" push -q
expect_failure run_fetchall -py "$scratch/collection"
grep -F 'SKIP dirty worktree' "$scratch/failure.log" >/dev/null || fail 'dirty diagnostic'
grep -F 'SKIP detached HEAD' "$scratch/failure.log" >/dev/null || fail 'detached diagnostic'
[[ $(git -C "$project" rev-parse HEAD) == "$second" && $(git -C "$worktree" rev-parse HEAD) == "$second" ]] || fail 'unsafe pull changed HEAD'
pass 'dirty and detached worktrees are reported and left untouched'

rm -f -- "$project/private file"
git -C "$worktree" switch -q linked
git -C "$project" remote rename origin alternate
run_fetchall -py "$scratch/collection" > /dev/null 2>&1
third=$(git -C "$scratch/seed" rev-parse HEAD)
[[ $(git -C "$project" rev-parse HEAD) == "$third" ]] || fail 'non-origin tracking remote'
pass 'pull follows configured upstreams instead of assuming origin or matching branch names'

printf 'local\n' > "$project/local file"
git -C "$project" add 'local file'
git -C "$project" commit -qm local
local_head=$(git -C "$project" rev-parse HEAD)
printf 'remote\n' >> "$scratch/seed/file"
git -C "$scratch/seed" commit -qam remote
git -C "$scratch/seed" push -q
expect_failure run_fetchall -py "$scratch/collection"
[[ $(git -C "$project" rev-parse HEAD) == "$local_head" ]] || fail 'divergence changed local branch'
[[ $(git -C "$project" rev-list --count HEAD) == 4 ]] || fail 'unexpected merge or rebase'
pass 'diverged history fails without merge, rebase or local-commit loss'

mkdir -p "$project/not a repo/.git"
expect_failure run_fetchall "$scratch/collection"
grep -F 'SKIP invalid Git worktree' "$scratch/failure.log" >/dev/null || fail 'invalid marker diagnostic'
expect_failure run_fetchall -fp "$scratch/collection"
pass 'invalid Git markers and conflicting modes fail explicitly'
printf '%s command checks passed. All remotes were local temporary repositories.\n' "$checks"
