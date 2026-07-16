/**
 * @fileoverview CORS middleware with allowed origins configuration.
 */

import cors from 'cors';
import { getEnv } from '../config/env';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const env = getEnv();
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());

    // Allow requests with no origin (e.g., mobile apps, Postman)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
});
