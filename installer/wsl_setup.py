"""Reviewed WSL interoperability setup and manual restart/resume guidance."""
from __future__ import annotations

import difflib
import json
from pathlib import Path
import shlex
import shutil

from wsl_interop import fingerprint, patch_config, read_config

CONFIG_PATH = Path('/etc/wsl.conf')


def configuration_plan(show_diff=False):
    original = read_config(CONFIG_PATH)
    desired = patch_config(original or b'')
    changed = desired != original
    item = {'path': str(CONFIG_PATH), 'kind': 'system',
            'status': ('NEW' if original is None else 'UPDATE') if changed else 'CURRENT',
            'changed': changed, 'expected_sha256': fingerprint(original), 'diff': [],
            'note': 'WSL interop enabled=true, appendWindowsPath=true; preserve other settings. '
                    'Changed system configuration uses sudo and a separate /etc backup; restart WSL before Windows font setup.'}
    if changed and show_diff:
        from planning import redact
        lines = list(difflib.unified_diff(redact((original or b'').decode('utf-8-sig')).splitlines(),
                                          redact(desired.decode('utf-8-sig')).splitlines(),
                                          fromfile='current /etc/wsl.conf', tofile='planned /etc/wsl.conf',
                                          lineterm='', n=2))
        item['diff'] = lines[:80]
        if len(lines) > 80:
            item['diff'].append('... diff truncated after 80 lines ...')
    return item


def ensure_interop(ctx):
    """Called only after confirmation and verified Linux font installation."""
    if ctx.platform != 'wsl':
        return True
    plan = getattr(ctx, 'wsl_interop_plan', None) or configuration_plan()
    if fingerprint(read_config(CONFIG_PATH)) != plan['expected_sha256']:
        raise RuntimeError('/etc/wsl.conf changed after the preview. Rerun the installer to review the new settings.')
    if not plan['changed']:
        return True
    if not shutil.which('sudo'):
        raise RuntimeError('sudo is required to enable Windows interoperability in /etc/wsl.conf.')
    print('  Enabling Windows interoperability in /etc/wsl.conf (sudo; existing settings preserved).')
    command = ['sudo', '/usr/bin/python3', '-I', '-B', str(ctx.repo / 'installer/wsl_interop.py'),
               '--apply', '--expected-sha256', plan['expected_sha256']]
    result = json.loads(ctx.runner.capture(command))
    if not isinstance(result, dict) or type(result.get('changed')) is not bool:
        raise RuntimeError('Unexpected WSL configuration helper response.')
    if result['changed']:
        ctx.wsl_restart_required = True
        ctx.wsl_windows_pending = True
        (ctx.backup.directory / 'wsl-interop.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
        if result.get('backup'):
            print('  Original WSL configuration backup: ' + result['backup'])
        print('  WSL restart required. Ubuntu setup continues; Windows font setup is deferred until restart.')
        return False
    return True


def report_pending(ctx, *, installation_complete):
    if not getattr(ctx, 'wsl_windows_pending', False):
        return
    print('\nWindows Nerd Font setup is pending.')
    print('  Save work in all WSL distributions: restarting stops their programs and tmux sessions.')
    print('  In a Windows PowerShell tab, run: wsl --shutdown')
    print('  Then open this Ubuntu profile in a new Windows Terminal tab, close its Settings tab, and run:')
    print('    cd ' + shlex.quote(str(ctx.repo)))
    if installation_complete:
        print('    bash setup_all.sh --modules fonts --configs-only')
    else:
        # A failed full installation can still need packages or plugin bootstrap.
        command = 'bash setup_all.sh --modules ' + shlex.quote(','.join(ctx.modules))
        if getattr(ctx, 'configs_only', False):
            command += ' --configs-only'
        if getattr(ctx, 'no_plugins', False):
            command += ' --no-plugins'
        print('    ' + command)
    print('  After font registration, close and reopen all Windows Terminal windows.')
