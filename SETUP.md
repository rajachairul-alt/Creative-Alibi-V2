# SETUP.md — Creative Alibi: Authenticity Companion

Full setup guide: from zero to a running Word Add-in, live web dashboard, and connected IBM Granite backend.

> **Primary Development Tool**: [IBM Bob](https://bit.ly/IBMBob-freetrial) — required for IBM AI Builders Challenge participation.

---

## System Requirements

| Requirement | Minimum | Recommended |
|---|---|---|
| Node.js | 18+ | v24.16.0 (LTS) |
| npm | 9+ | bundled with Node.js |
| OS | Windows 10/11 (for Word Add-in), any OS for dashboard | Windows 11 |
| Microsoft Word | 2016+ | Microsoft 365 |
| IBM Cloud account | Free tier | Paid / Academic tier |
| IBM Bob | Free trial | [Get free trial](https://bit.ly/IBMBob-freetrial) |
| watsonx.ai | API key + Project ID | [Register](https://cloud.ibm.com/registration?utm_content=academicsb) |
| Git | Any recent version | — |

---

## Prerequisites: IBM Account Setup

### Step 0A — Create an IBM Cloud Account

1. Go to [https://cloud.ibm.com/registration?utm_content=academicsb](https://cloud.ibm.com/registration?utm_content=academicsb)
2. Sign up with your email (academic email recommended for free credits)
3. Complete email verification

### Step 0B — Get IBM Bob (Required Primary Tool)

IBM Bob is the **required primary development tool** for the IBM AI Builders Challenge.

1. Go to [https://bit.ly/IBMBob-freetrial](https://bit.ly/IBMBob-freetrial)
2. Start your free trial using your IBM Cloud credentials
3. IBM Bob provides AI-assisted development capabilities used throughout this project

### Step 0C — Set Up watsonx.ai

1. Log in to [IBM Cloud Console](https://cloud.ibm.com)
2. Navigate to **Catalog → AI / Machine Learning → watsonx.ai**
3. Create a watsonx.ai instance (Lite/free tier is sufficient for development)
4. Go to **Manage → Access (IAM) → API Keys** → Create an API key → Copy and save it securely
5. Open your watsonx.ai project → Copy the **Project ID** from the project settings

> ⚠️ **Save both values**: `WATSONX_API_KEY` and `WATSONX_PROJECT_ID` — you'll need them in Step 2.

### Step 0D — IBM SkillsBuild (Required for Submission)

All team members must complete at least one IBM Bob-related course:

1. Go to [https://skillsbuild.org/](https://skillsbuild.org/)
2. Search for **"IBM Bob"** or **"watsonx"** courses
3. Complete the course and download your **completion certificate**
4. Upload the certificate as part of your hackathon submission

---

## Step 1 — Clone & Install

```powershell
git clone https://github.com/rajachairul-alt/Creative-Alibi-V2.git
cd Creative-Alibi-V2
npm install
```

This installs all 4 workspace packages: `shared`, `backend`, `word-plugin`, `web-dashboard`.

**What you should see:**
```
added XXXX packages, and audited XXXX packages in Xs
found 0 vulnerabilities
```

> If you see vulnerability warnings, run `npm audit fix` before proceeding.

---

## Step 2 — Configure IBM Credentials

```powershell
Copy-Item packages/backend/.env.example packages/backend/.env
```

Open `packages/backend/.env` in your editor and fill in your IBM credentials:

```env
# IBM watsonx.ai (REQUIRED)
WATSONX_API_KEY=your_ibm_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# Model (optional — defaults to granite-3-8b-instruct)
WATSONX_MODEL=ibm/granite-3-8b-instruct

# HuggingFace (OPTIONAL — for AI-likelihood detector)
# Without this key, the detector returns UNCERTAIN instead of a score
HUGGINGFACE_API_KEY=your_hf_key_here

# Port (optional — default 3001)
PORT=3001

# Environment (set to 'production' to enable rate limiting)
NODE_ENV=development
```

### Environment Variables Reference

#### Backend (`packages/backend/.env`)

| Variable | Required | Default | Description | Where to get it |
|---|---|---|---|---|
| `WATSONX_API_KEY` | ✅ | — | IBM Cloud API key | IBM Cloud → Manage → API Keys |
| `WATSONX_PROJECT_ID` | ✅ | — | watsonx.ai project ID | watsonx.ai → Project → Settings |
| `WATSONX_URL` | ✅ | `https://us-south.ml.cloud.ibm.com` | watsonx.ai endpoint | Based on your IBM Cloud region |
| `WATSONX_MODEL` | ❌ | `ibm/granite-3-8b-instruct` | Granite model ID | See [IBM Granite models](https://github.com/ibm-granite-community) |
| `HUGGINGFACE_API_KEY` | ❌ | `''` | HF API key | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| `PORT` | ❌ | `3001` | Backend server port | Any free port |
| `NODE_ENV` | ❌ | `development` | `production` enables rate limiting | — |

#### Web Dashboard Build Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_BACKEND_URL` | ❌ | `http://localhost:3001` | Backend API URL |
| `GITHUB_PAGES` | ❌ | `''` | Set to `1` for GitHub Pages base path |

#### Word Plugin Build Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_BACKEND_URL` | ❌ | `http://localhost:3001` | Backend API URL |
| `VITE_HTTPS` | ❌ | `''` | Set to `1` to enable HTTPS dev server |

> ⚠️ **Never commit `.env`**. It is listed in `.gitignore`. If you accidentally commit credentials, immediately rotate your IBM API key.

---

## Step 3 — Start All Services

### Option A: 1-Click Launcher (Windows — Recommended)

```powershell
.\start-dev.ps1
```

Opens 3 separate color-coded terminals automatically:
- 🟣 **Backend** → `http://localhost:3001`
- 🔵 **Word Plugin** → `http://localhost:3000`
- 🟢 **Web Dashboard** → `http://localhost:5173`

### Option B: npm (Cross-Platform)

```powershell
npm run dev
```

> All 3 services start concurrently in the same terminal using npm workspaces.

### Option C: Individual Services

Useful for debugging a specific package:

```powershell
npm run dev:backend     # Backend API only (port 3001)
npm run dev:plugin      # Word Add-in dev server (port 3000)
npm run dev:dashboard   # Web Dashboard (port 5173)
```

---

## Step 4 — Install the Word Add-in

> **Note**: Word Add-in installation requires Windows and Microsoft Word 2016+.

### Method A: Installer Script (Recommended)

Run as Administrator:

```powershell
.\install-addin.bat
```

This script automatically:
1. Creates an SMB share at `\\localhost\CreativeAlibiAddIn`
2. Copies `packages/word-plugin/manifest.xml` to the share
3. Adds the registry trust entry for Office 16.0

**After running the script:**
1. Restart Microsoft Word completely
2. Go to **Insert → Get Add-ins → My Organization**
3. Find **Creative Alibi: Authenticity Companion** and click **Add**

### Method B: Admin Installer (Enterprise / IT-Managed)

For machines where standard users cannot create network shares:

```powershell
.\install-addin-admin.bat
```

Run this from an elevated (Administrator) PowerShell or Command Prompt.

### Method C: Manual Registry Trust

1. Double-click `trust-addin.reg` → confirm the UAC prompt → click **Yes**
2. Copy `packages/word-plugin/manifest.xml` to any shared folder accessible on your machine
3. In Word: **File → Options → Trust Center → Trust Center Settings → Trusted Add-in Catalogs**
4. Add the UNC path of your shared folder (e.g., `\\localhost\CreativeAlibiAddIn`)
5. Check **"Show in Menu"** → Click **OK**
6. Restart Word

### Method D: Developer Sideload (Quickest for Testing)

Requires Word Developer ribbon enabled:
- **Insert → Add-ins → My Add-ins → Upload My Add-in**
- Browse to `packages/word-plugin/manifest.xml`
- Click **Upload**

> Note: Sideloaded add-ins are removed when Word is restarted.

---

## Step 5 — Verify Health

```powershell
# Backend health check
Invoke-WebRequest http://localhost:3001/health | Select-Object StatusCode, Content
```

**Expected response:**
```json
{
  "status": "ok",
  "model": "ibm/granite-3-8b-instruct",
  "guardian": "active",
  "timestamp": "2026-07-24T00:00:00.000Z"
}
```

**IBM Granite connectivity test:**
```powershell
# Quick AI response test
$body = @{ message = "Hello, Granite!" } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3001/api/ai/chat -Method POST -Body $body -ContentType "application/json"
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

### Backend (Node.js / Railway)

```powershell
npm run build --workspace=packages/backend
node packages/backend/dist/index.js
```

**Deploying to Railway:**
1. Push to `main` branch — the `deploy-backend.yml` workflow sends a notification
2. Log in to [Railway](https://railway.app) and connect your GitHub repository
3. Set environment variables in Railway dashboard (same as your `.env`)
4. Railway auto-deploys on each push

---

## Word Add-in Manifest Settings

The manifest is at `packages/word-plugin/manifest.xml`.

| Field | Value |
|---|---|
| **GUID** | `ca2024ab-1b2c-3d4e-5f6a-7b8c9d0e1f2a` |
| **Display Name** | Creative Alibi: Authenticity Companion |
| **Source URL (dev)** | `http://localhost:3000` |
| **Source URL (prod)** | Your HTTPS production URL |

To deploy to production, update all `http://localhost:3000` references in `manifest.xml` to your HTTPS production URL.

---

## GitHub Actions (CI/CD)

| Workflow | Trigger | Deploys To |
|---|---|---|
| `deploy-dashboard.yml` | Push to `main` (web-dashboard changes) | GitHub Pages |
| `deploy-word-plugin.yml` | Push to `main` (word-plugin changes) | GitHub Pages |
| `deploy-backend.yml` | Push to `main` (backend changes) | Railway (notify) |

### Required GitHub Secrets

Go to **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Used By | Value |
|---|---|---|
| `VITE_BACKEND_URL` | Dashboard build | Your Railway backend URL, e.g. `https://creative-alibi.up.railway.app` |

---

## Troubleshooting

### "Word Add-in not appearing in My Organization"

1. Ensure `install-addin.bat` ran **without errors** (try running as Administrator)
2. Check registry key exists:
   ```powershell
   Get-Item "HKCU:\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\CreativeAlibi"
   ```
3. In Word: **File → Options → Trust Center → Trust Center Settings → Trusted Add-in Catalogs**
4. Ensure `\\localhost\CreativeAlibiAddIn` is listed and **"Show in Menu"** is checked
5. Restart Word completely (not just close the document — exit from taskbar)

### "IBM Granite returning 401 / 403"

1. Check `WATSONX_API_KEY` has no trailing spaces or newlines
2. Verify `WATSONX_PROJECT_ID` matches your watsonx.ai project exactly
3. Test IAM token directly:
   ```powershell
   $body = "grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=$env:WATSONX_API_KEY"
   Invoke-RestMethod -Uri "https://iam.cloud.ibm.com/identity/token" -Method POST -Body $body -ContentType "application/x-www-form-urlencoded"
   ```
4. If token fetch fails: Rotate your API key in [IBM Cloud IAM](https://cloud.ibm.com/iam/apikeys)
5. Check backend logs: `http://localhost:3001/health`

### "qrcode.react / jspdf not found"

```powershell
npm install --workspace=packages/web-dashboard
```

### "TypeScript build errors"

Build packages in dependency order:

```powershell
npm run build --workspace=packages/shared
npm run build --workspace=packages/backend
npm run build --workspace=packages/web-dashboard
npm run build --workspace=packages/word-plugin
```

### "SMB share creation failed" (install-addin.bat)

```powershell
# Check if share already exists
net share CreativeAlibiAddIn

# If it exists but Word can't see it, remove and recreate:
net share CreativeAlibiAddIn /delete
.\install-addin.bat
```

### "npm install fails / ERESOLVE"

```powershell
# Clear npm cache and retry
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
```

---

## Additional Resources

| Resource | Link |
|---|---|
| IBM Bob Free Trial | [bit.ly/IBMBob-freetrial](https://bit.ly/IBMBob-freetrial) |
| IBM Granite Community | [github.com/ibm-granite-community](https://github.com/ibm-granite-community) |
| watsonx.ai Registration | [cloud.ibm.com/registration](https://cloud.ibm.com/registration?utm_content=academicsb) |
| IBM SkillsBuild | [skillsbuild.org](https://skillsbuild.org/) |
| LangChain Docs | [python.langchain.com](https://python.langchain.com/docs/get_started/introduction) |
| LangFlow | [langflow.org](https://www.langflow.org) |
| watsonx.ai Docs | [dataplatform.cloud.ibm.com/docs/content/wsj/getting-started/welcome-main.html](https://dataplatform.cloud.ibm.com/docs/content/wsj/getting-started/welcome-main.html) |

---

*Last updated: Creative Alibi v2.0.0 — IBM AI Builders Challenge 2026*
