# SETUP.md — Creative Alibi: Authenticity Companion

Full setup guide: from clone to running Word Add-in and live web dashboard.

---

## System Requirements

| Requirement | Minimum |
|---|---|
| Node.js | 18+ (v24.16.0 recommended) |
| npm | 9+ |
| OS | Windows 10/11 (for Word Add-in), any OS for dashboard |
| Microsoft Word | 2016+ or Microsoft 365 |
| IBM Cloud | watsonx.ai access (API key + Project ID) |

---

## Step 1 — Clone & Install

```powershell
git clone https://github.com/rajachairul-alt/Creative-Alibi-V2.git
cd Creative-Alibi-V2
npm install
```

This installs all 4 workspace packages: `shared`, `backend`, `word-plugin`, `web-dashboard`.

---

## Step 2 — Configure IBM Credentials

```powershell
Copy-Item packages/backend/.env.example packages/backend/.env
```

Edit `packages/backend/.env`:

```env
# IBM watsonx.ai (REQUIRED)
WATSONX_API_KEY=your_ibm_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# Model (optional — defaults to granite-3-8b-instruct)
WATSONX_MODEL=ibm/granite-3-8b-instruct

# HuggingFace (OPTIONAL — for AI-likelihood detector)
HUGGINGFACE_API_KEY=your_hf_key_here

# Port (optional — default 3001)
PORT=3001
```

> ⚠️ Never commit `.env`. It is listed in `.gitignore`.

---

## Step 3 — Start All Services

### Option A: 1-Click Launcher (Windows)

```powershell
.\start-dev.ps1
```

Opens 3 separate colored terminals:
- 🟣 **Backend** → `http://localhost:3001`
- 🔵 **Word Plugin** → `http://localhost:3000`
- 🟢 **Web Dashboard** → `http://localhost:5173`

### Option B: npm

```powershell
npm run dev
```

### Option C: Individual Packages

```powershell
npm run dev:backend     # Backend API
npm run dev:plugin      # Word Add-in
npm run dev:dashboard   # Web Dashboard
```

---

## Step 4 — Install the Word Add-in

### Method A: Installer Script (Recommended)

```powershell
.\install-addin.bat
```

This:
1. Creates an SMB share at `\\localhost\CreativeAlibiAddIn`
2. Adds the registry trust entry for Office 16.0
3. Copies `manifest.xml` to the share

Then restart Word → **Insert → Get Add-ins → My Organization** → Creative Alibi.

### Method B: Manual Registry

1. Double-click `trust-addin.reg` to install the trust entry
2. Copy `packages/word-plugin/manifest.xml` to a shared folder
3. Register the shared folder in Word's Add-in Catalog settings

### Method C: Office Developer Preview (Sideload)

In Word ribbon (with developer mode enabled):
- **Insert → Add-ins → My Add-ins → Upload My Add-in**
- Browse to `packages/word-plugin/manifest.xml`

---

## Step 5 — Verify Health

```powershell
# Backend health check
Invoke-WebRequest http://localhost:3001/health | Select-Object StatusCode, Content

# Expected:
# StatusCode: 200
# Content: {"status":"ok","model":"ibm/granite-3-8b-instruct",...}
```

---

## Building for Production

### Web Dashboard (GitHub Pages)

```powershell
# Standard build
npm run build --workspace=packages/web-dashboard

# GitHub Pages build (sets base path /Creative-Alibi-V2/)
$env:GITHUB_PAGES = "1"
$env:VITE_BACKEND_URL = "https://your-backend.railway.app"
npm run build --workspace=packages/web-dashboard
```

Output → `packages/web-dashboard/dist/`

### Backend (Node.js)

```powershell
npm run build --workspace=packages/backend
node packages/backend/dist/index.js
```

---

## Environment Variables Reference

### Backend (`packages/backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `WATSONX_API_KEY` | ✅ | — | IBM Cloud API key |
| `WATSONX_PROJECT_ID` | ✅ | — | watsonx.ai project ID |
| `WATSONX_URL` | ✅ | `https://us-south.ml.cloud.ibm.com` | watsonx.ai endpoint |
| `WATSONX_MODEL` | ❌ | `ibm/granite-3-8b-instruct` | Granite model ID |
| `HUGGINGFACE_API_KEY` | ❌ | `''` | HF API key (detector returns UNCERTAIN without it) |
| `PORT` | ❌ | `3001` | Backend server port |
| `NODE_ENV` | ❌ | `development` | `production` to enable rate limiting |

### Web Dashboard (`packages/web-dashboard` build)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_BACKEND_URL` | ❌ | `http://localhost:3001` | Backend API URL |
| `GITHUB_PAGES` | ❌ | `''` | Set to `1` for GitHub Pages base path |

### Word Plugin (`packages/word-plugin` build)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_BACKEND_URL` | ❌ | `http://localhost:3001` | Backend API URL |
| `VITE_HTTPS` | ❌ | `''` | Set to `1` to enable HTTPS dev server |

---

## Word Add-in Manifest Settings

The manifest is at `packages/word-plugin/manifest.xml`.

Key values:
- **GUID**: `ca2024ab-1b2c-3d4e-5f6a-7b8c9d0e1f2a`
- **Source URL**: `http://localhost:3000` (change to your deployed URL for production)
- **Display Name**: Creative Alibi: Authenticity Companion

To deploy to production, update all `http://localhost:3000` URLs to your HTTPS production URL.

---

## GitHub Actions (CI/CD)

| Workflow | Trigger | Deploys To |
|---|---|---|
| `deploy-dashboard.yml` | Push to `main` (web-dashboard changes) | GitHub Pages |
| `deploy-word-plugin.yml` | Push to `main` (word-plugin changes) | GitHub Pages |
| `deploy-backend.yml` | Push to `main` (backend changes) | Railway (notify) |

### Required GitHub Secrets

| Secret | Used By | Value |
|---|---|---|
| `VITE_BACKEND_URL` | Dashboard build | Your Railway backend URL |

---

## Troubleshooting

### "Word Add-in not appearing in My Organization"

1. Ensure `install-addin.bat` ran without errors
2. Check registry: `HKCU:\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\CreativeAlibi`
3. In Word: File → Options → Trust Center → Trust Center Settings → Trusted Add-in Catalogs
4. Ensure `\\localhost\CreativeAlibiAddIn` is listed and "Show in Menu" is checked
5. Restart Word completely

### "IBM Granite returning 401 / 403"

1. Check `WATSONX_API_KEY` is correct (no trailing spaces)
2. Verify `WATSONX_PROJECT_ID` matches your watsonx.ai project
3. Test: `GET https://iam.cloud.ibm.com/identity/token` with your API key
4. Check backend logs: `http://localhost:3001/health`

### "qrcode.react / jspdf not found"

```powershell
npm install --workspace=packages/web-dashboard
```

### "TypeScript build errors"

```powershell
npm run build --workspace=packages/shared
npm run build --workspace=packages/backend
npm run build --workspace=packages/web-dashboard
```

---

*Last updated: Creative Alibi v2.0.0 — IBM AI Builders 2025*
