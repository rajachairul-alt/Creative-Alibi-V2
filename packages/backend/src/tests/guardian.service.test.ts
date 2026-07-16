/**
 * @fileoverview Unit tests for guardian.service.ts
 * Tests the Granite Guardian output validation.
 */

import { validateGuardian } from '../services/guardian.service';

describe('validateGuardian', () => {
  test('APPROVED: style suggestion with proper hedging language', () => {
    const suggestion = `You might consider varying your sentence lengths more. One approach could be to alternate between short punchy sentences and longer analytical ones.`;
    const result = validateGuardian(suggestion, 'style_suggestion');
    expect(result.approved).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  test('REJECTED: directive framing ("Write:" prefix)', () => {
    const suggestion = `Write: Here is a rewritten version of your paragraph with better flow and structure.`;
    const result = validateGuardian(suggestion, 'style_suggestion');
    expect(result.approved).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  test('REJECTED: response too long (exceeds 150 words)', () => {
    const longText = Array(200).fill('word').join(' ');
    const result = validateGuardian(longText, 'brainstorm');
    expect(result.violations.some(v => v.toLowerCase().includes('long'))).toBe(true);
  });

  test('APPROVED: brainstorm with 4 numbered ideas', () => {
    const suggestion = `
1. What if you opened with a surprising statistic?
2. Consider exploring the counterargument first.
3. Another angle could be to use a case study.
4. You might try a narrative structure.
    `.trim();
    const result = validateGuardian(suggestion, 'brainstorm');
    expect(result.approved).toBe(true);
  });

  test('WARNING: brainstorm with only 2 ideas (below minimum)', () => {
    const suggestion = `1. What if you tried X? 2. Consider Y.`;
    const result = validateGuardian(suggestion, 'brainstorm');
    // Should still be approved but with a warning
    expect(result.violations.some(v => v.includes('ideas'))).toBe(true);
  });

  test('REJECTED: "here is your" directive framing', () => {
    const suggestion = `Here is your rewritten introduction that will work much better for your audience.`;
    const result = validateGuardian(suggestion, 'style_suggestion');
    expect(result.approved).toBe(false);
  });

  test('APPROVED: grammar check with specific issue identification', () => {
    const suggestion = `1. "its" should be "it's" (contraction of "it is") — could be revised to "it's"
2. Comma splice in sentence 3 — consider a semicolon or period`;
    const result = validateGuardian(suggestion, 'grammar_check');
    expect(result.approved).toBe(true);
  });
});
