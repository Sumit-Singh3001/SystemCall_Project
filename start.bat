@echo off
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   SysCall — Secure System Call Interface  ║
echo  ║            by Arvika Tech                 ║
echo  ╚══════════════════════════════════════════╝
echo.

echo [1/4] Installing backend dependencies...
cd backend
call npm install --silent
echo       Done.

echo [2/4] Installing frontend dependencies...
cd ..\frontend
call npm install --legacy-peer-deps --silent
echo       Done.

echo [3/4] Starting backend server...
cd ..\backend
start "SysCall Backend" cmd /k "node server.js"

echo [4/4] Starting frontend...
cd ..\frontend
set NODE_OPTIONS=--openssl-legacy-provider
echo.
echo   Backend  : http://localhost:5000
echo   Frontend : http://localhost:3000
echo   Login    : admin/password or user/password
echo.
call npm start
