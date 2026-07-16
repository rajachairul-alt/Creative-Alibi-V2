/**
 * @fileoverview Express routes for AI Creative Partner endpoints.
 */

import { Router } from 'express';
import { suggestHandler, guardianCheckHandler } from '../controllers/ai.controller';
import { validateBody } from '../middleware/validation.middleware';
import { z } from 'zod';

export const aiRoutes = Router();

const suggestSchema = z.object({
  prompt: z.string().min(1).max(500),
  type: z.enum(['style_suggestion', 'brainstorm', 'grammar_check', 'general']),
  sessionId: z.string().uuid(),
  documentContext: z.string().max(1000).default(''),
  wordCount: z.number().int().min(0).default(0),
});

/**
 * POST /api/ai/suggest
 * Get an AI Creative Partner suggestion from IBM Granite.
 */
aiRoutes.post('/suggest', validateBody(suggestSchema), suggestHandler);

/**
 * POST /api/ai/guardian-check
 * Validate a suggestion against Granite Guardian rules.
 */
aiRoutes.post('/guardian-check', guardianCheckHandler);
