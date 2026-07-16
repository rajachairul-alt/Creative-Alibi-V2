/**
 * @fileoverview Express routes for writing session management.
 */

import { Router } from 'express';
import {
  startSessionHandler,
  updateSessionHandler,
  getSessionHandler,
  endSessionHandler,
} from '../controllers/session.controller';
import { validateBody } from '../middleware/validation.middleware';
import { z } from 'zod';

export const sessionRoutes = Router();

const startSessionSchema = z.object({
  documentTitle: z.string().min(1).max(200).default('Untitled'),
  platform: z.enum(['word-plugin', 'web-editor', 'unknown']).default('word-plugin'),
  deviceFingerprint: z.string().min(1),
});

const updateSessionSchema = z.object({
  ledgerSnapshot: z.object({
    typingCadenceScore: z.number().min(0).max(100),
    copyPasteRatio: z.number().min(0).max(1),
    revisionCount: z.number().int().min(0),
    timeSpentSeconds: z.number().min(0),
    activeTypingSeconds: z.number().min(0),
    wordCount: z.number().int().min(0),
    averageWPM: z.number().min(0),
    aiAssistLog: z.array(z.any()),
    pasteEvents: z.array(z.any()),
    pauseEvents: z.array(z.any()),
  }),
  wordCountSnapshot: z.number().int().min(0).optional(),
});

/** POST /api/session/start */
sessionRoutes.post('/start', validateBody(startSessionSchema), startSessionHandler);

/** PUT /api/session/:sessionId */
sessionRoutes.put('/:sessionId', validateBody(updateSessionSchema), updateSessionHandler);

/** GET /api/session/:sessionId */
sessionRoutes.get('/:sessionId', getSessionHandler);

/** POST /api/session/:sessionId/end */
sessionRoutes.post('/:sessionId/end', endSessionHandler);
