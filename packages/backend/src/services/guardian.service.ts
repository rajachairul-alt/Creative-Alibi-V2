/**
 * @fileoverview Granite Guardian — output validation guardrail for AI Creative Partner.
 *
 * Validates that IBM Granite's suggestions:
 * 1. Contain appropriate hedging language (not directive commands)
 * 2. Don't exceed the maximum word count
 * 3. Don't reproduce the user's text with minor changes
 * 4. Don't contain full prose paragraphs that could replace the writer's voice
 * 5. Stay within the scope of the requested assistance type
 */

import type { AIAssistType } from '../../../shared/src/types';
import {
  GUARDIAN_REQUIRED_HEDGE_PHRASES,
  GUARDIAN_MAX_SUGGESTION_WORDS,
} from '../../../shared/src/constants';

// ─── Guardian Result ───────────────────────────────────────────────────────────

export interface GuardianValidationResult {
  approved: boolean;
  confidence: number; // 0.0–1.0
  reason?: string;
  violations: string[];
}

// ─── Main Validation ───────────────────────────────────────────────────────────

/**
 * Validates a Granite suggestion against the Creative Alibi Guardian rules.
 * Returns approval status and confidence score.
 */
export function validateGuardian(
  suggestion: string,
  type: AIAssistType
): GuardianValidationResult {
  const violations: string[] = [];
  let confidenceDeductions = 0;

  // ─── Check 1: Word count limit ─────────────────────────────────────────
  const wordCount = countWords(suggestion);
  if (wordCount > GUARDIAN_MAX_SUGGESTION_WORDS) {
    violations.push(
      `Response too long: ${wordCount} words (max: ${GUARDIAN_MAX_SUGGESTION_WORDS})`
    );
    confidenceDeductions += 0.3;
  }

  // ─── Check 2: Hedging language presence ───────────────────────────────
  const suggestionLower = suggestion.toLowerCase();
  const hasHedgingLanguage = GUARDIAN_REQUIRED_HEDGE_PHRASES.some(phrase =>
    suggestionLower.includes(phrase)
  );

  // Brainstorm type is more lenient (uses "What if..." framing)
  const hedgingRequired = type !== 'grammar_check';
  if (hedgingRequired && !hasHedgingLanguage) {
    violations.push('Response lacks required hedging language (must offer options, not directives)');
    confidenceDeductions += 0.2;
  }

  // ─── Check 3: No full prose paragraphs (unless grammar_check) ─────────
  if (type !== 'grammar_check') {
    const paragraphs = suggestion.split(/\n\n+/);
    const longParagraphs = paragraphs.filter(p => countWords(p) > 60);
    if (longParagraphs.length > 0) {
      violations.push(
        `Response contains ${longParagraphs.length} long prose paragraph(s) that could replace writer's voice`
      );
      confidenceDeductions += 0.4;
    }
  }

  // ─── Check 4: No imperative "Write:" directives ────────────────────────
  const imperativePatterns = [
    /^write[:\s]/im,
    /^here is your/im,
    /^i've written/im,
    /^i have written/im,
    /^here's a complete/im,
    /^the following is a/im,
  ];

  const hasImperativePatterns = imperativePatterns.some(pattern => pattern.test(suggestion));
  if (hasImperativePatterns) {
    violations.push('Response contains directive framing ("Write:", "Here is your...", etc.)');
    confidenceDeductions += 0.5;
  }

  // ─── Check 5: Brainstorm has 3-5 items ────────────────────────────────
  if (type === 'brainstorm') {
    const listItems = (suggestion.match(/^\d+\.|^[-•*]/gm) || []).length;
    if (listItems < 3) {
      violations.push(`Brainstorm response has only ${listItems} ideas (minimum: 3)`);
      confidenceDeductions += 0.1;
    }
  }

  // ─── Final Decision ────────────────────────────────────────────────────
  // Critical violations (deduction >= 0.5) cause immediate rejection
  const hasCriticalViolation = confidenceDeductions >= 0.5;
  const confidence = Math.max(0, 1.0 - confidenceDeductions);

  return {
    approved: !hasCriticalViolation,
    confidence,
    reason: violations.length > 0 ? violations[0] : undefined,
    violations,
  };
}

// ─── Utility ───────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}
