"""Dependency-free interactive checklist, with a plain terminal fallback."""
import os
import sys
from catalog import MODULES, defaults_for, available, resolve


def choose(platform: str, arch: str, plain: bool = False) -> set[str]:
    choices = [name for name in MODULES if available(name, platform, arch)]
    selected = defaults_for(platform, arch).intersection(choices)
    if not plain and sys.stdin.isatty() and os.environ.get('TERM', 'dumb') != 'dumb':
        try:
            import curses
            return curses.wrapper(_checklist, choices, selected, platform, arch)
        except ImportError:
            print('Using the plain checklist for this terminal.')
        except curses.error:
            print('Using the plain checklist for this terminal.')
    while True:
        print(f'\nDOTFILES / Ubuntu 24.04 / {platform} / {arch}\n')
        for index, name in enumerate(choices, 1):
            module = MODULES[name]
            marker = 'x' if name in selected else ' '
            print(f' {index:2}. [{marker}] {module.title:<24} {module.description}')
        answer = input('\nToggle numbers (e.g. 6 9), a=all, n=none, Enter=review, q=cancel: ').strip()
        if answer.lower() == 'q':
            raise KeyboardInterrupt
        if not answer:
            if selected:
                resolve(selected, platform, arch)
                return selected
            print('Select at least one module.')
            continue
        if answer.lower() in ('a', 'n'):
            selected = set(choices) if answer.lower() == 'a' else set()
            continue
        try:
            indexes = [int(token) for token in answer.split()]
            if any(index < 1 or index > len(choices) for index in indexes):
                raise ValueError
        except ValueError:
            print('Enter module numbers from the list.')
            continue
        for index in indexes:
            selected.symmetric_difference_update({choices[index - 1]})


def _checklist(screen, choices, selected, platform, arch):
    import curses
    curses.curs_set(0)
    if curses.has_colors():
        curses.start_color()
        curses.use_default_colors()
        curses.init_pair(1, curses.COLOR_CYAN, -1)
    cursor = 0
    message = ''

    def line(y, x, text, attr=0):
        height, width = screen.getmaxyx()
        if 0 <= y < height - 1 and x < width - 1:
            screen.addnstr(y, x, text, max(0, width - x - 1), attr)

    while True:
        screen.erase()
        height, _ = screen.getmaxyx()
        if height < 12:
            raise curses.error('Terminal too small')
        line(1, 2, f'DOTFILES   Ubuntu 24.04   {platform} / {arch}', curses.A_BOLD)
        line(3, 2, 'Up/Down: move   Space: toggle   Enter: review   q: cancel')
        visible = height - 10
        top = max(0, cursor - visible + 1)
        for row, name in enumerate(choices[top:top + visible], 5):
            index = top + row - 5
            marker = '[x]' if name in selected else '[ ]'
            attr = curses.A_REVERSE if index == cursor else 0
            line(row, 2, f'{marker} {MODULES[name].title}', attr)
        line(height - 4, 2, MODULES[choices[cursor]].description)
        line(height - 3, 2, message or 'Dependencies are added automatically. Nothing is installed yet.')
        screen.refresh()
        key = screen.getch()
        if key in (ord('q'), 27):
            raise KeyboardInterrupt
        if key in (curses.KEY_DOWN, ord('j')):
            cursor = (cursor + 1) % len(choices)
        elif key in (curses.KEY_UP, ord('k')):
            cursor = (cursor - 1) % len(choices)
        elif key == ord(' '):
            selected.symmetric_difference_update({choices[cursor]})
        elif key in (10, 13, curses.KEY_ENTER):
            if selected:
                return selected
            message = 'Select at least one module.'
