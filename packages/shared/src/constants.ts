/**
 * @file constants.ts
 * @description Shared configuration constants and authenticity thresholds for Creative Alibi.
 *
 * All threshold values are backed by references cited in the inline comments.
 * To change a threshold for an environment, override via environment variable
 * and use the helper at the bottom of this file — do NOT mutate these
 * module-level constants directly.
 */

// ===========================================================================
// Authenticity Score Thresholds
// ===========================================================================

/**
 * Minimum overall authenticity score (0–100) for a report to be considered
 * "verified authentic" without any flags.
 *
 * @remarks
 * Scores between SCORE_THRESHOLD_FLAGGED and SCORE_THRESHOLD_VERIFIED
 * produce a `flagged` report requiring human review.
 */
export const SCORE_THRESHOLD_VERIFIED = 75 as const;

/**
 * Score below which a report is automatically flagged for review.
 */
export const SCORE_THRESHOLD_FLAGGED = 50 as const;

/**
 * Score below which a report is considered high-risk and may be rejected
 * automatically by downstream platform integrations.
 */
export const SCORE_THRESHOLD_HIGH_RISK = 30 as const;

// ===========================================================================
// Typing Behaviour Thresholds
// ===========================================================================

/**
 * Minimum typing behaviour sub-score (0–100) for an authentic result.
 *
 * @remarks
 * The typing score is penalised when average inter-keystroke intervals fall
 * below {@link MIN_KEYSTROKE_INTERVAL_MS} (suggests bulk-paste disguised as
 * typing) or when WPM exceeds {@link MAX_SUSTAINED_WPM}.
 */
export const MIN_TYPING_SCORE = 75 as const;

/**
 * Minimum average inter-keystroke interval in milliseconds.
 * Values below this threshold suggest programmatic text injection.
 *
 * @remarks
 * Human typists average 150–300 ms between keystrokes at 60–120 WPM.
 * A hard floor of 30 ms filters clearly non-human cadence.
 */
export const MIN_KEYSTROKE_INTERVAL_MS = 30 as const;

/**
 * Maximum sustained words-per-minute before the typing score is penalised.
 *
 * @remarks
 * World record for sustained typing is ~212 WPM. 150 WPM is chosen as the
 * ceiling for "plausible human" to allow for outliers without flagging
 * genuinely fast typists.
 */
export const MAX_SUSTAINED_WPM = 150 as const;

/**
 * Minimum number of distinct inter-keystroke interval variance buckets
 * required to confirm organic typing rhythm (i.e. some variance is expected).
 * A perfectly uniform cadence is suspicious.
 */
export const MIN_KEYSTROKE_VARIANCE_BUCKETS = 5 as const;

// ===========================================================================
// Copy / Paste Thresholds
// ===========================================================================

/**
 * Maximum acceptable ratio of pasted characters to total characters
 * introduced in a session.
 *
 * @remarks
 * Range: [0, 1]. A ratio > 0.20 triggers a `warning` flag;
 * a ratio > {@link COPY_PASTE_RATIO_CRITICAL} triggers a `critical` flag.
 * Research contexts (quote-heavy essays) may legitimately exceed this —
 * the creator's declared AI collaboration level is used as a modifier.
 */
export const MAX_COPY_PASTE_RATIO = 0.20 as const;

/**
 * Copy/paste ratio above which the flag severity escalates to `critical`.
 */
export const COPY_PASTE_RATIO_CRITICAL = 0.50 as const;

/**
 * Maximum number of paste events allowed per 5-minute window before
 * triggering an `info` flag.
 */
export const MAX_PASTE_EVENTS_PER_WINDOW = 10 as const;

// ===========================================================================
// Revision Thresholds
// ===========================================================================

/**
 * Minimum number of revision cycles required across a session for the
 * revision depth score to reach 100.
 *
 * @remarks
 * A "revision cycle" is defined as: type ≥ 3 chars → delete ≥ 1 char →
 * type ≥ 1 char within a 60-second window. This filters trivial typo
 * corrections.
 */
export const MIN_REVISION_COUNT = 3 as const;

/**
 * Revision count above which the revision depth score is capped at 100
 * (diminishing returns — more revisions do not further increase the score).
 */
export const MAX_REVISION_COUNT_FOR_FULL_SCORE = 25 as const;

/**
 * Minimum percentage of the final document word count that must be covered
 * by revision cycles for the revision coverage component to pass.
 *
 * @remarks
 * Range: [0, 100]. Documents where revisions are concentrated in < 20% of
 * the text are considered suspicious.
 */
export const MIN_REVISION_COVERAGE_PERCENT = 20 as const;

// ===========================================================================
// Session Duration Thresholds
// ===========================================================================

/**
 * Minimum active writing time in seconds for a session to contribute
 * meaningfully to the authenticity score.
 *
 * @remarks
 * Sessions shorter than this threshold are given a reduced weight in the
 * overall score aggregation. 120 seconds (2 minutes) filters trivial
 * open-and-close events.
 */
export const MIN_SESSION_DURATION_SECONDS = 120 as const;

/**
 * Session duration (seconds) above which full weight is applied in
 * score aggregation. Sessions between MIN and FULL_WEIGHT receive a
 * linear weight interpolation.
 */
export const FULL_WEIGHT_SESSION_DURATION_SECONDS = 600 as const;

/**
 * Maximum idle period in seconds before the session is automatically
 * paused (idle time beyond this is not counted as active writing time).
 */
export const SESSION_IDLE_PAUSE_SECONDS = 120 as const;

/**
 * Total inactivity period in seconds after which the session is
 * automatically closed by the Word Add-in.
 */
export const SESSION_IDLE_TIMEOUT_SECONDS = 1800 as const; // 30 minutes

/**
 * Maximum allowed single-session duration in seconds.
 * Sessions exceeding this are split into consecutive session records.
 */
export const MAX_SESSION_DURATION_SECONDS = 14400 as const; // 4 hours

// ===========================================================================
// AI Transparency Thresholds
// ===========================================================================

/**
 * Maximum percentage of a document's final word count that may originate
 * from verbatim AI-generated content before the AI transparency score
 * is penalised.
 *
 * @remarks
 * "Verbatim" means the AI response text appeared in the document with
 * < {@link AI_VERBATIM_EDIT_THRESHOLD_PERCENT} change.
 */
export const MAX_AI_VERBATIM_CONTRIBUTION_PERCENT = 30 as const;

/**
 * Edit distance percentage below which an AI suggestion is considered
 * "verbatim" (i.e. accepted with minimal modification).
 *
 * @remarks
 * Levenshtein edit ratio < 15% ≈ verbatim. Creators who substantially
 * rewrite AI output are rewarded with a higher AI transparency score.
 */
export const AI_VERBATIM_EDIT_THRESHOLD_PERCENT = 15 as const;

/**
 * Maximum ratio of AI-assisted prompts to total document words.
 * High ratios suggest the document is primarily AI-orchestrated.
 */
export const MAX_AI_PROMPTS_PER_100_WORDS = 5 as const;

// ===========================================================================
// Score Component Weights
// ===========================================================================

/**
 * Weight applied to the typing behaviour sub-score.
 * All weights must sum to 1.0.
 */
export const TYPING_BEHAVIOUR_WEIGHT = 0.25 as const;

/** Weight applied to the revision depth sub-score. */
export const REVISION_DEPTH_WEIGHT = 0.25 as const;

/** Weight applied to the originality (copy/paste) sub-score. */
export const ORIGINALITY_WEIGHT = 0.20 as const;

/** Weight applied to the AI transparency sub-score. */
export const AI_TRANSPARENCY_WEIGHT = 0.20 as const;

/** Weight applied to the session authenticity sub-score. */
export const SESSION_AUTHENTICITY_WEIGHT = 0.10 as const;

// ===========================================================================
// IBM Granite / watsonx.ai Configuration
// ===========================================================================

/**
 * Default IBM Granite model identifier for all AI calls.
 *
 * @remarks
 * Can be overridden per-call via GraniteCallConfig.modelId.
 */
export const GRANITE_DEFAULT_MODEL_ID =
  "ibm/granite-13b-chat-v2" as const;

/**
 * Granite model used for long-context ledger analysis.
 * Has a larger context window suitable for full ledger summarisation.
 */
export const GRANITE_ANALYSIS_MODEL_ID =
  "ibm/granite-20b-multilingual" as const;

/**
 * Maximum number of new tokens Granite should generate per report narrative.
 */
export const GRANITE_MAX_NEW_TOKENS = 800 as const;

/**
 * Maximum tokens for a brainstorming / in-plugin AI assist response.
 * Kept shorter to maintain low latency inside the Word Add-in.
 */
export const GRANITE_ASSIST_MAX_NEW_TOKENS = 300 as const;

/**
 * Default sampling temperature. 0.3 balances factuality with fluency
 * for authenticity narrative generation.
 */
export const GRANITE_DEFAULT_TEMPERATURE = 0.3 as const;

/**
 * Default top-p nucleus sampling value.
 */
export const GRANITE_DEFAULT_TOP_P = 0.9 as const;

/**
 * watsonx.ai API base URL.
 */
export const WATSONX_API_BASE_URL =
  "https://us-south.ml.cloud.ibm.com" as const;

/**
 * watsonx.ai text generation endpoint path.
 */
export const WATSONX_GENERATE_ENDPOINT =
  "/ml/v1/text/generation" as const;

/**
 * watsonx.ai token (IAM) endpoint — used for API key exchange.
 */
export const WATSONX_IAM_TOKEN_URL =
  "https://iam.cloud.ibm.com/identity/token" as const;

// ===========================================================================
// Data Collection & Flush Intervals
// ===========================================================================

/**
 * How frequently (milliseconds) the Word Add-in flushes a WritingMetrics
 * snapshot to the backend Process Ledger.
 */
export const METRICS_FLUSH_INTERVAL_MS = 30_000 as const; // 30 seconds

/**
 * How frequently (milliseconds) the Word Add-in sends a heartbeat to
 * confirm the session is still active.
 */
export const HEARTBEAT_INTERVAL_MS = 60_000 as const; // 60 seconds

/**
 * Debounce delay (milliseconds) applied to keystroke event listeners
 * to avoid excessive event handler calls.
 */
export const KEYSTROKE_DEBOUNCE_MS = 500 as const;

/**
 * Maximum number of Process Ledger entries the Word Add-in will
 * buffer locally before forcing a flush (failsafe for network outages).
 */
export const MAX_LOCAL_LEDGER_BUFFER_SIZE = 100 as const;

// ===========================================================================
// Report & Storage
// ===========================================================================

/**
 * TTL (seconds) for pre-signed PDF download URLs.
 */
export const REPORT_DOWNLOAD_URL_TTL_SECONDS = 3600 as const; // 1 hour

/**
 * Maximum number of sessions that can be consolidated into a single report.
 */
export const MAX_SESSIONS_PER_REPORT = 20 as const;

/**
 * How long (days) reports are retained in active storage before being
 * moved to cold/archive storage.
 */
export const REPORT_ACTIVE_RETENTION_DAYS = 90 as const;

/**
 * How long (days) reports are retained in archive before permanent deletion.
 * Creators are notified 30 days before deletion.
 */
export const REPORT_ARCHIVE_RETENTION_DAYS = 365 as const;

// ===========================================================================
// Rate Limiting
// ===========================================================================

/**
 * Maximum number of AI assist calls per user per hour in the Word Add-in.
 * Prevents runaway API cost from automated or accidental looping.
 */
export const AI_ASSIST_RATE_LIMIT_PER_HOUR = 60 as const;

/**
 * Maximum number of report generation requests per user per day.
 */
export const REPORT_GENERATION_RATE_LIMIT_PER_DAY = 10 as const;

// ===========================================================================
// Environment-aware Override Helper
// ===========================================================================

/**
 * Returns a numeric constant, optionally overridden by an environment variable.
 *
 * @param envKey     - The environment variable name to check (e.g. "CA_MIN_TYPING_SCORE").
 * @param defaultVal - The compiled-in default value.
 * @returns The parsed environment value if present and valid, otherwise the default.
 *
 * @example
 * const threshold = getConstant("CA_MIN_TYPING_SCORE", MIN_TYPING_SCORE);
 */
export function getConstant(envKey: string, defaultVal: number): number {
  if (typeof process !== "undefined" && process.env?.[envKey] !== undefined) {
    const parsed = Number(process.env[envKey]);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return defaultVal;
}

/**
 * Validates that all score component weights sum to 1.0.
 * Call this once at application startup to catch misconfiguration early.
 *
 * @throws {Error} If the weights do not sum to 1.0 (within floating-point tolerance).
 */
export function assertWeightsSumToOne(): void {
  const sum =
    TYPING_BEHAVIOUR_WEIGHT +
    REVISION_DEPTH_WEIGHT +
    ORIGINALITY_WEIGHT +
    AI_TRANSPARENCY_WEIGHT +
    SESSION_AUTHENTICITY_WEIGHT;

  if (Math.abs(sum - 1.0) > 1e-9) {
    throw new Error(
      `Score component weights must sum to 1.0, but currently sum to ${sum}. ` +
        "Update the WEIGHT constants in packages/shared/src/constants.ts."
    );
  }
}
