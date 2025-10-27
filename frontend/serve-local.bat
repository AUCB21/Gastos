@echo off
REM Windows script to serve built frontend on LAN
echo Building frontend...
call npm run build

echo.
echo Starting HTTP server on http://0.0.0.0:3000
echo Access from clients at: http://YOUR_PC_IP:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Using Python's built-in HTTP server
cd dist
python -m http.server 3000 --bind 0.0.0.0
