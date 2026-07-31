<div align="center">

# 🪪 Creative Alibi: Authenticity Companion

### *Prove your writing is genuinely yours — even in the age of AI*

[![Live Dashboard](https://img.shields.io/badge/🌐%20Live%20Dashboard-GitHub%20Pages-2A9FBF?style=for-the-badge)](https://rajachairul-alt.github.io/Creative-Alibi-V2/)
[![Deploy Status](https://img.shields.io/github/actions/workflow/status/rajachairul-alt/Creative-Alibi-V2/deploy-dashboard.yml?branch=main&style=for-the-badge&label=Deploy)](https://github.com/rajachairul-alt/Creative-Alibi-V2/actions/workflows/deploy-dashboard.yml)
[![IBM Granite](https://img.shields.io/badge/IBM%20Granite-granite--3--8b--instruct-0F62FE?style=for-the-badge&logo=ibm)](https://www.ibm.com/granite)
[![watsonx.ai](https://img.shields.io/badge/watsonx.ai-Live%20Integration-7EB8D4?style=for-the-badge&logo=ibm)](https://www.ibm.com/watsonx)
[![Built with IBM Bob](https://img.shields.io/badge/Built%20with-IBM%20Bob-4CC38A?style=for-the-badge)](https://bit.ly/IBMBob-freetrial)
[![License: MIT](https://img.shields.io/badge/License-MIT-748D92?style=for-the-badge)](./LICENSE)

---

**IBM AI Builders Challenge 2025** · Challenge Theme: **AI for Education & Authenticity**

> *Built entirely with [IBM Bob](https://bit.ly/IBMBob-freetrial) as the primary development tool.*

</div>

---

## 🏆 Hackathon Submission Summary

| Field | Value |
|---|---|
| **Challenge** | IBM AI Builders Challenge — July 2025 |
| **Challenge Theme** | AI for Education / Responsible AI Use |
| **Primary Dev Tool** | **IBM Bob** (AI-powered IBM i development assistant) |
| **Core AI** | **IBM Granite** `granite-3-8b-instruct` via **watsonx.ai** |
| **Live URL** | [rajachairul-alt.github.io/Creative-Alibi-V2](https://rajachairul-alt.github.io/Creative-Alibi-V2/) |
| **Repository** | [github.com/rajachairul-alt/Creative-Alibi-V2](https://github.com/rajachairul-alt/Creative-Alibi-V2) |

---

## 🔥 The Problem

The rise of generative AI has created a **crisis of creative accountability**.

Students submit essays. Journalists file stories. Academics publish research. Content creators post articles. And increasingly, the question that follows is: *"Did you actually write this, or did an AI?"*

Current solutions are **broken**:
- 🚫 **AI detectors** produce false positives — flagging human writers as AI-generated
- 🚫 **Plagiarism checkers** don't address authorship at all
- 🚫 **Honour codes** rely on self-attestation with no evidence trail
- 🚫 **Blanket AI bans** punish legitimate, transparent AI use

**The real issue isn't whether someone used AI — it's whether the core intellectual process was theirs.**

---

## 💡 The Solution

**Creative Alibi** is an **Authenticity Companion** — a trust layer that sits inside your writing workflow and documents your creative process in real time.

> *Not a blocker. Not a detector. A witness.*

### How it works — in one paragraph

While you write, Creative Alibi's **Process Ledger** silently records your behavioral fingerprint: typing cadence (words per minute over time), natural pause patterns, revision depth, and any paste events. If you use **IBM Granite** as a writing assistant, every interaction is explicitly logged and disclosed — nothing is hidden. When you finish, the system computes an **Authenticity Score** across five dimensions and issues a **verifiable PDF Authenticity Report** with a QR code that links to the cryptographic record. The report doesn't say "this is human" — it says *"here is the evidence; judge for yourself."*

---

## 🤖 How IBM Bob Was Used

**IBM Bob was the primary development tool throughout this entire project.** Here's the specific breakdown:

| Phase | How IBM Bob Was Used |
|---|---|
| **Architecture Design** | Asked Bob to design a monorepo structure with 4 packages (shared, backend, word-plugin, web-dashboard), define package boundaries, and plan the IBM Granite integration layer |
| **IBM Granite Integration** | Bob wrote the entire `granite.service.ts` — IAM token refresh logic, watsonx.ai REST API calls, prompt engineering for each AI assist type (style, brainstorm, grammar), and Granite Guardian validation pipeline |
| **Backend API** | Bob scaffolded all 4 route groups (`/api/ai`, `/api/sessions`, `/api/reports`, `/health`), controllers, and services including the SHA-256 crypto ledger and Zod environment validation |
| **Microsoft Word Add-in** | Bob built the Office.js task pane — `Office.onReady()` initialization, `useTracker` hook for real-time behavioral telemetry, Zustand session store, and the 3-tab navigation (Tracker / AI Partner / Report) |
| **Web Dashboard** | Bob designed and implemented all 6 React pages with Recharts visualizations, jsPDF export, QR code generation, and the Moon Phases design system |
| **Accessibility & Design** | Bob applied WCAG AA compliance across all components — 4.5:1 contrast ratios, 44px touch targets, skip links, ARIA landmarks, focus rings, and `prefers-reduced-motion` support |
| **CI/CD Pipeline** | Bob wrote GitHub Actions workflows for zero-touch deployment to GitHub Pages with correct `GITHUB_PAGES=1` base path handling |
| **Debugging** | When the live site showed blank pages, Bob diagnosed the root cause (missing `GITHUB_PAGES=1` env var in CI), fixed the `paths:` filter in the workflow, and confirmed the fix by querying the GitHub Actions API |
| **Documentation** | This README, SETUP.md, and all inline code documentation were written by Bob |

---

## 🧠 AI Approach & Architecture

### Core AI Stack

```
Writer's Request
      │
      ▼
┌─────────────────────────────────────────────────────┐
│              Creative Alibi Backend                  │
│                  (Node.js / Express)                 │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │           granite.service.ts                  │   │
│  │                                              │   │
│  │  1. IAM Token Auth → iam.cloud.ibm.com       │   │
│  │  2. Prompt Builder (type-aware)              │   │
│  │  3. POST watsonx.ai /ml/v1/text/generation   │   │
│  │  4. Model: ibm/granite-3-8b-instruct         │   │
│  │  5. Fallback: ibm/granite-4-h-small          │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │                                    │
│  ┌──────────────▼───────────────────────────────┐   │
│  │           guardian.service.ts                 │   │
│  │  Validates output — filters hallucinations,   │   │
│  │  off-topic responses, harmful content         │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │                                    │
│  ┌──────────────▼───────────────────────────────┐   │
│  │         reportNarrative.service.ts            │   │
│  │  Uses Granite to generate the human-readable  │   │
│  │  narrative section of the Authenticity Report │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
      │
      ▼
  Response to Word Add-in or Web Dashboard
```

### AI Capabilities in the Product

| Feature | AI Model | What It Does |
|---|---|---|
| **Style Suggestion** | `granite-3-8b-instruct` | Analyses writing tone; suggests phrasing and structural improvements |
| **Brainstorming** | `granite-3-8b-instruct` | Generates multiple creative directions for the writer to choose from |
| **Grammar Check** | `granite-3-8b-instruct` | Identifies clarity, passive voice, and structural issues |
| **Report Narrative** | `granite-3-8b-instruct` | Writes the human-readable summary in the Authenticity Report |
| **AI Likelihood Signal** | HuggingFace (secondary) | Informational AI-probability estimate (does NOT affect eligibility) |
| **Safety Validation** | Granite Guardian (inline) | All outputs validated before reaching the writer |

### The Transparency Principle

Every IBM Granite interaction is:
1. **Logged** with timestamp, type, prompt, and response in the Process Ledger
2. **Disclosed** to the writer — they must explicitly **Accept** or **Decline** each suggestion
3. **Reported** — the AI assist count and each interaction appears verbatim in the Authenticity Report

This means Creative Alibi doesn't hide AI use — it **radically discloses** it, making AI assistance a feature rather than a liability.

---

## 🏗️ Full System Architecture

```
Creative-Alibi-V2/                     ← npm workspaces monorepo
│
├── packages/shared/                   ← Shared TypeScript types & constants
│   └── src/
│       ├── types.ts                   Branded UUID, ISOTimestamp types
│       └── constants.ts               IBM model IDs, score thresholds
│
├── packages/backend/                  ← Express API + IBM Granite integration
│   └── src/
│       ├── config/env.ts              Zod-validated environment variables
│       ├── config/watson.ts           IAM token client (auto-refresh)
│       ├── routes/                    /api/ai · /api/sessions · /api/reports · /health
│       └── services/
│           ├── granite.service.ts     ← IBM Granite REST calls
│           ├── guardian.service.ts    ← Output validation
│           ├── ledger.service.ts      ← Eligibility scoring engine
│           ├── report.service.ts      ← Authenticity Report assembly
│           ├── reportNarrative.ts     ← Granite narrative generation
│           └── crypto.service.ts      ← SHA-256 ledger integrity hash
│
├── packages/word-plugin/              ← Microsoft Word Add-in (Office.js + React)
│   ├── manifest.xml                   Office Add-in manifest
│   └── src/
│       ├── hooks/useTracker.ts        ← Real-time behavioral telemetry
│       ├── hooks/useAIPartner.ts      ← IBM Granite chat hook
│       ├── store/session.store.ts     ← Zustand session state
│       └── components/
│           ├── tracker/               WPM sparkline · cadence score · pause profile
│           ├── ai-partner/            IBM Granite chat with Accept/Decline logging
│           └── report/                In-plugin report preview + export
│
└── packages/web-dashboard/            ← React Web Dashboard (GitHub Pages)
    └── src/
        ├── pages/Dashboard/           Live stats · animated counters · 7-day chart
        ├── pages/Analytics/           6 charts: WPM timeline · radar · heatmap · more
        ├── pages/Sessions/            Sortable table · multi-filter · detail modal
        ├── pages/Reports/             PDF export (jsPDF) · QR code verification
        ├── pages/AIPartner/           Full IBM Granite chat + transparency log
        └── pages/Settings/            Privacy controls · IBM config · data export
```

### Data Flow

```
Word Add-in (keystroke events)
         │  behavioral telemetry (local)
         ▼
   Process Ledger (device-local)
         │  on session end
         ▼
   Backend API ──────────────────► IBM Granite (watsonx.ai)
         │  score + narrative            granite-3-8b-instruct
         ▼
   Authenticity Report
         │  PDF + QR code
         ▼
   Web Dashboard (analytics + sharing)
```

---

## 🚀 Live Deliverables

| Deliverable | Status | URL |
|---|---|---|
| 🎥 **Video Demo (Max 3 Min)** | ✅ Live | [Watch on YouTube](https://youtu.be/wItiDJtrpuU) |
| 🌐 **Web Dashboard** | ✅ Live | [rajachairul-alt.github.io/Creative-Alibi-V2](https://rajachairul-alt.github.io/Creative-Alibi-V2/) |
| 📝 **Word Add-in** | ✅ Sideloadable | See [SETUP.md](./SETUP.md) — 4-step install |
| ⚙️ **Backend API** | ✅ Runnable locally | `npm run dev:backend` → `localhost:3001` |
| 🤖 **IBM Granite** | ✅ Live credentials | `granite-3-8b-instruct` via `us-south.ml.cloud.ibm.com` |
| 📄 **PDF Reports** | ✅ Working | jsPDF + html2canvas · QR code verification |

---

## 🎨 Design System — Moon Phases

The entire UI uses a purpose-built design system called **Moon Phases** — deep-dark tones inspired by the cycle of visibility and authentication:

```
#1A2229  →  page background         (the void — deepest dark)
#212A31  →  card surface            (dark slate-navy)
#2E3944  →  elevated surface        (inputs, code blocks)
#124E66  →  brand accent dark teal  (IBM identity marker)
#2A9FBF  →  interactive teal        (4.8:1 contrast — WCAG AA ✓)
#748D92  →  muted text              (4.6:1 contrast — WCAG AA ✓)
#D3D9D4  →  primary text            (~12:1 contrast — WCAG AAA ✓)
#4CC38A  →  success green           (5.1:1 contrast ✓)
#E07070  →  error red               (4.8:1 contrast ✓)
#7EB8D4  →  IBM brand colour        (5.2:1 contrast ✓)
```

**Accessibility commitments**: WCAG AA ≥ 4.5:1 on all body text · 16px base font · 44px min touch targets · 3px focus rings · skip-link · full ARIA landmark structure · `prefers-reduced-motion` · `forced-colors` (Windows High Contrast) support.

---

## 🛠️ Quick Start

### Prerequisites

- **Node.js ≥ 18** (tested on v24.16.0)
- **IBM watsonx.ai** account — [free trial here](https://cloud.ibm.com/registration?utm_content=academicsb)
- **Microsoft Word 2016+** (for the Word Add-in)

### 3-Minute Setup

```bash
# 1. Clone
git clone https://github.com/rajachairul-alt/Creative-Alibi-V2.git
cd Creative-Alibi-V2

# 2. Install all packages (monorepo)
npm install

# 3. Configure IBM credentials
cp packages/backend/.env.example packages/backend/.env
# → Edit .env with your WATSONX_API_KEY and WATSONX_PROJECT_ID

# 4. Start everything
npm run dev
# Backend: localhost:3001  |  Word Plugin: localhost:3000  |  Dashboard: localhost:5173
```

> 📖 Full setup with Word Add-in installation → **[SETUP.md](./SETUP.md)**

---

## 📦 Package Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start all 3 services concurrently |
| `npm run dev:backend` | Backend API only (`localhost:3001`) |
| `npm run dev:plugin` | Word Add-in dev server (`localhost:3000`) |
| `npm run dev:dashboard` | Web Dashboard dev server (`localhost:5173`) |
| `npm run build` | Build all packages |
| `npm run build --workspace=packages/web-dashboard` | Dashboard only |

---

## 🔒 Security & Privacy

- **Local-first**: All Process Ledger data stored on the writer's device. Nothing sent to any server without explicit user action.
- **Minimal context exposure**: IBM Granite only receives the last 200 characters of document context — never the full document.
- **AES-256**: Optional ledger encryption at rest.
- **SHA-256 integrity hash**: Tamper-evident Process Ledger.
- **Secrets protected**: `.env` files are gitignored. IBM credentials never appear in git history.

---

## 🏅 Selected Challenge Theme

**AI for Education & Responsible AI Use**

Creative Alibi directly addresses the collision between AI adoption and academic / professional integrity. Rather than banning AI or pretending it doesn't exist, it provides a **transparent accountability layer** that:

1. Encourages honest AI use (disclose, don't hide)
2. Preserves human creative ownership
3. Gives educators and employers verifiable evidence
4. Demonstrates IBM Granite's role as a **responsible AI partner**, not a ghostwriter

---

## 🔗 Recommended Technologies Used

| Technology | Role in Project |
|---|---|
| **IBM Bob** | Primary development tool — architecture, code generation, debugging, docs |
| **IBM Granite** (`granite-3-8b-instruct`) | AI Creative Partner + Report Narrative generation |
| **watsonx.ai** | Granite model hosting, IAM authentication, REST API |
| **Node.js + TypeScript** | Backend API, all services |
| **React + Vite** | Web Dashboard + Word Add-in UI |
| **Office.js** | Microsoft Word Add-in integration |
| **GitHub Actions** | CI/CD — automated deploy to GitHub Pages |

---

## 👥 Team Members

1. **Raja Chairul Jannah Wydmann**  
   *Profession*: Maintenance Planner  
   *LinkedIn*: [linkedin.com/in/raja-wydmann00](https://www.linkedin.com/in/raja-wydmann00)

2. **Indri Anjar Kartikasari**  
   *Profession*: AI Engineer & Digital Transformation Leader  
   *LinkedIn*: [linkedin.com/in/indri-anjar-kartika-sari-](https://www.linkedin.com/in/indri-anjar-kartika-sari-/)

---

## 📄 License

MIT — see [LICENSE](./LICENSE)

---

<div align="center">

**Built for the [IBM AI Builders Challenge 2025](https://aibuilderschallenge-bobhub.bemyapp.com/#/sponsors/1-july-challenge)**

*Primary development tool: [IBM Bob](https://bit.ly/IBMBob-freetrial)*
*Core AI: IBM Granite via watsonx.ai*

</div>
