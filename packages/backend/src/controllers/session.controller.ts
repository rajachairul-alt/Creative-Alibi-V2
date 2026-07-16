/**
 * @fileoverview Session management controller.
 */

import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SessionStore } from '../models/session.model';
import type { WritingSession, ProcessLedger } from '../../../shared/src/types';

export async function startSessionHandler(req: Request, res: Response): Promise<void> {
  const { documentTitle, platform, deviceFingerprint } = req.body;
  const sessionId = uuidv4();
  const now = new Date().toISOString();

  const initialLedger: ProcessLedger = {
    sessionId,
    sessionStartedAt: now,
    sessionEndedAt: null,
    typingCadenceScore: 0,
    pauseProfile: {
      averageDurationMs: 0,
      medianDurationMs: 0,
      microPauses: 0,
      shortPauses: 0,
      thinkingPauses: 0,
      longBreaks: 0,
      totalPauses: 0,
    },
    copyPasteRatio: 0,
    revisionCount: 0,
    timeSpentSeconds: 0,
    activeTypingSeconds: 0,
    wordCount: 0,
    averageWPM: 0,
    pasteEvents: [],
    pauseEvents: [],
    aiAssistLog: [],
    integrityHash: '',
    deviceFingerprint,
    platform,
  };

  const session: WritingSession = {
    sessionId,
    state: 'ACTIVE',
    startedAt: now,
    endedAt: null,
    ledger: initialLedger,
    report: null,
    documentTitle,
    wordCountHistory: [],
  };

  SessionStore.save(session);

  res.status(201).json({ success: true, data: { sessionId, startedAt: now } });
}

export async function updateSessionHandler(req: Request, res: Response): Promise<void> {
  const { sessionId } = req.params;
  const { ledgerSnapshot, wordCountSnapshot } = req.body;

  const session = SessionStore.get(sessionId);
  if (!session) {
    res.status(404).json({ success: false, error: 'Session not found' });
    return;
  }

  // Merge snapshot into the session ledger
  session.ledger = { ...session.ledger, ...ledgerSnapshot };

  if (wordCountSnapshot !== undefined) {
    session.wordCountHistory.push({
      timestampMs: Date.now(),
      wordCount: wordCountSnapshot,
    });
  }

  SessionStore.update(sessionId, session);
  res.json({ success: true });
}

export async function getSessionHandler(req: Request, res: Response): Promise<void> {
  const { sessionId } = req.params;
  const session = SessionStore.get(sessionId);

  if (!session) {
    res.status(404).json({ success: false, error: 'Session not found' });
    return;
  }

  res.json({ success: true, data: session });
}

export async function endSessionHandler(req: Request, res: Response): Promise<void> {
  const { sessionId } = req.params;
  const session = SessionStore.get(sessionId);

  if (!session) {
    res.status(404).json({ success: false, error: 'Session not found' });
    return;
  }

  const now = new Date().toISOString();
  session.state = 'COMPLETED';
  session.endedAt = now;
  session.ledger.sessionEndedAt = now;

  SessionStore.update(sessionId, session);
  res.json({ success: true, data: { sessionId, endedAt: now } });
}
