/**
 * @fileoverview Core behavioral tracking hook for the Word Add-in.
 * Hooks into Office.js document events to capture typing, pause, and paste events.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useSessionStore } from '../store/session.store';
import {
  calculateCadenceScore,
  buildPauseDistribution,
  calculateCopyPasteRatio,
  calculateAverageWPM,
  type KeystrokeEvent,
} from '../services/tracker.service';
import type { PasteEvent, PauseEvent } from '../types';
import {
  PAUSE_MIN_THRESHOLD_MS,
  TRACKER_SNAPSHOT_INTERVAL_MS,
} from '../types';

/* global Office, Word */

export function useTracker() {
  const { session, isTracking, updateLedger, setTracking } = useSessionStore();

  // Internal tracking state (not in Zustand — high-frequency updates)
  const keystrokesRef = useRef<KeystrokeEvent[]>([]);
  const pasteEventsRef = useRef<PasteEvent[]>([]);
  const pauseEventsRef = useRef<PauseEvent[]>([]);
  const lastEventTimeRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const totalCharsTypedRef = useRef(0);
  const totalCharsPastedRef = useRef(0);
  const revisionCountRef = useRef(0);
  const prevWordCountRef = useRef(0);
  const activeTypingSecondsRef = useRef(0);
  const lastWordCountRef = useRef(0);

  // Snapshot interval ref
  const snapshotIntervalRef = useRef<ReturnType<typeof setInterval>>();

  // ─── Document Change Handler ───────────────────────────────────────────
  const handleDocumentChange = useCallback(async () => {
    const now = Date.now();
    const timeSinceLast = now - lastEventTimeRef.current;

    // ─── Pause detection ───────────────────────────────────────────────
    if (timeSinceLast > PAUSE_MIN_THRESHOLD_MS && keystrokesRef.current.length > 0) {
      pauseEventsRef.current.push({
        startMs: lastEventTimeRef.current - sessionStartRef.current,
        durationMs: timeSinceLast,
        charCountAtPause: totalCharsTypedRef.current,
      });
    }

    lastEventTimeRef.current = now;

    // ─── Get current document text for analysis ────────────────────────
    try {
      await Word.run(async (context) => {
        const body = context.document.body;
        body.load('text');
        await context.sync();

        const currentText = body.text;
        const currentWordCount = currentText.trim().split(/\s+/).filter(w => w.length > 0).length;

        // Detect paste events (large sudden text increases)
        const wordDelta = currentWordCount - lastWordCountRef.current;
        if (wordDelta > 20) {
          // Likely a paste event — large block of text appeared at once
          const charDelta = currentText.length - (totalCharsTypedRef.current + totalCharsPastedRef.current);
          if (charDelta > 50) {
            pasteEventsRef.current.push({
              timestampMs: now - sessionStartRef.current,
              charCount: charDelta,
              isExternalPaste: true,
            });
            totalCharsPastedRef.current += Math.max(0, charDelta);
          }
        } else {
          // Normal typing
          keystrokesRef.current.push({
            timestampMs: now,
            charDelta: wordDelta,
          });
          totalCharsTypedRef.current += Math.max(0, wordDelta * 5); // Approx chars
          activeTypingSecondsRef.current += Math.min(timeSinceLast / 1000, 5);
        }

        // Detect revisions (word count decrease = deletion)
        if (wordDelta < -3) {
          revisionCountRef.current++;
        }

        lastWordCountRef.current = currentWordCount;
        prevWordCountRef.current = currentWordCount;
      });
    } catch {
      // Office.js context not available (e.g., document closed)
    }
  }, []);

  // ─── Snapshot Builder ──────────────────────────────────────────────────
  const buildSnapshot = useCallback(() => {
    if (!isTracking) return;

    const elapsedSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
    const cadenceScore = calculateCadenceScore(keystrokesRef.current);
    const pauseProfile = buildPauseDistribution(pauseEventsRef.current);
    const copyPasteRatio = calculateCopyPasteRatio(
      totalCharsTypedRef.current,
      totalCharsPastedRef.current
    );
    const averageWPM = calculateAverageWPM(
      prevWordCountRef.current,
      activeTypingSecondsRef.current
    );

    updateLedger({
      typingCadenceScore: cadenceScore,
      pauseProfile,
      copyPasteRatio,
      revisionCount: revisionCountRef.current,
      timeSpentSeconds: elapsedSeconds,
      activeTypingSeconds: Math.round(activeTypingSecondsRef.current),
      wordCount: prevWordCountRef.current,
      averageWPM,
      pasteEvents: pasteEventsRef.current,
      pauseEvents: pauseEventsRef.current,
    });
  }, [isTracking, updateLedger]);

  // ─── Start Tracking ────────────────────────────────────────────────────
  const startTracking = useCallback(async () => {
    if (isTracking) return;

    // Reset internal state
    keystrokesRef.current = [];
    pasteEventsRef.current = [];
    pauseEventsRef.current = [];
    lastEventTimeRef.current = Date.now();
    sessionStartRef.current = Date.now();
    totalCharsTypedRef.current = 0;
    totalCharsPastedRef.current = 0;
    revisionCountRef.current = 0;
    prevWordCountRef.current = 0;
    activeTypingSecondsRef.current = 0;

    // Register Office.js document change handler
    try {
      Office.context.document.addHandlerAsync(
        Office.EventType.DocumentSelectionChanged,
        handleDocumentChange
      );
    } catch {
      console.warn('[Tracker] Could not register Office.js event handler');
    }

    // Start snapshot interval
    snapshotIntervalRef.current = setInterval(buildSnapshot, TRACKER_SNAPSHOT_INTERVAL_MS);

    setTracking(true);
  }, [isTracking, handleDocumentChange, buildSnapshot, setTracking]);

  // ─── Stop Tracking ─────────────────────────────────────────────────────
  const stopTracking = useCallback(async () => {
    if (!isTracking) return;

    clearInterval(snapshotIntervalRef.current);
    buildSnapshot(); // Final snapshot

    try {
      Office.context.document.removeHandlerAsync(
        Office.EventType.DocumentSelectionChanged,
        { handler: handleDocumentChange }
      );
    } catch {
      // Ignore cleanup errors
    }

    setTracking(false);
  }, [isTracking, buildSnapshot, handleDocumentChange, setTracking]);

  // ─── Cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearInterval(snapshotIntervalRef.current);
    };
  }, []);

  return {
    startTracking,
    stopTracking,
    isTracking,
    currentMetrics: session?.ledger,
  };
}
