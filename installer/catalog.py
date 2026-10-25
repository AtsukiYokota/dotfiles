"""Selectable modules and their Ubuntu 26.04 package dependencies."""
from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Module:
    title: str
    description: str
    packages: tuple[str, ...] = ()
    depends: tuple[str, ...] = ()
    native_only: bool = False
    amd64_only: bool = False


BASE_PACKAGES = ('ca-certificates', 'curl', 'git', 'unzip', 'xz-utils')
MODULES = {
    'fonts': Module('Nerd Font + terminal font', 'JetBrainsMono Nerd Font Mono; configure Ptyxis/GNOME Terminal or the active WSL Windows Terminal profile',
                    ('fontconfig',)),
    'shell': Module('Shell + tmux', 'Bash, Starship prompt, tmux, clipboard and familiar shortcuts',
                    ('bash-completion', 'tmux', 'ripgrep', 'fzf', 'tree', 'ncdu', 'jq', 'openssh-client', 'wl-clipboard', 'xsel'), ('fonts',)),
    'file-tools': Module('File search + source preview', 'fd file search and bat with Gruvbox syntax highlighting', ('less',), ('shell',)),
    'zoxide': Module('Smart directory navigation', 'z / zi jump to frequently used directories; keep cd unchanged', (), ('shell',)),
    'atuin': Module('Searchable shell history', 'Local history database and Ctrl+R search; retain ordinary arrow keys', (), ('shell',)),
    'just': Module('Project task commands', 'just recipes and an opt-in ROS workspace justfile template', (), ('shell',)),
    'git-tools': Module('Git UI + readable diffs', 'lazygit and delta; preserve personal Git identity and credentials', ('less',), ('shell',)),
    'direnv': Module('Per-project environment', 'Load explicitly approved .envrc files and unload on leaving a project', (), ('shell',)),
    'cpp': Module('C / C++', 'Ubuntu-supported compiler, CMake, clangd and formatting',
                  ('build-essential', 'cmake', 'ninja-build', 'gdb', 'clang', 'clangd', 'clang-format', 'pkg-config', 'universal-ctags')),
    'python': Module('Python tools', 'uv + isolated CMake language server, autopep8 and Ruff; basedpyright on verified Node',
                     ('python3-dev', 'python3-venv'), ('node',)),
    'neovim': Module('Neovim + lazy.nvim', 'Pinned stable Neovim; retain existing editing keys and settings',
                     ('xdg-utils', 'lsof'), ('shell', 'cpp', 'python', 'node')),
    'ros2': Module('ROS 2 Lyrical', 'ROS base, colcon, rosdep, vcstool; no ROS 1',
                   ('software-properties-common', 'gnupg', 'locales', 'ros-lyrical-ament-uncrustify',
                    'ros-lyrical-ament-flake8', 'ros-lyrical-ament-pep257', 'ros-lyrical-ament-cpplint'), ('shell', 'cpp', 'python')),
    'ros-desktop': Module('ROS visualization', 'RViz, demos and tutorials (native desktop or WSLg)',
                          (), ('ros2',)),
    'rust': Module('Rust', 'Pinned stable toolchain, rustfmt, Clippy and rust-analyzer',
                   (), ('shell', 'cpp')),
    'node': Module('Node.js LTS + language servers', 'Node 24 LTS, Bash/JSON/YAML/HTML/CSS/TypeScript language servers; installed per user', (), ('shell',)),
    'latex': Module('Japanese LaTeX + live preview', 'pLaTeX/upLaTeX/LuaLaTeX, latexmk, Texlab and Zathura PDF live preview (desktop or WSLg)',
                    ('latexmk', 'texlive-lang-japanese', 'texlive-latex-extra', 'texlive-fonts-recommended', 'texlive-luatex', 'texlive-extra-utils', 'biber', 'zathura', 'zathura-pdf-poppler'), ('shell',)),
    'diagrams': Module('Diagrams + live preview', 'PlantUML, Graphviz, Japanese fonts and feh live preview (desktop or WSLg)',
                       ('graphviz', 'openjdk-21-jre-headless', 'fonts-noto-cjk', 'python3-pil', 'feh'), ('shell',)),
    'desktop': Module('Desktop applications', 'Inkscape, VLC, GNOME Tweaks and fonts',
                      ('inkscape', 'vlc', 'gnome-tweaks', 'fonts-noto-cjk', 'fonts-firacode'), native_only=True),
    'launcher': Module('Spotlight-style launcher', 'Albert application search with Ctrl+Space; native GNOME, X11 or Wayland via XWayland',
                       ('libglib2.0-bin', 'xwayland'), native_only=True),
    'screen-capture': Module('Screen recording + screenshots', 'Kooha for audio/video recording; GNOME Print for screenshots; native GNOME only',
                             ('flatpak', 'pipewire', 'gstreamer1.0-pipewire', 'xdg-desktop-portal', 'xdg-desktop-portal-gnome'), native_only=True),
    'dropbox': Module('Dropbox sync', 'Official Linux client; choose your account and sync folder after installation',
                      ('python3-gpg',), native_only=True, amd64_only=True),
    'onedrive': Module('OneDrive sync', 'Community OneDrive client; private manual login and folder selection',
                       ('gnupg', 'systemd'), native_only=True),
    'google-drive': Module('Google Drive sync', 'Verified rclone; manual OAuth and folder selection, scheduled bidirectional file sync',
                           ('systemd',), native_only=True),
    'slack': Module('Slack', 'Official stable Snap; sign in from the application after installation',
                    ('snapd',), native_only=True, amd64_only=True),
    'obsidian': Module('Obsidian', 'Official stable Snap (classic); choose a local vault or sign in yourself',
                       ('snapd',), native_only=True, amd64_only=True),
    'teams-for-linux': Module('Teams for Linux', 'Unofficial Teams desktop client, stable Snap; manual sign-in',
                              ('snapd', 'xdg-desktop-portal', 'xdg-desktop-portal-gnome'), native_only=True),
    'keyboard': Module('Caps Lock -> Ctrl', 'GNOME keyboard mapping; preserve other XKB options and back up changes',
                       ('libglib2.0-bin',), native_only=True),
    'japanese-input': Module('Japanese input (Mozc)', 'Fcitx 5 + Mozc; right Alt / Henkan enable, left Alt / Muhenkan disable; keep the desktop language',
                              ('fcitx5', 'fcitx5-mozc', 'fcitx5-config-qt', 'mozc-utils-gui',
                               'fcitx5-frontend-gtk2', 'fcitx5-frontend-gtk3', 'fcitx5-frontend-gtk4',
                               'fcitx5-frontend-qt5', 'fcitx5-frontend-qt6', 'im-config',
                               'fonts-noto-cjk', 'libglib2.0-bin'), native_only=True),
    'vscode': Module('VS Code', 'Linux VS Code through the official Snap (Windows app is recommended on WSL)',
                     ('snapd',), native_only=True),
    'chrome': Module('Google Chrome', 'Google signed APT repository; amd64 only',
                     ('gnupg',), native_only=True, amd64_only=True),
    'ibis-office': Module('ibisOffice', 'Office suite and application launcher; native Ubuntu amd64 only',
                          ('libxcb1', 'libxkbcommon0', 'libxkbcommon-x11-0', 'libegl1',
                           'libvulkan1', 'mesa-vulkan-drivers', 'libwayland-client0', 'libwayland-egl1',
                           'xdg-utils', 'desktop-file-utils', 'fonts-noto-cjk'), native_only=True, amd64_only=True),
    'macos-theme': Module('macOS appearance', 'WhiteSur GTK theme, icons, cursors, Big Sur-style wallpaper and auto-hiding Ubuntu Dock; reversible',
                          ('sassc', 'libglib2.0-dev-bin', 'libxml2-utils', 'libgtk-3-bin', 'gtk2-engines-murrine'), native_only=True),
    'ssh-server': Module('SSH server', 'Enable inbound SSH through the Ubuntu service; optional',
                         ('openssh-server',)),
}
DEFAULTS = {'shell', 'cpp', 'python', 'neovim', 'ros2'}


def defaults_for(platform: str, arch: str) -> set[str]:
    selected = {name for name in DEFAULTS if available(name, platform, arch)}
    if platform == 'native' and 'GNOME' in os.environ.get('XDG_CURRENT_DESKTOP', '').upper() and os.environ.get('DBUS_SESSION_BUS_ADDRESS'):
        selected.add('keyboard')
    return selected


def available(module_id: str, platform: str, arch: str) -> bool:
    module = MODULES[module_id]
    return not ((module.native_only and platform == 'wsl') or (module.amd64_only and arch != 'amd64'))


def resolve(selected: set[str], platform: str, arch: str) -> list[str]:
    unknown = selected - MODULES.keys()
    if unknown:
        raise ValueError('Unknown modules: ' + ', '.join(sorted(unknown)))
    if not selected:
        raise ValueError('Select at least one module.')
    result: list[str] = []

    def visit(name: str):
        if name in result:
            return
        if not available(name, platform, arch):
            raise ValueError(f'{name} is not available on {platform}/{arch}.')
        for dependency in MODULES[name].depends:
            visit(dependency)
        result.append(name)

    for name in MODULES:
        if name in selected:
            visit(name)
    return result


def packages_for(modules: list[str]) -> list[str]:
    return sorted(set(BASE_PACKAGES).union(*(MODULES[name].packages for name in modules)))
