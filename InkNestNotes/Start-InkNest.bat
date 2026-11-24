@echo off
rem ------------------------------------------------------------
rem  InkNest Notes - instant launcher (no install needed)
rem  Opens the app in its own window using Edge or Chrome.
rem ------------------------------------------------------------
setlocal
set "URL=file:///%~dp0app/index.html"
set "URL=%URL:\=/%"

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" goto edge86
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" goto edge64
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" goto chrome64
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" goto chrome86
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" goto chromeuser
goto fallback

:edge86
start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%URL%" --window-size=1380,880
goto end
:edge64
start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="%URL%" --window-size=1380,880
goto end
:chrome64
start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%URL%" --window-size=1380,880
goto end
:chrome86
start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="%URL%" --window-size=1380,880
goto end
:chromeuser
start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" --app="%URL%" --window-size=1380,880
goto end

:fallback
start "" "%~dp0app\index.html"

:end
endlocal
