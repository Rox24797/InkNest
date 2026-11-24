@echo off
rem ------------------------------------------------------------
rem  InkNest Notes - builds the Windows installer (Setup .exe)
rem  Requires Node.js 18+ (https://nodejs.org). Run once, ~3 min.
rem ------------------------------------------------------------
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js is not installed. Download the LTS version from https://nodejs.org
  echo  install it, then run this file again.
  echo.
  pause
  exit /b 1
)

echo.
echo  [1/2] Installing build tools (first time only)...
call npm install
if errorlevel 1 goto fail

echo.
echo  [2/2] Building InkNest Notes installer...
call npm run dist
if errorlevel 1 goto fail

echo.
echo  Done!  Your installer is in the "dist" folder:
echo     InkNest Notes Setup 1.0.0.exe   (installs with shortcuts)
echo     InkNest Notes 1.0.0.exe         (portable, no install)
echo.
start "" "%~dp0dist"
pause
exit /b 0

:fail
echo.
echo  Build failed. Check the messages above (internet connection is required for the first build).
pause
exit /b 1
