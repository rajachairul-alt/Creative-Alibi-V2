# 🗓️ Creative Alibi — Hackathon Roadmap & Timeline

**Duration**: 4 weeks (July 2026)  
**Team Size**: 5 people  
**Goal**: Ship a demo-ready MVP for the AI Builders Challenge

---

## Overview

| Week | Focus | Critical Milestone |
|------|-------|-------------------|
| Week 1 | Foundation | Architecture finalized, repo live, IBM access confirmed |
| Week 2 | Core Build | Word plugin tracking + backend API working end-to-end |
| Week 3 | AI Integration | IBM Granite live, report generation complete, QA pass 1 |
| Week 4 | Polish + Ship | UI polished, demo recorded, submission complete |

---

## Week 1: Foundation (Jul 1–7)

### Monday (Jul 1) — Kickoff
- **All**: Review PRD v4.0 together (1 hour)
- **Product Lead**: Finalize tech stack decisions, create GitHub repo
- **Full-Stack Eng**: Set up monorepo, install Office.js scaffold
- **Backend/AI Eng**: Set up Node.js project, configure IBM Cloud account
- **UX/UI Designer**: Begin wireframes for Word plugin sidebar (3 tabs)
- **QA**: Review PRD for testable requirements, list acceptance criteria

### Tuesday (Jul 2)
- **Product Lead**: Write pitch first draft
- **Full-Stack Eng**: Build skeleton React app with Tailwind, basic tab navigation
- **Backend/AI Eng**: Confirm watsonx.ai access, test IBM Granite API with curl
- **UX/UI Designer**: Wireframes for web dashboard (5 pages)
- **QA**: Set up test spreadsheet with test cases per feature

### Wednesday (Jul 3)
- **All**: Daily sync + architecture review (30 min)
- **Full-Stack Eng**: Implement Office.js `addHandlerAsync` for document events
- **Backend/AI Eng**: Build `GET /api/health`, `POST /api/session/start`
- **UX/UI Designer**: Finalize color palette and typography system
- **Product Lead**: Write shared types (`packages/shared/src/types.ts`)

### Thursday (Jul 4)
- **Full-Stack Eng**: Implement keystroke/pause detection logic
- **Backend/AI Eng**: Implement `processLedger` validation logic
- **UX/UI Designer**: Design Creative Timeline SVG component (Figma)
- **QA**: Test document event handlers manually in Word Online

### Friday (Jul 5)
- **All**: Integration check — frontend can call backend health endpoint
- **Full-Stack Eng**: Zustand store + session initialization
- **Backend/AI Eng**: IBM IAM token management + first Granite test call
- **UX/UI Designer**: Component library (Button, Card, Badge, Input)

### Weekend Buffer (Jul 6–7)
- Catch-up time, unblock blockers
- **Product Lead**: Refine pitch based on what's been built

**Week 1 Milestone**: Architecture confirmed, repo deployed, IBM Granite responds to test prompt, Word plugin opens in Word Online.

---

## Week 2: Core Build (Jul 8–14)

### Monday (Jul 8)
- **Full-Stack Eng**: BehavioralTracker hook — cadence score calculation
- **Backend/AI Eng**: `POST /api/ai/suggest` — full Granite integration
- **UX/UI Designer**: TrackerStatus component (live metrics display)
- **QA**: Write test cases for cadence score algorithm
- **Product Lead**: Write DEMO_SCRIPT.md first draft

### Tuesday (Jul 9)
- **Full-Stack Eng**: CreativeTimeline SVG visualization
- **Backend/AI Eng**: Guardian validation service
- **UX/UI Designer**: AIPartnerChat component design
- **QA**: Manual test: type for 5 minutes, verify cadence score makes sense

### Wednesday (Jul 10)
- **All**: Mid-week sync — demo walk-through of what's been built
- **Full-Stack Eng**: PromptInput + ChatMessage components
- **Backend/AI Eng**: `POST /api/report/generate` (process validation + hash)
- **UX/UI Designer**: ReportPanel component

### Thursday (Jul 11)
- **Full-Stack Eng**: Connect Word plugin to backend (real API calls)
- **Backend/AI Eng**: Session management (start/update/end)
- **UX/UI Designer**: Web dashboard layout (AppShell + Sidebar)
- **QA**: End-to-end: type → track → call AI → generate report (manual)

### Friday (Jul 12)
- **Full-Stack Eng**: manifest.xml — sideload in Word desktop
- **Backend/AI Eng**: desklib one-shot detector integration
- **UX/UI Designer**: Dashboard home page
- **QA**: QA pass 1 — bug list

**Week 2 Milestone**: End-to-end flow working — start session → type → AI suggest → generate report — in both Word plugin and raw API calls.

---

## Week 3: AI Integration & QA (Jul 15–21)

### Monday (Jul 15)
- **Full-Stack Eng**: Fix QA bugs from Week 2
- **Backend/AI Eng**: Report narrative generation via Granite
- **UX/UI Designer**: Analytics page (Recharts charts)
- **QA**: Regression testing after bug fixes

### Tuesday (Jul 16)
- **Full-Stack Eng**: Accept/decline suggestion UX in Word plugin
- **Backend/AI Eng**: SHA-256 tamper-evidence hashing
- **UX/UI Designer**: Reports page (list + detail modal + badge)
- **QA**: Test all 10 ledger validation scenarios

### Wednesday (Jul 17)
- **All**: Full demo run-through together
- **Full-Stack Eng**: Report preview in Word plugin sidebar
- **Backend/AI Eng**: Verify desklib call count enforcement
- **UX/UI Designer**: AI Partner full-screen page

### Thursday (Jul 18)
- **Full-Stack Eng**: Error handling and loading states
- **Backend/AI Eng**: Rate limiting + CORS configuration
- **UX/UI Designer**: Settings page
- **QA**: Test IBM Granite with 5 different prompt types

### Friday (Jul 19)
- **All**: QA pass 2 — full product review
- **QA**: Document all remaining issues, prioritize P0 vs P1

**Week 3 Milestone**: IBM Granite integration live and tested, Authenticity Report generates with narrative, all P0 features working.

---

## Week 4: Polish & Ship (Jul 22–31)

### Monday (Jul 22)
- **Full-Stack Eng**: UI polish — animations, loading states, empty states
- **Backend/AI Eng**: Fix P0 bugs from QA pass 2
- **UX/UI Designer**: Final design review and pixel-perfect fixes
- **QA**: Prepare before/after false-positive demo scenario

### Tuesday–Wednesday (Jul 23–24)
- **All**: Demo video recording session
- **QA + Product Lead**: Record multiple takes of the 3-minute demo
- **Backend/AI Eng**: Performance optimization if needed
- **UX/UI Designer**: Create screenshots for README

### Thursday–Friday (Jul 25–26)
- **Product Lead**: Write SUBMISSION.md, finalize README
- **QA**: Final regression test after all changes
- **All**: Review submission materials together

### Weekend (Jul 27–28)
- Buffer for unexpected issues
- Begin video editing

### Monday (Jul 29)
- Final video edit complete
- Upload to YouTube (unlisted)
- Final submission package ready

### Tuesday (Jul 30)
- Pre-submission check: all files committed, README accurate
- Submission form filled

### Wednesday (Jul 31) — SUBMISSION DAY
- Submit by EOD
- Celebrate 🎉

---

## Success Criteria

| Metric | Target |
|--------|--------|
| End-to-end reports in demo | ≥ 3 complete reports |
| False-positive scenario | 1 realistic before/after case |
| Tracker accuracy | Consistent across 10 test runs |
| IBM Granite live | Real API calls, not mocked |
| Demo video | Under 3 minutes, professional quality |
| Judge clarity | Non-technical judge can explain product in 1 sentence |

---

## Risk Register

| Risk | Owner | Mitigation |
|------|-------|-----------|
| IBM watsonx.ai rate limits | Backend Eng | Cache tokens, use 3B model for speed |
| Office.js API changes | Full-Stack Eng | Test on both Word Online and desktop early |
| Cadence score accuracy | QA | Manual validation with 10 typing sessions |
| Video production time | Product Lead + QA | Script + record by Day 23, buffer built in |
| Scope creep | Product Lead | P0 only for demo; P1/P2 in backlog |
