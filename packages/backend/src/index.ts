/**
 * @fileoverview Creative Alibi Backend API Server
 * Express + TypeScript server providing IBM Granite integration,
 * Process Ledger validation, and Authenticity Report generation.
 *
 * @version 2.0.0
 */

import 'dotenv/config'; // ← load .env into process.env FIRST
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { validateEnv } from './config/env';
import { aiRoutes } from './routes/ai.routes';
import { sessionRoutes } from './routes/session.routes';
import { reportRoutes } from './routes/report.routes';
import { healthRoutes } from './routes/health.routes';
import { corsMiddleware } from './middleware/cors.middleware';
import { rateLimitMiddleware, applyEnvToRateLimit } from './middleware/rateLimit.middleware';

// ─── Validate environment variables on startup ────────────────────────────────
const env = validateEnv();
applyEnvToRateLimit(); // apply rate-limit values now that env is validated

// ─── Express Application ──────────────────────────────────────────────────────
const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

app.use(corsMiddleware);
app.use(rateLimitMiddleware);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ─── Logging ─────────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/report', reportRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist.',
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Creative Alibi API Error]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred.',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(env.PORT, env.HOST, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║        Creative Alibi API v2.0 — Server Started          ║
║  Port: ${env.PORT}  |  Environment: ${env.NODE_ENV.padEnd(12)}           ║
║  IBM Granite: ${env.GRANITE_MODEL_ID.padEnd(36)}║
║  Authenticity. Transparency. Powered by IBM.             ║
╚══════════════════════════════════════════════════════════╝
    `);
  });
}

export default app;
