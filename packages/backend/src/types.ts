/**
 * @fileoverview Backend-internal types.
 * These are the shapes used by the API server, ledger, and report services.
 * They intentionally differ from the @creative-alibi/shared branded types
 * because the backend uses plain strings (not UUID/ISOTimestamp branded types)
 * and a different report shape than the frontend-oriented shared package.
 */

// ─── Assist Types ─────────────────────────────────────────────────────────────

export type AIAssistType = 'style_suggestion' | 'brainstorm' | 'grammar_check' | 'general';
export type AILikelihoodLabel = 'HUMAN' | 'AI' | 'UNCERTAIN';

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
  type: AIAssistType;
  confidence: number;
  disclaimerText: string;
  modelId: string;
  guardianApproved: boolean;
  tokensUsed?: number;
}

// ─── Process Ledger ───────────────────────────────────────────────────────────

export interface PauseDistribution {
  averageDurationMs: number;
  medianDurationMs: number;
  microPauses: number;
  shortPauses: number;
  thinkingPauses: number;
  longBreaks: number;
  totalPauses: number;
}

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

// ─── Report Types ─────────────────────────────────────────────────────────────

export type ReportStatus = 'ISSUED' | 'NOT_ELIGIBLE';

export interface ProcessMetrics {
  typingCadenceScore: number;
  pauseProfile: PauseDistribution;
  copyPasteRatio: number;
  revisionCount: number;
  timeSpentSeconds: number;
  wordCount: number;
  sessionDurationMinutes: number;
  averageWPM: number;
  compositeScore: number;
}

export interface AIAssistSummary {
  totalInteractions: number;
  acceptedSuggestions: number;
  rejectedSuggestions: number;
  assistTypes: Record<string, number>;
  disclosureStatement: string;
}

export interface AILikelihoodSignal {
  score: number;
  label: 'HUMAN' | 'AI' | 'UNCERTAIN';
  disclaimer: string;
  modelUsed: string;
  discrepancyNote?: string;
}

// ─── Writing Session (backend shape) ─────────────────────────────────────────

export interface WritingSession {
  sessionId: string;
  state: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startedAt: string;
  endedAt: string | null;
  ledger: ProcessLedger;
  report: AuthenticityReport | null;
  documentTitle: string;
  wordCountHistory: Array<{ timestampMs: number; wordCount: number }>;
}

export interface VerificationBadge {
  badgeId: string;
  badgeUrl: string;
  qrCodeData: string;
  embedCode: string;
  expiresAt: string;
}

export interface AuthenticityReport {
  reportId: string;
  version: string;
  issuedAt: string;
  expiresAt: string;
  status: ReportStatus;
  sessionHash: string;
  writer: {
    sessionId: string;
    deviceFingerprint: string;
    platform: string;
  };
  processMetrics: ProcessMetrics;
  aiAssistSummary: AIAssistSummary;
  aiLikelihoodSignal: AILikelihoodSignal;
  verificationBadge: VerificationBadge;
  reportNarrative: string;
  ineligibilityReason?: string;
  warnings: string[];
}
