"""Apply the per-user GNOME Caps Lock mapping, with reversible settings."""
import ast
import os
import shutil

SCHEMA = 'org.gnome.desktop.input-sources'
KEY = 'xkb-options'
# Ubuntu 24.04 xkb-data 2.41: physical Caps (or model-specific AC00/AA00 alias).
# Keep unrelated Ctrl/Compose/group/LED options and caps:internal/shift types.
CAPS_OPTIONS = {
    'caps:capslock', 'caps:numlock', 'caps:shiftlock', 'caps:swapescape',
    'caps:escape', 'caps:escape_shifted_capslock', 'caps:escape_shifted_compose',
    'caps:backspace', 'caps:super', 'caps:hyper', 'caps:menu', 'caps:none',
    'caps:ctrl_modifier', 'ctrl:nocaps', 'ctrl:swapcaps', 'ctrl:swapcaps_hyper',
    'ctrl:hyper_capscontrol', 'ctrl:swapcaps_and_switch_layout',
    'ctrl:grouptoggle_capscontrol', 'ctrl:ac_ctrl', 'ctrl:aa_ctrl',
    'compose:caps', 'compose:caps-altgr', 'lv3:caps_switch',
    'lv3:caps_switch_latch', 'lv5:caps_switch', 'grp:caps_switch',
    'grp:caps_toggle', 'grp:shift_caps_toggle', 'grp:caps_select',
    'grp:shift_caps_switch', 'grp:alt_caps_toggle',
}


def require_session():
    if 'GNOME' not in os.environ.get('XDG_CURRENT_DESKTOP', '').upper() or not os.environ.get('DBUS_SESSION_BUS_ADDRESS'):
        raise ValueError('Run keyboard in a terminal inside your native GNOME desktop session.')
    if not shutil.which('gsettings'):
        raise ValueError('The GNOME keyboard module requires gsettings (libglib2.0-bin).')


def caps_as_ctrl(value):
    text = value.strip()
    if text.startswith('@as '):
        text = text[4:]
    options = ast.literal_eval(text)
    if not isinstance(options, list) or not all(isinstance(option, str) for option in options):
        raise ValueError('Unexpected GNOME xkb-options value; leave it unchanged.')
    kept = [option for option in options if option not in CAPS_OPTIONS]
    return repr(kept + ['ctrl:nocaps'])


def configure_keyboard(ctx):
    if ctx.platform != 'native':
        raise ValueError('Caps Lock mapping requires native GNOME; configure the Windows keyboard on WSL.')
    require_session()
    current = ctx.runner.capture(['gsettings', 'get', SCHEMA, KEY])
    ctx.backup.set_setting(SCHEMA, KEY, caps_as_ctrl(current), ctx.runner)
