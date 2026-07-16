# 🏆 HACKATHON SUBMISSION — Creative Alibi: Authenticity Companion

**Challenge**: AI Builders Challenge — July 2026  
**Theme**: "Reimagine Creative Industries with AI"  
**Submission Date**: July 31, 2026  

---

## 📋 Submission Checklist

### Required Materials
- [x] GitHub repository with complete source code
- [x] 3-minute demo video (see Demo Video section)
- [x] Product Requirements Document (PRD v4.0)
- [x] README with setup instructions
- [x] IBM technology integration documentation

---

## 🎯 Product Summary (3 Sentences)

Creative Alibi is an Authenticity Companion for content creators that captures the behavioral fingerprint of writing — typing cadence, pause patterns, and revision depth — and compiles it into a cryptographically-signed Authenticity Report the writer can attach to any submission as verifiable evidence of genuine authorship. The product directly addresses the false-positive AI detection crisis facing freelance writers, students, and journalists, while embracing responsible AI use through a fully disclosed IBM Granite AI Creative Partner that logs every interaction in the Process Ledger. Built as both a Microsoft Word Add-in and a comprehensive web dashboard, Creative Alibi answers the "Reimagine Creative Industries with AI" theme by turning AI from a threat to creator trust into the infrastructure that defends it.

---

## 🤖 IBM Technology Used

### Primary Integration: IBM Granite

| Technology | Version | Integration |
|-----------|---------|-------------|
| IBM Granite | granite-3-3b-instruct | AI Creative Partner (style, brainstorm, grammar) |
| IBM Granite (fallback) | granite-3-8b-instruct | Automatic fallback if primary model unavailable |
| IBM watsonx.ai | REST API v1 | Authentication, model hosting, inference |
| Granite Guardian | Custom validation layer | Output guardrail ensuring suggestions stay in scope |

**Where IBM Granite is Used**:

1. **AI Creative Partner** (`packages/backend/src/services/granite.service.ts`)  
   - Called when writer requests style suggestions, brainstorming, or grammar help
   - System prompts enforce hedging language ("you might consider...", not "write this:")
   - Granite Guardian validates every output before returning to the writer
   - Endpoint: `POST /api/ai/suggest`

2. **Authenticity Report Narrative** (`packages/backend/src/services/reportNarrative.service.ts`)  
   - IBM Granite generates the human-readable summary paragraph of the Authenticity Report
   - Factual, neutral tone prompt engineering
   - Endpoint: called within `POST /api/report/generate`

3. **Model Access**: IBM IAM token authentication with automatic refresh, pointing to `https://us-south.ml.cloud.ibm.com/ml/v1/text/generation`

### Supporting Technology: desklib/ai-text-detector-v1.01

- **Role**: Informational AI-likelihood signal in the Authenticity Report
- **Called**: ONCE per session (hard enforced — see `packages/backend/src/services/detector.service.ts`)
- **Platform**: Hugging Face Inference API
- **Critical constraint**: Never in a loop; never gates eligibility; discrepancies reported honestly

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ENTRY POINTS                         │
├──────────────────────┬──────────────────────────────────────┤
│   Microsoft Word     │         Web Browser                   │
│   (Office Add-in)    │      (React Dashboard)                │
│   packages/word-plugin│     packages/web-dashboard           │
└──────────┬───────────┴───────────────┬──────────────────────┘
           │                           │
           └─────────────┬─────────────┘
                         │ REST API
                         ▼
         ┌───────────────────────────────┐
         │     Node.js + Express API     │
         │   packages/backend/src/       │
         │                               │
         │  /api/ai/suggest              │
         │  /api/session/start           │
         │  /api/session/:id             │
         │  /api/report/generate         │
         └───────┬────────────┬──────────┘
                 │            │
    ┌────────────▼──┐    ┌───▼──────────────────┐
    │  IBM Granite  │    │  desklib detector     │
    │  watsonx.ai   │    │  (Hugging Face)       │
    │  + Guardian   │    │  ONE CALL PER SESSION │
    └───────────────┘    └──────────────────────┘
```

---

## 📁 Repository Structure

```
creative-alibi/                     # Monorepo root
├── packages/
│   ├── shared/                     # Shared TypeScript types + constants
│   ├── word-plugin/                # Microsoft Word Add-in (Office.js + React)
│   ├── web-dashboard/              # Web Dashboard (React + Recharts + Tailwind)
│   └── backend/                    # Node.js API (Express + IBM Granite)
├── README.md
├── ROADMAP.md
├── PITCH.md
├── DEMO_SCRIPT.md
└── SUBMISSION.md                   # This file
```

---

## 🎬 Demo Video

**URL**: [https://youtu.be/PLACEHOLDER](https://youtu.be/PLACEHOLDER)  
**Duration**: 3:00  
**Script**: See `DEMO_SCRIPT.md`

**Demo covers**:
1. Microsoft Word plugin — starting a session, tracking in real-time
2. IBM Granite AI Creative Partner — requesting style suggestion, accepting/declining
3. Generating the Authenticity Report — Process Ledger validation, report compilation
4. Web Dashboard — analytics, report viewer, badge generator

---

## 📐 How It Fits "Reimagine Creative Industries with AI"

| Challenge Theme Signal | Creative Alibi Feature |
|----------------------|----------------------|
| Personalized creative assistants | IBM Granite AI Creative Partner — tailored to style, brainstorm, or grammar modes |
| Storytelling & content creation tools | Process Ledger visualized as a "Creative Timeline" — the story of how content was made |
| Helping creators work smarter, not harder | Authenticity Report removes false-flag anxiety and re-submission cycles |
| Real-world impact for creative professionals | Directly protects income & credibility of freelancers, students, journalists |
| Responsible AI use | Granite Guardian, full disclosure, no evasion loops |

---

## 🧪 Self-Assessment: Judging Criteria

### Innovation (25%)
**Score estimate: ★★★★★**

Creative Alibi is a novel category: "proof of authentic authorship infrastructure." No existing product captures behavioral writing metadata and combines it with transparent AI assistance to produce a cryptographically-signed process certificate. The use of IBM Granite as a *disclosed helper* rather than an invisible ghostwriter is a genuinely new paradigm.

### Technical Implementation (25%)
**Score estimate: ★★★★☆**

- Full-stack TypeScript monorepo (4 packages)
- Office.js integration for behavioral tracking in Word
- IBM Granite via watsonx.ai with IAM token management
- Granite Guardian output validation
- Process Ledger validation with composite scoring algorithm
- SHA-256 tamper-evidence hashing
- Per-session call enforcement for the desklib detector
- Recharts data visualizations

### IBM Technology Use (25%)
**Score estimate: ★★★★★**

IBM Granite is central to two core features: the AI Creative Partner (the primary interactive feature) and the Report Narrative (IBM Granite writes the human-readable summary of every report). The integration uses the proper REST API with IAM authentication, not a third-party wrapper. Granite Guardian is implemented as a custom validation layer on top.

### Real-World Impact (15%)
**Score estimate: ★★★★★**

The false-positive AI detection problem is causing documented financial and reputational harm to real creators right now. The product addresses a genuine, urgent need for a defensible 5-person team to build and ship.

### Demo Quality (10%)
**Score estimate: ★★★★☆**

3-minute scripted demo showing real interactions with the Word Add-in and web dashboard. Before/after false-positive scenario. IBM Granite interactions shown live. Report generated and downloaded on-screen.

---

## 🔒 Ethical Commitments

1. **No evasion**: The system does not help users fool AI detectors — it helps them prove genuine authorship
2. **Full disclosure**: Every IBM Granite interaction is logged and included in the Authenticity Report
3. **Privacy first**: All raw behavioral data stays on-device; only the summary is shareable
4. **Honest signals**: If the AI detector and the Process Ledger disagree, the report says so plainly
5. **Not a guarantee**: Reports clearly state they are supporting evidence, not absolute proof

---

## 👥 Team

| Role | Key Deliverable |
|------|----------------|
| Product Lead | PRD v4.0, pitch script, submission materials |
| Full-Stack Engineer | Word Add-in, behavioral tracker, Creative Timeline |
| Backend / AI Engineer | IBM Granite integration, report generator, Granite Guardian |
| UX/UI Designer | Web dashboard, design system, report layout |
| QA & Growth | Test coverage, demo storytelling, video production |
