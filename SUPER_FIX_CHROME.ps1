# 🎬 OneGrant Demo Browser Fixer (v2 - MORE STABLE)

# Stop errors from being hidden
$ErrorActionPreference = "Stop"

try {
    Write-Host "🧹 Step 1: Killing ALL Chrome processes..." -ForegroundColor Cyan
    # Use taskkill directly for better results
    Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue
    taskkill /F /IM chrome.exe /T 2>$null
    Start-Sleep -Seconds 2

    Write-Host "📂 Step 2: Finding Chrome Path..." -ForegroundColor Cyan
    # Try multiple ways to find Chrome
    $pathsToTry = @(
        (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe' -ErrorAction SilentlyContinue).'(default)',
        "C:\Program Files\Google\Chrome\Application\chrome.exe",
        "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
    )

    $chromePath = $null
    foreach ($p in $pathsToTry) {
        if ($p -and (Test-Path $p)) {
            $chromePath = $p
            break
        }
    }

    if (-not $chromePath) {
        # Last ditch effort
        $chromePath = (Get-Command "chrome.exe" -ErrorAction SilentlyContinue).Source
    }

    if (-not $chromePath) {
        throw "❌ COULD NOT FIND CHROME! Please right-click your Chrome shortcut -> Properties -> Shortcut -> and tell me the 'Target' path."
    }

    Write-Host "✅ Found Chrome at: $chromePath" -ForegroundColor Green

    Write-Host "🧼 Step 3: Preparing Temporary Profile..." -ForegroundColor Cyan
    $tempProfile = "$env:TEMP\ChromeDemoProfile"
    if (Test-Path $tempProfile) {
        Remove-Item $tempProfile -Recurse -Force -ErrorAction SilentlyContinue
    }
    New-Item -ItemType Directory -Path $tempProfile -Force | Out-Null

    Write-Host "🚀 Step 4: Starting Chrome on port 9222..." -ForegroundColor Cyan
    
    # We must quote the path carefully for Start-Process
    $args = @(
        "--remote-debugging-port=9222",
        "--user-data-dir=$tempProfile",
        "--no-first-run",
        "--no-default-browser-check",
        "https://onegrantai.vercel.app"
    )

    Start-Process -FilePath $chromePath -ArgumentList $args

    Write-Host ""
    Write-Host "✅ browser SHOULD BE OPEN NOW!" -ForegroundColor Green
    Write-Host "1. In Chrome, go to: http://localhost:9222" -ForegroundColor Yellow
    Write-Host "2. If it works, install OneWallet, import account, and run your script." -ForegroundColor Yellow
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "❌ FATAL ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
