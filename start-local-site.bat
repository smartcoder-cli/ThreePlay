@echo off
setlocal

set "PORT=8000"
set "ROOT=%~dp0"

echo Starting local site from "%ROOT%" on http://127.0.0.1:%PORT%/
start "ThreePlay Local Site" /min cmd /c "cd /d "%ROOT%" && python -m http.server %PORT%"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:%PORT%/"

echo.
echo Open:
echo   http://127.0.0.1:%PORT%/
echo   http://localhost:%PORT%/

endlocal
