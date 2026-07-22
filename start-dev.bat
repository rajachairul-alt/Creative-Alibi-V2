@echo off
title Creative Alibi — Dev Launcher
color 0A

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║        Creative Alibi v2.0 — Dev Environment             ║
echo  ║  Backend :3001  ^|  Word Plugin :3000  ^|  Dashboard :5173  ║
echo  ║  Powered by IBM Granite via watsonx.ai                   ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

:: Check node is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

:: Check .env exists
if not exist "packages\backend\.env" (
    echo  [WARN] packages\backend\.env not found!
    echo  Copy packages\backend\.env.example to packages\backend\.env
    echo  and fill in your IBM watsonx.ai credentials.
    echo.
    pause
)

echo  [1/3] Installing dependencies...
call npm install --silent 2>nul
echo        Done.
echo.

echo  Starting all 3 services in separate windows...
echo.

:: ── Backend API (port 3001) ──────────────────────────────────────────────────
echo  [2/3] Starting Backend API   → http://localhost:3001/api/health
start "Creative Alibi — Backend :3001" cmd /k "cd /d %~dp0packages\backend && color 0B && echo [Backend] Starting... && npm run dev"

:: Wait 2 seconds so backend boots first
timeout /t 2 /nobreak >nul

:: ── Word Plugin (port 3000) ──────────────────────────────────────────────────
echo  [2/3] Starting Word Plugin   → http://localhost:3000
start "Creative Alibi — Word Plugin :3000" cmd /k "cd /d %~dp0packages\word-plugin && color 0E && echo [Word Plugin] Starting... && npm run dev"

:: ── Web Dashboard (port 5173) ────────────────────────────────────────────────
echo  [3/3] Starting Web Dashboard → http://localhost:5173
start "Creative Alibi — Dashboard :5173" cmd /k "cd /d %~dp0packages\web-dashboard && color 0D && echo [Dashboard] Starting... && npm run dev"

echo.
echo  ══════════════════════════════════════════════════════════
echo   All services launching in separate windows.
echo   Opening browser in 5 seconds...
echo  ══════════════════════════════════════════════════════════
echo.

:: Wait for servers to boot then open browser tabs
timeout /t 5 /nobreak >nul

start "" "http://localhost:5173"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3001/api/health"

echo.
echo  Browsers opened. You can close this window.
echo.
pause
