 <#
.SYNOPSIS
    把 src/ 下的分片打包成一份 Obsidian 主题 SeeYuePlus/theme.css。

.DESCRIPTION
    Obsidian 只读主题文件夹里的 theme.css。@import 的相对路径在 Obsidian 里
    能不能解析要看它把样式塞进哪，不值得赌，所以这里直接拼成单文件：
    源码保持分片好维护，发出去的是拼好的那一份。

.EXAMPLE
    .\build.ps1
    打包一次。

.EXAMPLE
    .\build.ps1 -Watch
    常驻监听，src/ 一改动就重新打包（Ctrl+C 退出）。
#>
[CmdletBinding()]
param(
    [switch]$Watch,
    [int]$IntervalSeconds = 1
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$srcDir = Join-Path $root 'src'
$themeDir = Join-Path $root 'SeeYuePlus'
$outFile = Join-Path $themeDir 'theme.css'

$banner = @'
/* ═══════════════════════════════════════════════════════════════════════
   见月 · SeeYue Plus — Obsidian
   浅色 = 见月 · 明亮   深色 = 见月 · 暗黑
   护眼配色见 snippets/见月·护眼.css

   这份 theme.css 由 src/ 下的分片拼成，不要直接改这里 ——
   改 src/，然后跑 build.ps1。
   ═══════════════════════════════════════════════════════════════════════ */
'@

# --x: var(--x) 会让整条变量链失效，且不报错，只是样式静默失灵。
# 手写主题时最容易踩的坑，打包前拦一道。
function Find-SelfReference {
    param([System.IO.FileInfo[]]$Files)

    $hits = @()
    foreach ($f in $Files) {
        $lineNo = 0
        foreach ($line in Get-Content $f.FullName) {
            $lineNo++
            $m = [regex]::Match($line, '^\s*(--[A-Za-z0-9_-]+)\s*:\s*(.+?);?\s*$')
            if (-not $m.Success) { continue }
            $name = $m.Groups[1].Value
            if ($m.Groups[2].Value -match [regex]::Escape("var($name)")) {
                $hits += '{0}:{1}  {2} 引用了自己' -f $f.Name, $lineNo, $name
            }
        }
    }
    return $hits
}

function Build-Theme {
    $files = Get-ChildItem $srcDir -Filter '*.css' -File | Sort-Object Name
    if (-not $files) { throw "src/ 下没有 CSS 文件：$srcDir" }

    $selfRefs = Find-SelfReference -Files $files
    if ($selfRefs) {
        Write-Host '发现变量自引用，已中止：' -ForegroundColor Red
        $selfRefs | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
        throw '修掉自引用再打包'
    }

    $parts = foreach ($f in $files) {
        "`n`n/* ─────────── $($f.Name) ─────────── */`n"
        (Get-Content $f.FullName -Raw).TrimEnd()
    }

    $css = $banner + ($parts -join "`n")

    # 统一成 LF。不这么做的话，Windows 上检出的是 CRLF，打包产物跟着变，
    # 每台机器克隆下来都会看到一份假的 diff
    $css = $css -replace "`r`n", "`n"

    if (-not (Test-Path $themeDir)) {
        New-Item -ItemType Directory -Path $themeDir | Out-Null
    }
    # 无 BOM 的 UTF-8：Obsidian 和浏览器都认，中文注释不会变成乱码
    [System.IO.File]::WriteAllText($outFile, $css, [System.Text.UTF8Encoding]::new($false))

    $kb = [math]::Round((Get-Item $outFile).Length / 1KB, 1)
    Write-Host ("[{0}] 已打包 {1} 个分片 -> SeeYuePlus\theme.css  ({2} KB)" -f `
        (Get-Date -Format 'HH:mm:ss'), $files.Count, $kb)
}

function Get-SrcStamp {
    (Get-ChildItem $srcDir -Filter '*.css' -File |
        Sort-Object Name |
        ForEach-Object { '{0}|{1}|{2}' -f $_.Name, $_.LastWriteTimeUtc.Ticks, $_.Length }) -join "`n"
}

if (-not $Watch) {
    Build-Theme
    Write-Host '把 SeeYuePlus 整个文件夹复制到 <库>/.obsidian/themes/ 即可。'
    return
}

Write-Host "监听中：$srcDir`n  Ctrl+C 退出`n"
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
