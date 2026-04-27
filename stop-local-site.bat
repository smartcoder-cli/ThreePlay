@echo off
setlocal

for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /PID %%P /F >nul 2>nul
)

echo Stopped local site process on port 8000.

endlocal
