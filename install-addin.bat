@echo off
:: ============================================================
::  Creative Alibi — Word Add-in Sideload Installer
::  Run as Administrator for best results.
::  This script:
::    1. Creates a Shared Folder catalog on your machine
::    2. Copies manifest.xml into it
::    3. Registers the folder in the Windows Registry
::    4. Tells you exactly what to click in Word
:: ============================================================
title Creative Alibi — Add-in Installer
color 0B

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║      Creative Alibi — Word Add-in Installer              ║
echo  ║      Shared Folder Sideload Method                       ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

:: ── Step 1: Create the shared catalog folder ──────────────────────────────────
set "CATALOG=%USERPROFILE%\CreativeAlibiAddIn"
echo  [1/4] Creating catalog folder...
if not exist "%CATALOG%" mkdir "%CATALOG%"
echo        Created: %CATALOG%
echo.

:: ── Step 2: Copy manifest ────────────────────────────────────────────────────
set "MANIFEST=%~dp0packages\word-plugin\manifest.xml"
echo  [2/4] Copying manifest.xml...
if not exist "%MANIFEST%" (
    echo  [ERROR] manifest.xml not found at:
    echo          %MANIFEST%
    echo  Make sure you run this from the project root folder.
    pause
    exit /b 1
)
copy /Y "%MANIFEST%" "%CATALOG%\manifest.xml" >nul
echo        Copied to: %CATALOG%\manifest.xml
echo.

:: ── Step 3: Register in Windows Registry ────────────────────────────────────
echo  [3/4] Registering trusted catalog in Windows Registry...

:: Trust the catalog folder (required by Office)
reg add "HKCU\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\CreativeAlibi" /v "Id"          /t REG_SZ /d "{CA2024-ALIBI-WORD-PLUGIN-7C3AED10}" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\CreativeAlibi" /v "Url"         /t REG_SZ /d "%CATALOG%" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\CreativeAlibi" /v "Flags"       /t REG_DWORD /d 1 /f >nul 2>&1

:: Also try Office 15 (Word 2013) just in case
reg add "HKCU\Software\Microsoft\Office\15.0\WEF\TrustedCatalogs\CreativeAlibi" /v "Url"         /t REG_SZ /d "%CATALOG%" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Office\15.0\WEF\TrustedCatalogs\CreativeAlibi" /v "Flags"       /t REG_DWORD /d 1 /f >nul 2>&1

echo        Registry entries written.
echo.

:: ── Step 4: Summary + Instructions ──────────────────────────────────────────
echo  [4/4] Done! Now do this in Microsoft Word:
echo.
echo  ┌─────────────────────────────────────────────────────────┐
echo  │  STEP A: Close Word completely (all windows)            │
echo  │                                                         │
echo  │  STEP B: Reopen Word → open any document               │
echo  │                                                         │
echo  │  STEP C: Insert tab → Get Add-ins → MY ADD-INS         │
echo  │          → click "SHARED FOLDER" tab                   │
echo  │          → you should see "Creative Alibi"             │
echo  │          → click Add                                    │
echo  │                                                         │
echo  │  STEP D: Make sure npm run dev is running first:       │
echo  │          double-click start-dev.bat                     │
echo  └─────────────────────────────────────────────────────────┘
echo.
echo  Catalog folder : %CATALOG%
echo  Manifest file  : %CATALOG%\manifest.xml
echo.

:: Open the catalog folder so user can verify
start "" "%CATALOG%"

echo  Press any key to exit...
pause >nul
