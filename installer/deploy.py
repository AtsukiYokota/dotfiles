"""Backed-up, explicit configuration deployment and conflict-aware restoration."""
import hashlib
import json
import os
import re
from pathlib import Path
import shutil
import subprocess


def fingerprint(path: Path):
    if path.is_symlink():
        return {'kind': 'link', 'target': os.readlink(path)}
    if path.is_file():
        return {'kind': 'file', 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
    if path.exists():
        return {'kind': 'directory'}
    return None


class Backup:
    def __init__(self, directory: Path, home: Path):
        self.directory = directory
        self.home = home.resolve()
        self.entries: list[dict] = []
        self.directory.mkdir(parents=True, exist_ok=False, mode=0o700)
        self.save()

    def save(self):
        manifest = self.directory / 'manifest.json'
        temporary = self.directory / 'manifest.tmp'
        temporary.write_text(json.dumps({'version': 1, 'home': str(self.home), 'entries': self.entries}, indent=2) + '\n', encoding='utf-8')
        temporary.replace(manifest)

    def _protect(self, path: Path):
        # Resolve parent symlinks, but preserve the final symlink itself for backup.
        parent = path.parent.resolve()
        if not parent.is_relative_to(self.home):
            raise ValueError(f'Refusing to deploy outside home (including symlinked parents): {path}')
        if any(entry.get('path') == str(path) for entry in self.entries):
            raise ValueError(f'Duplicate deployment target: {path}')
        entry = {'kind': 'path', 'path': str(path), 'backup': None, 'installed': None}
        current = fingerprint(path)
        if current is not None:
            saved = self.directory / f'{len(self.entries):04d}'
            entry['backup'] = saved.name
            # Write intent before moving, so failed installs remain recoverable.
            entry['original'] = current
            self.entries.append(entry)
            self.save()
            shutil.move(str(path), str(saved))
        else:
            self.entries.append(entry)
            self.save()
        path.parent.mkdir(parents=True, exist_ok=True)
        return entry

    def link(self, source: Path, target: Path):
        source = source.resolve(strict=True)
        target = target.absolute()
        if target.is_symlink() and target.resolve() == source:
            return
        entry = self._protect(target)
        target.symlink_to(source, target_is_directory=source.is_dir())
        entry['installed'] = fingerprint(target)
        self.save()

    def write_text(self, target: Path, content: str):
        target = target.absolute()
        if target.is_file() and not target.is_symlink() and target.read_text(encoding='utf-8') == content:
            return
        mode = target.stat().st_mode & 0o777 if target.is_file() else 0o600
        entry = self._protect(target)
        target.write_text(content, encoding='utf-8', newline='\n')
        target.chmod(mode)
        entry['installed'] = fingerprint(target)
        self.save()

    def retire(self, target: Path):
        """Move an existing obsolete path into this backup without replacing it."""
        target = target.absolute()
        if fingerprint(target) is None:
            return False
        # _protect records the original before moving it; installed=None already
        # describes the absent target and lets restore detect a recreated path.
        self._protect(target)
        return True

    def set_setting(self, schema: str, key: str, value: str, runner):
        old = runner.capture(['gsettings', 'get', schema, key]).strip()
        if old == value:
            return
        entry = {'kind': 'gsettings', 'schema': schema, 'key': key, 'original': old, 'installed': value}
        self.entries.append(entry)
        self.save()
        runner.run(['gsettings', 'set', schema, key, value])


def restore(directory: Path, home: Path):
    directory = directory.resolve(strict=True)
    manifest = json.loads((directory / 'manifest.json').read_text(encoding='utf-8'))
    home = home.resolve()
    if manifest.get('version') != 1 or manifest.get('home') != str(home):
        raise ValueError('Backup does not belong to this home or has an unsupported format.')
    entries = manifest['entries']
    # Check all conflicts before changing anything. Never discard edits made after installation.
    for entry in entries:
        if entry['kind'] == 'gsettings':
            current = subprocess.check_output(['gsettings', 'get', entry['schema'], entry['key']], text=True).strip()
            if current not in (entry['installed'], entry['original']):
                raise ValueError(f'Setting changed since installation: {entry["schema"]} {entry["key"]}')
            continue
        path = Path(entry['path'])
        if not path.is_absolute() or not path.parent.resolve().is_relative_to(home):
            raise ValueError(f'Invalid backup target: {path}')
        saved_name = entry.get('backup')
        saved = directory / saved_name if saved_name else None
        if saved is not None and (saved.parent != directory or not re.fullmatch(r'\d{4,}', saved_name)):
            raise ValueError('Invalid backup entry.')
        if entry.get('restored'):
            continue
        if saved is not None and not (saved.exists() or saved.is_symlink()):
            # Interrupted before the original move is safe if the original is still in place.
            if fingerprint(path) == entry.get('original'):
                continue
            raise ValueError(f'Missing backup: {saved}')
        if fingerprint(path) not in (entry.get('installed'), None):
            raise ValueError(f'File changed since installation; preserve it before restoring: {path}')
    for entry in reversed(entries):
        if entry.get('restored'):
            continue
        if entry['kind'] == 'gsettings':
            subprocess.run(['gsettings', 'set', entry['schema'], entry['key'], entry['original']], check=True)
        else:
            path = Path(entry['path'])
            saved = directory / entry['backup'] if entry.get('backup') else None
            if saved is not None and not (saved.exists() or saved.is_symlink()):
                entry['restored'] = True
                continue
            if path.exists() or path.is_symlink():
                if path.is_dir() and not path.is_symlink():
                    raise ValueError(f'Refusing to remove directory created after installation: {path}')
                path.unlink()
            if saved is not None:
                shutil.move(str(saved), str(path))
        entry['restored'] = True
        (directory / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
