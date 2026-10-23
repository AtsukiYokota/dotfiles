"""C++ completion checks; optional portable clangd for an unmodified Ubuntu host."""
import os
import platform
import shlex
import shutil
import subprocess


def prepare_clangd(root, env):
    """Use Ubuntu clangd or extract its signed-APT packages inside the test tree."""
    if shutil.which('clangd', path=env['PATH']):
        return
    release = platform.freedesktop_os_release()
    if release.get('ID') != 'ubuntu' or release.get('VERSION_ID') != '24.04':
        raise RuntimeError('Install clangd to run this test outside Ubuntu 24.04.')
    work = root / 'clangd-packages'
    work.mkdir()
    extracted = work / 'root'
    packages = ('clangd-18', 'libclang-common-18-dev', 'libclang-cpp18', 'libllvm18',
                'libabsl20220623t64', 'libgrpc++1.51t64', 'libgrpc29t64',
                'libprotobuf32t64', 'libprotoc32t64', 'libcares2', 'libre2-10')
    specs = []
    for package in packages:
        rows = subprocess.check_output(['apt-cache', 'madison', package], text=True).splitlines()
        versions = [row.split('|')[1].strip() for row in rows
                    if len(row.split('|')) == 3 and ' noble/' in row.split('|')[2]]
        if not versions:
            raise RuntimeError('The local APT index has no base Noble entry for ' + package)
        specs.append(package + '=' + versions[0])
    # Downloads are verified against local signed APT metadata; no apt update,
    # installation, sudo or changes to the host's package database are made.
    subprocess.run(['apt-get', 'download', *specs], cwd=work, check=True, timeout=180)
    for package in work.glob('*.deb'):
        subprocess.run(['dpkg-deb', '--extract', str(package), str(extracted)], check=True)
    triplet = {'x86_64': 'x86_64-linux-gnu', 'aarch64': 'aarch64-linux-gnu'}[platform.machine()]
    binary = extracted / 'usr/lib/llvm-18/bin/clangd'
    lib = extracted / 'usr/lib' / triplet
    resources = extracted / 'usr/lib/llvm-18/lib/clang/18'
    tools = work / 'bin'
    tools.mkdir()
    wrapper = tools / 'clangd'
    wrapper.write_text('#!/bin/sh\nexport LD_LIBRARY_PATH=' + shlex.quote(str(lib)) + '\nexec '
                       + shlex.quote(str(binary)) + ' --resource-dir=' + shlex.quote(str(resources)) + ' "$@"\n')
    wrapper.chmod(0o755)
    env['PATH'] = str(tools) + os.pathsep + env['PATH']
    subprocess.run([str(wrapper), '--version'], env=env, check=True, timeout=15)


def check_cpp_completion(editor, project):
    source = project / 'completion_probe.cpp'
    source.write_text('struct Probe { int dotfiles_cpp_member; };\nint main() {\n'
                      '  Probe probe{};\n  int dotfiles_cpp_value = 42;\n  \n}\n')
    editor.open(source, 'clangd')
    editor.execute('vim.api.nvim_win_set_cursor(0, {5, 0})')
    editor.keys(b'Adotfiles_cpp_v')
    editor.menu('dotfiles_cpp_value')
    editor.keys(b'\t\r')
    editor.wait(lambda: editor.query('vim.trim(vim.api.nvim_get_current_line())') == 'dotfiles_cpp_value',
                'C++ identifier completion acceptance')
    editor.open(source, 'clangd')
    editor.execute('vim.api.nvim_win_set_cursor(0, {5, 0})')
    editor.keys(b'Aprobe.dotfiles_cpp_m')
    editor.menu('dotfiles_cpp_member')
    print('  C++ identifier and member autocompletion + Tab + Enter passed.', flush=True)
