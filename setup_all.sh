#!/usr/bin/env bash
set -euo pipefail
repo_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
if [[ ! -x /usr/bin/python3 ]]; then
  printf '%s\n' 'Ubuntu Python 3.12+ is required. On Ubuntu 24.04: sudo apt install python3' >&2
  exit 1
fi
# Avoid Conda/venv/pyenv interpreters that may be incompatible with system tools.
exec /usr/bin/python3 "$repo_dir/installer/main.py" "$@"
