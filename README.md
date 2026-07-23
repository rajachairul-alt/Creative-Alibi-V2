# Creative Alibi: Authenticity Companion

> **IBM AI Builders Challenge 2025**
> *Prove your creative process is genuinely yours — powered by IBM Granite via watsonx.ai*

[![Deploy Dashboard → GitHub Pages](https://github.com/rajachairul-alt/Creative-Alibi-V2/actions/workflows/deploy-dashboard.yml/badge.svg)](https://github.com/rajachairul-alt/Creative-Alibi-V2/actions/workflows/deploy-dashboard.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-7C3AED.svg)](./LICENSE)
[![IBM Granite](https://img.shields.io/badge/IBM%20Granite-granite--3--8b--instruct-8B5CF6)](https://www.ibm.com/granite)

---

## 🎯 What is Creative Alibi?

In the age of generative AI, **proving you actually wrote your own work** has become a new challenge for students, academics, journalists, and content creators. Creative Alibi solves this — not by gatekeeping AI, but by documenting your authentic human process.

**Creative Alibi records your writing journey** — every keystroke rhythm, every revision, every thinking pause — and produces a cryptographically verifiable **Authenticity Report** that proves the work was genuinely created by you, even if you used AI as a creative partner.

### Core Innovation

> *It's not about blocking AI. It's about proving human authorship through transparent, documented process.*

- 📝 **Process Ledger** — Real-time behavioral fingerprinting of your writing (WPM cadence, pause patterns, revision depth)
- 🤖 **IBM Granite AI Partner** — AI assistance that's explicitly disclosed and logged, not hidden
- 🔒 **Authenticity Report** — Verifiable, shareable proof of your creative process
- 🧠 **Granite Guardian** — Every AI response validated for safety and context relevance

---

## 🚀 Live Demo

| Deliverable | URL |
|---|---|
| 🌐 **Web Dashboard** | [rajachairul-alt.github.io/Creative-Alibi-V2](https://rajachairul-alt.github.io/Creative-Alibi-V2/) |
| 📝 **Word Add-in** (manifest) | `\\localhost\CreativeAlibiAddIn\manifest.xml` (local sideload) |
| ⚙️ **Backend API** | Deploy to Railway via `packages/backend` |

---

## 🏗 Architecture

```
Creative-Alibi-V2/                          (npm workspaces monorepo)
├── packages/
│   ├── shared/                             Shared types & constants
│   │   └── src/
│   │       ├── types.ts                    Branded UUID/ISOTimestamp types
│   │       ├── constants.ts                IBM model IDs, thresholds
│   │       └── index.ts
│   │
│   ├── backend/                            Express API + IBM Granite
│   │   └── src/
│   │       ├── index.ts                    Server entry (dotenv first)
│   │       ├── types.ts                    Backend domain types
│   │       ├── constants.ts                Report version, Guardian phrases
│   │       ├── config/env.ts               Zod-validated env (WATSONX_*)
│   │       ├── config/watson.ts            IAM token client
│   │       ├── routes/                     /api/ai, /api/sessions, /api/reports
│   │       ├── controllers/                ai, session, report
│   │       └── services/
│   │           ├── granite.service.ts      IBM Granite REST (granite-3-8b-instruct)
│   │           ├── guardian.service.ts     Granite Guardian output validation
│   │           ├── detector.service.ts     HuggingFace AI-likelihood detector
│   │           ├── ledger.service.ts       Process Ledger eligibility gate
│   │           ├── report.service.ts       Authenticity Report assembly
│   │           ├── reportNarrative.service.ts  Granite narrative generation
│   │           └── crypto.service.ts       SHA-256 ledger hash
│   │
│   ├── word-plugin/                        Microsoft Word Add-in (Office.js)
│   │   ├── manifest.xml                    Office Add-in manifest (GUID: ca2024ab-...)
│   │   ├── vite.config.ts                  HTTP dev server (HTTPS opt-in via VITE_HTTPS=1)
│   │   └── src/
│   │       ├── main.tsx                    Office.onReady + browser fallback
│   │       ├── App.tsx                     Session init + tab routing
│   │       ├── types.ts                    Plugin-local types
│   │       ├── store/session.store.ts      Zustand session state
│   │       ├── hooks/useTracker.ts         Keystroke behavior tracker
│   │       ├── hooks/useAIPartner.ts       IBM Granite chat hook
│   │       ├── services/granite.service.ts Granite API calls
│   │       └── components/
│   │           ├── tracker/TrackerStatus.tsx
│   │           ├── tracker/CreativeTimeline.tsx
│   │           ├── ai-partner/AIPartnerChat.tsx
│   │           └── report/ReportPanel.tsx
│   │
│   └── web-dashboard/                      React web dashboard
│       ├── vite.config.ts                  GITHUB_PAGES base path + chunk splitting
│       └── src/
│           ├── App.tsx                     BrowserRouter + 6 routes
│           ├── utils/pdf.ts                jsPDF + html2canvas export
│           ├── layout/
│           │   ├── AppShell.tsx
│           │   ├── Sidebar.tsx             Futuristic nav with IBM status
│           │   └── Navbar.tsx              Live clock + search
│           └── pages/
│               ├── Dashboard/              Live stats, animated counters, charts
│               ├── Analytics/              WPM timeline, radar, pause distribution
│               ├── Sessions/               Search/filter/sort table
│               ├── Reports/                PDF export + QR code generation
│               ├── AIPartner/              Full IBM Granite chat interface
│               └── Settings/               Privacy, IBM config, data export
│
├── .github/workflows/
│   ├── deploy-dashboard.yml                GitHub Pages (GITHUB_PAGES=1)
│   ├── deploy-word-plugin.yml              GitHub Pages (manifest hosting)
│   └── deploy-backend.yml                  Railway deploy notification
│
├── start-dev.bat / start-dev.ps1           1-click dev launcher (3 terminals)
├── install-addin.bat                       Word Add-in installer (Shared Folder)
└── trust-addin.reg                         Registry trust entry
```

---

## 🤖 IBM Granite Integration

| Capability | Model | Purpose |
|---|---|---|
| **AI Creative Partner** | `ibm/granite-3-8b-instruct` | Style suggestions, brainstorming, grammar |
| **Report Narrative** | `ibm/granite-3-8b-instruct` | Human-readable authenticity summary |
| **Fallback** | `ibm/granite-4-h-small` | When primary model unavailable |
| **Safety Layer** | Granite Guardian (inline) | Output validation, harmful content filter |

All IBM Granite calls go through `packages/backend/src/services/granite.service.ts` using the watsonx.ai REST API with IAM token authentication.

---

## 🛠 Quick Start

### Prerequisites

- Node.js ≥ 18 (tested on v24.16.0)
- Microsoft Word 2016+ or Microsoft 365
- IBM watsonx.ai credentials (API key + Project ID)

### 1. Clone & Install

```powershell
git clone https://github.com/rajachairul-alt/Creative-Alibi-V2.git
cd Creative-Alibi-V2
npm install
```

### 2. Configure Environment

```powershell
Copy-Item packages/backend/.env.example packages/backend/.env
# Edit packages/backend/.env with your IBM credentials:
# WATSONX_API_KEY=your_key
# WATSONX_PROJECT_ID=your_project_id
# WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

### 3. Start Everything

```powershell
.\start-dev.ps1
# Or: npm run dev
```

This opens 3 terminals:
- **Backend** on `http://localhost:3001`
- **Word Plugin** on `http://localhost:3000`
- **Web Dashboard** on `http://localhost:5173`

### 4. Install Word Add-in

```powershell
.\install-addin.bat   # Creates SMB share + Registry trust entry
```

Then in Word: **Insert → Get Add-ins → My Organization** → Creative Alibi

---

## 📦 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start all packages (backend + plugin + dashboard) |
| `npm run dev:backend` | Backend only (`localhost:3001`) |
| `npm run dev:plugin` | Word plugin dev server (`localhost:3000`) |
| `npm run dev:dashboard` | Web dashboard dev server (`localhost:5173`) |
| `npm run build` | Build all packages |
| `npm run build --workspace=packages/web-dashboard` | Build dashboard only |

---

## 🔒 Security & Privacy

- **Local-first**: All Process Ledger data stored locally — nothing sent to server without user action
- **No document content leaked**: IBM Granite only sees the last 200 characters of context
- **AES-256 encryption**: Optional ledger encryption at rest
- **`.env` protected**: IBM credentials never committed (see `.gitignore`)
- **AUT(*EXCLUDE) principle**: Minimum required permissions throughout

---

## 📄 License

MIT — see [LICENSE](./LICENSE)

---

*Built for the IBM AI Builders Challenge 2025 by Creative Alibi Team*
*Powered by IBM Granite via watsonx.ai*
