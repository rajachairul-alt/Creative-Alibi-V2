# 🛠️ Creative Alibi — Complete Setup, Configuration & Deployment Guide

> From zero to a publicly deployed, fully working product in one document.

**Covers:**
1. [Prerequisites](#1-prerequisites)
2. [Get Your API Keys (step-by-step)](#2-get-your-api-keys)
   - IBM watsonx.ai (Granite)
   - Hugging Face
3. [Local Installation & First Run](#3-local-installation--first-run)
4. [Configure the Environment](#4-configure-the-environment)
5. [Run All Services Locally](#5-run-all-services-locally)
6. [Install the Word Add-in in Microsoft Word](#6-install-the-word-add-in-in-microsoft-word)
7. [Operate the App (User Guide)](#7-operate-the-app-user-guide)
8. [Deploy to Free Public Hosting](#8-deploy-to-free-public-hosting)
   - Backend → Railway (free tier)
   - Web Dashboard → Vercel (free tier)
   - Word Plugin → GitHub Pages (free)
9. [Post-Deploy: Update CORS & Manifest](#9-post-deploy-update-cors--manifest)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

Install these tools **before** anything else. Each item links to the official download.

### 1.1 Required Software

| Tool | Minimum Version | Check Command | Download |
|------|----------------|--------------|---------|
| **Node.js** | 18.x LTS | `node -v` | https://nodejs.org |
| **npm** | 9.x | `npm -v` | Included with Node.js |
| **Git** | 2.x | `git --version` | https://git-scm.com |
| **Microsoft Word** | 2016 or Microsoft 365 | — | https://microsoft.com/microsoft-365 |

> 💡 **Windows users**: Use PowerShell or Windows Terminal. Run as Administrator when installing.
> 💡 **Mac users**: Use Terminal. Install Node.js via the `.pkg` installer, not `brew`, for Office Add-in HTTPS compatibility.

### 1.2 Verify Your Node.js Version

```bash
node -v
# Must output: v18.x.x or v20.x.x

npm -v
# Must output: 9.x.x or 10.x.x
```

If the version is lower, download the LTS release from https://nodejs.org and reinstall.

---

## 2. Get Your API Keys

You need **two** API keys: one from IBM Cloud (for IBM Granite / watsonx.ai) and one from Hugging Face.

---

### 2.1 IBM watsonx.ai API Key + Project ID

This powers the AI Creative Partner (IBM Granite). Follow every step exactly.

#### Step A — Create a Free IBM Cloud Account

1. Go to **https://cloud.ibm.com/registration**
2. Fill in your email, password, and name
3. Select **"Create a free account"** — no credit card required for the free Lite plan
4. Check your email for the verification link and click it
5. Log in at **https://cloud.ibm.com**

#### Step B — Create an IBM Cloud API Key

1. In the IBM Cloud console, click your **profile icon** (top right) → **"IBM Cloud API Keys"**
   - Or go directly to: **https://cloud.ibm.com/iam/apikeys**
2. Click **"Create an IBM Cloud API key"**
3. Give it a name: `creative-alibi-key`
4. Click **"Create"**
5. **IMPORTANT**: Click **"Copy"** or **"Download"** immediately — you will NEVER see this key again after closing this window
6. Save the key somewhere safe (e.g. a password manager or a local text file)

Your key looks like: `abc123XYZ_abcDEF-ghiJKL_mnoPQR-stUVW`

#### Step C — Create a watsonx.ai Project

1. Go to **https://dataplatform.cloud.ibm.com/wx/home**
   - If prompted, log in with your IBM Cloud account
2. Click **"New project"** → **"Create an empty project"**
3. Name it: `creative-alibi`
4. Click **"Create"**
5. After creation, you are taken to the project page
6. Click the **"Manage"** tab → **"General"**
7. Find **"Project ID"** — it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
8. Copy and save this Project ID

#### Step D — Enable watsonx.ai in Your Region

1. In your IBM Cloud console, go to **Catalog** → search for **"Watson Machine Learning"**
2. Select **"Watson Machine Learning"**
3. Choose the **Lite (free)** plan
4. Set the region to **"us-south" (Dallas)** — this is required to match `WATSONX_URL`
5. Click **"Create"**
6. Go back to your watsonx.ai project → **"Manage"** → **"Services & integrations"**
7. Click **"Associate service"** → select the Watson Machine Learning instance you just created
8. Click **"Associate"**

> ✅ You now have:
> - `WATSONX_API_KEY` = the API key from Step B
> - `WATSONX_PROJECT_ID` = the project ID from Step C
> - `WATSONX_URL` = `https://us-south.ml.cloud.ibm.com` (fixed value)

#### Step E — Test Your Granite Access (Optional but Recommended)

Run this in your terminal to confirm Granite responds before wiring up the app:

```bash
# First, get a Bearer token
curl -X POST "https://iam.cloud.ibm.com/identity/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=YOUR_API_KEY_HERE"

# Copy the "access_token" from the response, then:
curl -X POST "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "ibm/granite-3-3b-instruct",
    "input": "Hello, are you working?",
    "parameters": { "max_new_tokens": 20 },
    "project_id": "YOUR_PROJECT_ID"
  }'
```

You should get a JSON response with a `generated_text` field. If so, your keys work.

---

### 2.2 Hugging Face API Token

This powers the one-shot AI-likelihood detector (`desklib/ai-text-detector-v1.01`).

#### Step A — Create a Free Hugging Face Account

1. Go to **https://huggingface.co/join**
2. Enter a username, email, and password
3. Click **"Register"**
4. Verify your email address

#### Step B — Create an Access Token

1. Log in, then click your profile picture (top right) → **"Settings"**
   - Or go directly to: **https://huggingface.co/settings/tokens**
2. Click **"New token"**
3. Name it: `creative-alibi-detector`
4. Role: **"Read"** is sufficient
5. Click **"Generate a token"**
6. Copy the token — it looks like: `hf_AbCdEfGhIjKlMnOpQrStUvWxYz123456`
7. Save it securely

> ✅ You now have:
> - `HUGGINGFACE_API_KEY` = the token you just copied

---

## 3. Local Installation & First Run

### 3.1 Clone the Repository

```bash
git clone https://github.com/your-team/creative-alibi.git
cd creative-alibi
```

> If you are working from the existing folder (not from a git clone):
> ```bash
> cd "C:\Users\YOGA 7\IBM Bob\Hackathon-pre\Creative-Alibi-V2"
> ```

### 3.2 Install All Dependencies

The project is a **monorepo** with 4 packages. Install everything with one command:

```bash
npm install
```

This will install dependencies for:
- `packages/shared` — shared TypeScript types
- `packages/backend` — Node.js API server
- `packages/web-dashboard` — React web app
- `packages/word-plugin` — Microsoft Word Add-in

Expected output: `added XXX packages in Xs` — no errors.

> ⚠️ If you see peer dependency warnings, ignore them — they are non-critical.
> ⚠️ If you see `ERESOLVE` errors, run: `npm install --legacy-peer-deps`

### 3.3 Build the Shared Package

The `shared` package must be built first because `backend`, `web-dashboard`, and `word-plugin` all depend on its compiled types:

```bash
npm run build --workspace=packages/shared
```

Expected output: `dist/index.js`, `dist/index.mjs`, `dist/index.d.ts` created inside `packages/shared/dist/`.

---

## 4. Configure the Environment

### 4.1 Create the Backend `.env` File

```bash
# Copy the example file
cp packages/backend/.env.example packages/backend/.env
```

On Windows (PowerShell):
```powershell
Copy-Item packages\backend\.env.example packages\backend\.env
```

### 4.2 Open and Fill In the `.env` File

Open `packages/backend/.env` in any text editor (VS Code, Notepad, etc.) and replace every placeholder:

```env
# ─── IBM watsonx.ai ──────────────────────────────────────────────────
# Your IBM Cloud API Key (from Section 2.1 Step B)
WATSONX_API_KEY=abc123XYZ_abcDEF-ghiJKL_mnoPQR-stUVW

# Your watsonx.ai Project ID (from Section 2.1 Step C)
WATSONX_PROJECT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890

# Fixed URL — do NOT change unless your project is in a different region
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_IAM_URL=https://iam.cloud.ibm.com/identity/token

# ─── IBM Granite Model ────────────────────────────────────────────────
# Use the 3B model for fast responses (hackathon / demo)
GRANITE_MODEL_ID=ibm/granite-3-3b-instruct
GRANITE_FALLBACK_MODEL_ID=ibm/granite-3-8b-instruct

# ─── Hugging Face ─────────────────────────────────────────────────────
# Your Hugging Face token (from Section 2.2 Step B)
HUGGINGFACE_API_KEY=hf_AbCdEfGhIjKlMnOpQrStUvWxYz123456

# ─── Backend Server ───────────────────────────────────────────────────
PORT=3001
NODE_ENV=development
HOST=0.0.0.0

# ─── Security Keys ────────────────────────────────────────────────────
# Generate a random 32-char key. Run in terminal:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_ENCRYPTION_KEY=paste_your_64_char_hex_here

# Generate another random key for JWT:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=paste_your_64_char_hex_here

# ─── CORS ─────────────────────────────────────────────────────────────
# During local development, keep these as-is
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://localhost:3000

# ─── Rate Limiting ────────────────────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ─── AI Partner ───────────────────────────────────────────────────────
GRANITE_MAX_TOKENS=300
GRANITE_TIMEOUT_MS=30000

# ─── Detector Safety (DO NOT CHANGE) ──────────────────────────────────
DETECTOR_MAX_CALLS_PER_SESSION=1
```

### 4.3 Generate Your Security Keys

Run these two commands in your terminal and paste the output into `.env`:

```bash
# For SESSION_ENCRYPTION_KEY:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For JWT_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Each command prints a unique 64-character hex string. Use different values for each variable.

### 4.4 Create Frontend Environment Files

Create a `.env` for the web dashboard:

```bash
# packages/web-dashboard/.env
echo "VITE_BACKEND_URL=http://localhost:3001" > packages/web-dashboard/.env
echo "VITE_APP_NAME=Creative Alibi" >> packages/web-dashboard/.env
```

Create a `.env` for the Word plugin:

```bash
# packages/word-plugin/.env
echo "VITE_BACKEND_URL=http://localhost:3001" > packages/word-plugin/.env
```

---

## 5. Run All Services Locally

You need **3 terminals** running simultaneously.

### Terminal 1 — Backend API

```bash
cd packages/backend
npm run dev
```

Expected output:
```
╔══════════════════════════════════════════════════════════╗
║        Creative Alibi API v2.0 — Server Started          ║
║  Port: 3001  |  Environment: development                 ║
║  IBM Granite: ibm/granite-3-3b-instruct                  ║
╚══════════════════════════════════════════════════════════╝
```

**Verify it works:**
```bash
curl http://localhost:3001/api/health
# Expected: {"status":"ok","service":"creative-alibi-api",...}
```

### Terminal 2 — Web Dashboard

```bash
cd packages/web-dashboard
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser. You should see the Creative Alibi dashboard.

### Terminal 3 — Word Plugin Dev Server

```bash
cd packages/word-plugin
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in XXX ms
  ➜  Local:   https://localhost:3000/
```

> ⚠️ **HTTPS is required** for Office Add-ins. The dev server uses a self-signed certificate.
> Your browser will show a security warning — click "Advanced" → "Proceed to localhost (unsafe)".
> This is normal and only happens in development.

---

## 6. Install the Word Add-in in Microsoft Word

### 6.1 Trust the Development Certificate (Windows)

Because the plugin runs on `https://localhost:3000` with a self-signed certificate, you must trust it:

1. Open your browser and navigate to **https://localhost:3000**
2. You will see a "Your connection is not private" warning
3. Click **Advanced** → **Proceed to localhost (unsafe)**
4. You should see the Creative Alibi plugin UI load in the browser
5. Now Word will also accept this certificate

### 6.2 Sideload in Microsoft Word (Desktop)

**On Windows:**
1. Open **Microsoft Word** (any document)
2. Click the **Insert** tab in the ribbon
3. Click **Add-ins** → **My Add-ins**
4. In the "My Add-ins" dialog, click **Upload My Add-in** (bottom left)
5. Browse to: `packages/word-plugin/manifest.xml`
6. Click **Upload**
7. The **Creative Alibi** button now appears in the **Home** tab ribbon

**On Mac:**
1. Open **Microsoft Word** (any document)
2. Click **Insert** → **Add-ins** → **My Add-ins**
3. Click the **"..."** menu → **Upload My Add-in**
4. Browse to `packages/word-plugin/manifest.xml`
5. Click **Open**

### 6.3 Sideload in Word Online (Browser)

1. Go to **https://www.office.com** → open Word Online
2. Open or create a document
3. Click **Insert** → **Add-ins** → **More Add-ins**
4. Click **Upload My Add-in**
5. Upload `packages/word-plugin/manifest.xml`

### 6.4 Open the Plugin Task Pane

After sideloading:
1. In the Word ribbon, go to the **Home** tab
2. Find the **"Creative Alibi"** group
3. Click **"Open Alibi"** to open the task pane on the right side
4. The task pane shows three tabs: **Tracker | AI Partner | Report**

---

## 7. Operate the App (User Guide)

### 7.1 Starting a Writing Session (Word Plugin)

1. Open Microsoft Word and load or create a document
2. Click **"Open Alibi"** in the ribbon to open the task pane
3. In the **Tracker** tab, click **"▶ Start Tracking"**
4. A green pulsing dot appears: **TRACKING**
5. Begin writing your document normally

**What is being tracked (all local, private):**
- Typing cadence (inter-keystroke intervals)
- Natural pause events (gaps > 500ms)
- Copy/paste events (large text insertions)
- Revision count (deletions followed by new typing)
- Active typing time vs. total session time

### 7.2 Using the AI Creative Partner (Word Plugin)

1. Click the **AI Partner** tab in the task pane
2. Select the type of help you need:
   - **✍️ Style** — voice, rhythm, word choice suggestions
   - **💡 Ideas** — brainstorming directions (not written content)
   - **📝 Grammar** — grammar and clarity notes
3. Type your question in the text box (e.g. *"How can I make this opening more engaging?"*)
4. Press **Enter** or click the send button
5. IBM Granite responds with hedged, non-directive suggestions
6. Click **✓ Accept** or **✗ Decline** for each suggestion
7. All interactions are automatically logged in your Process Ledger

> ⚠️ Every AI interaction is logged and will appear in your Authenticity Report.
> This is intentional and required for the system to work honestly.

### 7.3 Generating an Authenticity Report (Word Plugin)

1. Finish writing your document
2. Click the **Report** tab in the task pane
3. Review the eligibility checklist — all items should show ✓:
   - Cadence Score ≥ 75/100
   - Paste Ratio ≤ 20%
   - Revisions ≥ 3
   - Duration ≥ 2 minutes
4. Click **"Generate Authenticity Report"**
5. Wait 10–30 seconds while IBM Granite compiles the report narrative
6. The report appears with:
   - **Status**: ISSUED ✓ or NOT ELIGIBLE ✗
   - **Composite Score**: 0–100
   - **Verified Badge** with your session ID
7. Click **↓ Download PDF** to save the report
8. Attach the PDF to your submission/email/publication

### 7.4 Using the Web Dashboard

Open **http://localhost:5173** in your browser.

#### Dashboard (Home)
- See totals: sessions, reports issued, average cadence score
- View the 7-day cadence trend chart
- Click any recent session to open its detail

#### Analytics
- Select a session from the dropdown
- View the **WPM over time** chart (typing speed history)
- View **Pause Distribution** — how often you paused and for how long
- View the **Authorship Radar** — a pentagon showing all 5 score dimensions

#### Reports
- All generated reports listed with status badges
- Click any report to open the detail modal
- Download PDF, copy share link, or get the embed badge code
- The embed code lets you add a "Verified Creative Process" badge to your website/portfolio

#### AI Partner (Full Screen)
- Full-screen version of the chat interface
- Right panel shows your current session context (words, cadence score, duration)
- Select Style / Brainstorm / Grammar from the type buttons
- Type and send — IBM Granite responds
- All interactions are logged

#### Settings
- Toggle local-only data storage
- Configure your IBM watsonx.ai API key and Project ID from the UI
- Choose Granite model variant (3B for speed, 8B for quality)

---

## 8. Deploy to Free Public Hosting

The strategy: deploy each piece to the best free platform for its type.

| Component | Platform | Free Tier Limit | Link |
|-----------|----------|----------------|------|
| **Backend API** | Railway | $5 credit/month (~500 hrs) | https://railway.app |
| **Web Dashboard** | Vercel | Unlimited for hobby | https://vercel.com |
| **Word Plugin** | GitHub Pages | Unlimited static | https://pages.github.com |

---

### 8.1 Push Your Code to GitHub

Before deploying, your code must be in a GitHub repository.

```bash
# Initialize git if not already done
git init
git add .
git commit -m "feat: initial Creative Alibi v2 build"

# Create a new repo on GitHub at https://github.com/new
# Name it: creative-alibi
# Set it to Public
# Do NOT initialize with README (your code is already there)

# Connect and push
git remote add origin https://github.com/YOUR_USERNAME/creative-alibi.git
git branch -M main
git push -u origin main
```

---

### 8.2 Deploy the Backend to Railway

Railway gives you a always-on Node.js server on the free tier.

#### Step 1 — Sign Up for Railway

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Sign up with your **GitHub account** (recommended — enables auto-deploy)
4. Authorize Railway to access your GitHub repositories

#### Step 2 — Create a New Project

1. In the Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Search for and select **`creative-alibi`**
4. Railway detects it's a Node.js project

#### Step 3 — Configure the Service

1. Railway creates a service — click on it
2. Go to **Settings** tab
3. Under **"Root Directory"**, type: `packages/backend`
4. Under **"Build Command"**, type: `npm run build`
5. Under **"Start Command"**, type: `node dist/index.js`

#### Step 4 — Add Environment Variables

1. Click the **Variables** tab
2. Click **"Add Variable"** for each of the following (copy from your `.env` file):

```
WATSONX_API_KEY          = your-ibm-api-key
WATSONX_PROJECT_ID       = your-project-id
WATSONX_URL              = https://us-south.ml.cloud.ibm.com
WATSONX_IAM_URL          = https://iam.cloud.ibm.com/identity/token
GRANITE_MODEL_ID         = ibm/granite-3-3b-instruct
GRANITE_FALLBACK_MODEL_ID= ibm/granite-3-8b-instruct
HUGGINGFACE_API_KEY      = your-hf-token
PORT                     = 3001
NODE_ENV                 = production
SESSION_ENCRYPTION_KEY   = your-64-char-hex
JWT_SECRET               = your-64-char-hex
ALLOWED_ORIGINS          = https://creative-alibi.vercel.app,https://YOUR_USERNAME.github.io
RATE_LIMIT_WINDOW_MS     = 900000
RATE_LIMIT_MAX_REQUESTS  = 100
GRANITE_MAX_TOKENS       = 300
GRANITE_TIMEOUT_MS       = 30000
DETECTOR_MAX_CALLS_PER_SESSION = 1
```

> 💡 Tip: Railway has a "bulk add" feature — click "RAW Editor" and paste all variables at once.

#### Step 5 — Deploy

1. Click **"Deploy"**
2. Watch the build logs — takes 1–3 minutes
3. Once green, click **"Generate Domain"** (under Settings → Networking)
4. Your backend URL looks like: `https://creative-alibi-production.up.railway.app`
5. Test it:
   ```
   https://creative-alibi-production.up.railway.app/api/health
   ```
   Should return: `{"status":"ok","service":"creative-alibi-api",...}`

Save this URL — you need it for the next steps.

---

### 8.3 Deploy the Web Dashboard to Vercel

Vercel is the best free platform for React/Vite apps with zero configuration.

#### Step 1 — Sign Up for Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub repositories

#### Step 2 — Import Your Project

1. In the Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find and click **"Import"** next to your `creative-alibi` repository

#### Step 3 — Configure the Project

Vercel's auto-detection may select the wrong root. Configure manually:

1. **Framework Preset**: `Vite`
2. **Root Directory**: Click **"Edit"** → type `packages/web-dashboard` → click **"Continue"**
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `dist` (auto-detected)
5. **Install Command**: `npm install`

#### Step 4 — Add Environment Variables

Click **"Environment Variables"** and add:

```
VITE_BACKEND_URL = https://creative-alibi-production.up.railway.app
VITE_APP_NAME    = Creative Alibi
```

Replace the Railway URL with the actual URL you got in Step 8.2.

#### Step 5 — Deploy

1. Click **"Deploy"**
2. Vercel builds and deploys in 1–2 minutes
3. Your dashboard URL looks like: `https://creative-alibi.vercel.app`
4. Open it in your browser — the full dashboard is live!

#### Step 6 — Set Up a Custom Domain (Optional, Free)

1. In your Vercel project, click **Domains**
2. Add a free `.vercel.app` subdomain, e.g. `creative-alibi-app.vercel.app`
3. Or connect your own domain (if you own one)

---

### 8.4 Deploy the Word Plugin to GitHub Pages

The Word plugin must be served over **HTTPS**. GitHub Pages provides this for free.

#### Step 1 — Enable GitHub Pages in Your Repo

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/creative-alibi`
2. Click **Settings** tab
3. In the left sidebar, click **Pages**
4. Under **"Source"**, select **"GitHub Actions"**

#### Step 2 — Create the GitHub Actions Workflow

Create this file in your project:

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/deploy-word-plugin.yml`:

```yaml
name: Deploy Word Plugin to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'packages/word-plugin/**'
      - 'packages/shared/**'

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Build shared package
        run: npm run build --workspace=packages/shared

      - name: Build Word plugin
        run: npm run build --workspace=packages/word-plugin
        env:
          VITE_BACKEND_URL: https://creative-alibi-production.up.railway.app

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: packages/word-plugin/dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

```bash
git add .github/workflows/deploy-word-plugin.yml
git commit -m "ci: deploy word plugin to github pages"
git push
```

#### Step 3 — Get Your Plugin URL

After the GitHub Action completes (3–5 minutes):
1. Go to your repo → **Settings** → **Pages**
2. Your plugin URL is: `https://YOUR_USERNAME.github.io/creative-alibi/`

---

## 9. Post-Deploy: Update CORS & Manifest

After deploying, you must update two files to use the live URLs instead of `localhost`.

### 9.1 Update CORS in Railway

In Railway → Variables, update:
```
ALLOWED_ORIGINS = https://creative-alibi.vercel.app,https://YOUR_USERNAME.github.io
```

Redeploy by clicking "Deploy" or pushing a new commit.

### 9.2 Update the Word Plugin Manifest

Open `packages/word-plugin/manifest.xml` and replace all `https://localhost:3000` with your GitHub Pages URL:

```xml
<!-- Change this: -->
<SourceLocation DefaultValue="https://localhost:3000/index.html" />

<!-- To this: -->
<SourceLocation DefaultValue="https://YOUR_USERNAME.github.io/creative-alibi/index.html" />
```

Also update the icon URLs and the `TaskpaneUrl` resource. Then:

```bash
git add packages/word-plugin/manifest.xml
git commit -m "chore: update manifest for production deployment"
git push
```

The GitHub Action will automatically rebuild and redeploy the plugin.

### 9.3 Distribute the Manifest File

Users install your Word plugin by downloading and sideloading `manifest.xml`:

1. Add a download link to your README or website:
   ```
   https://raw.githubusercontent.com/YOUR_USERNAME/creative-alibi/main/packages/word-plugin/manifest.xml
   ```
2. Users follow the sideloading steps in Section 6 of this guide
3. Or, for organizations: push the manifest via **Microsoft 365 Admin Center** → Integrated Apps

---

## 10. Troubleshooting

### ❌ `npm install` fails with `ERESOLVE` error

```bash
npm install --legacy-peer-deps
```

### ❌ Backend starts but Granite calls fail with 401 Unauthorized

Your IBM API key is invalid or your watsonx.ai service is not associated with your project.
- Re-verify Steps 2.1 D and 2.1 E
- Make sure your Watson Machine Learning service is in **us-south** (Dallas)
- Check that `WATSONX_PROJECT_ID` matches the project where the WML service is associated

### ❌ Backend fails with "WATSONX_API_KEY is required"

Your `.env` file is either missing, in the wrong location, or has a typo.
- It must be at `packages/backend/.env` (not root `.env`)
- Check for leading/trailing spaces around `=` in the `.env` file

### ❌ Word plugin shows blank white pane

The dev server is not running or HTTPS is not trusted.
- Confirm Terminal 3 (`npm run dev` in `packages/word-plugin`) is running
- Open `https://localhost:3000` directly in Chrome and accept the certificate
- Re-sideload the manifest

### ❌ Word plugin ribbon button does not appear

The manifest was not loaded correctly.
- Remove the add-in: Insert → Add-ins → My Add-ins → right-click Creative Alibi → Remove
- Restart Word
- Re-sideload the manifest file

### ❌ Web dashboard shows blank page on Vercel

- Check Vercel build logs for errors
- Confirm `VITE_BACKEND_URL` is set in Vercel environment variables
- Make sure the Root Directory is set to `packages/web-dashboard`

### ❌ Railway deploy fails with "Cannot find module"

The shared package wasn't built before the backend.
Add a `build` script to `packages/backend/package.json`:
```json
"build": "cd ../shared && npm run build && cd ../backend && tsc"
```

### ❌ "CORS error" in the browser console

Your deployed backend's `ALLOWED_ORIGINS` does not include your frontend URL.
- In Railway Variables, add your Vercel URL to `ALLOWED_ORIGINS`
- Redeploy the backend

### ❌ Hugging Face detector returns 503

The `desklib/ai-text-detector-v1.01` model may be cold-starting.
- The first call after inactivity can take 20–30 seconds
- This is normal for Hugging Face Inference API free tier
- The code handles this gracefully — the report will still be generated with an "UNCERTAIN" signal

---

## Quick Reference — All URLs

| Service | Local URL | Production URL |
|---------|----------|---------------|
| Backend API | http://localhost:3001 | https://your-app.up.railway.app |
| Web Dashboard | http://localhost:5173 | https://creative-alibi.vercel.app |
| Word Plugin | https://localhost:3000 | https://your-username.github.io/creative-alibi |
| API Health | http://localhost:3001/api/health | https://your-app.up.railway.app/api/health |

## Quick Reference — All API Keys Needed

| Key | Where to Get It | Where to Put It |
|-----|----------------|----------------|
| `WATSONX_API_KEY` | IBM Cloud → IAM → API Keys | `packages/backend/.env` |
| `WATSONX_PROJECT_ID` | watsonx.ai project → Manage → General | `packages/backend/.env` |
| `HUGGINGFACE_API_KEY` | huggingface.co → Settings → Tokens | `packages/backend/.env` |
| `SESSION_ENCRYPTION_KEY` | Generate locally (see §4.3) | `packages/backend/.env` |
| `JWT_SECRET` | Generate locally (see §4.3) | `packages/backend/.env` |

---

*Questions? Open an issue on GitHub or refer to the [README.md](README.md).*
