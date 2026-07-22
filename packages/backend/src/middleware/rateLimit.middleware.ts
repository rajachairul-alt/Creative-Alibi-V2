/**
 * @fileoverview Rate limiting middleware.
 * windowMs and max are read lazily so validateEnv() in index.ts runs first.
 */

import rateLimit from 'express-rate-limit';
import { getEnv } from '../config/env';

export const rateLimitMiddleware = rateLimit({
  windowMs: 900_000,   // default; overridden lazily below
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the rate limit. Please try again later.',
  },
  skip: (req) => req.path === '/api/health',
  keyGenerator: (req) => {
    // also a safe place to read validated env the first time a request arrives
    return req.ip ?? 'unknown';
  },
});

// Patch windowMs and max after env is validated (called from index.ts)
export function applyEnvToRateLimit(): void {
  const env = getEnv();
  (rateLimitMiddleware as unknown as Record<string, unknown>).windowMs = env.RATE_LIMIT_WINDOW_MS;
  (rateLimitMiddleware as unknown as Record<string, unknown>).max      = env.RATE_LIMIT_MAX_REQUESTS;
}
