/**
 * @fileoverview Express routes for Authenticity Report endpoints.
 */

import { Router } from 'express';
import { generateReportHandler, getReportHandler } from '../controllers/report.controller';
import { validateBody } from '../middleware/validation.middleware';
import { z } from 'zod';

export const reportRoutes = Router();

const generateReportSchema = z.object({
  sessionId: z.string().uuid(),
  documentText: z.string().min(50, 'Document text too short for report generation'),
});

/**
 * POST /api/report/generate
 * Generate an Authenticity Report for a completed session.
 */
reportRoutes.post('/generate', validateBody(generateReportSchema), generateReportHandler);

/**
 * GET /api/report/:reportId
 * Retrieve a previously generated report.
 */
reportRoutes.get('/:reportId', getReportHandler);
