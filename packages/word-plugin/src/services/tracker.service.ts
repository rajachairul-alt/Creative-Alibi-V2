/**
 * @fileoverview Behavioral Tracker Service.
 * Analyzes raw keystroke/pause/paste events to compute Process Ledger metrics.
 */

import type { PauseEvent, PasteEvent, PauseDistribution } from '@creative-alibi/shared';
import {
  PAUSE_MIN_THRESHOLD_MS,
  PAUSE_SHORT_MAX_MS,
  PAUSE_THINKING_MIN_MS,
  PAUSE_BREAK_MIN_MS,
} from '@creative-alibi/shared';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KeystrokeEvent {
  timestampMs: number;
  charDelta: number; // positive = typed, negative = deleted
}

export interface TrackerState {
  keystrokes: KeystrokeEvent[];
  pasteEvents: PasteEvent[];
  pauseEvents: PauseEvent[];
  lastKeystrokeMs: number;
  sessionStartMs: number;
  totalCharsTyped: number;
  totalCharsDeleted: number;
  totalCharsPasted: number;
  revisionCount: number;
}

// ─── Cadence Score Calculator ─────────────────────────────────────────────────

/**
 * Calculates the typing cadence score (0–100) from keystroke intervals.
 *
 * Algorithm:
 * - Compute inter-keystroke intervals (IKI) between consecutive keystrokes
 * - Filter out pauses > 2s (thinking gaps — not part of typing rhythm)
 * - Calculate coefficient of variation (CV) of the filtered IKIs
 * - Human typing shows characteristic CV (30–80%); very low CV suggests automation
 * - Score maps CV to 0–100 using a sigmoid curve
 */
export function calculateCadenceScore(keystrokes: KeystrokeEvent[]): number {
  if (keystrokes.length < 10) return 50; // Too few events for reliable analysis

  // Get inter-keystroke intervals (ms), filtering only actual typing gaps
  const intervals: number[] = [];
  for (let i = 1; i < keystrokes.length; i++) {
    const interval = keystrokes[i].timestampMs - keystrokes[i - 1].timestampMs;
    // Only include intervals that represent typing rhythm (not pauses)
    if (interval > 0 && interval < PAUSE_THINKING_MIN_MS) {
      intervals.push(interval);
    }
  }

  if (intervals.length < 5) return 50;

  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  const cv = (stdDev / mean) * 100; // Coefficient of variation in %

  // Human typing typically has CV between 30% and 150%
  // Very low CV (< 10%) suggests automated/pasted input
  // Very high CV (> 200%) suggests inconsistent manual entry
  if (cv < 5) return 15;   // Almost certainly not human typing
  if (cv < 15) return 35;  // Suspicious — very regular
  if (cv < 30) return 60;  // Below-average human variance
  if (cv <= 100) return Math.round(60 + (cv - 30) * (35 / 70)); // 60–95
  if (cv <= 150) return Math.round(95 - (cv - 100) * (5 / 50)); // 95–90
  return Math.max(50, Math.round(90 - (cv - 150) * (40 / 50))); // Declining
}

// ─── Pause Profile Builder ─────────────────────────────────────────────────────

export function buildPauseDistribution(pauseEvents: PauseEvent[]): PauseDistribution {
  if (pauseEvents.length === 0) {
    return {
      averageDurationMs: 0,
      medianDurationMs: 0,
      microPauses: 0,
      shortPauses: 0,
      thinkingPauses: 0,
      longBreaks: 0,
      totalPauses: 0,
    };
  }

  const durations = pauseEvents.map(p => p.durationMs).sort((a, b) => a - b);
  const average = durations.reduce((a, b) => a + b, 0) / durations.length;
  const median = durations[Math.floor(durations.length / 2)];

  return {
    averageDurationMs: Math.round(average),
    medianDurationMs: median,
    microPauses: durations.filter(d => d < PAUSE_MIN_THRESHOLD_MS).length,
    shortPauses: durations.filter(d => d >= PAUSE_MIN_THRESHOLD_MS && d < PAUSE_SHORT_MAX_MS).length,
    thinkingPauses: durations.filter(d => d >= PAUSE_THINKING_MIN_MS && d < PAUSE_BREAK_MIN_MS).length,
    longBreaks: durations.filter(d => d >= PAUSE_BREAK_MIN_MS).length,
    totalPauses: pauseEvents.length,
  };
}

// ─── Copy-Paste Ratio Calculator ──────────────────────────────────────────────

export function calculateCopyPasteRatio(
  totalCharsTyped: number,
  totalCharsPasted: number
): number {
  const total = totalCharsTyped + totalCharsPasted;
  if (total === 0) return 0;
  return Math.min(1, totalCharsPasted / total);
}

// ─── WPM Calculator ────────────────────────────────────────────────────────────

export function calculateAverageWPM(
  wordCount: number,
  activeTypingSeconds: number
): number {
  if (activeTypingSeconds < 10) return 0;
  return Math.round((wordCount / activeTypingSeconds) * 60);
}
