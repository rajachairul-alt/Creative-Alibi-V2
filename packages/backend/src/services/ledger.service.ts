/**
 * @fileoverview Process Ledger validation service.
 * Validates a submitted Process Ledger against the system's authenticity thresholds.
 * This is the eligibility gate — no Authenticity Report is issued without passing this.
 */

import type { ProcessLedger } from '../../../shared/src/types';
import {
  MIN_TYPING_CADENCE_SCORE,
  MAX_COPY_PASTE_RATIO,
  MIN_REVISION_COUNT,
  MIN_SESSION_DURATION_SECONDS,
  MIN_WORD_COUNT_FOR_REPORT,
  MIN_AVERAGE_WPM,
  COMPOSITE_SCORE_WEIGHTS,
} from '../../../shared/src/constants';

// ─── Validation Result Types ───────────────────────────────────────────────────

export interface LedgerValidationResult {
  isEligible: boolean;
  compositeScore: number; // 0–100 overall authenticity confidence
  reasons: string[];      // Human-readable explanation of the decision
  warnings: string[];     // Non-blocking issues noted in the report
  details: {
    cadenceScore: number;
    cadencePassed: boolean;
    copyPasteRatio: number;
    copyPastePassed: boolean;
    revisionCount: number;
    revisionPassed: boolean;
    sessionDurationSeconds: number;
    durationPassed: boolean;
    wordCount: number;
    wordCountPassed: boolean;
    averageWPM: number;
    wpmPassed: boolean;
    aiAssistRatio: number;  // Percentage of content that was AI-suggested
  };
}

// ─── Main Validation Function ─────────────────────────────────────────────────

/**
 * Validates a Process Ledger against all authenticity thresholds.
 * Returns detailed validation result including composite score.
 *
 * Eligibility requires ALL of the following:
 * - typingCadenceScore >= MIN_TYPING_CADENCE_SCORE (75)
 * - copyPasteRatio <= MAX_COPY_PASTE_RATIO (0.20)
 * - revisionCount >= MIN_REVISION_COUNT (3)
 * - timeSpentSeconds >= MIN_SESSION_DURATION_SECONDS (120)
 * - wordCount >= MIN_WORD_COUNT_FOR_REPORT (50)
 */
export function validateProcessLedger(ledger: ProcessLedger): LedgerValidationResult {
  const reasons: string[] = [];
  const warnings: string[] = [];

  // ─── Individual Gate Checks ────────────────────────────────────────────

  const cadencePassed = ledger.typingCadenceScore >= MIN_TYPING_CADENCE_SCORE;
  const copyPastePassed = ledger.copyPasteRatio <= MAX_COPY_PASTE_RATIO;
  const revisionPassed = ledger.revisionCount >= MIN_REVISION_COUNT;
  const durationPassed = ledger.timeSpentSeconds >= MIN_SESSION_DURATION_SECONDS;
  const wordCountPassed = ledger.wordCount >= MIN_WORD_COUNT_FOR_REPORT;
  const wpmPassed = ledger.averageWPM >= MIN_AVERAGE_WPM;

  // ─── Build Failure Reasons ─────────────────────────────────────────────

  if (!cadencePassed) {
    reasons.push(
      `Typing cadence score ${ledger.typingCadenceScore}/100 is below the minimum threshold of ${MIN_TYPING_CADENCE_SCORE}. ` +
      `This typically indicates text was not typed naturally character-by-character.`
    );
  }

  if (!copyPastePassed) {
    const pastePercent = (ledger.copyPasteRatio * 100).toFixed(1);
    reasons.push(
      `Copy-paste ratio of ${pastePercent}% exceeds the maximum threshold of ${(MAX_COPY_PASTE_RATIO * 100).toFixed(0)}%. ` +
      `A significant portion of the document text was not typed by the writer.`
    );
  }

  if (!revisionPassed) {
    reasons.push(
      `Only ${ledger.revisionCount} meaningful revision(s) detected (minimum: ${MIN_REVISION_COUNT}). ` +
      `Natural writing involves iterative refinement; an absence of revisions is atypical.`
    );
  }

  if (!durationPassed) {
    const durationMin = (ledger.timeSpentSeconds / 60).toFixed(1);
    reasons.push(
      `Session duration of ${durationMin} minutes is below the minimum threshold of ${MIN_SESSION_DURATION_SECONDS / 60} minutes. ` +
      `Insufficient time was spent writing to generate a reliable behavioral profile.`
    );
  }

  if (!wordCountPassed) {
    reasons.push(
      `Document word count of ${ledger.wordCount} is below the minimum of ${MIN_WORD_COUNT_FOR_REPORT} words. ` +
      `Authenticity Reports require sufficient text to generate a meaningful behavioral analysis.`
    );
  }

  // ─── Build Warnings (non-blocking) ────────────────────────────────────

  if (!wpmPassed) {
    warnings.push(
      `Average typing speed of ${ledger.averageWPM.toFixed(1)} WPM is unusually low. ` +
      `This does not affect eligibility but may indicate transcription rather than composition.`
    );
  }

  const aiAssistRatio = calculateAIAssistRatio(ledger);
  if (aiAssistRatio > 0.40) {
    warnings.push(
      `${(aiAssistRatio * 100).toFixed(0)}% of this document's content involved AI Creative Partner assistance. ` +
      `This level of AI assistance is disclosed in full in the report.`
    );
  }

  if (ledger.pauseProfile.longBreaks > 5) {
    warnings.push(
      `${ledger.pauseProfile.longBreaks} extended breaks (>30 seconds) were recorded. ` +
      `This does not affect eligibility but may indicate the session was split across multiple sittings.`
    );
  }

  // ─── Composite Score Calculation ──────────────────────────────────────

  const compositeScore = calculateCompositeScore(ledger, {
    cadencePassed,
    copyPastePassed,
    revisionPassed,
    durationPassed,
    wpmPassed,
  });

  // ─── Final Decision ────────────────────────────────────────────────────

  const isEligible =
    cadencePassed && copyPastePassed && revisionPassed && durationPassed && wordCountPassed;

  if (isEligible) {
    reasons.push(
      `All process validation checks passed. This session demonstrates characteristics consistent with ` +
      `genuine human authorship: natural typing cadence (${ledger.typingCadenceScore}/100), ` +
      `low copy-paste ratio (${(ledger.copyPasteRatio * 100).toFixed(1)}%), ` +
      `${ledger.revisionCount} revisions over ${(ledger.timeSpentSeconds / 60).toFixed(0)} minutes.`
    );
  }

  return {
    isEligible,
    compositeScore,
    reasons,
    warnings,
    details: {
      cadenceScore: ledger.typingCadenceScore,
      cadencePassed,
      copyPasteRatio: ledger.copyPasteRatio,
      copyPastePassed,
      revisionCount: ledger.revisionCount,
      revisionPassed,
      sessionDurationSeconds: ledger.timeSpentSeconds,
      durationPassed,
      wordCount: ledger.wordCount,
      wordCountPassed,
      averageWPM: ledger.averageWPM,
      wpmPassed,
      aiAssistRatio,
    },
  };
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Calculates the weighted composite authenticity score (0–100).
 */
function calculateCompositeScore(
  ledger: ProcessLedger,
  passed: Record<string, boolean>
): number {
  // Cadence sub-score (0–100, already on right scale)
  const cadenceSubScore = passed.cadencePassed
    ? Math.min(100, ledger.typingCadenceScore)
    : Math.min(74, ledger.typingCadenceScore);

  // Paste sub-score (0–100, inverse of ratio)
  const pasteSubScore = passed.copyPastePassed
    ? Math.round((1 - ledger.copyPasteRatio) * 100)
    : Math.round((1 - Math.min(ledger.copyPasteRatio, 1)) * 100);

  // Revision sub-score (0–100, capped at 20 revisions for max score)
  const revisionSubScore = Math.min(100, Math.round((ledger.revisionCount / 20) * 100));

  // Duration sub-score (0–100, capped at 60 minutes for max score)
  const durationSubScore = Math.min(100, Math.round((ledger.timeSpentSeconds / 3600) * 100));

  // WPM consistency sub-score (0–100)
  const wpmSubScore = passed.wpmPassed
    ? Math.min(100, Math.round((ledger.averageWPM / 60) * 100))
    : 30;

  const composite =
    (cadenceSubScore * COMPOSITE_SCORE_WEIGHTS.cadence) +
    (pasteSubScore * COMPOSITE_SCORE_WEIGHTS.pasteRatio) +
    (revisionSubScore * COMPOSITE_SCORE_WEIGHTS.revisions) +
    (durationSubScore * COMPOSITE_SCORE_WEIGHTS.duration) +
    (wpmSubScore * COMPOSITE_SCORE_WEIGHTS.wpmConsistency);

  return Math.round(Math.min(100, Math.max(0, composite)));
}

/**
 * Calculates the ratio of document content that involved AI Creative Partner suggestions.
 * Accepted suggestions only — rejected suggestions don't count.
 */
function calculateAIAssistRatio(ledger: ProcessLedger): number {
  if (ledger.wordCount === 0) return 0;

  const acceptedSuggestions = ledger.aiAssistLog.filter(e => e.accepted).length;
  if (acceptedSuggestions === 0) return 0;

  // Rough estimate: each accepted suggestion adds ~30 words on average
  const estimatedAIWords = acceptedSuggestions * 30;
  return Math.min(1, estimatedAIWords / ledger.wordCount);
}
