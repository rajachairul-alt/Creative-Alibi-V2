# SETUP.md — Creative Alibi: Authenticity Companion

> **IBM AI Builders Challenge 2025** · Built with [IBM Bob](https://bit.ly/IBMBob-freetrial)

Getting from `git clone` to a fully running Creative Alibi in **under 5 minutes**.

---

## 📋 What You'll Have Running

After setup you'll have three services:

| Service | Port | What it does |
|---|---|---|
| ⚙️ **Backend API** | `3001` | IBM Granite integration, Process Ledger scoring, report generation |
| 📝 **Word Add-in** | `3000` | Office.js task pane (also works in browser for demo) |
| 🌐 **Web Dashboard** | `5173` | Full analytics and report management UI |

> **Just want to see the UI?** Skip to the live demo: [rajachairul-alt.github.io/Creative-Alibi-V2](https://rajachairul-alt.github.io/Creative-Alibi-V2/)

---

## 🖥️ System Requirements

| Requirement | Minimum | Notes |
|---|---|---|
| **Node.js** | v18+ | Tested on v24.16.0 — `node --version` |
| **npm** | v9+ | Comes with Node.js |
| **OS** | Windows 10/11 | Windows required for Word Add-in sideload; macOS/Linux work for dashboard |
| **Microsoft Word** | 2016+ or M365 | For the Word Add-in component |
| **IBM Cloud** | watsonx.ai access | [Free trial here](https://cloud.ibm.com/registration?utm_content=academicsb) |

---

## ⚡ Step 1 — Clone & Install

```bash
git clone https://github.com/rajachairul-alt/Creative-Alibi-V2.git
cd Creative-Alibi-V2
npm install
```

`npm install` installs all 4 workspace packages at once:
- `packages/shared` — TypeScript types & constants
- `packages/backend` — Express API + IBM Granite services
- `packages/word-plugin` — Microsoft Word Add-in (Office.js + React)
- `packages/web-dashboard` — React Web Dashboard

---

## 🔑 Step 2 — Configure IBM Credentials

```bash
# Windows PowerShell
Copy-Item packages/backend/.env.example packages/backend/.env

# macOS / Linux
cp packages/backend/.env.example packages/backend/.env
```

Open `packages/backend/.env` and fill in your IBM credentials:

```env
# ─── IBM watsonx.ai (REQUIRED) ─────────────────────────────────────
WATSONX_API_KEY=your_ibm_cloud_api_key_here
WATSONX_PROJECT_ID=your_watsonx_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# ─── Model Selection (optional — default shown) ─────────────────────
WATSONX_MODEL=ibm/granite-3-8b-instruct

# ─── HuggingFace (optional — for AI-likelihood detector signal) ─────
HUGGINGFACE_API_KEY=your_hf_key_here

# ─── Server port (optional) ─────────────────────────────────────────
PORT=3001
```

### How to get your IBM credentials

1. Go to [cloud.ibm.com](https://cloud.ibm.com) → **Manage → Access (IAM) → API Keys** → Create API Key
2. Go to [dataplatform.cloud.ibm.com](https://dataplatform.cloud.ibm.com) → Create a project → Copy the Project ID
3. Your `WATSONX_URL` is `https://us-south.ml.cloud.ibm.com` if your project is in US South (default)

> ⚠️ **Never commit `.env`** — it is listed in `.gitignore`. IBM credentials must not appear in git history.

---

## 🚀 Step 3 — Start All Services

### Option A — 1-Click Launcher (Windows, recommended)

```powershell
.\start-dev.ps1
```

Opens 3 color-coded terminals automatically.

### Option B — npm workspace command

```bash
npm run dev
```

### Option C — Individual services (for debugging)

```bash
npm run dev:backend      # → http://localhost:3001
npm run dev:plugin       # → http://localhost:3000
npm run dev:dashboard    # → http://localhost:5173
```

### Verify the backend is alive

```bash
# PowerShell
Invoke-WebRequest http://localhost:3001/health | Select-Object -ExpandProperty Content

# curl (macOS / Linux / WSL)
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "model": "ibm/granite-3-8b-instruct",
  "granite": "connected",
  "timestamp": "2025-07-23T..."
}
```

---

## 📝 Step 4 — Install the Word Add-in (Windows)

The Word Add-in is sideloaded via a shared folder catalog.

### Method A — Automated installer (recommended)

```powershell
.\install-addin.bat
```

This script:
1. Creates a Windows SMB share at `\\localhost\CreativeAlibiAddIn`
2. Adds the registry trust entry for Office 16.0
3. Copies `manifest.xml` to the shared folder

Then:
- Restart Microsoft Word completely
- **Insert → Get Add-ins → My Organization**
- Click **Creative Alibi: Authenticity Companion**

### Method B — Manual registry

1. Double-click `trust-addin.reg` to install the trust entry
2. Create a shared folder and copy `packages/word-plugin/manifest.xml` into it
3. In Word: **File → Options → Trust Center → Trust Center Settings → Trusted Add-in Catalogs** → add the share path

### Method C — Direct sideload (developer mode)

In Word with developer mode enabled:
- **Insert → Add-ins → My Add-ins → Upload My Add-in** → browse to `packages/word-plugin/manifest.xml`

### Verify the add-in is installed

In Registry Editor: check `HKCU:\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\CreativeAlibi` exists.

In Word Trust Center: `\\localhost\CreativeAlibiAddIn` should appear with **Show in Menu** checked.

---

## 🌐 Step 5 — Open the Web Dashboard

Navigate to `http://localhost:5173` in your browser.

The dashboard includes 6 pages:

| Page | What it shows |
|---|---|
| 🏠 **Dashboard** | Live stats, 7-day cadence trend, recent sessions |
| 📊 **Analytics** | WPM timeline, radar chart, pause distribution, revision heatmap |
| 📋 **Sessions** | Searchable/sortable session history with detail modal |
| 📄 **Reports** | Authenticity Reports with PDF export and QR code generation |
| 🤖 **AI Partner** | Live IBM Granite chat (style / brainstorm / grammar) |
| ⚙️ **Settings** | Privacy controls, IBM Granite configuration, data export |

---

## 🏗️ Building for Production

### Web Dashboard → GitHub Pages

```powershell
# PowerShell (sets correct /Creative-Alibi-V2/ base path)
$env:GITHUB_PAGES = "1"
$env:VITE_BACKEND_URL = "https://your-backend.railway.app"
npm run build --workspace=packages/web-dashboard
# Output: packages/web-dashboard/dist/
```

```bash
# bash (macOS / Linux)
GITHUB_PAGES=1 VITE_BACKEND_URL=https://your-backend.railway.app \
  npm run build --workspace=packages/web-dashboard
```

> The GitHub Actions workflow does this automatically on every push to `main`.

### Backend → Node.js server

```bash
npm run build --workspace=packages/backend
node packages/backend/dist/index.js
```

---

## 📋 All Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start backend + word-plugin + dashboard concurrently |
| `npm run dev:backend` | Backend only |
| `npm run dev:plugin` | Word Add-in dev server only |
| `npm run dev:dashboard` | Web Dashboard dev server only |
| `npm run build` | Build all 4 packages |
| `npm run build --workspace=packages/shared` | Build shared types |
| `npm run build --workspace=packages/backend` | Build backend |
| `npm run build --workspace=packages/word-plugin` | Build Word Add-in |
| `npm run build --workspace=packages/web-dashboard` | Build Web Dashboard |

---

## 🔧 Environment Variables Reference

### Backend — `packages/backend/.env`

| Variable | Required | Default | Description |
|---|---|---|---|
| `WATSONX_API_KEY` | ✅ Yes | — | IBM Cloud API key |
| `WATSONX_PROJECT_ID` | ✅ Yes | — | watsonx.ai project ID |
| `WATSONX_URL` | ✅ Yes | `https://us-south.ml.cloud.ibm.com` | watsonx.ai endpoint URL |
| `WATSONX_MODEL` | No | `ibm/granite-3-8b-instruct` | Primary Granite model ID |
| `HUGGINGFACE_API_KEY` | No | `''` | HF API key for AI-likelihood detector |
| `PORT` | No | `3001` | Server port |
| `NODE_ENV` | No | `development` | Set `production` to enable rate limiting |

### Web Dashboard build vars

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_BACKEND_URL` | No | `http://localhost:3001` | Backend API URL |
| `GITHUB_PAGES` | No | `''` | Set `1` to use `/Creative-Alibi-V2/` base path |

### Word Plugin build vars

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_BACKEND_URL` | No | `http://localhost:3001` | Backend API URL |
| `VITE_HTTPS` | No | `''` | Set `1` for HTTPS dev server |

---

## 🔄 CI/CD — GitHub Actions

| Workflow | Trigger | Deploys to |
|---|---|---|
| `deploy-dashboard.yml` | Every push to `main` | GitHub Pages (GITHUB_PAGES=1 build) |
| `deploy-word-plugin.yml` | Push to `main` (word-plugin changes) | GitHub Pages |
| `deploy-backend.yml` | Push to `main` (backend changes) | Railway notification |

### Required GitHub Secret

| Secret | Used by | Value |
|---|---|---|
| `VITE_BACKEND_URL` | `deploy-dashboard.yml` | Your production backend URL (Railway, Render, etc.) |

---

## 🩺 Troubleshooting

### "Word Add-in not appearing in My Organization"

1. Run `.\install-addin.bat` as Administrator
2. Check registry: `HKCU:\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\CreativeAlibi`
3. In Word: **File → Options → Trust Center → Trust Center Settings → Trusted Add-in Catalogs**
4. Ensure `\\localhost\CreativeAlibiAddIn` is listed and **Show in Menu** is checked ✓
5. **Fully restart Word** — close all Word windows and reopen

### "IBM Granite returning 401 / 403"

1. Check `WATSONX_API_KEY` has no trailing spaces
2. Verify `WATSONX_PROJECT_ID` matches the correct watsonx.ai project
3. Test token exchange: `curl -X POST "https://iam.cloud.ibm.com/identity/token" -d "grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=YOUR_KEY"`
4. Check backend logs at `http://localhost:3001/health`

### "Blank page on GitHub Pages"

The `GITHUB_PAGES=1` environment variable must be set during the build. The GitHub Actions workflow handles this automatically. Locally, use:

```powershell
$env:GITHUB_PAGES = "1"; npm run build --workspace=packages/web-dashboard
```

### "TypeScript errors on build"

Always build `shared` first — other packages depend on its `dist/`:

```bash
npm run build --workspace=packages/shared
npm run build --workspace=packages/backend
npm run build --workspace=packages/web-dashboard
```

### "qrcode.react or jspdf not found"

```bash
npm install --workspace=packages/web-dashboard
```

### "Port already in use"

```bash
# Kill processes on the ports
npx kill-port 3000 3001 5173
npm run dev
```

---

## 🛡️ Security Checklist

Before deploying or sharing:

- [ ] `packages/backend/.env` is in `.gitignore` ✓ (already set)
- [ ] `.env` files are NOT committed (`git status` should not show `.env`)
- [ ] IBM credentials are stored only in `.env`, not in any source file
- [ ] `GITHUB_PAGES` env var is set in GitHub Actions, not hardcoded in `vite.config.ts`

---

## 📞 Support

- **Issues**: [github.com/rajachairul-alt/Creative-Alibi-V2/issues](https://github.com/rajachairul-alt/Creative-Alibi-V2/issues)
- **IBM watsonx.ai docs**: [cloud.ibm.com/docs/watson-machine-learning](https://cloud.ibm.com/docs/watson-machine-learning)
- **IBM Granite community**: [github.com/ibm-granite-community](https://github.com/ibm-granite-community)
- **IBM Bob**: [bit.ly/IBMBob-freetrial](https://bit.ly/IBMBob-freetrial)

---

*Creative Alibi v2.0.0 · IBM AI Builders Challenge 2025*
*Built with IBM Bob · Powered by IBM Granite via watsonx.ai*
