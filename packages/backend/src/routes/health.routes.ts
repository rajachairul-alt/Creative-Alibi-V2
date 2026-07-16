/**
 * @fileoverview Health check route.
 */

import { Router } from 'express';
import { getEnv } from '../config/env';

export const healthRoutes = Router();

healthRoutes.get('/', (_req, res) => {
  const env = getEnv();
  res.json({
    status: 'ok',
    service: 'creative-alibi-api',
    version: '2.0.0',
    environment: env.NODE_ENV,
    granite_model: env.GRANITE_MODEL_ID,
    timestamp: new Date().toISOString(),
  });
});
