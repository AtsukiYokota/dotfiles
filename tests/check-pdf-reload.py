#!/usr/bin/env python3
"""Verify real PDF redraws after consecutive TeX saves in a private Xvfb.

Requires latexmk, pLaTeX/dvipdfmx, Japanese TeX fonts, poppler-utils, zathura,
zathura-pdf-poppler, xvfb, xauth, imagemagick, python3-pil, and dbus-daemon. No host
desktop is accessed; compiler, viewer, X server, and D-Bus are private jobs.
"""
from __future__ import annotations

import hashlib
import io
import os
from pathlib import Path
import secrets
import select
import shutil
import signal
import subprocess
import sys
import tempfile
import time

from PIL import Image

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]


def alive(process, description):
    if process.poll() is not None:
        raise RuntimeError(f'{description} exited unexpectedly: {process.returncode}')


def read_line(fd, process, description, timeout=15):
    deadline = time.monotonic() + timeout
    value = bytearray()
    while time.monotonic() < deadline:
        alive(process, description)
        if select.select([fd], [], [], 0.2)[0]:
            item = os.read(fd, 1)
            if item == b'\n':
                return value.decode('ascii')
            if not item:
                raise RuntimeError(f'{description} closed its startup pipe')
            value.extend(item)
    raise TimeoutError(f'{description} did not start within {timeout}s')


def stop(process):
    if process is None:
        return
    # Every job was started in a new session. Only that job and its children
    # are terminated, including a TeX subprocess still running under latexmk.
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        process.wait(timeout=5)


def source_text(marker, width, height):
    return (r'\documentclass[a4paper,12pt]{jsarticle}' '\n'
            r'\pagestyle{empty}' '\n'
            r'\begin{document}' '\n'
            r'{\Huge ' + marker + r'}\par' '\n'
            r'{\Large 日本語とEnglishのライブプレビュー}\par' '\n'
            r'\vspace{10mm}' '\n'
            r'\noindent\rule{' + str(width) + 'mm}{' + str(height) + 'mm}\n'
            r'\end{document}' '\n')


def wait_pdf(pdf, marker, compiler, environment, timeout=90):
    deadline = time.monotonic() + timeout
    previous = None
    stable_since = time.monotonic()
    while time.monotonic() < deadline:
        alive(compiler, 'latexmk continuous compiler')
        if pdf.is_file():
            result = subprocess.run(['pdftotext', str(pdf), '-'], env=environment,
                                    capture_output=True, text=True, timeout=5)
            try:
                info = pdf.stat()
            except FileNotFoundError:
                # Some build pipelines replace the PDF after writing a new one.
                previous = None
                time.sleep(0.2)
                continue
            state = (info.st_size, info.st_mtime_ns)
            if result.returncode == 0 and marker in result.stdout and '日本語' in result.stdout:
                if state != previous:
                    stable_since = time.monotonic()
                    previous = state
                elif time.monotonic() - stable_since >= 0.8:
                    return
        time.sleep(0.2)
    raise TimeoutError(f'latexmk did not rebuild the bilingual PDF with {marker}')


def snapshot(environment):
    # ImageMagick handles X11 visual depth/scanline differences. Explicit
    # -display and private XAUTHORITY prevent any default-display capture.
    data = subprocess.check_output(['import', '-display', environment['DISPLAY'],
                                    '-window', 'root', '-depth', '8', 'png:-'],
                                   env=environment, stderr=subprocess.PIPE, timeout=5)
    # Test content is a fixed page plus an increasingly large black rectangle.
    # Sample its interior viewport, excluding most of the desktop/window border.
    # Requiring MORE dark pixels rejects a transient blank/loading page, while
    # the >500 increase also rules out a changed window title/status message.
    with Image.open(io.BytesIO(data)) as captured:
        if captured.size != (1000, 800):
            raise RuntimeError(f'Unexpected private Xvfb image size: {captured.size}')
        with captured.convert('RGB') as image:
            digest = hashlib.sha256(image.tobytes()).hexdigest()
            with image.crop((150, 20, 750, 650)) as region:
                with region.resize((300, 315), Image.Resampling.NEAREST) as sampled:
                    colors = list(sampled.getdata())
    dark = sum(max(rgb) < 96 for rgb in colors)
    white = sum(min(rgb) > 235 for rgb in colors)
    return digest, dark, white


def wait_frame(environment, viewer, xvfb, previous, initial=False, timeout=35):
    deadline = time.monotonic() + timeout
    last_digest = None
    stable_since = time.monotonic()
    while time.monotonic() < deadline:
        alive(viewer, 'the original Zathura viewer')
        alive(xvfb, 'private Xvfb')
        frame = snapshot(environment)
        changed = frame[0] != previous[0]
        content_ready = frame[2] > 10_000 and (initial or frame[1] > previous[1] + 500)
        if changed and content_ready:
            if frame[0] != last_digest:
                last_digest = frame[0]
                stable_since = time.monotonic()
            elif time.monotonic() - stable_since >= 1:
                return frame
        else:
            last_digest = None
            stable_since = time.monotonic()
        time.sleep(0.2)
    raise TimeoutError('Zathura did not automatically redraw the changed PDF content')


def run(root):
    home = root / 'home'
    runtime = root / 'runtime'
    project = root / 'project with spaces'
    for directory in (home, runtime, project):
        directory.mkdir(mode=0o700)
    shutil.copyfile(ROOT / '.latexmkrc', home / '.latexmkrc')
    config = home / '.config/zathura'
    config.mkdir(parents=True)
    # Leave filemonitor at its shipped default: this tests normal auto-reload.
    (config / 'zathurarc').write_text('set window-width 900\nset window-height 700\n'
                                    'set adjust-open best-fit\nset guioptions ""\n', encoding='utf-8')
    authority = root / 'Xauthority'
    authority.touch(mode=0o600)
    cookie = secrets.token_hex(16)
    # Xorg reads the cookie independently of the display number; add the actual
    # number for clients after -displayfd chooses an unused display atomically.
    subprocess.run(['xauth', '-f', str(authority), 'add', ':65535', '.', cookie],
                   check=True, capture_output=True, timeout=5)
    environment = dict(os.environ, HOME=str(home), XDG_CONFIG_HOME=str(home / '.config'),
                       XDG_DATA_HOME=str(home / '.local/share'), XDG_STATE_HOME=str(home / '.local/state'),
                       XDG_CACHE_HOME=str(home / '.cache'), XDG_RUNTIME_DIR=str(runtime),
                       XAUTHORITY=str(authority), WAYLAND_DISPLAY='', GDK_BACKEND='x11',
                       GTK_USE_PORTAL='0', NO_AT_BRIDGE='1', GSETTINGS_BACKEND='memory',
                       DISPLAY='', DBUS_SESSION_BUS_ADDRESS='')
    xvfb = bus = compiler = viewer = None
    read_fd, write_fd = os.pipe()
    try:
        with (root / 'xvfb.log').open('wb') as log:
            xvfb = subprocess.Popen(['Xvfb', '-displayfd', str(write_fd), '-screen', '0', '1000x800x24',
                                     '-nolisten', 'tcp', '-noreset', '-auth', str(authority)],
                                    pass_fds=(write_fd,), env=environment, stdin=subprocess.DEVNULL,
                                    stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
        os.close(write_fd)
        write_fd = None
        number = read_line(read_fd, xvfb, 'private Xvfb')
        if not number.isdigit():
            raise RuntimeError(f'Invalid private Xvfb display: {number!r}')
        environment['DISPLAY'] = ':' + number
        subprocess.run(['xauth', '-f', str(authority), 'add', environment['DISPLAY'], '.', cookie],
                       check=True, capture_output=True, timeout=5)
        with (root / 'dbus.log').open('wb') as log:
            bus = subprocess.Popen(['dbus-daemon', '--session', '--nofork', '--print-address=1'],
                                   env=environment, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                                   stderr=log, start_new_session=True)
        environment['DBUS_SESSION_BUS_ADDRESS'] = read_line(bus.stdout.fileno(), bus, 'private D-Bus')
        source = project / 'main.tex'
        pdf = source.with_suffix('.pdf')
        source.write_text(source_text('FIRST', 35, 15), encoding='utf-8')
        with (root / 'latexmk.log').open('wb') as log:
            compiler = subprocess.Popen(['latexmk', '-pvc', '-view=none', '-pdfdvi',
                                         '-interaction=nonstopmode', '-file-line-error', source.name],
                                        cwd=project, env=environment, stdin=subprocess.DEVNULL,
                                        stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
        wait_pdf(pdf, 'FIRST', compiler, environment)
        blank = snapshot(environment)
        with (root / 'zathura.log').open('wb') as log:
            viewer = subprocess.Popen(['zathura', str(pdf)], env=environment, stdin=subprocess.DEVNULL,
                                      stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
        viewer_pid = viewer.pid
        frame = wait_frame(environment, viewer, xvfb, blank, initial=True)
        print(f'Zathura displayed the initial bilingual PDF (PID {viewer_pid}).', flush=True)
        for marker, width, height in (('SECOND', 90, 25), ('THIRD', 135, 35)):
            # A real file save is the only trigger: no viewer command/signal,
            # simulated reload key, PDF reopen, or new viewer is issued.
            source.write_text(source_text(marker, width, height), encoding='utf-8')
            wait_pdf(pdf, marker, compiler, environment)
            updated = wait_frame(environment, viewer, xvfb, frame)
            assert viewer.pid == viewer_pid and viewer.poll() is None
            assert compiler.poll() is None
            print(f'{marker}: same viewer redrew automatically after save '
                  f'(dark content samples {frame[1]} -> {updated[1]}).', flush=True)
            frame = updated
    finally:
        if write_fd is not None:
            os.close(write_fd)
        os.close(read_fd)
        for process in (viewer, compiler, bus, xvfb):
            stop(process)
        if bus is not None and bus.stdout is not None:
            bus.stdout.close()


def main():
    if sys.platform != 'linux':
        raise RuntimeError('Run the actual PDF redraw test under Linux.')
    for command in ('latexmk', 'platex', 'dvipdfmx', 'pdftotext', 'zathura', 'Xvfb', 'xauth', 'import', 'dbus-daemon'):
        if not shutil.which(command):
            raise RuntimeError(f'Missing test dependency: {command}')
    with tempfile.TemporaryDirectory(prefix='dotfiles-pdf-reload-') as temporary:
        root = Path(temporary)
        try:
            run(root)
        except Exception:
            for name in ('latexmk.log', 'zathura.log', 'xvfb.log', 'dbus.log'):
                path = root / name
                if path.exists():
                    print(f'{name}:\n{path.read_text(errors="replace")[-10000:]}', file=sys.stderr)
            raise
    print('Real PDF live preview passed: continuous pLaTeX compilation and two automatic Zathura redraws.')


if __name__ == '__main__':
    main()
