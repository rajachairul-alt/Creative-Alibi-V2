/**
 * @fileoverview Local types used exclusively by the Word plugin.
 * Types that could not be imported from @creative-alibi/shared are defined here.
 */

// ─── Assist Types ─────────────────────────────────────────────────────────────

export type AIAssistType = 'style_suggestion' | 'brainstorm' | 'grammar_check';

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  assistType?: AIAssistType;
  accepted?: boolean | null;
  guardianApproved?: boolean;
  modelId?: string;
}

// ─── Tracker Events ───────────────────────────────────────────────────────────

export interface PauseEvent {
  startMs: number;
  durationMs: number;
  charCountAtPause: number;
}

export interface PasteEvent {
  timestampMs: number;
  charCount: number;
  isExternalPaste: boolean;
}

export interface PauseDistribution {
  averageDurationMs: number;
  medianDurationMs: number;
  microPauses: number;
  shortPauses: number;
  thinkingPauses: number;
  longBreaks: number;
  totalPauses: number;
}

// ─── AI Assist Log Entry ──────────────────────────────────────────────────────

export interface AIAssistLogEntry {
  id: string;
  timestamp: string;
  type: AIAssistType;
  prompt: string;
  suggestionPreview: string;
  accepted: boolean;
  modelId: string;
  guardianApproved: boolean;
}

// ─── Process Ledger ───────────────────────────────────────────────────────────

export interface ProcessLedger {
  sessionId: string;
  sessionStartedAt: string;
  sessionEndedAt: string | null;
  typingCadenceScore: number;
  pauseProfile: PauseDistribution;
  copyPasteRatio: number;
  revisionCount: number;
  timeSpentSeconds: number;
  activeTypingSeconds: number;
  wordCount: number;
  averageWPM: number;
  pasteEvents: PasteEvent[];
  pauseEvents: PauseEvent[];
  aiAssistLog: AIAssistLogEntry[];
  integrityHash: string;
  deviceFingerprint: string;
  platform: string;
}

// ─── Writing Session ──────────────────────────────────────────────────────────

export interface WritingSession {
  sessionId: string;
  state: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startedAt: string;
  endedAt: string | null;
  ledger: ProcessLedger;
  report: import('@creative-alibi/shared').AuthenticityReport | null;
  documentTitle: string;
  wordCountHistory: number[];
}

// ─── API Contracts ────────────────────────────────────────────────────────────

export interface AIPartnerRequest {
  sessionId: string;
  prompt: string;
  type: AIAssistType;
  documentContext: string;
  wordCount: number;
}

export interface AIPartnerResponse {
  eventId: string;
  suggestion: string;
  modelId: string;
  guardianApproved: boolean;
  tokensUsed: number;
}

// ─── Tracker Constants ────────────────────────────────────────────────────────

/** Minimum gap (ms) to count as a deliberate pause between keystrokes. */
export const PAUSE_MIN_THRESHOLD_MS = 500;

/** Maximum duration (ms) for a "short" pause (attention shift). */
export const PAUSE_SHORT_MAX_MS = 2_000;

/** Minimum duration (ms) for a "thinking" pause. */
export const PAUSE_THINKING_MIN_MS = 2_000;

/** Minimum duration (ms) for a "break" (step away). */
export const PAUSE_BREAK_MIN_MS = 30_000;

/** How often (ms) the tracker flushes a snapshot to the Zustand store. */
export const TRACKER_SNAPSHOT_INTERVAL_MS = 5_000;
