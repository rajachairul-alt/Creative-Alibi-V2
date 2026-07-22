/**
 * @fileoverview Environment variable validation using Zod.
 * All required configuration is validated at startup — fail fast if anything is missing.
 */

import { z } from 'zod';

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // IBM watsonx.ai
  WATSONX_API_KEY: z.string().min(1, 'WATSONX_API_KEY is required'),
  WATSONX_PROJECT_ID: z.string().min(1, 'WATSONX_PROJECT_ID is required'),
  WATSONX_URL: z.string().url().default('https://us-south.ml.cloud.ibm.com'),
  WATSONX_IAM_URL: z.string().url().default('https://iam.cloud.ibm.com/identity/token'),

  // Granite Model
  GRANITE_MODEL_ID: z.string().default('ibm/granite-3-8b-instruct'),
  GRANITE_FALLBACK_MODEL_ID: z.string().default('ibm/granite-4-h-small'),
  GRANITE_MAX_TOKENS: z.coerce.number().default(300),
  GRANITE_TIMEOUT_MS: z.coerce.number().default(30_000),

  // Hugging Face — optional; detector returns UNCERTAIN without it
  HUGGINGFACE_API_KEY: z.string().optional().default(''),

  // Security
  SESSION_ENCRYPTION_KEY: z.string().min(32, 'SESSION_ENCRYPTION_KEY must be at least 32 characters'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Detector safety
  DETECTOR_MAX_CALLS_PER_SESSION: z.coerce.number().max(1, 'DETECTOR_MAX_CALLS_PER_SESSION cannot exceed 1').default(1),
});

export type AppEnv = z.infer<typeof envSchema>;

let _env: AppEnv | null = null;

/**
 * Validates and returns the application environment.
 * Call this once at startup — subsequent calls return the cached result.
 */
export function validateEnv(): AppEnv {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('[Creative Alibi] ❌ Invalid environment configuration:');
    result.error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    console.error('\nPlease check your .env file against .env.example');
    process.exit(1);
  }

  _env = result.data;
  return _env;
}

/** Get the validated environment (must call validateEnv first) */
export function getEnv(): AppEnv {
  if (!_env) throw new Error('Environment not validated yet. Call validateEnv() first.');
  return _env;
}
