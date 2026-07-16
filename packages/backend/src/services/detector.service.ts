/**
 * @fileoverview desklib/ai-text-detector-v1.01 integration.
 *
 * ⚠️  CRITICAL SECURITY CONSTRAINT:
 * This service MAY BE CALLED EXACTLY ONCE per writing session.
 * The detector is called AFTER the session ends, ONLY to produce an informational
 * AI-likelihood estimate for inclusion in the Authenticity Report.
 *
 * It MUST NEVER be:
 * - Called in a loop
 * - Used to gate eligibility (only the Process Ledger determines eligibility)
 * - Used to trigger text rewriting or paraphrasing
 *
 * The per-session call count is tracked in a Map and enforced with a hard throw.
 * Any attempt to call this service more than once per session is an error.
 */

import axios from 'axios';
import { getEnv } from '../config/env';
import type { AILikelihoodSignal, AILikelihoodLabel } from '../../../shared/src/types';
import {
  DESKLIB_MODEL_ID,
  HF_INFERENCE_URL,
  DETECTOR_MAX_CALLS_PER_SESSION,
  DETECTOR_DISCREPANCY_THRESHOLD,
  DETECTOR_DISCLAIMER_TEXT,
} from '../../../shared/src/constants';

// ─── Per-session call count tracker (security enforcement) ────────────────────
const _sessionCallCounts = new Map<string, number>();

// ─── Hugging Face Response Types ─────────────────────────────────────────────

interface HuggingFaceClassificationResult {
  label: string;  // 'LABEL_1' = AI, 'LABEL_0' = Human
  score: number;  // confidence 0.0–1.0
}

// ─── Main Service Function ─────────────────────────────────────────────────────

/**
 * Calls the desklib AI text detector EXACTLY ONCE for a given session.
 * Returns an AILikelihoodSignal for transparent inclusion in the Authenticity Report.
 *
 * @param sessionId - The writing session ID (used to enforce single-call limit)
 * @param text - The final document text to analyze
 * @param processLedgerCadenceScore - The cadence score from the Process Ledger (for discrepancy detection)
 * @throws Error if called more than once for the same sessionId
 */
export async function detectAILikelihood(
  sessionId: string,
  text: string,
  processLedgerCadenceScore: number
): Promise<AILikelihoodSignal> {
  const env = getEnv();

  // ─── HARD ENFORCEMENT: Single-call limit ──────────────────────────────
  const currentCount = _sessionCallCounts.get(sessionId) ?? 0;

  if (currentCount >= DETECTOR_MAX_CALLS_PER_SESSION) {
    throw new Error(
      `[SECURITY VIOLATION] Detector has already been called ${currentCount} time(s) for session ${sessionId}. ` +
      `Maximum allowed: ${DETECTOR_MAX_CALLS_PER_SESSION}. This is a hard limit — no exceptions.`
    );
  }

  _sessionCallCounts.set(sessionId, currentCount + 1);

  // ─── Truncate text to 512 tokens (~2000 chars) for the model ──────────
  const truncatedText = text.slice(0, 2000);

  let score = 0.5;
  let rawLabel = 'UNCERTAIN';

  try {
    const response = await axios.post<HuggingFaceClassificationResult[][]>(
      `${HF_INFERENCE_URL}/${DESKLIB_MODEL_ID}`,
      { inputs: truncatedText },
      {
        headers: {
          'Authorization': `Bearer ${env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30_000,
      }
    );

    // HF returns [[{ label, score }, { label, score }]]
    const results = response.data[0];
    if (results && results.length > 0) {
      // Find the AI label result (LABEL_1)
      const aiResult = results.find(r => r.label === 'LABEL_1');
      const humanResult = results.find(r => r.label === 'LABEL_0');

      if (aiResult) {
        score = aiResult.score;
        if (score >= 0.7) {
          rawLabel = 'AI';
        } else if (score <= 0.3) {
          rawLabel = 'HUMAN';
          score = humanResult?.score ?? 1 - score;
        } else {
          rawLabel = 'UNCERTAIN';
        }
      }
    }
  } catch (error) {
    // If the detector is unavailable, return UNCERTAIN with a note
    console.warn('[Detector] desklib API call failed — returning UNCERTAIN signal:', error);
    return {
      score: 0.5,
      label: 'UNCERTAIN',
      disclaimer: DETECTOR_DISCLAIMER_TEXT,
      discrepancyNote: 'AI-likelihood detector was unavailable. The Process Ledger evidence stands independently.',
      modelUsed: `${DESKLIB_MODEL_ID} (unavailable)`,
    };
  }

  // ─── Discrepancy Detection ────────────────────────────────────────────
  // If the detector says AI but the cadence score says human (or vice versa), note it honestly
  const label = rawLabel as AILikelihoodLabel;
  let discrepancyNote: string | undefined;

  const detectorSaysAI = label === 'AI' && score >= DETECTOR_DISCREPANCY_THRESHOLD;
  const ledgerSaysHuman = processLedgerCadenceScore >= 75;

  if (detectorSaysAI && ledgerSaysHuman) {
    discrepancyNote =
      `Note: The AI-likelihood detector assigned a high AI-probability score (${(score * 100).toFixed(0)}%), ` +
      `while the Process Ledger recorded a strong human-authorship cadence score (${processLedgerCadenceScore}/100). ` +
      `These signals disagree. This discrepancy is reported transparently. ` +
      `AI detectors are known to produce false positives on certain writing styles. ` +
      `The Process Ledger remains the primary evidence of authentic authorship.`;
  }

  const ledgerSaysSuspicious = processLedgerCadenceScore < 60;

  if (detectorSaysSuspicious(label, score) && ledgerSaysSuspicious) {
    discrepancyNote =
      `Note: Both the AI-likelihood detector and the Process Ledger show signals inconsistent ` +
      `with typical human authorship patterns. This session was not eligible for an Authenticity Report.`;
  }

  return {
    score: parseFloat(score.toFixed(4)),
    label,
    disclaimer: DETECTOR_DISCLAIMER_TEXT,
    discrepancyNote,
    modelUsed: DESKLIB_MODEL_ID,
  };
}

/**
 * Cleans up session tracking state (call after report is generated and stored).
 */
export function clearSessionDetectorState(sessionId: string): void {
  _sessionCallCounts.delete(sessionId);
}

// ─── Helper ────────────────────────────────────────────────────────────────────

function detectorSaysSuspicious(label: AILikelihoodLabel, score: number): boolean {
  return label === 'AI' && score >= 0.5;
}
