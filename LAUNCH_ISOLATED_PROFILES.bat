@echo off
echo ===============================================================================
echo     HEXENSE LABS SCMS - LAUNCH SEPARATE CHROME PROFILES FOR LEADS
echo ===============================================================================
echo.
echo Launching completely isolated Chrome profiles with dedicated user data directories...
echo.

set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
set PROFILES_DIR=%USERPROFILE%\.scms_chrome_profiles

if not exist "%PROFILES_DIR%" mkdir "%PROFILES_DIR%"

echo [1/4] Launching Purchasing ^& SCM Lead (Morgan Reed) in isolated profile...
start "" %CHROME% --user-data-dir="%PROFILES_DIR%\pur" --new-window "http://localhost:8080/?role=pur"

timeout /t 1 /nobreak >nul
echo [2/4] Launching Sales ^& BD Lead (Priya Sharma) in isolated profile...
start "" %CHROME% --user-data-dir="%PROFILES_DIR%\sales" --new-window "http://localhost:8080/?role=sales"

timeout /t 1 /nobreak >nul
echo [3/4] Launching Finance ^& Accounts Lead (Priya Voss) in isolated profile...
start "" %CHROME% --user-data-dir="%PROFILES_DIR%\fin" --new-window "http://localhost:8080/?role=fin"

timeout /t 1 /nobreak >nul
echo [4/4] Launching Executive Admin / MD in isolated profile...
start "" %CHROME% --user-data-dir="%PROFILES_DIR%\admin" --new-window "http://localhost:8080/?role=admin"

echo.
echo ===============================================================================
echo All 4 isolated Department Lead profiles launched into separate windows!
echo Each window has its own isolated profile session and taskbar icon.
echo ===============================================================================
echo.
pause
