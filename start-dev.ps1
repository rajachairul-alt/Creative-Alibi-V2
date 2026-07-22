# Creative Alibi — Dev Launcher (PowerShell)
# Run: Right-click → Run with PowerShell
# Or:  powershell -ExecutionPolicy Bypass -File start-dev.ps1

$Host.UI.RawUI.WindowTitle = "Creative Alibi — Dev Launcher"

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║        Creative Alibi v2.0 — Dev Environment             ║" -ForegroundColor Cyan
Write-Host "  ║  Backend :3001  |  Word Plugin :3000  |  Dashboard :5173  ║" -ForegroundColor Cyan
Write-Host "  ║  Powered by IBM Granite via watsonx.ai                   ║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot

# ── Check node ────────────────────────────────────────────────────────────────
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "  [ERROR] Node.js not found. Install from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  ✓ Node.js $(node --version)" -ForegroundColor Green

# ── Check .env ────────────────────────────────────────────────────────────────
$envFile = Join-Path $root "packages\backend\.env"
if (-not (Test-Path $envFile)) {
    Write-Host ""
    Write-Host "  [WARN] packages\backend\.env not found!" -ForegroundColor Yellow
    Write-Host "  Copy packages\backend\.env.example → packages\backend\.env" -ForegroundColor Yellow
    Write-Host "  and add your IBM watsonx.ai credentials." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to continue anyway"
}

# ── Install deps ──────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  Installing dependencies..." -ForegroundColor Gray
Set-Location $root
npm install --silent 2>$null
Write-Host "  ✓ Dependencies ready" -ForegroundColor Green

# ── Launch Backend ────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  [1/3] Starting Backend API   → http://localhost:3001/api/health" -ForegroundColor Blue
$backendPath = Join-Path $root "packages\backend"
Start-Process powershell -ArgumentList `
    "-NoExit", `
    "-Command", `
    "`$Host.UI.RawUI.WindowTitle='Backend :3001'; `$Host.UI.RawUI.BackgroundColor='DarkBlue'; Clear-Host; Set-Location '$backendPath'; npm run dev" `
    -WindowStyle Normal

Start-Sleep -Seconds 2

# ── Launch Word Plugin ────────────────────────────────────────────────────────
Write-Host "  [2/3] Starting Word Plugin   → http://localhost:3000" -ForegroundColor Yellow
$wordPath = Join-Path $root "packages\word-plugin"
Start-Process powershell -ArgumentList `
    "-NoExit", `
    "-Command", `
    "`$Host.UI.RawUI.WindowTitle='Word Plugin :3000'; `$Host.UI.RawUI.BackgroundColor='DarkGreen'; Clear-Host; Set-Location '$wordPath'; npm run dev" `
    -WindowStyle Normal

Start-Sleep -Seconds 1

# ── Launch Web Dashboard ──────────────────────────────────────────────────────
Write-Host "  [3/3] Starting Web Dashboard → http://localhost:5173" -ForegroundColor Magenta
$dashPath = Join-Path $root "packages\web-dashboard"
Start-Process powershell -ArgumentList `
    "-NoExit", `
    "-Command", `
    "`$Host.UI.RawUI.WindowTitle='Dashboard :5173'; `$Host.UI.RawUI.BackgroundColor='DarkMagenta'; Clear-Host; Set-Location '$dashPath'; npm run dev" `
    -WindowStyle Normal

# ── Wait then open browsers ───────────────────────────────────────────────────
Write-Host ""
Write-Host "  ══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   All services launching. Opening browsers in 5s..." -ForegroundColor Cyan
Write-Host "  ══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 5

Start-Process "http://localhost:5173"
Start-Sleep -Milliseconds 500
Start-Process "http://localhost:3000"
Start-Sleep -Milliseconds 500
Start-Process "http://localhost:3001/api/health"

Write-Host "  ✓ Browsers opened." -ForegroundColor Green
Write-Host "  You can close this window." -ForegroundColor Gray
Write-Host ""
