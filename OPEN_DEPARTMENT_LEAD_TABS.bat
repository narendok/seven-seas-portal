@echo off
echo ===============================================================================
echo     XYZ Pvt Ltd SCMS - MULTI-DEPARTMENT LEAD TABS & PROFILES LAUNCHER
echo ===============================================================================
echo.
echo Launching browser tabs with isolated department contexts on http://localhost:8080...
echo.

REM Check if Chrome exists
set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist %CHROME_PATH% set CHROME_PATH="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not exist %CHROME_PATH% set CHROME_PATH="chrome.exe"

echo [1/6] Launching Executive Admin / MD...
start "" %CHROME_PATH% "http://localhost:8080/?role=admin"

timeout /t 1 /nobreak >nul
echo [2/6] Launching Purchasing & SCM Lead (Morgan Reed)...
start "" %CHROME_PATH% "http://localhost:8080/?role=pur"

timeout /t 1 /nobreak >nul
echo [3/6] Launching Sales & Business Development Lead (Priya Sharma)...
start "" %CHROME_PATH% "http://localhost:8080/?role=sales"

timeout /t 1 /nobreak >nul
echo [4/6] Launching Accounts & Finance Lead (Priya Voss)...
start "" %CHROME_PATH% "http://localhost:8080/?role=fin"

timeout /t 1 /nobreak >nul
echo [5/6] Launching Embedded Hardware Engineering Lead (Avery Vale)...
start "" %CHROME_PATH% "http://localhost:8080/?role=ehw"

timeout /t 1 /nobreak >nul
echo [6/6] Launching Quality Assurance & APQP Lead (Jordan Blake)...
start "" %CHROME_PATH% "http://localhost:8080/?role=qa"

echo.
echo ===============================================================================
echo All key Department Lead tabs launched successfully!
echo To open any remaining department:
echo   - Firmware & SW (ESW):     http://localhost:8080/?role=esw
echo   - Mechanical (MECH):       http://localhost:8080/?role=mech
echo   - Manufacturing (EMF):     http://localhost:8080/?role=emf
echo   - EOL Testing (TST):       http://localhost:8080/?role=tst
echo   - Service & IT (SIT):      http://localhost:8080/?role=sit
echo   - HR & Ops (HR/OPS):       http://localhost:8080/?role=hrops
echo   - Tata Motors Client:      http://localhost:8080/?role=client
echo ===============================================================================
echo.
pause
