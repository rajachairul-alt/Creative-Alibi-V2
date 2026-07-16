/**
 * @fileoverview AI Creative Partner controller.
 */

import type { Request, Response } from 'express';
import { generateCreativeSuggestion } from '../services/granite.service';
import { validateGuardian } from '../services/guardian.service';
import type { AIPartnerRequest } from '../../../shared/src/types';

export async function suggestHandler(req: Request, res: Response): Promise<void> {
  try {
    const request: AIPartnerRequest = req.body;
    const result = await generateCreativeSuggestion(request);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[AI Controller] Suggestion failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'AI suggestion failed',
    });
  }
}

export async function guardianCheckHandler(req: Request, res: Response): Promise<void> {
  const { suggestion, type } = req.body;
  if (!suggestion || !type) {
    res.status(400).json({ success: false, error: 'suggestion and type are required' });
    return;
  }
  const result = validateGuardian(suggestion, type);
  res.json({ success: true, data: result });
}
