<#
.SYNOPSIS
    编译 AnuPpuccin 源码，再拼上 enhance/ 里的见月增强。

.EXAMPLE
    .\build.ps1
    .\build.ps1 -Watch
#>
[CmdletBinding()]
param(
    [switch]$Watch,
    [int]$IntervalSeconds = 1
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$srcDir = Join-Path $root 'src'
$enhanceDir = Join-Path $root 'enhance'
$themeDir = Join-Path $root 'SeeYuePlus'
$outFile = Join-Path $themeDir 'theme.css'
$outRoot = Join-Path $root 'theme.css'
$sassEntry = Join-Path $srcDir 'base.scss'
$sassBin = Join-Path $root 'node_modules\.bin\sass.cmd'

$banner = @'
/*===============================================================
   SeeYuePlus — 基于 AnuPpuccin 的二改

   AnuPpuccin is licensed under the GPL-3.0 license which allows you
   to modify the code freely, however the Copyright and license
   notices must be preserved in your CSS. If you redistribute a part
   of my code, please credit my theme in your CSS file, and specify
   which code you are using. Please keep my Buy Me a Coffee link
                   in your README if you do so.

             https://www.buymeacoffee.com/anubisnekhet

   上游：AnuPpuccin 1.5.0 全部源码（src/）
   本仓库：enhance/ 按文件名叠见月（令牌、官方新变量、写作、代码窗、插件）。
   不要直接改 theme.css，改 src/ 或 enhance/ 再跑 build.ps1。
*===============================================================*/
'@

function Get-Sass {
    if (Test-Path $sassBin) { return $sassBin }
    $npx = Get-Command npx -ErrorAction SilentlyContinue
    if ($npx) { return 'npx' }
    throw '找不到 sass。先在仓库根目录跑 npm install。'
}

function Build-Theme {
    if (-not (Test-Path $sassEntry)) {
        throw "没有 AnuPpuccin 入口：$sassEntry"
    }

    $sass = Get-Sass
    $tmp = Join-Path $root '.anuppuccin.css'
    if ($sass -eq 'npx') {
        & npx --yes sass $sassEntry $tmp --no-source-map --no-charset
    } else {
        & $sass $sassEntry $tmp --no-source-map --no-charset
    }
    if ($LASTEXITCODE -ne 0) { throw 'sass 编译失败' }

    $files = Get-ChildItem $enhanceDir -Filter '*.css' -File -ErrorAction SilentlyContinue |
        Sort-Object Name

    $parts = @(Get-Content $tmp -Raw)
    foreach ($f in $files) {
        $parts += "`n`n/* ─────────── enhance/$($f.Name) ─────────── */`n"
        $parts += (Get-Content $f.FullName -Raw).TrimEnd()
    }

    $css = $banner + "`n" + ($parts -join "`n")
    $css = $css -replace "`r`n", "`n"

    if (-not (Test-Path $themeDir)) {
        New-Item -ItemType Directory -Path $themeDir | Out-Null
    }

    $utf8 = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($outFile, $css, $utf8)
    [System.IO.File]::WriteAllText($outRoot, $css, $utf8)
    Remove-Item $tmp -ErrorAction SilentlyContinue

    $kb = [math]::Round((Get-Item $outFile).Length / 1KB, 1)
    $n = if ($files) { $files.Count } else { 0 }
    $names = if ($files) { ($files.Name -join ', ') } else { '无' }
    Write-Host ("[{0}] AnuPpuccin + {1} 层 -> SeeYuePlus\theme.css  ({2} KB)" -f `
        (Get-Date -Format 'HH:mm:ss'), $n, $kb)
    Write-Host ("         enhance: {0}" -f $names)
}

function Get-SrcStamp {
    $a = Get-ChildItem $srcDir -Recurse -Filter '*.scss' -File |
        Sort-Object FullName |
        ForEach-Object { '{0}|{1}|{2}' -f $_.FullName, $_.LastWriteTimeUtc.Ticks, $_.Length }
    $b = @()
    if (Test-Path $enhanceDir) {
        $b = Get-ChildItem $enhanceDir -Filter '*.css' -File |
            Sort-Object Name |
            ForEach-Object { '{0}|{1}|{2}' -f $_.Name, $_.LastWriteTimeUtc.Ticks, $_.Length }
    }
    ($a + $b) -join "`n"
}

if (-not $Watch) {
    Build-Theme
    Write-Host '把 SeeYuePlus 整个文件夹复制到 <库>/.obsidian/themes/ 即可。'
    return
}

Write-Host "监听中：src/ 与 enhance/`n  Ctrl+C 退出`n"
Build-Theme
$last = Get-SrcStamp
while ($true) {
    Start-Sleep -Seconds $IntervalSeconds
    $now = Get-SrcStamp
    if ($now -ne $last) {
        $last = $now
        try { Build-Theme } catch { Write-Warning $_ }
    }
}
