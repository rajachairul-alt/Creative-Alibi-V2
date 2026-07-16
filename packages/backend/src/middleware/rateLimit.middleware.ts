/**
 * @fileoverview Rate limiting middleware.
 */

import rateLimit from 'express-rate-limit';
import { getEnv } from '../config/env';

export const rateLimitMiddleware = rateLimit({
  windowMs: getEnv().RATE_LIMIT_WINDOW_MS,
  max: getEnv().RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the rate limit. Please try again later.',
  },
  skip: (req) => req.path === '/api/health',
});
