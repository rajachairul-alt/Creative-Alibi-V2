/**
 * @file constants.ts
 * @description Shared configuration constants and authenticity thresholds for Creative Alibi.
 *
 * All threshold values are backed by references cited in the inline comments.
 * To change a threshold for an environment, override via environment variable
 * and use the helper at the bottom of this file — do NOT mutate these
 * module-level constants directly.
 */
/**
 * Minimum overall authenticity score (0–100) for a report to be considered
 * "verified authentic" without any flags.
 *
 * @remarks
 * Scores between SCORE_THRESHOLD_FLAGGED and SCORE_THRESHOLD_VERIFIED
 * produce a `flagged` report requiring human review.
 */
export declare const SCORE_THRESHOLD_VERIFIED: 75;
/**
 * Score below which a report is automatically flagged for review.
 */
export declare const SCORE_THRESHOLD_FLAGGED: 50;
/**
 * Score below which a report is considered high-risk and may be rejected
 * automatically by downstream platform integrations.
 */
export declare const SCORE_THRESHOLD_HIGH_RISK: 30;
/**
 * Minimum typing behaviour sub-score (0–100) for an authentic result.
 *
 * @remarks
 * The typing score is penalised when average inter-keystroke intervals fall
 * below {@link MIN_KEYSTROKE_INTERVAL_MS} (suggests bulk-paste disguised as
 * typing) or when WPM exceeds {@link MAX_SUSTAINED_WPM}.
 */
export declare const MIN_TYPING_SCORE: 75;
/**
 * Minimum average inter-keystroke interval in milliseconds.
 * Values below this threshold suggest programmatic text injection.
 *
 * @remarks
 * Human typists average 150–300 ms between keystrokes at 60–120 WPM.
 * A hard floor of 30 ms filters clearly non-human cadence.
 */
export declare const MIN_KEYSTROKE_INTERVAL_MS: 30;
/**
 * Maximum sustained words-per-minute before the typing score is penalised.
 *
 * @remarks
 * World record for sustained typing is ~212 WPM. 150 WPM is chosen as the
 * ceiling for "plausible human" to allow for outliers without flagging
 * genuinely fast typists.
 */
export declare const MAX_SUSTAINED_WPM: 150;
/**
 * Minimum number of distinct inter-keystroke interval variance buckets
 * required to confirm organic typing rhythm (i.e. some variance is expected).
 * A perfectly uniform cadence is suspicious.
 */
export declare const MIN_KEYSTROKE_VARIANCE_BUCKETS: 5;
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
export declare const MAX_COPY_PASTE_RATIO: 0.2;
/**
 * Copy/paste ratio above which the flag severity escalates to `critical`.
 */
export declare const COPY_PASTE_RATIO_CRITICAL: 0.5;
/**
 * Maximum number of paste events allowed per 5-minute window before
 * triggering an `info` flag.
 */
export declare const MAX_PASTE_EVENTS_PER_WINDOW: 10;
/**
 * Minimum number of revision cycles required across a session for the
 * revision depth score to reach 100.
 *
 * @remarks
 * A "revision cycle" is defined as: type ≥ 3 chars → delete ≥ 1 char →
 * type ≥ 1 char within a 60-second window. This filters trivial typo
 * corrections.
 */
export declare const MIN_REVISION_COUNT: 3;
/**
 * Revision count above which the revision depth score is capped at 100
 * (diminishing returns — more revisions do not further increase the score).
 */
export declare const MAX_REVISION_COUNT_FOR_FULL_SCORE: 25;
/**
 * Minimum percentage of the final document word count that must be covered
 * by revision cycles for the revision coverage component to pass.
 *
 * @remarks
 * Range: [0, 100]. Documents where revisions are concentrated in < 20% of
 * the text are considered suspicious.
 */
export declare const MIN_REVISION_COVERAGE_PERCENT: 20;
/**
 * Minimum active writing time in seconds for a session to contribute
 * meaningfully to the authenticity score.
 *
 * @remarks
 * Sessions shorter than this threshold are given a reduced weight in the
 * overall score aggregation. 120 seconds (2 minutes) filters trivial
 * open-and-close events.
 */
export declare const MIN_SESSION_DURATION_SECONDS: 120;
/**
 * Session duration (seconds) above which full weight is applied in
 * score aggregation. Sessions between MIN and FULL_WEIGHT receive a
 * linear weight interpolation.
 */
export declare const FULL_WEIGHT_SESSION_DURATION_SECONDS: 600;
/**
 * Maximum idle period in seconds before the session is automatically
 * paused (idle time beyond this is not counted as active writing time).
 */
export declare const SESSION_IDLE_PAUSE_SECONDS: 120;
/**
 * Total inactivity period in seconds after which the session is
 * automatically closed by the Word Add-in.
 */
export declare const SESSION_IDLE_TIMEOUT_SECONDS: 1800;
/**
 * Maximum allowed single-session duration in seconds.
 * Sessions exceeding this are split into consecutive session records.
 */
export declare const MAX_SESSION_DURATION_SECONDS: 14400;
/**
 * Maximum percentage of a document's final word count that may originate
 * from verbatim AI-generated content before the AI transparency score
 * is penalised.
 *
 * @remarks
 * "Verbatim" means the AI response text appeared in the document with
 * < {@link AI_VERBATIM_EDIT_THRESHOLD_PERCENT} change.
 */
export declare const MAX_AI_VERBATIM_CONTRIBUTION_PERCENT: 30;
/**
 * Edit distance percentage below which an AI suggestion is considered
 * "verbatim" (i.e. accepted with minimal modification).
 *
 * @remarks
 * Levenshtein edit ratio < 15% ≈ verbatim. Creators who substantially
 * rewrite AI output are rewarded with a higher AI transparency score.
 */
export declare const AI_VERBATIM_EDIT_THRESHOLD_PERCENT: 15;
/**
 * Maximum ratio of AI-assisted prompts to total document words.
 * High ratios suggest the document is primarily AI-orchestrated.
 */
export declare const MAX_AI_PROMPTS_PER_100_WORDS: 5;
/**
 * Weight applied to the typing behaviour sub-score.
 * All weights must sum to 1.0.
 */
export declare const TYPING_BEHAVIOUR_WEIGHT: 0.25;
/** Weight applied to the revision depth sub-score. */
export declare const REVISION_DEPTH_WEIGHT: 0.25;
/** Weight applied to the originality (copy/paste) sub-score. */
export declare const ORIGINALITY_WEIGHT: 0.2;
/** Weight applied to the AI transparency sub-score. */
export declare const AI_TRANSPARENCY_WEIGHT: 0.2;
/** Weight applied to the session authenticity sub-score. */
export declare const SESSION_AUTHENTICITY_WEIGHT: 0.1;
/**
 * Default IBM Granite model identifier for all AI calls.
 *
 * @remarks
 * Can be overridden per-call via GraniteCallConfig.modelId.
 */
export declare const GRANITE_DEFAULT_MODEL_ID: "ibm/granite-13b-chat-v2";
/**
 * Granite model used for long-context ledger analysis.
 * Has a larger context window suitable for full ledger summarisation.
 */
export declare const GRANITE_ANALYSIS_MODEL_ID: "ibm/granite-20b-multilingual";
/**
 * Maximum number of new tokens Granite should generate per report narrative.
 */
export declare const GRANITE_MAX_NEW_TOKENS: 800;
/**
 * Maximum tokens for a brainstorming / in-plugin AI assist response.
 * Kept shorter to maintain low latency inside the Word Add-in.
 */
export declare const GRANITE_ASSIST_MAX_NEW_TOKENS: 300;
/**
 * Default sampling temperature. 0.3 balances factuality with fluency
 * for authenticity narrative generation.
 */
export declare const GRANITE_DEFAULT_TEMPERATURE: 0.3;
/**
 * Default top-p nucleus sampling value.
 */
export declare const GRANITE_DEFAULT_TOP_P: 0.9;
/**
 * watsonx.ai API base URL.
 */
export declare const WATSONX_API_BASE_URL: "https://us-south.ml.cloud.ibm.com";
/**
 * watsonx.ai text generation endpoint path.
 */
export declare const WATSONX_GENERATE_ENDPOINT: "/ml/v1/text/generation";
/**
 * watsonx.ai token (IAM) endpoint — used for API key exchange.
 */
export declare const WATSONX_IAM_TOKEN_URL: "https://iam.cloud.ibm.com/identity/token";
/**
 * How frequently (milliseconds) the Word Add-in flushes a WritingMetrics
 * snapshot to the backend Process Ledger.
 */
export declare const METRICS_FLUSH_INTERVAL_MS: 30000;
/**
 * How frequently (milliseconds) the Word Add-in sends a heartbeat to
 * confirm the session is still active.
 */
export declare const HEARTBEAT_INTERVAL_MS: 60000;
/**
 * Debounce delay (milliseconds) applied to keystroke event listeners
 * to avoid excessive event handler calls.
 */
export declare const KEYSTROKE_DEBOUNCE_MS: 500;
/**
 * Maximum number of Process Ledger entries the Word Add-in will
 * buffer locally before forcing a flush (failsafe for network outages).
 */
export declare const MAX_LOCAL_LEDGER_BUFFER_SIZE: 100;
/**
 * TTL (seconds) for pre-signed PDF download URLs.
 */
export declare const REPORT_DOWNLOAD_URL_TTL_SECONDS: 3600;
/**
 * Maximum number of sessions that can be consolidated into a single report.
 */
export declare const MAX_SESSIONS_PER_REPORT: 20;
/**
 * How long (days) reports are retained in active storage before being
 * moved to cold/archive storage.
 */
export declare const REPORT_ACTIVE_RETENTION_DAYS: 90;
/**
 * How long (days) reports are retained in archive before permanent deletion.
 * Creators are notified 30 days before deletion.
 */
export declare const REPORT_ARCHIVE_RETENTION_DAYS: 365;
/**
 * Maximum number of AI assist calls per user per hour in the Word Add-in.
 * Prevents runaway API cost from automated or accidental looping.
 */
export declare const AI_ASSIST_RATE_LIMIT_PER_HOUR: 60;
/**
 * Maximum number of report generation requests per user per day.
 */
export declare const REPORT_GENERATION_RATE_LIMIT_PER_DAY: 10;
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
export declare function getConstant(envKey: string, defaultVal: number): number;
/**
 * Validates that all score component weights sum to 1.0.
 * Call this once at application startup to catch misconfiguration early.
 *
 * @throws {Error} If the weights do not sum to 1.0 (within floating-point tolerance).
 */
export declare function assertWeightsSumToOne(): void;
