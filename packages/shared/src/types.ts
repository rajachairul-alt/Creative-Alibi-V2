/**
 * @file types.ts
 * @description Shared TypeScript interfaces for the Creative Alibi monorepo.
 *
 * These types are consumed by:
 *  - packages/backend   — Node.js API server
 *  - packages/word-plugin — Office.js Word Add-in
 *  - packages/web-dashboard — React analytics dashboard
 *
 * All interfaces are intentionally exhaustive and production-ready.
 * Keep this file framework-agnostic: no React, no Express, no Office.js imports.
 */

// ---------------------------------------------------------------------------
// Primitives & Enums
// ---------------------------------------------------------------------------

/**
 * ISO-8601 timestamp string, e.g. "2024-06-01T14:30:00.000Z".
 * Using a branded alias makes timestamps distinct from arbitrary strings
 * in function signatures.
 */
export type ISOTimestamp = string & { readonly __brand: "ISOTimestamp" };

/** Universally unique identifier (UUID v4). */
export type UUID = string & { readonly __brand: "UUID" };

/** Semantic version string, e.g. "2.0.1". */
export type SemVer = string & { readonly __brand: "SemVer" };

/**
 * Possible overall states of an AuthenticityReport.
 *
 * @remarks
 * - `draft`      — Report object created; data collection ongoing.
 * - `processing` — AI analysis in progress (IBM Granite call queued/running).
 * - `ready`      — Analysis complete; report can be downloaded/shared.
 * - `flagged`    — One or more authenticity thresholds were breached;
 *                  manual review recommended.
 * - `archived`   — Report retained for audit but no longer actively surfaced.
 */
export type ReportStatus =
  | "draft"
  | "processing"
  | "ready"
  | "flagged"
  | "archived";

/**
 * Origin of a text chunk inserted into the document.
 *
 * @remarks
 * - `typed`      — Characters were entered via keyboard in real time.
 * - `pasted`     — Content arrived via paste event (clipboard).
 * - `ai_suggest` — Text was accepted from an IBM Granite AI suggestion.
 * - `voice`      — Transcribed from voice dictation.
 * - `imported`   — Bulk-imported from an external file or template.
 */
export type TextOrigin = "typed" | "pasted" | "ai_suggest" | "voice" | "imported";

/**
 * Level of AI collaboration declared by the creator for a given session.
 *
 * @remarks
 * Used to contextualise the authenticity score — a score of 60 may be
 * perfectly acceptable under `heavy_ai` but suspicious under `none`.
 */
export type AICollaborationLevel =
  | "none"          // Creator asserts no AI assistance was used.
  | "light_assist"  // Minor grammar/spell suggestions accepted.
  | "co_author"     // AI generated sections that were substantially edited.
  | "heavy_ai";     // AI generated the majority of the content.

/**
 * Device form factor recorded at session start.
 */
export type DeviceType = "desktop" | "laptop" | "tablet" | "mobile" | "unknown";

// ---------------------------------------------------------------------------
// Writing Metrics
// ---------------------------------------------------------------------------

/**
 * Granular metrics captured during a single writing session.
 *
 * @remarks
 * Captured every {@link METRICS_FLUSH_INTERVAL_MS} milliseconds by the
 * Word Add-in and flushed to the backend Process Ledger.
 */
export interface WritingMetrics {
  /** Unique identifier for this metrics snapshot. */
  readonly snapshotId: UUID;

  /** Parent session this snapshot belongs to. */
  readonly sessionId: UUID;

  /** Wall-clock time when the snapshot was captured. */
  readonly capturedAt: ISOTimestamp;

  // ── Keystroke & composition ──────────────────────────────────────────────

  /** Total characters typed in this window (excludes deletions). */
  totalCharsTyped: number;

  /** Total characters deleted (Backspace / Delete) in this window. */
  totalCharsDeleted: number;

  /**
   * Average inter-keystroke interval in milliseconds.
   * Low values (< 30 ms) may indicate pasted content disguised as typing.
   */
  avgKeystrokeIntervalMs: number;

  /**
   * Words per minute averaged over this snapshot window.
   * Sustained WPM > 120 is a soft heuristic flag for non-human input.
   */
  avgWordsPerMinute: number;

  // ── Copy / Paste ─────────────────────────────────────────────────────────

  /** Number of paste events fired in this window. */
  pasteEventCount: number;

  /** Total characters introduced via paste in this window. */
  pastedCharCount: number;

  /**
   * Ratio of pasted characters to total characters introduced.
   * Range: [0, 1]. Compared against {@link MAX_COPY_PASTE_RATIO}.
   */
  copyPasteRatio: number;

  // ── Revision behaviour ───────────────────────────────────────────────────

  /** Number of discrete revision cycles (type → delete → retype sequences). */
  revisionCycleCount: number;

  /**
   * Percentage of the current document that has been revised at least once.
   * Range: [0, 100].
   */
  revisionCoveragePercent: number;

  // ── Idle & focus ─────────────────────────────────────────────────────────

  /**
   * Seconds within this window where no keyboard/mouse input was detected.
   * Long idle stretches suggest research, reading, or thinking — authentic
   * creative behaviour.
   */
  idleSeconds: number;

  /** Number of times the document window lost focus in this window. */
  focusLostCount: number;

  // ── AI interaction ───────────────────────────────────────────────────────

  /** Number of AI suggestion prompts fired in this window. */
  aiPromptsSubmitted: number;

  /** Number of AI suggestions accepted (inserted into the document). */
  aiSuggestionsAccepted: number;

  /** Number of AI suggestions dismissed without insertion. */
  aiSuggestionsDismissed: number;

  /**
   * Characters introduced via accepted AI suggestions.
   * Used to compute the AI contribution ratio in the final report.
   */
  aiContributedCharCount: number;

  // ── Document state ───────────────────────────────────────────────────────

  /** Word count of the document at the time of this snapshot. */
  documentWordCount: number;

  /** Paragraph count at the time of this snapshot. */
  documentParagraphCount: number;
}

// ---------------------------------------------------------------------------
// AI Assist Event
// ---------------------------------------------------------------------------

/**
 * A single interaction between the creator and the IBM Granite AI assistant
 * embedded in the Word Add-in.
 *
 * @remarks
 * Each event is stored in the Process Ledger and hashed into the
 * tamper-evident event chain.
 */
export interface AIAssistEvent {
  /** Unique identifier for this event. */
  readonly eventId: UUID;

  /** Session this event belongs to. */
  readonly sessionId: UUID;

  /** Wall-clock time the prompt was submitted. */
  readonly timestamp: ISOTimestamp;

  // ── Prompt ───────────────────────────────────────────────────────────────

  /** The exact text sent to IBM Granite. Stored for transparency. */
  promptText: string;

  /** Word count of the prompt for token-cost tracking. */
  promptWordCount: number;

  /**
   * Context window sent alongside the prompt (e.g. selected paragraph,
   * surrounding sentences). Stored to verify contextual usage.
   */
  contextSnapshot: string;

  // ── Response ─────────────────────────────────────────────────────────────

  /**
   * Raw response returned by IBM Granite (watsonx.ai).
   * Null until the model responds or if the call was cancelled.
   */
  responseText: string | null;

  /** Latency in milliseconds from prompt submission to first token received. */
  responseLatencyMs: number | null;

  /** IBM Granite model identifier used for this call, e.g. "ibm/granite-13b-chat-v2". */
  modelId: string;

  /** watsonx.ai project ID under which the call was made. */
  watsonxProjectId: string;

  // ── Creator action ───────────────────────────────────────────────────────

  /**
   * What the creator did with the AI response.
   * - `accepted`  — Full response inserted into the document.
   * - `partial`   — Only part of the response was kept.
   * - `edited`    — Response was inserted then immediately modified.
   * - `rejected`  — Response was not used.
   * - `pending`   — Creator has not yet acted (event still open).
   */
  creatorAction: "accepted" | "partial" | "edited" | "rejected" | "pending";

  /**
   * If `creatorAction` is "partial" or "edited", the final text that was
   * actually retained in the document.
   */
  retainedText: string | null;

  /**
   * Percentage of the AI response that the creator retained verbatim.
   * Range: [0, 100]. Null for `rejected` or `pending` events.
   */
  verbatimRetentionPercent: number | null;
}

// ---------------------------------------------------------------------------
// Process Ledger Entry
// ---------------------------------------------------------------------------

/**
 * A single immutable entry in the tamper-evident Process Ledger.
 *
 * @remarks
 * The ledger forms a linked hash chain. Each entry contains a SHA-256 hash
 * of the previous entry's payload, making retrospective tampering detectable.
 * The chain is verified server-side before an AuthenticityReport is generated.
 */
export interface ProcessLedgerEntry {
  /** Unique identifier for this ledger entry. */
  readonly entryId: UUID;

  /** Session that produced this entry. */
  readonly sessionId: UUID;

  /** Sequential index within the session's ledger (0-based). */
  readonly sequenceIndex: number;

  /** Wall-clock time this entry was appended. */
  readonly timestamp: ISOTimestamp;

  /**
   * Type of event recorded.
   * - `metrics_snapshot` — Periodic WritingMetrics flush.
   * - `ai_event`         — AIAssistEvent (prompt + response + action).
   * - `document_save`    — Creator explicitly saved the document.
   * - `session_start`    — Session began.
   * - `session_end`      — Session ended (graceful or timeout).
   * - `milestone`        — Creator manually marked a creative milestone.
   */
  entryType:
    | "metrics_snapshot"
    | "ai_event"
    | "document_save"
    | "session_start"
    | "session_end"
    | "milestone";

  /** The actual payload data — either WritingMetrics or AIAssistEvent or free-form metadata. */
  payload: WritingMetrics | AIAssistEvent | Record<string, unknown>;

  /**
   * SHA-256 hex digest of the *previous* entry's serialised payload.
   * For the first entry (sequenceIndex === 0) this is a known genesis hash
   * derived from the sessionId.
   */
  previousHash: string;

  /**
   * SHA-256 hex digest of *this* entry's serialised payload.
   * Computed server-side on receipt; any mismatch signals tampering.
   */
  entryHash: string;

  /** Server IP that received and persisted this entry (for audit trails). */
  receivedByServer: string;
}

// ---------------------------------------------------------------------------
// User Session
// ---------------------------------------------------------------------------

/**
 * Represents a single writing session tracked by the Word Add-in.
 *
 * @remarks
 * A session begins when the Add-in loads (or the creator explicitly starts
 * tracking) and ends on document close, manual stop, or after
 * {@link SESSION_IDLE_TIMEOUT_SECONDS} of continuous inactivity.
 */
export interface UserSession {
  /** Unique identifier for this session. */
  readonly sessionId: UUID;

  /** The creator's user account ID. */
  readonly userId: UUID;

  /** Document identifier (derived from the Office document URL or a generated UUID). */
  readonly documentId: UUID;

  /** Human-readable document title at the time the session started. */
  documentTitle: string;

  /** Wall-clock time when tracking began. */
  readonly startedAt: ISOTimestamp;

  /** Wall-clock time when tracking ended. Null if the session is ongoing. */
  endedAt: ISOTimestamp | null;

  /**
   * Total active writing time in seconds (idle time subtracted).
   * Computed from WritingMetrics snapshots.
   */
  activeWritingSeconds: number;

  /**
   * Total elapsed wall-clock time in seconds from session start to end.
   * Includes idle periods.
   */
  totalDurationSeconds: number;

  /** AI collaboration level declared by the creator at session start. */
  declaredAICollaboration: AICollaborationLevel;

  /** Device type recorded at session start. */
  deviceType: DeviceType;

  /** Operating system user agent string (sanitised — no PII). */
  userAgent: string;

  /** Version of the Word Add-in that captured this session. */
  pluginVersion: SemVer;

  /** All metrics snapshots collected during this session. */
  metricsSnapshots: WritingMetrics[];

  /** All AI assist events that occurred during this session. */
  aiAssistEvents: AIAssistEvent[];

  /**
   * Aggregated copy/paste ratio for the entire session.
   * Derived from all metricsSnapshots.
   */
  aggregateCopyPasteRatio: number;

  /**
   * Total number of revision cycles across all snapshots.
   */
  totalRevisionCycles: number;

  /**
   * Whether this session's ledger chain has been server-verified.
   */
  ledgerVerified: boolean;
}

// ---------------------------------------------------------------------------
// Authenticity Score Breakdown
// ---------------------------------------------------------------------------

/**
 * Granular breakdown of the components contributing to the overall
 * Authenticity Score.
 *
 * @remarks
 * Each dimension is scored 0–100 and a configurable weight is applied
 * before computing the weighted average. Weights must sum to 1.0.
 */
export interface AuthenticityScoreBreakdown {
  /**
   * Typing behaviour score.
   * Derived from keystroke intervals, WPM consistency, and absence of
   * suspiciously uniform cadence.
   * Weight: {@link TYPING_BEHAVIOUR_WEIGHT}
   */
  typingBehaviourScore: number;

  /**
   * Revision depth score.
   * Rewards documents with substantial iterative revision history.
   * Weight: {@link REVISION_DEPTH_WEIGHT}
   */
  revisionDepthScore: number;

  /**
   * Originality score.
   * Penalises high copy/paste ratios; rewards low clipboard dependency.
   * Weight: {@link ORIGINALITY_WEIGHT}
   */
  originalityScore: number;

  /**
   * AI transparency score.
   * Rewards explicit declaration of AI assistance and heavy editing of
   * AI-generated content; penalises verbatim AI-to-document transfers.
   * Weight: {@link AI_TRANSPARENCY_WEIGHT}
   */
  aiTransparencyScore: number;

  /**
   * Session authenticity score.
   * Rewards realistic session durations, organic idle patterns, and
   * consistent cross-session behaviour.
   * Weight: {@link SESSION_AUTHENTICITY_WEIGHT}
   */
  sessionAuthenticityScore: number;

  /** Weighted overall score. Range: [0, 100]. */
  overallScore: number;

  /** The weights applied. Must sum to 1.0. */
  weights: {
    typingBehaviour: number;
    revisionDepth: number;
    originality: number;
    aiTransparency: number;
    sessionAuthenticity: number;
  };
}

// ---------------------------------------------------------------------------
// Authenticity Report
// ---------------------------------------------------------------------------

/**
 * The primary output artifact of Creative Alibi.
 *
 * @remarks
 * Generated by the backend Report Generator after IBM Granite has analysed
 * the full Process Ledger. This report can be exported as a signed PDF and
 * shared with platforms, publishers, or academic institutions as proof of
 * authentic creative process.
 */
export interface AuthenticityReport {
  /** Unique identifier for this report. */
  readonly reportId: UUID;

  /** The user account that owns this report. */
  readonly userId: UUID;

  /** The session(s) that this report covers. */
  readonly sessionIds: UUID[];

  /** The document this report relates to. */
  readonly documentId: UUID;

  /** Human-readable document title. */
  documentTitle: string;

  /** Report lifecycle status. */
  status: ReportStatus;

  /** ISO timestamp when this report object was created. */
  readonly createdAt: ISOTimestamp;

  /** ISO timestamp of the most recent status change. */
  updatedAt: ISOTimestamp;

  /** ISO timestamp when the IBM Granite analysis completed. Null until then. */
  analysisCompletedAt: ISOTimestamp | null;

  // ── Score ────────────────────────────────────────────────────────────────

  /**
   * Detailed breakdown of the authenticity score.
   * Null while status is `draft` or `processing`.
   */
  scoreBreakdown: AuthenticityScoreBreakdown | null;

  // ── AI narrative ─────────────────────────────────────────────────────────

  /**
   * Human-readable narrative summary generated by IBM Granite.
   * Explains the score, highlights authentic behaviours observed, and
   * flags any anomalies found in the Process Ledger.
   *
   * @example
   * "This document shows clear evidence of iterative authorship. The creator
   *  spent 47 minutes actively writing across 3 sessions, with 23 distinct
   *  revision cycles covering 68% of the final text. AI assistance was used
   *  for two brainstorming prompts; both responses were substantially edited
   *  before integration, retaining only 31% verbatim content on average."
   */
  aiNarrativeSummary: string | null;

  /**
   * Structured list of authenticity evidence items surfaced by IBM Granite.
   * Each item is a positive data point supporting the creator's authenticity.
   */
  evidencePoints: AuthenticityEvidencePoint[];

  /**
   * Structured list of anomalies or risk flags detected.
   * Empty array for fully authentic documents.
   */
  riskFlags: AuthenticityRiskFlag[];

  // ── Ledger integrity ─────────────────────────────────────────────────────

  /**
   * Whether the full Process Ledger hash chain was verified intact
   * before this report was generated.
   */
  ledgerIntegrityVerified: boolean;

  /** The root hash of the verified ledger chain. */
  ledgerRootHash: string | null;

  // ── Export metadata ──────────────────────────────────────────────────────

  /**
   * Signed PDF download URL. Available only when status is `ready` or `flagged`.
   * URL is pre-signed and expires after {@link REPORT_DOWNLOAD_URL_TTL_SECONDS}.
   */
  signedPdfUrl: string | null;

  /**
   * Cryptographic signature over the report payload for external verification.
   * Null until the PDF has been generated.
   */
  reportSignature: string | null;

  /** Version of the report schema used to generate this report. */
  schemaVersion: SemVer;

  /** IBM Granite model ID used for narrative generation. */
  graniteModelId: string | null;

  /** watsonx.ai project ID used for AI calls in this report. */
  watsonxProjectId: string | null;
}

// ---------------------------------------------------------------------------
// Authenticity Evidence Point
// ---------------------------------------------------------------------------

/**
 * A single piece of positive evidence for authentic creative process,
 * extracted from the Process Ledger by IBM Granite.
 */
export interface AuthenticityEvidencePoint {
  /** Short category label, e.g. "Iterative Revision", "Organic Typing Cadence". */
  category: string;

  /** Human-readable description of the evidence. */
  description: string;

  /**
   * Confidence level IBM Granite assigned to this evidence point.
   * Range: [0, 1].
   */
  confidence: number;

  /**
   * Ledger entry IDs that support this evidence point.
   * Allows deep-linking from the dashboard to the raw ledger data.
   */
  supportingEntryIds: UUID[];
}

// ---------------------------------------------------------------------------
// Authenticity Risk Flag
// ---------------------------------------------------------------------------

/**
 * An anomaly or risk factor detected in the Process Ledger.
 *
 * @remarks
 * Risk flags do NOT automatically mean the content is inauthentic.
 * They are surfaced for the creator's awareness and provide context for
 * human reviewers.
 */
export interface AuthenticityRiskFlag {
  /** Unique code identifying this flag type, e.g. "HIGH_PASTE_RATIO". */
  flagCode: string;

  /**
   * Severity level.
   * - `info`     — Advisory only; no score impact.
   * - `warning`  — Moderate anomaly; partial score penalty.
   * - `critical` — Significant anomaly; may trigger `flagged` report status.
   */
  severity: "info" | "warning" | "critical";

  /** Human-readable explanation of the flag. */
  description: string;

  /**
   * The observed metric value that triggered this flag.
   * @example 0.45 (for a copy/paste ratio flag)
   */
  observedValue: number | string;

  /**
   * The threshold that was breached.
   * @example 0.20 (MAX_COPY_PASTE_RATIO)
   */
  thresholdValue: number | string;

  /** Ledger entry IDs where this anomaly was observed. */
  affectedEntryIds: UUID[];
}

// ---------------------------------------------------------------------------
// Dashboard / UI Layer
// ---------------------------------------------------------------------------

/**
 * Lightweight list-view representation of a report for the web dashboard.
 * Avoids sending full ledger payloads to the frontend.
 */
export interface ReportSummary {
  readonly reportId: UUID;
  readonly documentId: UUID;
  documentTitle: string;
  status: ReportStatus;
  overallScore: number | null;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  sessionCount: number;
  riskFlagCount: number;
  hasCriticalFlags: boolean;
}

/**
 * Pagination envelope used by list endpoints across the API.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

/**
 * Standard API error shape returned by the backend.
 */
export interface APIError {
  /** HTTP status code. */
  status: number;
  /** Machine-readable error code, e.g. "REPORT_NOT_FOUND". */
  code: string;
  /** Human-readable message. */
  message: string;
  /** Optional validation error details (field-level). */
  details?: Record<string, string[]>;
  /** Request ID for log correlation. */
  requestId: string;
}

// ---------------------------------------------------------------------------
// IBM Granite / watsonx Integration
// ---------------------------------------------------------------------------

/**
 * Configuration for a single IBM Granite API call via watsonx.ai.
 */
export interface GraniteCallConfig {
  /** watsonx.ai project ID. */
  projectId: string;

  /** Model ID, e.g. "ibm/granite-13b-chat-v2". */
  modelId: string;

  /**
   * Maximum number of new tokens to generate.
   * Default: {@link GRANITE_MAX_NEW_TOKENS}
   */
  maxNewTokens: number;

  /**
   * Sampling temperature. Lower values = more deterministic output.
   * Default: {@link GRANITE_DEFAULT_TEMPERATURE}
   */
  temperature: number;

  /**
   * Top-p nucleus sampling parameter.
   * Default: {@link GRANITE_DEFAULT_TOP_P}
   */
  topP: number;

  /**
   * Stop sequences that terminate generation early.
   */
  stopSequences: string[];

  /**
   * Whether to include the token-level log probabilities in the response.
   * Used for confidence scoring of evidence extraction.
   */
  includeLogProbs: boolean;
}

/**
 * Structured prompt sent to IBM Granite for report narrative generation.
 */
export interface GraniteAnalysisPrompt {
  /** System prompt establishing Granite's role as an authenticity analyst. */
  systemPrompt: string;

  /** Serialised summary of the Process Ledger (token-budget-aware truncation applied). */
  ledgerSummary: string;

  /** The creator's declared AI collaboration level. */
  declaredCollaboration: AICollaborationLevel;

  /** Pre-computed score breakdown to include as structured context. */
  scoreBreakdown: AuthenticityScoreBreakdown;

  /** Document title for contextualisation. */
  documentTitle: string;
}
