@echo off
setlocal enabledelayedexpansion

echo 🧹 Step 1: Killing Chrome...
taskkill /F /IM chrome.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo 📂 Step 2: Finding Chrome Path...
set "CHROME_PATH="

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
)

if not defined CHROME_PATH (
    echo ❌ ERROR: Could not find Chrome!
    echo Please let me know where you installed Chrome.
    pause
    exit /b
)

echo ✅ Found Chrome at: !CHROME_PATH!

echo 🧼 Step 3: Preparing Temporary Profile...
set "TEMP_PROFILE=%TEMP%\ChromeDemoProfile"
if exist "!TEMP_PROFILE!" (
    rd /s /q "!TEMP_PROFILE!" 2>nul
)
mkdir "!TEMP_PROFILE!"

echo 🚀 Step 4: Starting Chrome on port 9222...
start "" "!CHROME_PATH!" --remote-debugging-port=9222 --user-data-dir="!TEMP_PROFILE!" --no-first-run --no-default-browser-check https://onegrantai.vercel.app

echo.
echo ✅ DONE! Check if it worked by opening this: http://localhost:9222
echo ⚠️  Note: This is a fresh profile. You must:
echo    1. Install OneWallet extension
echo    2. Import your account
echo    3. Run the automated script.
echo.
pause
