#!/usr/bin/env python3
"""Read-only inventory for the October 2026 Node.js/Brotli advisories.

This is a dated, narrow check, not a general vulnerability scanner. It does not
contact services, install packages, import packages from environments, or run
project code. Only PATH Node's --version and dpkg-query are executed.
"""
from __future__ import annotations

import argparse
from email.parser import Parser
import json
import os
from pathlib import Path
import re
import shutil
import subprocess


REVIEWED = '2026-10-25'
NODE_URL = 'https://nodejs.org/en/blog/vulnerability/october-2026-security-releases'
BROTLI_URL = 'https://github.com/advisories/GHSA-9v8h-qqgm-4m35'
UBUNTU_URL = 'https://ubuntu.com/security/CVE-2026-111497'
FIXED_NODE = {22: (22, 23, 4), 24: (24, 22, 1), 26: (26, 12, 1)}
APT_PACKAGES = ('libbrotli1', 'python3-brotli', 'python3-brotlicffi', 'nodejs')
PYTHON_PACKAGES = {'brotli', 'brotlicffi', 'nodejs-wheel-binaries'}


def release(value):
    if not re.fullmatch(r'v?\d+(?:\.\d+){2,3}', value):
        return None
    return tuple(int(part) for part in value.removeprefix('v').split('.'))


def node_status(value):
    version = release(value)
    if version is None or len(version) != 3:
        return 'UNKNOWN'
    floor = FIXED_NODE.get(version[0])
    if floor is None:
        return 'UNKNOWN'
    return 'PATCHED' if version >= floor else 'VULNERABLE'


def python_status(name, value):
    if name == 'nodejs-wheel-binaries':
        return node_status(value)
    version = release(value)
    if version is None:
        return 'UNKNOWN'
    if name == 'brotlicffi':
        # PyPI's binding has its own four-component release numbering.
        version += (0,) * (4 - len(version))
        if version < (1, 0, 3, 0):
            return 'UNKNOWN'
        return 'PATCHED' if version >= (1, 2, 1, 0) else 'VULNERABLE'
    if name == 'brotli' and len(version) == 3:
        # Upstream also released fixes on its 1.0 and 1.1 branches.
        if version >= (1, 2, 1) or (1, 1, 1) <= version < (1, 2, 0) or (1, 0, 10) <= version < (1, 1, 0):
            return 'PATCHED'
        if (1, 0, 3) <= version <= (1, 2, 0):
            return 'VULNERABLE'
    return 'UNKNOWN'


def finding(component, version, status, location, detail, source):
    return dict(component=component, version=version, status=status,
                location=str(location), detail=detail, source=source)


def apt_findings(output):
    results = []
    for row in output.splitlines():
        fields = row.split('\t')
        if len(fields) != 3 or fields[2] != 'installed':
            continue
        name, version = fields[:2]
        if name.split(':')[0] not in APT_PACKAGES:
            continue
        results.append(finding(name, version, 'UNKNOWN', 'APT / dpkg',
                               'Ubuntu 24.04/26.04 vendor assessment was pending on '
                               + REVIEWED + '. Check the current Ubuntu notice and full package revision; '
                               'upstream version comparisons cannot recognize Ubuntu backports.', UBUNTU_URL))
    return results


def managed_findings(data):
    results = []
    for directory in sorted((data / 'dotfiles/tools/node').glob('*')):
        if not (directory / 'bin/node').is_file():
            continue
        results.append(finding('managed Node.js', directory.name, node_status(directory.name), directory,
                               'Versioned installation directory; older copies remain callable even when '
                               'the active symlink has changed. Version is inferred from the directory name.', NODE_URL))
    return results


def metadata_findings(environment):
    results = []
    patterns = ('lib/python*/site-packages/*.dist-info/METADATA',
                'Lib/site-packages/*.dist-info/METADATA')
    for pattern in patterns:
        for path in sorted(environment.glob(pattern)):
            try:
                # Only read the metadata header, never import a module or .pth file.
                with path.open(encoding='utf-8') as stream:
                    metadata = Parser().parsestr(stream.read(65536), headersonly=True)
                name = re.sub(r'[-_.]+', '-', metadata.get('Name', '').lower())
                if name not in PYTHON_PACKAGES:
                    continue
                version = metadata.get('Version', 'unknown')
                source = NODE_URL if name == 'nodejs-wheel-binaries' else BROTLI_URL
                results.append(finding(name, version, python_status(name, version), path,
                                       'Installed distribution metadata; environment packages were not imported.', source))
            except (OSError, UnicodeError) as error:
                results.append(finding('Python metadata', '?', 'UNKNOWN', path,
                                       'Could not read metadata: ' + str(error), BROTLI_URL))
    return results


def command(argv):
    environment = dict(os.environ)
    # NODE_OPTIONS can preload project modules even during a version query.
    environment.pop('NODE_OPTIONS', None)
    environment.pop('NODE_PATH', None)
    return subprocess.run(argv, text=True, capture_output=True, timeout=10, env=environment)


def inspect(venvs=()):
    data = Path(os.environ.get('XDG_DATA_HOME', str(Path.home() / '.local/share')))
    results = managed_findings(data)
    if shutil.which('dpkg-query'):
        try:
            output = command(['dpkg-query', '-W', '-f=${binary:Package}\t${Version}\t${db:Status-Status}\n',
                              *APT_PACKAGES])
            results.extend(apt_findings(output.stdout))
        except (OSError, subprocess.SubprocessError) as error:
            results.append(finding('APT inventory', '?', 'UNKNOWN', 'dpkg-query', str(error), UBUNTU_URL))
    else:
        results.append(finding('APT inventory', '?', 'UNKNOWN', 'dpkg-query',
                               'dpkg-query is unavailable; run this check inside Ubuntu.', UBUNTU_URL))
    node = shutil.which('node')
    if node:
        try:
            output = command([node, '--version'])
            version = output.stdout.strip() if output.returncode == 0 else 'unknown'
            # Ubuntu can backport fixes without changing Node's upstream number.
            distro_node = Path(node).resolve() == Path('/usr/bin/node')
            results.append(finding('PATH Node.js', version, 'UNKNOWN' if distro_node else node_status(version), node,
                                   'APT Node: check the full vendor revision above.' if distro_node else
                                   'Compared with the fixed October 2026 releases on Node 22, 24 and 26; '
                                   'other release lines need manual review.', UBUNTU_URL if distro_node else NODE_URL))
        except (OSError, subprocess.SubprocessError) as error:
            results.append(finding('PATH Node.js', '?', 'UNKNOWN', node, str(error), NODE_URL))
    else:
        results.append(finding('PATH Node.js', '-', 'NOT_FOUND', 'PATH', 'No node executable found.', NODE_URL))
    tools = Path(os.environ.get('UV_TOOL_DIR', str(data / 'uv/tools')))
    environments = set(venvs)
    environments.update(path for path in tools.glob('*') if path.is_dir())
    for environment in sorted(environments):
        results.extend(metadata_findings(environment))
    return results


def exit_status(findings):
    if any(item['status'] == 'VULNERABLE' for item in findings):
        return 1
    if any(item['status'] == 'UNKNOWN' for item in findings):
        return 2
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--json', action='store_true', help='Print the inventory as JSON.')
    parser.add_argument('--venv', action='append', type=Path, default=[],
                        help='Also read distribution metadata in this virtual environment (repeatable).')
    args = parser.parse_args(argv)
    for environment in args.venv:
        if not environment.is_dir():
            parser.error(f'Virtual environment directory does not exist: {environment}')
    results = inspect(args.venv)
    scope = ('Only the October 2026 Node.js/Brotli advisories are checked. '
             'APT, PATH Node, dotfiles Node directories and uv tool metadata are inventoried. '
             'Project/other environments require --venv; containers and bundled application runtimes are not scanned. '
             'PATCHED does not mean free from all vulnerabilities. Exit: 1 vulnerable, 2 unknown, 0 no finding within this scope.')
    if args.json:
        print(json.dumps(dict(reviewed=REVIEWED, scope=scope, findings=results), indent=2))
    else:
        print('Node.js/Brotli check; advisory snapshot: ' + REVIEWED)
        print(scope)
        for item in results:
            print(f"\n[{item['status']}] {item['component']} {item['version']}\n  {item['location']}\n  {item['detail']}\n  {item['source']}")
    return exit_status(results)


if __name__ == '__main__':
    raise SystemExit(main())
