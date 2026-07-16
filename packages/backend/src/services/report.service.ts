/**
 * @fileoverview Authenticity Report compilation service.
 * Assembles all available data into a comprehensive, shareable Authenticity Report.
 * Called only AFTER the Process Ledger has been validated as eligible.
 */

import { v4 as uuidv4 } from 'uuid';
import { validateProcessLedger } from './ledger.service';
import { detectAILikelihood } from './detector.service';
import { generateReportNarrative } from './reportNarrative.service';
import { hashLedger, generateBadgeData } from './crypto.service';
import type { ProcessLedger, AuthenticityReport, AIAssistSummary } from '../../../shared/src/types';
import {
  REPORT_VERSION,
  REPORT_EXPIRY_DAYS,
  BADGE_BASE_URL,
  REPORT_LEGAL_DISCLAIMER,
  AI_ASSIST_DISCLOSURE_TEXT,
} from '../../../shared/src/constants';

// ─── Main Report Generator ────────────────────────────────────────────────────

/**
 * Generates a full Authenticity Report for a completed writing session.
 * This is the final step in the Creative Alibi pipeline.
 *
 * Flow:
 * 1. Validate the Process Ledger
 * 2. If eligible: call desklib detector (once)
 * 3. Compile report with all data, including discrepancy notes
 * 4. Generate report narrative via IBM Granite
 * 5. Sign and return the report
 *
 * @param ledger - The completed Process Ledger from the writing session
 * @param documentText - The final document text (for AI-likelihood detection)
 * @returns The complete AuthenticityReport
 */
export async function generateAuthenticityReport(
  ledger: ProcessLedger,
  documentText: string
): Promise<AuthenticityReport> {
  const reportId = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + REPORT_EXPIRY_DAYS);

  // ─── Step 1: Validate the Process Ledger ──────────────────────────────
  const validation = validateProcessLedger(ledger);

  // ─── Step 2: Generate session hash (tamper evidence) ─────────────────
  const sessionHash = await hashLedger(ledger);

  // ─── Step 3: Build AI Assist Summary ─────────────────────────────────
  const aiAssistSummary = buildAIAssistSummary(ledger);

  // ─── Step 4: NOT_ELIGIBLE path — return early without detector call ───
  if (!validation.isEligible) {
    return {
      reportId,
      version: REPORT_VERSION,
      issuedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'NOT_ELIGIBLE',
      sessionHash,
      writer: {
        sessionId: ledger.sessionId,
        deviceFingerprint: ledger.deviceFingerprint,
        platform: ledger.platform,
      },
      processMetrics: {
        typingCadenceScore: validation.details.cadenceScore,
        pauseProfile: ledger.pauseProfile,
        copyPasteRatio: validation.details.copyPasteRatio,
        revisionCount: validation.details.revisionCount,
        timeSpentSeconds: ledger.timeSpentSeconds,
        wordCount: ledger.wordCount,
        sessionDurationMinutes: Math.round(ledger.timeSpentSeconds / 60),
        averageWPM: ledger.averageWPM,
        compositeScore: validation.compositeScore,
      },
      aiAssistSummary,
      aiLikelihoodSignal: {
        score: 0,
        label: 'UNCERTAIN',
        disclaimer: 'AI-likelihood detection was not performed — session was not eligible for a report.',
        modelUsed: 'N/A (not called)',
      },
      verificationBadge: {
        badgeId: reportId,
        badgeUrl: `${BADGE_BASE_URL}/${reportId}`,
        qrCodeData: '',
        embedCode: '',
        expiresAt: expiresAt.toISOString(),
      },
      reportNarrative: `This session was reviewed but did not meet the eligibility criteria for an Authenticity Report. ${validation.reasons.join(' ')}`,
      ineligibilityReason: validation.reasons.join(' '),
      warnings: validation.warnings,
    };
  }

  // ─── Step 5: ISSUED path — call detector once ─────────────────────────
  const aiLikelihoodSignal = await detectAILikelihood(
    ledger.sessionId,
    documentText,
    ledger.typingCadenceScore
  );

  // ─── Step 6: Generate badge data ──────────────────────────────────────
  const badgeData = await generateBadgeData(reportId, ledger, validation.compositeScore);

  // ─── Step 7: Generate human-readable narrative via IBM Granite ────────
  let reportNarrative: string;
  try {
    reportNarrative = await generateReportNarrative(ledger, validation, aiLikelihoodSignal);
  } catch {
    // Fallback narrative if Granite is unavailable
    reportNarrative = buildFallbackNarrative(ledger, validation);
  }

  // ─── Step 8: Assemble and return the full report ──────────────────────
  return {
    reportId,
    version: REPORT_VERSION,
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'ISSUED',
    sessionHash,
    writer: {
      sessionId: ledger.sessionId,
      deviceFingerprint: ledger.deviceFingerprint,
      platform: ledger.platform,
    },
    processMetrics: {
      typingCadenceScore: validation.details.cadenceScore,
      pauseProfile: ledger.pauseProfile,
      copyPasteRatio: validation.details.copyPasteRatio,
      revisionCount: validation.details.revisionCount,
      timeSpentSeconds: ledger.timeSpentSeconds,
      wordCount: ledger.wordCount,
      sessionDurationMinutes: Math.round(ledger.timeSpentSeconds / 60),
      averageWPM: ledger.averageWPM,
      compositeScore: validation.compositeScore,
    },
    aiAssistSummary,
    aiLikelihoodSignal,
    verificationBadge: badgeData,
    reportNarrative,
    warnings: validation.warnings,
  };
}

// ─── Helper: AI Assist Summary ────────────────────────────────────────────────

function buildAIAssistSummary(ledger: ProcessLedger): AIAssistSummary {
  const log = ledger.aiAssistLog;
  const accepted = log.filter(e => e.accepted).length;
  const rejected = log.filter(e => !e.accepted).length;

  const assistTypes = log.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let disclosureStatement: string;
  if (log.length === 0) {
    disclosureStatement = 'The writer did not use the AI Creative Partner in this session.';
  } else {
    const typeSummary = Object.entries(assistTypes)
      .map(([type, count]) => `${count} ${type.replace('_', ' ')} request${count > 1 ? 's' : ''}`)
      .join(', ');

    disclosureStatement =
      `The writer used the IBM Granite AI Creative Partner ${log.length} time(s) during this session ` +
      `(${typeSummary}). Of these, ${accepted} suggestion(s) were accepted and ${rejected} were rejected. ` +
      `All AI interactions were logged in real-time and are disclosed in this report. ` +
      `${AI_ASSIST_DISCLOSURE_TEXT}`;
  }

  return {
    totalInteractions: log.length,
    acceptedSuggestions: accepted,
    rejectedSuggestions: rejected,
    assistTypes: assistTypes as Record<'style_suggestion' | 'brainstorm' | 'grammar_check' | 'general', number>,
    disclosureStatement,
  };
}

// ─── Helper: Fallback Narrative ───────────────────────────────────────────────

function buildFallbackNarrative(
  ledger: ProcessLedger,
  validation: ReturnType<typeof validateProcessLedger>
): string {
  return (
    `This Authenticity Report documents a writing session of ${(ledger.timeSpentSeconds / 60).toFixed(0)} minutes ` +
    `producing ${ledger.wordCount} words. The writer's typing cadence scored ${ledger.typingCadenceScore}/100, ` +
    `reflecting a natural human authorship pattern. The copy-paste ratio was ${(ledger.copyPasteRatio * 100).toFixed(1)}%, ` +
    `and ${ledger.revisionCount} meaningful revisions were recorded — consistent with genuine iterative writing. ` +
    (ledger.aiAssistLog.length > 0
      ? `The writer used the IBM Granite AI Creative Partner ${ledger.aiAssistLog.length} time(s), fully disclosed in the AI Assist section of this report. `
      : 'The writer did not use the AI Creative Partner during this session. ') +
    `Overall authenticity confidence: ${validation.compositeScore}/100. ` +
    REPORT_LEGAL_DISCLAIMER
  );
}
