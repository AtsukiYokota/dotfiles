#!/usr/bin/env python3
"""Exercise actual Lyrical ament_uncrustify/autopep8 in a disposable Ubuntu directory.

Downloads pinned sources/wheels and extracts an Ubuntu uncrustify .deb. No ROS,
Python or OS package installation, sudo, apt update or home changes are used.
"""
from __future__ import annotations

import hashlib
import os
from pathlib import Path
import platform
import subprocess
import sys
import tarfile
import tempfile
import zipfile

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'installer'))
from runtime import Runner

AMENT_COMMIT = 'efe741dce0cd8a36c1f6a08e35324571555961c3'
AMENT_SHA = 'eff5b19400936635b064c0221136fbc1893f8774754f6198974ab4ecec9e95d0'
WHEELS = (
    ('autopep8', 'https://files.pythonhosted.org/packages/9e/43/53afb8ba17218f19b77c7834128566c5bbb100a0ad9ba2e8e89d089d7079/autopep8-2.3.2-py2.py3-none-any.whl',
     'ce8ad498672c845a0c3de2629c15b635ec2b05ef8177a6e7c91c74f3e9b51128'),
    ('pycodestyle', 'https://files.pythonhosted.org/packages/56/e2/480bcdb153feecde4d736b18c908c7eee4846f11d7547d2e0c71499af630/pycodestyle-2.15.0-py2.py3-none-any.whl',
     '12fd2f73c7b8ee8845a0431111df8faf4c1a07d6e64e2ee7f0c74014dab14181'),
)


def run(command, environment, cwd, expected=0):
    result = subprocess.run([str(part) for part in command], env=environment, cwd=cwd,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=120)
    if result.returncode != expected:
        raise AssertionError(f'{command} returned {result.returncode}, expected {expected}\n'
                             + result.stdout.decode(errors='replace') + result.stderr.decode(errors='replace'))
    return result


def main():
    if sys.platform != 'linux' or os.geteuid() == 0:
        raise SystemExit('Run as a regular Ubuntu 26.04/WSL user without sudo.')
    release = platform.freedesktop_os_release()
    if release.get('ID') != 'ubuntu' or release.get('VERSION_ID') != '26.04':
        raise SystemExit('The portable dependency adapter targets Ubuntu 26.04.')
    status = Path('/var/lib/dpkg/status')
    original_status = hashlib.sha256(status.read_bytes()).hexdigest()
    try:
        with tempfile.TemporaryDirectory(prefix='dotfiles-ros-format-real-') as temporary:
            work = Path(temporary)
            runner = Runner(work / 'download.log')
            source_archive = work / 'ament.tar.gz'
            runner.download(f'https://codeload.github.com/ament/ament_lint/tar.gz/{AMENT_COMMIT}',
                            source_archive, AMENT_SHA)
            with tarfile.open(source_archive) as archive:
                archive.extractall(work, filter='data')
            ament = work / f'ament_lint-{AMENT_COMMIT}'
            packages = work / 'python'
            packages.mkdir()
            for name, url, digest in WHEELS:
                wheel = work / f'{name}.whl'
                runner.download(url, wheel, digest)
                with zipfile.ZipFile(wheel) as archive:
                    archive.extractall(packages)
            dependencies = work / 'dependencies'
            dependencies.mkdir()
            rows = subprocess.check_output(['apt-cache', 'madison', 'uncrustify'], text=True).splitlines()
            versions = [row.split('|')[1].strip() for row in rows
                        if len(row.split('|')) == 3 and ' resolute/' in row.split('|')[2]]
            if not versions:
                raise RuntimeError('The local APT index has no base resolute uncrustify entry.')
            # apt-get download verifies against local signed APT metadata; no system write.
            subprocess.run(['apt-get', 'download', 'uncrustify=' + versions[0]], cwd=work,
                           check=True, timeout=120)
            for archive in work.glob('*.deb'):
                subprocess.run(['dpkg-deb', '--extract', str(archive), str(dependencies)], check=True)
            tools = work / 'bin'
            tools.mkdir()
            for name, module in (('ament_uncrustify', 'ament_uncrustify.main'), ('autopep8', 'autopep8')):
                executable = tools / name
                executable.write_text(f'#!/usr/bin/python3\nfrom {module} import main\nraise SystemExit(main())\n')
                executable.chmod(0o755)
            home = work / 'home'
            home.mkdir()
            environment = {**os.environ, 'HOME': str(home), 'XDG_CONFIG_HOME': str(home / '.config'),
                           'XDG_CACHE_HOME': str(home / '.cache'), 'XDG_DATA_HOME': str(home / '.local/share'),
                           'ROS_DISTRO': 'lyrical', 'PYTHONDONTWRITEBYTECODE': '1',
                           'PYTHONPATH': os.pathsep.join((str(packages), str(ament / 'ament_uncrustify'))),
                           'PATH': os.pathsep.join((str(tools), str(dependencies / 'usr/bin'), '/usr/bin', '/bin'))}
            samples = work / 'source tree'
            samples.mkdir()
            cpp = samples / 'hello world.cpp'
            cpp.write_text('int main()\n{\nint x=1;\nif(x)\n{\nreturn 0;\n}\nreturn 1;\n}\n')
            c_file = samples / 'example.c'
            c_file.write_text('int main(void){int value=1;return value;}\n')
            python = samples / 'example script.py'
            python.write_text('import math, sys\n\n\ndef square(value):\n    result=value*value\n    return result\n')
            excluded = samples / 'build' / 'generated.cpp'
            excluded.parent.mkdir()
            excluded.write_text('int value=1;\n')
            command = [sys.executable, ROOT / 'commands/ros-format.py']
            for language in ('cpp', 'python'):
                before = {path: path.read_bytes() for path in samples.rglob('*') if path.is_file()}
                run([*command, '--language', language, '--recursive', '--check', samples], environment, work, expected=1)
                assert all(path.read_bytes() == content for path, content in before.items())
                run([*command, '--language', language, '--recursive', samples], environment, work)
                run([*command, '--language', language, '--recursive', '--check', samples], environment, work)
            assert excluded.read_text() == 'int value=1;\n'
            assert 'int main()\n{' in cpp.read_text(), repr(cpp.read_text())
            assert '  int x = 1;' in cpp.read_text()
            assert '    result = ' in python.read_text(), repr(python.read_text())
            assert 'import math\nimport sys\n' in python.read_text()
            # The actual official checker must accept each formatted C/C++ fixture.
            run(['ament_uncrustify', cpp, c_file], environment, work)
            print('Actual formatter checks passed: Lyrical ament_uncrustify, Ubuntu uncrustify '
                  + versions[0] + ', autopep8 2.3.2; check/write/idempotence/exclusions verified.')
    finally:
        assert hashlib.sha256(status.read_bytes()).hexdigest() == original_status, 'OS package state changed'


if __name__ == '__main__':
    main()
