@echo off
:: ============================================================
::  Creative Alibi — Trust Center Fix (Run as Administrator)
::  This script:
::    1. Creates a network share for the manifest folder
::    2. Writes the correct \\localhost UNC path to registry
::    3. Cleans up old broken entries
:: ============================================================
title Creative Alibi — Trust Center Fix (Admin Required)
color 0A

:: Check if running as admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  [!] This script needs Administrator rights.
    echo      Right-click this file and choose "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo.
echo  ============================================================
echo   Creative Alibi — Trust Center Fixer
echo  ============================================================
echo.

set "CATALOG=%USERPROFILE%\CreativeAlibiAddIn"
set "SHARE=CreativeAlibiAddIn"
set "UNC=\\localhost\CreativeAlibiAddIn"

:: ── Create folder if needed ─────────────────────────────────
if not exist "%CATALOG%" mkdir "%CATALOG%"

:: ── Copy manifest ───────────────────────────────────────────
set "MANIFEST=%~dp0packages\word-plugin\manifest.xml"
if exist "%MANIFEST%" (
    copy /Y "%MANIFEST%" "%CATALOG%\manifest.xml" >nul
    echo  [1] Manifest copied to %CATALOG%
) else (
    echo  [WARN] manifest.xml not found — skipping copy
)

:: ── Remove old share if exists ──────────────────────────────
net share %SHARE% >nul 2>&1
if %errorlevel% equ 0 (
    net share %SHARE% /delete >nul 2>&1
    echo  [2] Removed old share
)

:: ── Create new network share ────────────────────────────────
net share %SHARE%="%CATALOG%" /GRANT:Everyone,READ >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Could not create network share.
    echo  Trying alternative share method...
    powershell -Command "New-SmbShare -Name '%SHARE%' -Path '%CATALOG%' -FullAccess '%USERNAME%'" >nul 2>&1
)

net share %SHARE% >nul 2>&1
if %errorlevel% equ 0 (
    echo  [3] Network share created: %UNC%
) else (
    echo  [WARN] Share creation failed — will try direct path
    set "UNC=%CATALOG%"
)

:: ── Clean old registry entries ──────────────────────────────
reg delete "HKCU\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\CreativeAlibi" /f >nul 2>&1
reg delete "HKCU\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\{E6160C6B-FA2F-4F45-A037-2452695B2A6D}" /f >nul 2>&1
reg delete "HKCU\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\{AF71ECDB-155E-41DF-A13A-3456E92E87A2}" /f >nul 2>&1
echo  [4] Cleaned old registry entries

:: ── Write correct registry entry ───────────────────────────
set "REGKEY=HKCU\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\CreativeAlibi"
reg add "%REGKEY%" /v "Id"    /t REG_SZ    /d "{CA2024-ALIBI-WORD-PLUGIN-7C3AED10}" /f >nul
reg add "%REGKEY%" /v "Url"   /t REG_SZ    /d "%UNC%" /f >nul
reg add "%REGKEY%" /v "Flags" /t REG_DWORD /d 1 /f >nul
echo  [5] Registry updated: %UNC%

:: ── Verify ─────────────────────────────────────────────────
echo.
echo  ============================================================
echo   DONE. Follow these steps:
echo  ============================================================
echo.
echo   1. CLOSE Word completely (all windows)
echo.
echo   2. REOPEN Word
echo.
echo   3. Insert ^> Get Add-ins ^> SHARED FOLDER tab
echo      You should see "Creative Alibi"
echo.
echo   4. Make sure start-dev.bat is running first!
echo.
echo  Catalog: %CATALOG%
echo  Share  : %UNC%
echo.

:: Open the catalog folder so user can verify
explorer "%CATALOG%"

pause
