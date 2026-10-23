#!/usr/bin/env bash
# Legacy basename input/output remain supported: jpg2eps.sh photo result.
set -euo pipefail
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
exec /usr/bin/python3 "$script_dir/image2eps.py" --format jpg "$@"
