# Creative Alibi: Authenticity Companion

> 📖 **Full setup guide (install → configure → deploy):** see **[SETUP.md](SETUP.md)**

> **The trust layer of the creative process** — powered by IBM Granite

[![IBM Granite](https://img.shields.io/badge/IBM%20Granite-3.3B%20Instruct-0F62FE?style=flat-square&logo=ibm)](https://www.ibm.com/granite)
[![watsonx.ai](https://img.shields.io/badge/watsonx.ai-Integrated-7C3AED?style=flat-square)](https://www.ibm.com/watsonx)
[![AI Builders Challenge](https://img.shields.io/badge/AI%20Builders%20Challenge-July%202026-10B981?style=flat-square)](https://developer.ibm.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)

---

```
 ██████╗██████╗ ███████╗ █████╗ ████████╗██╗██╗   ██╗███████╗
██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██║██║   ██║██╔════╝
██║     ██████╔╝█████╗  ███████║   ██║   ██║██║   ██║█████╗  
██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██║╚██╗ ██╔╝██╔══╝  
╚██████╗██║  ██║███████╗██║  ██║   ██║   ██║ ╚████╔╝ ███████╗
 ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═══╝  ╚══════╝
 █████╗ ██╗     ██╗██████╗ ██╗
██╔══██╗██║     ██║██╔══██╗██║
███████║██║     ██║██████╔╝██║
██╔══██║██║     ██║██╔══██╗██║
██║  ██║███████╗██║██████╔╝██║
╚═╝  ╚═╝╚══════╝╚═╝╚═════╝ ╚═╝
```

### *"Prove you wrote it. Protect what's yours."*

---

## 🎯 The Problem

AI content detectors are increasingly used by clients, publishers, universities, and platforms to screen submitted work. They are known to produce **false positives** — wrongly flagging genuine human writing as AI-generated.

This damages the credibility and livelihood of honest creators: **freelance writers, students, and journalists** who have no easy way to prove their work was truly their own.

**What's missing is a trustworthy, verifiable record of how a piece of work was actually made.**

---

## ✨ The Solution

Creative Alibi captures the **behavioral fingerprint** of your writing process — typing cadence, natural pauses, revision patterns, and copy-paste ratios — and compiles it into a cryptographically-signed **Authenticity Report** you can attach to any submission.

> *"Not a detector-evasion tool. Not an AI-washing machine. A honest record of real work."*

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICITY REPORT                       │
│                      Creative Alibi™                         │
├─────────────────────────────────────────────────────────────┤
│  Status:     ✓ ISSUED                                        │
│  Report ID:  CA-2024-A8F3E2D1                                │
│  Session:    34 minutes | 1,247 words                        │
│  Score:      91/100 Composite Authenticity                   │
├─────────────────────────────────────────────────────────────┤
│  Cadence Score:    88/100  ✓ Natural rhythm detected         │
│  Paste Ratio:      4.2%    ✓ Within threshold (max 20%)      │
│  Revisions:        23      ✓ Iterative authorship            │
│  AI Assist:        2 IBM Granite suggestions (1 accepted,    │
│                    1 declined) — fully disclosed             │
├─────────────────────────────────────────────────────────────┤
│  AI-Likelihood Signal: HUMAN (12%) — estimate only           │
│  Session Hash: sha256:8a3f2c1d...  (tamper-evident)          │
├─────────────────────────────────────────────────────────────┤
│  Powered by IBM Granite via watsonx.ai                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         CREATIVE ALIBI v2                        │
├──────────────┬────────────────────────┬───────────────────────────┤
│  Word Plugin │    Web Dashboard       │    Backend API            │
│  (Office.js) │    (React + Tailwind)  │    (Node.js + Express)    │
│  React 18    │    6 pages + Analytics │    REST API               │
│  Behavioral  │    Recharts            │    IBM Granite Integration│
│  Tracker     │    Session Management  │    Report Generator       │
└──────┬───────┴───────────┬────────────┴──────────┬────────────────┘
       │                   │                       │
       └───────────────────┴───────────────────────┘
                                   │
              ┌────────────────────▼─────────────────────┐
              │            BACKEND API                    │
              │  POST /api/ai/suggest                     │
              │  POST /api/session/start                  │
              │  POST /api/report/generate                │
              └──────────┬──────────────┬────────────────┘
                         │              │
              ┌──────────▼──┐  ┌────────▼───────────────┐
              │  IBM Granite │  │  desklib Detector      │
              │  watsonx.ai  │  │  (called ONCE only)    │
              │  + Guardian  │  │  HuggingFace Inference │
              └─────────────┘  └────────────────────────┘
```

---

## 🚀 Quick Start (5 Steps)

### Prerequisites
- Node.js >= 18
- npm >= 9
- IBM Cloud account with watsonx.ai access
- Hugging Face account (for desklib detector)
- Microsoft 365 (for Word Add-in testing)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-team/creative-alibi.git
cd creative-alibi

# 2. Install all workspace dependencies
npm install

# 3. Configure environment
cp packages/backend/.env.example packages/backend/.env
# Edit packages/backend/.env with your IBM API keys

# 4. Start the backend
npm run dev --workspace=packages/backend

# 5a. Start the web dashboard
npm run dev --workspace=packages/web-dashboard
# → Open http://localhost:5173

# 5b. Start the Word plugin (for Word Add-in testing)
npm run dev --workspace=packages/word-plugin
# → Sideload manifest.xml in Microsoft Word
```

### Sideloading the Word Plugin
1. Open Word → Insert → Add-ins → My Add-ins → Upload My Add-in
2. Browse to `packages/word-plugin/manifest.xml`
3. Click "Creative Alibi" button in the ribbon
4. The task pane opens with the AI Assistant

---

## 📦 Repository Structure

```
creative-alibi/
├── package.json                    # Monorepo root (npm workspaces)
├── README.md
├── ROADMAP.md                      # 4-week hackathon roadmap
├── PITCH.md                        # 3-minute demo pitch script
├── DEMO_SCRIPT.md                  # Video demo script
├── SUBMISSION.md                   # Hackathon submission checklist
│
├── packages/
│   ├── shared/                     # Shared TypeScript types & constants
│   │   └── src/
│   │       ├── types.ts            # All interfaces (ProcessLedger, AuthenticityReport, etc.)
│   │       └── constants.ts        # Validation thresholds & config
│   │
│   ├── word-plugin/                # Microsoft Word Add-in
│   │   ├── manifest.xml            # Office Add-in manifest
│   │   └── src/
│   │       ├── App.tsx             # Root + session init
│   │       ├── components/
│   │       │   ├── layout/         # Header, TabNav
│   │       │   ├── tracker/        # BehavioralTracker, CreativeTimeline
│   │       │   ├── ai-partner/     # AIPartnerChat, ChatMessage, PromptInput
│   │       │   └── report/         # ReportPanel
│   │       ├── hooks/              # useTracker, useAIPartner
│   │       ├── services/           # granite.service, tracker.service
│   │       └── store/              # Zustand session store
│   │
│   ├── web-dashboard/              # Full React Web Dashboard
│   │   └── src/
│   │       ├── layout/             # AppShell, Sidebar, Navbar
│   │       └── pages/
│   │           ├── Dashboard/      # Overview stats + charts
│   │           ├── Analytics/      # Deep-dive visualizations (Recharts)
│   │           ├── Sessions/       # Session history
│   │           ├── Reports/        # Report viewer + badge
│   │           ├── AIPartner/      # Full-screen IBM Granite chat
│   │           └── Settings/       # Privacy + Granite config
│   │
│   └── backend/                    # Node.js + Express API
│       └── src/
│           ├── config/             # Env validation (Zod), watsonx.ai client
│           ├── routes/             # ai, session, report, health
│           ├── controllers/
│           ├── services/
│           │   ├── granite.service.ts      # IBM Granite integration ★
│           │   ├── guardian.service.ts     # Granite Guardian guardrail ★
│           │   ├── detector.service.ts     # desklib (one-shot) ★
│           │   ├── ledger.service.ts       # Process validation
│           │   └── report.service.ts       # Authenticity Report compiler
│           └── tests/              # Jest unit tests
```

---

## 🤖 IBM Technology Integration

### IBM Granite (Primary AI Layer)
**Model**: `ibm/granite-3-3b-instruct` (fallback: `ibm/granite-3-8b-instruct`)  
**Platform**: IBM watsonx.ai  
**Role**: AI Creative Partner — provides style suggestions, brainstorming, and grammar assistance

Every suggestion is:
- ✅ Prompted with role-specific system instructions
- ✅ Validated by Granite Guardian rules
- ✅ Logged to the Process Ledger with timestamp
- ✅ Presented to the writer for explicit accept/decline
- ✅ Disclosed in the Authenticity Report

### Granite Guardian
Custom output validation layer that ensures IBM Granite's responses:
- Use hedging language ("you might consider...", "one option could be...")
- Don't exceed 150 words per suggestion
- Don't contain full prose paragraphs that could replace the writer's voice
- Never frame suggestions as directives ("Write:", "Here is:")

### IBM watsonx.ai
- IAM token-based authentication with automatic token refresh
- REST API integration via `/ml/v1/text/generation`
- Used for both AI Creative Partner suggestions and Authenticity Report narrative generation

---

## 🔬 Detection Layer (Informational Only)

**Model**: `desklib/ai-text-detector-v1.01` via Hugging Face  
**Called**: EXACTLY ONCE per session — after writing ends, before report generation  
**Role**: Informational AI-likelihood estimate printed transparently in the report  
**Safeguard**: Per-session call counter enforced with hard throw on second call

> ⚠️ **This is NOT a gate.** The detector score does NOT determine eligibility. Only the Process Ledger does. If the detector and the ledger disagree, the report states the discrepancy honestly.

---

## 🛡️ Security Design

| Concern | Mitigation |
|---------|-----------|
| Privacy | All Process Ledger data stays on-device by default |
| Tamper-evidence | SHA-256 hash of ledger included in every report |
| Gaming the tracker | Process metadata — not text content — determines eligibility |
| AI-washing | Guardian blocks full prose generation; all AI events logged |
| Evasion loop | desklib called once, hard-limited; no feedback to text |
| False positives | Discrepancy between signal and ledger noted honestly in report |

---

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| AI (Generative) | IBM Granite 3.3B Instruct via watsonx.ai |
| AI (Guardrail) | Custom Granite Guardian validation |
| AI (Detection) | desklib/ai-text-detector-v1.01 (HuggingFace) |
| Word Add-in | Office.js, React 18, Vite, Tailwind CSS |
| Web Dashboard | React 18, React Router v6, Recharts, Tailwind CSS |
| State Management | Zustand |
| Backend | Node.js, Express, TypeScript |
| Validation | Zod |
| Testing | Jest, ts-jest |
| Monorepo | npm workspaces |

---

## 🎬 Demo Video

> 📹 [Watch the 3-minute demo video](https://youtu.be/PLACEHOLDER)

Screenshots:

| Word Plugin — Tracker | Word Plugin — AI Partner | Web Dashboard |
|---|---|---|
| *(tracker screenshot)* | *(AI chat screenshot)* | *(dashboard screenshot)* |

---

## 👥 Team

| Role | Responsibility |
|------|---------------|
| **Product Lead** | PRD, pitch, narrative, submission |
| **Full-Stack Engineer** | Word Add-in, behavioral tracker, Creative Timeline |
| **Backend / AI Engineer** | Granite integration, report generator, validation |
| **UX/UI Designer** | Design system, web dashboard, report layout |
| **QA & Growth** | Testing, demo storytelling, submission materials |

---

## 🏆 AI Builders Challenge — July 2026

**Theme**: "Reimagine Creative Industries with AI"

Creative Alibi directly answers this theme by:
- Empowering creators to **work confidently with AI tools** without being penalized unfairly
- Using **IBM Granite** as a responsible AI assistant that helps without replacing
- Building **trust infrastructure** for the creator economy
- Demonstrating that AI can protect human creativity, not just replace it

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ and IBM Granite for the AI Builders Challenge 2026*
