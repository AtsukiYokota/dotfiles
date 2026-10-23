#!/usr/bin/env bash
# Compatibility entry point; selection and confirmation live in setup_all.sh.
set -euo pipefail
repo_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
exec bash "$repo_dir/setup_all.sh" "$@"
