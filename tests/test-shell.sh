#!/usr/bin/env bash
# Isolated integration checks: only temporary homes, workspaces and mocked programs.
set -euo pipefail
repo=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
real_tmux=$(command -v tmux || true)
tmux_socket=
scratch=$(mktemp -d "${TMPDIR:-/tmp}/dotfiles-shell-tests.XXXXXXXX")
scratch=$(cd -- "$scratch" && pwd -P)
cleanup() {
  if [[ -n $tmux_socket && -n $real_tmux ]]; then
    "$real_tmux" -S "$tmux_socket" kill-server 2>/dev/null || true
  fi
  # The only recursively removed tree is the directory allocated by mktemp above.
  if [[ -n $scratch && $scratch != / && ${scratch##*/} == dotfiles-shell-tests.* ]]; then
    rm -rf -- "$scratch"
  fi
}
trap cleanup EXIT
export HOME="$scratch/home" TMPDIR="$scratch/tmp"
export PATH="$scratch/bin:/usr/bin:/bin"
export CALL_LOG="$scratch/calls" ROS_SOURCE_LOG="$scratch/ros-source"
export CLIP_FILE="$scratch/clipboard" TMUX_FILE="$scratch/tmux-buffer" PASTE_FILE="$scratch/pasted"
export BACKEND_LOG="$scratch/backend"
mkdir -p "$HOME" "$TMPDIR" "$scratch/bin" "$scratch/ros/jazzy" "$scratch/robot workspace/src/pkg"
export DOTFILES_ROS_ROOT="$scratch/ros"
export DOTFILES_ROS_DISTRO=jazzy
unset ROS_DISTRO ROS_VERSION ROS_WORKSPACE AMENT_PREFIX_PATH COLCON_PREFIX_PATH TMUX WSL_DISTRO_NAME WSL_INTEROP DISPLAY WAYLAND_DISPLAY || true
checks=0
pass() { checks=$((checks + 1)); printf 'ok %s - %s\n' "$checks" "$1"; }
fail() { printf 'not ok - %s\n' "$1" >&2; exit 1; }
expect_failure() {
  if "$@" > "$scratch/expected-out" 2> "$scratch/expected-err"; then
    fail "unexpected success: $*"
  fi
}

cat > "$DOTFILES_ROS_ROOT/jazzy/setup.bash" <<'MOCK'
printf 'base\n' >> "$ROS_SOURCE_LOG"
export ROS_DISTRO=jazzy ROS_VERSION=2
MOCK
cat > "$scratch/bin/colcon" <<'MOCK'
#!/usr/bin/env bash
printf '%s\n' "$PWD" "$@" '---' >> "$CALL_LOG"
if [[ $1 == test ]]; then exit "${MOCK_TEST_STATUS:-0}"; fi
MOCK
cat > "$scratch/bin/rosdep" <<'MOCK'
#!/usr/bin/env bash
printf '%s\n' "$PWD" "$@" '---' >> "$CALL_LOG"
MOCK
cat > "$scratch/bin/wl-copy" <<'MOCK'
#!/usr/bin/env bash
printf 'wayland-copy\n' >> "$BACKEND_LOG"
cat > "$CLIP_FILE"
MOCK
cat > "$scratch/bin/wl-paste" <<'MOCK'
#!/usr/bin/env bash
printf 'wayland-paste\n' >> "$BACKEND_LOG"
cat "$CLIP_FILE"
MOCK
cat > "$scratch/bin/xclip" <<'MOCK'
#!/usr/bin/env bash
printf 'x11\n' >> "$BACKEND_LOG"
if [[ ${!#} == -out ]]; then cat "$CLIP_FILE"; else cat > "$CLIP_FILE"; fi
MOCK
cat > "$scratch/bin/powershell.exe" <<'MOCK'
#!/usr/bin/env bash
printf 'wsl\n' >> "$BACKEND_LOG"
if [[ ${!#} == *Get-Clipboard* ]]; then cat "$CLIP_FILE"; else cat > "$CLIP_FILE"; fi
MOCK
cat > "$scratch/bin/tmux" <<'MOCK'
#!/usr/bin/env bash
printf '%s\n' "$@" '---' >> "$CALL_LOG"
case $1 in
  load-buffer)
    if [[ ${!#} == - ]]; then cat > "$TMUX_FILE"; else cat "${!#}" > "$TMUX_FILE"; fi ;;
  paste-buffer) cat "$TMUX_FILE" > "$PASTE_FILE" ;;
esac
MOCK
chmod +x "$scratch/bin/"*
source "$repo/.rosrc"

export ROS_WORKSPACE="$scratch/robot workspace"
cd -- "$scratch"
ros_build --cmake-args '-DCMAKE_CXX_FLAGS=-Wall -Wextra'
mapfile -t call < "$CALL_LOG"
[[ ${call[0]} == "$ROS_WORKSPACE" && ${call[1]} == build && ${call[2]} == --symlink-install && ${call[4]} == '-DCMAKE_CXX_FLAGS=-Wall -Wextra' ]] || fail 'fresh build arguments'
[[ $PWD == "$scratch" && -z ${ROS_DISTRO:-} ]] || fail 'build changed caller state'
pass 'fresh workspace builds with spaced paths/arguments and preserves caller state'

: > "$CALL_LOG"
unset ROS_WORKSPACE
cd -- "$scratch/robot workspace/src/pkg"
ros_build
[[ $(head -n 1 "$CALL_LOG") == "$scratch/robot workspace" ]] || fail 'workspace discovery'
pass 'workspace discovery works below src'
cd -- "$scratch"
export ROS_WORKSPACE="$scratch/robot workspace"

ROS_DISTRO=humble expect_failure ros_env
ROS_VERSION=1 expect_failure ros_env
[[ ! -e $ROS_SOURCE_LOG || $(wc -l < "$ROS_SOURCE_LOG") == 2 ]] || fail 'mixed distro was sourced'
pass 'ROS 1 and a different ROS 2 distribution are rejected before sourcing'

mkdir -p "$ROS_WORKSPACE/install"
printf 'export MOCK_OVERLAY=loaded\n' > "$ROS_WORKSPACE/install/local_setup.bash"
ros_env "$ROS_WORKSPACE"
[[ $ROS_DISTRO == jazzy && $MOCK_OVERLAY == loaded ]] || fail 'explicit overlay'
unset ROS_DISTRO ROS_VERSION MOCK_OVERLAY
pass 'explicit overlay activation works'

: > "$CALL_LOG"
MOCK_TEST_STATUS=7 expect_failure ros_test --packages-select demo
grep -Fx 'test-result' "$CALL_LOG" >/dev/null || fail 'failed test did not report results'
pass 'failed tests return failure and still report colcon test results'
: > "$CALL_LOG"
ros_deps
grep -Fx -- '--rosdistro' "$CALL_LOG" >/dev/null && grep -Fx jazzy "$CALL_LOG" >/dev/null || fail 'rosdep distro'
pass 'rosdep uses the selected ROS 2 distribution'

mkdir -p "$scratch/build"
printf 'keep\n' > "$scratch/build/sentinel"
ROS_WORKSPACE="$scratch/missing" expect_failure ros_clean --yes
[[ -f $scratch/build/sentinel ]] || fail 'stale workspace deleted current build'
ROS_WORKSPACE="$HOME" expect_failure ros_clean --yes
ROS_WORKSPACE=/ expect_failure ros_clean --yes
pass 'clean refuses missing workspace, HOME and root without touching caller files'

mkdir -p "$ROS_WORKSPACE/build" "$ROS_WORKSPACE/log"
touch "$ROS_WORKSPACE/build/COLCON_IGNORE" "$ROS_WORKSPACE/log/COLCON_IGNORE"
expect_failure ros_clean --yes
[[ -d $ROS_WORKSPACE/build ]] || fail 'clean deleted part of an invalid target set'
touch "$ROS_WORKSPACE/install/COLCON_IGNORE"
expect_failure ros_clean
ros_clean --yes
[[ ! -e $ROS_WORKSPACE/build && ! -e $ROS_WORKSPACE/install && ! -e $ROS_WORKSPACE/log && -d $ROS_WORKSPACE/src ]] || fail 'validated clean scope'
pass 'clean validates all markers before removal and requires --yes'

mkdir -p "$scratch/outside"
touch "$scratch/outside/COLCON_IGNORE" "$scratch/outside/sentinel"
if ln -s "$scratch/outside" "$ROS_WORKSPACE/build" 2>/dev/null && [[ -L $ROS_WORKSPACE/build ]]; then
  expect_failure ros_clean --yes
  [[ -f $scratch/outside/sentinel ]] || fail 'clean followed output symlink'
  pass 'clean refuses output symlinks'
else
  printf 'skip - filesystem cannot create native symlinks\n'
fi

cp "$repo/.rosrc" "$HOME/.rosrc"
export XDG_CONFIG_HOME="$scratch/config with spaces"
mkdir -p "$HOME/.cargo" "$XDG_CONFIG_HOME/dotfiles"
cp "$repo/configs/shell/formatting.bash" "$XDG_CONFIG_HOME/dotfiles/formatting.bash"
printf 'export PATH="$HOME/.cargo/bin:$PATH"\n' > "$HOME/.cargo/env"
printf 'export NPM_CONFIG_PREFIX="$HOME/.local"\n' > "$XDG_CONFIG_HOME/dotfiles/node.env"
cat > "$HOME/.bashrc.local" <<'LOCAL'
DOTFILES_AUTO_ROS=0
PS1='local prompt'
printf 'loaded\n' >> "$HOME/local-loads"
LOCAL
export TEST_REPO="$repo" TEST_ROOT="$scratch"
bash --noprofile --norc -ic '
  source "$TEST_REPO/.bashrc"
  source "$TEST_REPO/.bashrc"
  [[ $PS1 == "local prompt" ]] || exit 1
  [[ $NPM_CONFIG_PREFIX == "$HOME/.local" ]] || exit 1
  [[ :$PATH: == *":$HOME/.cargo/bin:"* ]] || exit 1
  [[ $(wc -l < "$HOME/local-loads") == 1 ]] || exit 1
  cd -- "$TEST_ROOT/robot workspace" || exit 1
  mark project || exit 1
  cd -- "$HOME" || exit 1
  cmark project || exit 1
  [[ $PWD == "$TEST_ROOT/robot workspace" ]] || exit 1
  if mark ../escape; then exit 1; fi
' > "$scratch/interactive-out" 2> "$scratch/interactive-err" || fail 'interactive supplement/bookmarks'
pass 'interactive supplement loads Rust/Node and local overrides once, and handles spaced bookmarks'
mkdir -p "$scratch/alias target/.git"
printf 'needle\n' > "$scratch/alias target/.hidden-file"
printf 'needle\n' > "$scratch/alias target/visible-file"
printf 'needle\n' > "$scratch/alias target/.git/excluded"
cat > "$scratch/bin/starship" <<'MOCK'
#!/usr/bin/env bash
[[ $1 == init && $2 == bash ]] || exit 1
printf 'init\n' >> "$HOME/starship-loads"
printf 'export TEST_STARSHIP_INIT=loaded\n'
MOCK
chmod +x "$scratch/bin/starship"
TERM=xterm-256color bash --noprofile --norc -ic '
  source "$TEST_REPO/.bashrc"
  source "$TEST_REPO/.bashrc"
  [[ $TEST_STARSHIP_INIT == loaded && $(wc -l < "$HOME/starship-loads") == 1 ]] || exit 1
  [[ $STARSHIP_CONFIG == "$XDG_CONFIG_HOME/starship.toml" ]] || exit 1
  declare -F clang_autoformat recursive_clang_autoformat pep8_autoformat recursive_pep8_autoformat >/dev/null || exit 1
  cd -- "$TEST_ROOT/alias target" > "$TEST_ROOT/cd-list" || exit 1
  [[ $PWD == "$TEST_ROOT/alias target" ]] || exit 1
  command grep -Fx .hidden-file "$TEST_ROOT/cd-list" >/dev/null || exit 1
  if cd -- "$TEST_ROOT/nonexistent" > "$TEST_ROOT/failed-cd-list" 2>/dev/null; then exit 1; fi
  [[ ! -s $TEST_ROOT/failed-cd-list ]] || exit 1
  eval "ls" > "$TEST_ROOT/alias-list"
  command grep -Fx .hidden-file "$TEST_ROOT/alias-list" >/dev/null || exit 1
  eval "grep -r needle ." > "$TEST_ROOT/alias-grep"
  command grep -F .git/excluded "$TEST_ROOT/alias-grep" >/dev/null && exit 1
  [[ $(cat "$TEST_ROOT/alias-grep") == *$'\''\e['\''* ]] || exit 1
' > "$scratch/restored-out" 2> "$scratch/restored-err" || fail 'restored aliases, formatter functions and prompt'
pass 'cd/ls include hidden files; grep keeps ANSI through pipes and excludes .git; Starship and formatters load once'
TERM=dumb bash --noprofile --norc -ic 'source "$TEST_REPO/.bashrc"; [[ -z ${TEST_STARSHIP_INIT:-} ]]' \
  > "$scratch/dumb-out" 2> "$scratch/dumb-err" || fail 'dumb terminal prompt'
pass 'dumb terminals keep the plain prompt without invoking Starship'
bash --noprofile --norc -c 'before=$PATH; source "$TEST_REPO/.bashrc"; [[ $PATH == "$before" ]]' || fail 'noninteractive shell changed'
pass 'noninteractive sourcing has no side effects'

printf 'first line\n日本語 and spaces\n\n' > "$scratch/expected-clipboard"
export WAYLAND_DISPLAY=wayland-0 DISPLAY=:0 WSL_DISTRO_NAME=Ubuntu TMUX=mock
bash "$repo/scripts/clipboard.sh" copy < "$scratch/expected-clipboard"
bash "$repo/scripts/clipboard.sh" paste > "$scratch/actual-clipboard"
cmp "$scratch/expected-clipboard" "$scratch/actual-clipboard" || fail 'wayland multiline'
[[ $(head -n 1 "$BACKEND_LOG") == wayland-copy ]] || fail 'wayland precedence'
pass 'Wayland clipboard keeps Unicode, multiline text and trailing newlines'

unset WAYLAND_DISPLAY
: > "$BACKEND_LOG"
bash "$repo/scripts/clipboard.sh" copy < "$scratch/expected-clipboard"
bash "$repo/scripts/clipboard.sh" paste > "$scratch/actual-clipboard"
cmp "$scratch/expected-clipboard" "$scratch/actual-clipboard" || fail 'x11 multiline'
[[ $(head -n 1 "$BACKEND_LOG") == x11 ]] || fail 'x11 selection'
pass 'X11 clipboard preserves complete text'

unset DISPLAY
: > "$BACKEND_LOG"
bash "$repo/scripts/clipboard.sh" copy < "$scratch/expected-clipboard"
bash "$repo/scripts/clipboard.sh" paste > "$scratch/actual-clipboard"
cmp "$scratch/expected-clipboard" "$scratch/actual-clipboard" || fail 'wsl multiline'
[[ $(head -n 1 "$BACKEND_LOG") == wsl ]] || fail 'wsl selection'
pass 'WSL clipboard routes through mocked PowerShell without shell text interpolation'

unset WSL_DISTRO_NAME
: > "$CALL_LOG"
bash "$repo/scripts/clipboard.sh" copy < "$scratch/expected-clipboard"
cmp "$scratch/expected-clipboard" "$TMUX_FILE" || fail 'OSC52 buffer'
grep -Fx -- '-w' "$CALL_LOG" >/dev/null || fail 'OSC52 flag missing'
bash "$repo/scripts/clipboard.sh" tmux-paste '%1'
cmp "$scratch/expected-clipboard" "$PASTE_FILE" || fail 'internal buffer fallback'
pass 'headless copy requests tmux OSC52 and paste falls back to its internal buffer'

export WAYLAND_DISPLAY=wayland-0
: > "$CALL_LOG"
bash "$repo/scripts/clipboard.sh" tmux-paste '%2'
cmp "$scratch/expected-clipboard" "$PASTE_FILE" || fail 'tmux multiline paste'
grep -Fx -- '-p' "$CALL_LOG" >/dev/null || fail 'bracketed paste missing'
[[ -z $(find "$TMPDIR" -type f -print) ]] || fail 'clipboard temporary file leaked'
pass 'tmux paste uses the complete clipboard, bracketed paste and removes its temporary file'

if [[ -n $real_tmux ]]; then
  # An isolated server validates real tmux syntax without touching the user's server.
  tmux_socket=$scratch/config-check.sock
  TMUX= "$real_tmux" -S "$tmux_socket" -f /dev/null new-session -d -s config-check 'sleep 30'
  "$real_tmux" -S "$tmux_socket" source-file "$repo/.tmux.conf"
  [[ $("$real_tmux" -S "$tmux_socket" show-options -gv prefix) == C-x ]] || fail 'tmux prefix'
  [[ $("$real_tmux" -S "$tmux_socket" show-options -gv default-terminal) == tmux-256color ]] || fail 'tmux terminfo'
  "$real_tmux" -S "$tmux_socket" kill-server
  tmux_socket=
  pass 'real tmux accepts the configuration in an isolated server'
else
  printf 'skip - real tmux is unavailable for configuration parsing\n'
fi

printf '%s checks passed. Real ROS and desktop clipboard integration require manual checks.\n' "$checks"
