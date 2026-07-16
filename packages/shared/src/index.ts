/**
 * @file index.ts
 * @description Barrel export for @creative-alibi/shared.
 *
 * Import from this entry point in all packages:
 *   import { AuthenticityReport, MIN_TYPING_SCORE } from "@creative-alibi/shared";
 */

// Types
export type {
  ISOTimestamp,
  UUID,
  SemVer,
  ReportStatus,
  TextOrigin,
  AICollaborationLevel,
  DeviceType,
  WritingMetrics,
  AIAssistEvent,
  ProcessLedgerEntry,
  UserSession,
  AuthenticityScoreBreakdown,
  AuthenticityReport,
  AuthenticityEvidencePoint,
  AuthenticityRiskFlag,
  ReportSummary,
  PaginatedResponse,
  APIError,
  GraniteCallConfig,
  GraniteAnalysisPrompt,
} from "./types";

// Constants — thresholds & scoring
export {
  SCORE_THRESHOLD_VERIFIED,
  SCORE_THRESHOLD_FLAGGED,
  SCORE_THRESHOLD_HIGH_RISK,
  MIN_TYPING_SCORE,
  MIN_KEYSTROKE_INTERVAL_MS,
  MAX_SUSTAINED_WPM,
  MIN_KEYSTROKE_VARIANCE_BUCKETS,
  MAX_COPY_PASTE_RATIO,
  COPY_PASTE_RATIO_CRITICAL,
  MAX_PASTE_EVENTS_PER_WINDOW,
  MIN_REVISION_COUNT,
  MAX_REVISION_COUNT_FOR_FULL_SCORE,
  MIN_REVISION_COVERAGE_PERCENT,
  MIN_SESSION_DURATION_SECONDS,
  FULL_WEIGHT_SESSION_DURATION_SECONDS,
  SESSION_IDLE_PAUSE_SECONDS,
  SESSION_IDLE_TIMEOUT_SECONDS,
  MAX_SESSION_DURATION_SECONDS,
  MAX_AI_VERBATIM_CONTRIBUTION_PERCENT,
  AI_VERBATIM_EDIT_THRESHOLD_PERCENT,
  MAX_AI_PROMPTS_PER_100_WORDS,
} from "./constants";

// Constants — score weights
export {
  TYPING_BEHAVIOUR_WEIGHT,
  REVISION_DEPTH_WEIGHT,
  ORIGINALITY_WEIGHT,
  AI_TRANSPARENCY_WEIGHT,
  SESSION_AUTHENTICITY_WEIGHT,
} from "./constants";

// Constants — IBM Granite / watsonx
export {
  GRANITE_DEFAULT_MODEL_ID,
  GRANITE_ANALYSIS_MODEL_ID,
  GRANITE_MAX_NEW_TOKENS,
  GRANITE_ASSIST_MAX_NEW_TOKENS,
  GRANITE_DEFAULT_TEMPERATURE,
  GRANITE_DEFAULT_TOP_P,
  WATSONX_API_BASE_URL,
  WATSONX_GENERATE_ENDPOINT,
  WATSONX_IAM_TOKEN_URL,
} from "./constants";

// Constants — data collection
export {
  METRICS_FLUSH_INTERVAL_MS,
  HEARTBEAT_INTERVAL_MS,
  KEYSTROKE_DEBOUNCE_MS,
  MAX_LOCAL_LEDGER_BUFFER_SIZE,
} from "./constants";

// Constants — storage & rate limiting
export {
  REPORT_DOWNLOAD_URL_TTL_SECONDS,
  MAX_SESSIONS_PER_REPORT,
  REPORT_ACTIVE_RETENTION_DAYS,
  REPORT_ARCHIVE_RETENTION_DAYS,
  AI_ASSIST_RATE_LIMIT_PER_HOUR,
  REPORT_GENERATION_RATE_LIMIT_PER_DAY,
} from "./constants";

// Utilities
export { getConstant, assertWeightsSumToOne } from "./constants";
