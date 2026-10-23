"""Host detection, checked downloads and subprocess execution."""
import hashlib
import os
from pathlib import Path
import shlex
import subprocess
import urllib.request


def is_wsl() -> bool:
    """Recognize WSL even when a custom kernel omits Microsoft's release name.

    Environment variables can be absent in login/service contexts, so retain
    both kernel sources as fallbacks. Display/session variables are not WSL
    indicators: WSLg provides them without a native GNOME desktop.
    """
    if os.environ.get('WSL_DISTRO_NAME') or os.environ.get('WSL_INTEROP'):
        return True
    for name in ('/proc/sys/kernel/osrelease', '/proc/version'):
        try:
            if 'microsoft' in Path(name).read_text(encoding='utf-8').lower():
                return True
        except OSError:
            continue
    return False


class Runner:
    def __init__(self, log: Path):
        self.log = log

    def run(self, argv, env=None):
        argv = [str(arg) for arg in argv]
        print('\n  $ ' + shlex.join(argv), flush=True)
        process_env = os.environ.copy()
        if env:
            process_env.update({str(key): str(value) for key, value in env.items()})
        with self.log.open('a', encoding='utf-8') as output:
            output.write('\n$ ' + shlex.join(argv) + '\n')
            output.flush()
            with subprocess.Popen(argv, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
                                  encoding='utf-8', errors='replace', env=process_env) as process:
                for line in process.stdout:
                    print(line, end='', flush=True)
                    output.write(line)
                result = process.wait()
            if result:
                raise RuntimeError(f'Command failed ({result}): {shlex.join(argv)}\nLog: {self.log}')

    def capture(self, argv):
        return subprocess.check_output([str(arg) for arg in argv], text=True, encoding='utf-8').strip()

    def download(self, url: str, destination: Path, sha256: str):
        if not url.startswith('https://') or len(sha256) != 64:
            raise ValueError('Downloads require HTTPS and a SHA-256 digest.')
        print(f'  Download: {url}', flush=True)
        request = urllib.request.Request(url, headers={'User-Agent': 'dotfiles-installer/1'})
        with urllib.request.urlopen(request, timeout=60) as response, destination.open('wb') as output:
            digest = hashlib.sha256()
            while chunk := response.read(1024 * 1024):
                output.write(chunk)
                digest.update(chunk)
        if digest.hexdigest() != sha256:
            destination.unlink(missing_ok=True)
            raise RuntimeError(f'SHA-256 mismatch: {url}')
        with self.log.open('a', encoding='utf-8') as output:
            output.write(f'Download verified: {url} sha256={sha256}\n')
