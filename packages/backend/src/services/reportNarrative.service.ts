/**
 * @fileoverview Report narrative generator using IBM Granite.
 * Generates the human-readable summary paragraph for the Authenticity Report.
 */

import { createWatsonxClient } from '../config/watson';
import { getEnv } from '../config/env';
import type { ProcessLedger, AILikelihoodSignal } from '../types';
import type { LedgerValidationResult } from './ledger.service';
import { REPORT_LEGAL_DISCLAIMER } from '../constants';

/**
 * Generates a human-readable narrative summary for the Authenticity Report
 * using IBM Granite. This is informational only — it summarizes what the
 * data already says, it does not make new claims.
 */
export async function generateReportNarrative(
  ledger: ProcessLedger,
  validation: LedgerValidationResult,
  signal: AILikelihoodSignal
): Promise<string> {
  const env = getEnv();

  const prompt = buildNarrativePrompt(ledger, validation, signal);

  try {
    const client = await createWatsonxClient();
    const response = await client.post('/ml/v1/text/generation?version=2023-05-29', {
      model_id: env.GRANITE_MODEL_ID,
      input: prompt,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.2,
        top_p: 0.9,
        repetition_penalty: 1.1,
        stop_sequences: ['\n\n', '<|endoftext|>'],
      },
      project_id: env.WATSONX_PROJECT_ID,
    });

    const narrative = response.data.results[0].generated_text.trim();
    return narrative + '\n\n' + REPORT_LEGAL_DISCLAIMER;
  } catch {
    throw new Error('Granite narrative generation failed');
  }
}

function buildNarrativePrompt(
  ledger: ProcessLedger,
  validation: LedgerValidationResult,
  signal: AILikelihoodSignal
): string {
  const durationMin = Math.round(ledger.timeSpentSeconds / 60);
  const pastePercent = (ledger.copyPasteRatio * 100).toFixed(1);
  const aiAssistSummary = ledger.aiAssistLog.length > 0
    ? `The writer used the AI Creative Partner ${ledger.aiAssistLog.length} time(s) (${ledger.aiAssistLog.filter((e: { accepted: boolean }) => e.accepted).length} accepted).`
    : 'No AI Creative Partner assistance was used.';

  return `<|system|>
You are a professional document writer generating a factual, neutral summary paragraph for an Authenticity Report.
Write in third-person, professional tone. Do not add any information not provided. Keep it under 120 words.
<|user|>
Write a report narrative paragraph summarizing this writing session:
- Duration: ${durationMin} minutes
- Word count: ${ledger.wordCount} words  
- Typing cadence score: ${ledger.typingCadenceScore}/100
- Copy-paste ratio: ${pastePercent}%
- Revisions: ${ledger.revisionCount}
- Average WPM: ${ledger.averageWPM.toFixed(0)}
- AI assist: ${aiAssistSummary}
- Composite score: ${validation.compositeScore}/100
- AI-likelihood signal: ${signal.label} (${(signal.score * 100).toFixed(0)}% — estimate only, not a verdict)
- Status: ${validation.isEligible ? 'ELIGIBLE — Authenticity Report ISSUED' : 'NOT ELIGIBLE'}

Write a concise, factual narrative paragraph:
<|assistant|>`;
}
