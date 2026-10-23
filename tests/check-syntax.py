#!/usr/bin/env python3
"""Parse configuration and source files without installing or running them."""
import ast
import json
from pathlib import Path
import subprocess
import tomllib

ROOT = Path(__file__).resolve().parent.parent
count = 0
for directory in ('installer', 'commands', 'tests'):
    for path in (ROOT / directory).glob('*.py'):
        ast.parse(path.read_text(encoding='utf-8'), filename=str(path))
        count += 1
for path in [ROOT / 'setup_all.sh', ROOT / '.bashrc', ROOT / '.rosrc',
             *(ROOT / 'scripts').glob('*.sh'), *(ROOT / 'commands').glob('*.sh'),
             *(ROOT / 'configs/shell').glob('*.bash'),
             *(ROOT / 'tests').glob('*.sh')]:
    subprocess.run(['bash', '-n', str(path)], check=True)
    count += 1
for path in (ROOT / 'installer/versions.json', ROOT / 'configs/nvim/lazy-lock.json'):
    json.loads(path.read_text(encoding='utf-8'))
    count += 1
tomllib.loads((ROOT / 'configs/starship.toml').read_text(encoding='utf-8'))
count += 1
subprocess.run(['perl', '-c', str(ROOT / '.latexmkrc')], check=True)
print(f'Syntax checks passed: {count} files + latexmk configuration.')
