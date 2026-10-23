# Settings-only integration fixture. Never registers fonts or writes HKCU.
$ErrorActionPreference = 'Stop'
$taskRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('dotfiles-windows-font-test-' + [Guid]::NewGuid().ToString('N'))
$taskData = Join-Path $taskRoot 'LocalData'
$target = Join-Path $taskData 'Microsoft\Windows Terminal\settings.json'
[System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($target)) | Out-Null
$script = Join-Path (Split-Path -Parent $PSScriptRoot) 'scripts\setup-windows-fonts.ps1'
$syntaxErrors = $null
$tokens = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile($script, [ref]$tokens, [ref]$syntaxErrors)
if ($syntaxErrors) { throw 'Font setup script has PowerShell syntax errors.' }
$registryFunction = @($ast.FindAll({ param($node)
    $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and
    $node.Name -eq 'Initialize-FontRegistry'
}, $true))
$newItems = @($ast.FindAll({ param($node)
    $node -is [System.Management.Automation.Language.CommandAst] -and $node.GetCommandName() -eq 'New-Item'
}, $true))
if ($registryFunction.Count -ne 1 -or $newItems.Count -ne 1 -or
    $newItems[0].Extent.StartOffset -lt $registryFunction[0].Extent.StartOffset -or
    $newItems[0].Extent.EndOffset -gt $registryFunction[0].Extent.EndOffset) {
    throw 'Registry creation must remain inside the guarded Initialize-FontRegistry function.'
}
# Execute the production initializer against mocked registry commands. Testing
# an existing key must preserve every unrelated value and never recreate it.
& {
    param($definition)
    . ([ScriptBlock]::Create($definition))
    $state = @{ exists = $true; creations = 0; values = @{ 'Unrelated Font (TrueType)' = 'keep.ttf' } }
    function Test-Path {
        param([string]$LiteralPath)
        if ($LiteralPath -ne 'MockFontRegistry') { throw 'Unexpected registry lookup' }
        return $state.exists
    }
    function New-Item {
        param([string]$Path, [switch]$Force)
        if ($Path -ne 'MockFontRegistry') { throw 'Unexpected registry creation' }
        if ($Force) { throw 'Registry initialization must never use Force' }
        if ($state.exists) { throw 'An existing font registry key must never be recreated' }
        $state.exists = $true
        $state.creations++
    }
    Initialize-FontRegistry 'MockFontRegistry'
    if ($state.creations -ne 0 -or $state.values['Unrelated Font (TrueType)'] -ne 'keep.ttf') {
        throw 'Existing font registrations were not preserved'
    }
    $state.exists = $false
    Initialize-FontRegistry 'MockFontRegistry'
    Initialize-FontRegistry 'MockFontRegistry'
    if ($state.creations -ne 1) { throw 'Missing registry key was not created exactly once' }
} $registryFunction[0].Extent.Text
$utf8 = [System.Text.UTF8Encoding]::new($false)
$original = '{"profiles":{"list":[]},"test":"original"}'
$replacement = '{"profiles":{"list":[]},"test":"updated"}'
[System.IO.File]::WriteAllText($target, $original, $utf8)
$content = Join-Path $taskRoot 'replacement.json'
[System.IO.File]::WriteAllText($content, $replacement, $utf8)
$taskOldLocal = $env:LOCALAPPDATA
try {
    $env:LOCALAPPDATA = $taskData
    $inspection = (& $script -Action Inspect | ConvertFrom-Json)
    if ($inspection.settings[0] -ne $target) { throw 'Incorrect settings discovery' }
    $digest = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash
    $manifest = & $script -Action WriteSettings -SettingsPath $target -ContentPath $content -ExpectedSha256 $digest
    if ([System.IO.File]::ReadAllText($target) -ne $replacement) { throw 'Settings update failed' }
    & $script -Action RestoreSettings -ManifestPath $manifest
    if ([System.IO.File]::ReadAllText($target) -ne $original) { throw 'Settings restoration failed' }
    $rejected = $false
    try { & $script -Action WriteSettings -SettingsPath $target -ContentPath $content -ExpectedSha256 ('0' * 64) }
    catch { $rejected = $true }
    if (-not $rejected) { throw 'Concurrent-write conflict was not rejected' }
    $rejected = $false
    try { & $script -Action WriteSettings -SettingsPath $content -ContentPath $content -ExpectedSha256 $digest }
    catch { $rejected = $true }
    if (-not $rejected) { throw 'Unknown terminal settings path was not rejected' }
    $manifest = & $script -Action WriteSettings -SettingsPath $target -ContentPath $content -ExpectedSha256 $digest
    [System.IO.File]::WriteAllText($target, '{"edited": true}', $utf8)
    $rejected = $false
    try { & $script -Action RestoreSettings -ManifestPath $manifest }
    catch { $rejected = $true }
    if (-not $rejected) { throw 'User edits after installation were not protected' }
    Write-Output 'Windows Terminal: discovery, atomic update, backup, restore, and conflict protection OK.'
} finally {
    $env:LOCALAPPDATA = $taskOldLocal
    $resolved = (Resolve-Path -LiteralPath $taskRoot).Path
    $temporary = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
    if ($resolved.StartsWith($temporary, [StringComparison]::OrdinalIgnoreCase) -and
        [System.IO.Path]::GetFileName($resolved).StartsWith('dotfiles-windows-font-test-')) {
        Remove-Item -LiteralPath $resolved -Recurse -Force
    }
}
