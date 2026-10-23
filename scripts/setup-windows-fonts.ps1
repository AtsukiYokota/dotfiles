# Called by the Ubuntu installer only after the user accepts the reviewed plan.
# Font files are installed per user; no administrator rights are needed.
[CmdletBinding()]
param(
    [ValidateSet('Inspect', 'InstallFonts', 'WriteSettings', 'RestoreSettings')]
    [string]$Action = 'Inspect',
    [string]$FontDirectory,
    [string]$SettingsPath,
    [string]$ContentPath,
    [string]$ExpectedSha256,
    [string]$ManifestPath
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$Utf8 = [System.Text.UTF8Encoding]::new($false)

function Get-TerminalSettingsPaths {
    $relative = @(
        'Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json',
        'Packages\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\LocalState\settings.json',
        'Microsoft\Windows Terminal\settings.json'
    )
    foreach ($item in $relative) {
        $candidate = Join-Path $env:LOCALAPPDATA $item
        if (Test-Path -LiteralPath $candidate -PathType Leaf) {
            (Get-Item -LiteralPath $candidate).FullName
        }
    }
}

function Assert-TerminalSettingsPath([string]$Path) {
    $resolved = [System.IO.Path]::GetFullPath($Path)
    if (@(Get-TerminalSettingsPaths) -notcontains $resolved) {
        throw 'Refusing to modify a file outside the known Windows Terminal settings paths.'
    }
    $item = Get-Item -LiteralPath $resolved
    if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
        throw 'Refusing a symlinked Windows Terminal settings file.'
    }
    return $resolved
}

function Set-FileAtomically([string]$Path, [byte[]]$Bytes) {
    $temporary = Join-Path ([System.IO.Path]::GetDirectoryName($Path)) ('.dotfiles-' + [Guid]::NewGuid().ToString('N') + '.tmp')
    try {
        [System.IO.File]::WriteAllBytes($temporary, $Bytes)
        [System.IO.File]::Replace($temporary, $Path, [System.Management.Automation.Language.NullString]::Value)
    } finally {
        if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary }
    }
}

function Initialize-FontRegistry([string]$RegistryPath) {
    # New-Item -Force empties an existing registry key, including registrations
    # for unrelated fonts. Create only an absent key, without Force.
    if (-not (Test-Path -LiteralPath $RegistryPath)) {
        New-Item -Path $RegistryPath | Out-Null
    }
}

if ($Action -eq 'Inspect') {
    @{ settings = @(Get-TerminalSettingsPaths) } | ConvertTo-Json -Compress
    exit 0
}

if ($Action -eq 'InstallFonts') {
    $source = (Resolve-Path -LiteralPath $FontDirectory).Path
    $destination = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Fonts'
    [System.IO.Directory]::CreateDirectory($destination) | Out-Null
    if ((Get-Item -LiteralPath $destination).Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
        throw 'Refusing a redirected Windows font directory.'
    }
    $registry = 'HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts'
    Initialize-FontRegistry $registry
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class DotfilesFontNative {
    [DllImport("gdi32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern int AddFontResourceEx(string name, uint flags, IntPtr reserved);
    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern IntPtr SendMessageTimeout(IntPtr handle, uint message, IntPtr wParam,
        IntPtr lParam, uint flags, uint timeout, out IntPtr result);
}
'@
    foreach ($style in @('Regular', 'Bold', 'Italic', 'BoldItalic')) {
        $filename = 'JetBrainsMonoNerdFontMono-' + $style + '.ttf'
        $font = Join-Path $source $filename
        if (-not (Test-Path -LiteralPath $font -PathType Leaf)) { throw "Missing font: $font" }
        $target = Join-Path $destination $filename
        if (Test-Path -LiteralPath $target) {
            if ((Get-Item -LiteralPath $target).Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
                throw "Refusing a symlinked font: $target"
            }
            if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $font -Algorithm SHA256).Hash) {
                # Existing user-installed files must remain available on upgrades.
                $saved = $target + '.dotfiles-backup-' + [Guid]::NewGuid().ToString('N')
                Copy-Item -LiteralPath $target -Destination $saved
                Copy-Item -LiteralPath $font -Destination $target -Force
            }
        } else {
            Copy-Item -LiteralPath $font -Destination $target
        }
        $name = 'JetBrainsMono NFM ' + ($style -replace 'BoldItalic', 'Bold Italic') + ' (TrueType)'
        New-ItemProperty -LiteralPath $registry -Name $name -Value $target -PropertyType String -Force | Out-Null
        if ([DotfilesFontNative]::AddFontResourceEx($target, 0, [IntPtr]::Zero) -eq 0) {
            throw "Windows could not register the font: $target"
        }
    }
    Copy-Item -LiteralPath (Join-Path $source 'OFL.txt') -Destination (Join-Path $destination 'JetBrainsMonoNerdFont-OFL.txt') -Force
    $result = [IntPtr]::Zero
    [DotfilesFontNative]::SendMessageTimeout([IntPtr]0xffff, 0x001d, [IntPtr]::Zero,
        [IntPtr]::Zero, 2, 1000, [ref]$result) | Out-Null
    Write-Output 'JetBrainsMono NFM installed for the current Windows user.'
    exit 0
}

if ($Action -eq 'WriteSettings') {
    $target = Assert-TerminalSettingsPath $SettingsPath
    if ($ExpectedSha256 -notmatch '^[a-fA-F0-9]{64}$' -or
        (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash -ne $ExpectedSha256) {
        throw 'Windows Terminal settings changed during installation. Retry after closing its Settings tab.'
    }
    $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $ContentPath).Path)
    $backups = Join-Path $env:LOCALAPPDATA ('dotfiles\backups\' + [Guid]::NewGuid().ToString('N'))
    [System.IO.Directory]::CreateDirectory($backups) | Out-Null
    $original = Join-Path $backups 'settings.json'
    Copy-Item -LiteralPath $target -Destination $original
    $algorithm = [System.Security.Cryptography.SHA256]::Create()
    try { $hash = [BitConverter]::ToString($algorithm.ComputeHash($bytes)).Replace('-', '').ToLowerInvariant() }
    finally { $algorithm.Dispose() }
    $manifest = @{ version = 1; path = $target; originalSha256 = $ExpectedSha256; installedSha256 = $hash }
    $manifestFile = Join-Path $backups 'manifest.json'
    [System.IO.File]::WriteAllText($manifestFile, ($manifest | ConvertTo-Json), $Utf8)
    Set-FileAtomically $target $bytes
    Write-Output $manifestFile
    exit 0
}

if ($Action -eq 'RestoreSettings') {
    $manifestFile = (Resolve-Path -LiteralPath $ManifestPath).Path
    $backupRoot = [System.IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'dotfiles\backups')) + '\'
    if (-not $manifestFile.StartsWith($backupRoot, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'The backup manifest must be inside the current user dotfiles backup directory.'
    }
    $manifest = Get-Content -LiteralPath $manifestFile -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($manifest.version -ne 1) { throw 'Unsupported Windows Terminal backup version.' }
    $target = Assert-TerminalSettingsPath $manifest.path
    $current = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash
    if ($current -eq $manifest.originalSha256) { Write-Output 'Already restored.'; exit 0 }
    if ($current -ne $manifest.installedSha256) { throw 'Windows Terminal settings changed after installation; preserve those edits before restoring.' }
    $original = Join-Path ([System.IO.Path]::GetDirectoryName($manifestFile)) 'settings.json'
    if ((Get-FileHash -LiteralPath $original -Algorithm SHA256).Hash -ne $manifest.originalSha256) {
        throw 'The Windows Terminal backup has been modified.'
    }
    Set-FileAtomically $target ([System.IO.File]::ReadAllBytes($original))
    Write-Output 'Windows Terminal settings restored. Installed font files are retained.'
}
