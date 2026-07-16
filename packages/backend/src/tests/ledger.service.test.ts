/**
 * @fileoverview Unit tests for ledger.service.ts
 * Tests the Process Ledger validation logic across all edge cases.
 */

import { validateProcessLedger } from '../services/ledger.service';
import type { ProcessLedger } from '../../../shared/src/types';

// ─── Test Fixture Builder ──────────────────────────────────────────────────────

function buildLedger(overrides: Partial<ProcessLedger> = {}): ProcessLedger {
  return {
    sessionId: 'test-session-001',
    sessionStartedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    sessionEndedAt: new Date().toISOString(),
    typingCadenceScore: 85,
    pauseProfile: {
      averageDurationMs: 3200,
      medianDurationMs: 2800,
      microPauses: 120,
      shortPauses: 45,
      thinkingPauses: 18,
      longBreaks: 2,
      totalPauses: 185,
    },
    copyPasteRatio: 0.05,
    revisionCount: 12,
    timeSpentSeconds: 1800,
    activeTypingSeconds: 1200,
    wordCount: 750,
    averageWPM: 37,
    pasteEvents: [],
    pauseEvents: [],
    aiAssistLog: [],
    integrityHash: 'mock-hash',
    deviceFingerprint: 'fp-test1234',
    platform: 'word-plugin',
    ...overrides,
  };
}

// ─── Test Suite ────────────────────────────────────────────────────────────────

describe('validateProcessLedger', () => {
  // ─── Test 1: Genuine session — all thresholds passed ────────────────────────
  test('ELIGIBLE: genuine writing session passes all checks', () => {
    const ledger = buildLedger();
    const result = validateProcessLedger(ledger);

    expect(result.isEligible).toBe(true);
    expect(result.compositeScore).toBeGreaterThan(70);
    expect(result.details.cadencePassed).toBe(true);
    expect(result.details.copyPastePassed).toBe(true);
    expect(result.details.revisionPassed).toBe(true);
    expect(result.details.durationPassed).toBe(true);
    expect(result.details.wordCountPassed).toBe(true);
  });

  // ─── Test 2: High paste ratio — NOT ELIGIBLE ────────────────────────────────
  test('NOT ELIGIBLE: paste ratio exceeds 20% threshold', () => {
    const ledger = buildLedger({ copyPasteRatio: 0.35 });
    const result = validateProcessLedger(ledger);

    expect(result.isEligible).toBe(false);
    expect(result.details.copyPastePassed).toBe(false);
    expect(result.reasons.some(r => r.toLowerCase().includes('copy-paste'))).toBe(true);
  });

  // ─── Test 3: Low cadence score — NOT ELIGIBLE ───────────────────────────────
  test('NOT ELIGIBLE: typing cadence score below 75', () => {
    const ledger = buildLedger({ typingCadenceScore: 62 });
    const result = validateProcessLedger(ledger);

    expect(result.isEligible).toBe(false);
    expect(result.details.cadencePassed).toBe(false);
    expect(result.reasons.some(r => r.toLowerCase().includes('cadence'))).toBe(true);
  });

  // ─── Test 4: Too short session — NOT ELIGIBLE ───────────────────────────────
  test('NOT ELIGIBLE: session shorter than 120 seconds', () => {
    const ledger = buildLedger({ timeSpentSeconds: 90, wordCount: 200 });
    const result = validateProcessLedger(ledger);

    expect(result.isEligible).toBe(false);
    expect(result.details.durationPassed).toBe(false);
  });

  // ─── Test 5: Too few revisions — NOT ELIGIBLE ───────────────────────────────
  test('NOT ELIGIBLE: fewer than 3 meaningful revisions', () => {
    const ledger = buildLedger({ revisionCount: 1 });
    const result = validateProcessLedger(ledger);

    expect(result.isEligible).toBe(false);
    expect(result.details.revisionPassed).toBe(false);
  });

  // ─── Test 6: Word count too low — NOT ELIGIBLE ──────────────────────────────
  test('NOT ELIGIBLE: word count below 50', () => {
    const ledger = buildLedger({ wordCount: 30 });
    const result = validateProcessLedger(ledger);

    expect(result.isEligible).toBe(false);
    expect(result.details.wordCountPassed).toBe(false);
  });

  // ─── Test 7: Borderline session — ELIGIBLE with warnings ────────────────────
  test('ELIGIBLE with warnings: borderline paste ratio (19.5%)', () => {
    const ledger = buildLedger({ copyPasteRatio: 0.195 });
    const result = validateProcessLedger(ledger);

    expect(result.isEligible).toBe(true);
    expect(result.details.copyPastePassed).toBe(true);
    // Composite score should be somewhat lower due to high paste ratio
    expect(result.compositeScore).toBeLessThan(90);
  });

  // ─── Test 8: Multiple failures — all reasons listed ─────────────────────────
  test('NOT ELIGIBLE: multiple failures all reported in reasons', () => {
    const ledger = buildLedger({
      typingCadenceScore: 50,
      copyPasteRatio: 0.45,
      revisionCount: 0,
      timeSpentSeconds: 60,
    });
    const result = validateProcessLedger(ledger);

    expect(result.isEligible).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(2);
  });

  // ─── Test 9: Session with AI assist — ELIGIBLE with disclosure ──────────────
  test('ELIGIBLE: session with AI Creative Partner usage', () => {
    const ledger = buildLedger({
      aiAssistLog: [
        {
          id: 'evt-001',
          timestamp: new Date().toISOString(),
          type: 'style_suggestion',
          prompt: 'improve this paragraph',
          suggestionPreview: 'You might consider...',
          accepted: true,
          modelId: 'ibm/granite-3-3b-instruct',
          guardianApproved: true,
        },
        {
          id: 'evt-002',
          timestamp: new Date().toISOString(),
          type: 'brainstorm',
          prompt: 'ideas for conclusion',
          suggestionPreview: 'What if you ended with...',
          accepted: false,
          modelId: 'ibm/granite-3-3b-instruct',
          guardianApproved: true,
        },
      ],
    });
    const result = validateProcessLedger(ledger);

    expect(result.isEligible).toBe(true);
    // AI assist at reasonable level should not block eligibility
  });

  // ─── Test 10: Perfect session — maximum composite score ─────────────────────
  test('ELIGIBLE: high-quality session should score above 85', () => {
    const ledger = buildLedger({
      typingCadenceScore: 95,
      copyPasteRatio: 0.02,
      revisionCount: 25,
      timeSpentSeconds: 3600,
      wordCount: 2000,
      averageWPM: 55,
    });
    const result = validateProcessLedger(ledger);

    expect(result.isEligible).toBe(true);
    expect(result.compositeScore).toBeGreaterThan(85);
    expect(result.warnings).toHaveLength(0);
  });
});
