#!/usr/bin/env bash
# Compatibility entry point: preview, confirm and back up the GNOME Caps -> Ctrl setting.
set -euo pipefail
repo=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
exec bash "$repo/setup_all.sh" --modules keyboard --configs-only "$@"
