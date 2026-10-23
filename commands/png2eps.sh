#!/usr/bin/env bash
# Legacy basename input remains supported: png2eps.sh figure -> eps/figure.eps.
set -euo pipefail
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
exec /usr/bin/python3 "$script_dir/image2eps.py" --format png "$@"
