import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  ML_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  OPENAQ_API_KEY: z.string().optional().default(''),
  GEMINI_API_KEY: z.string().optional().default(''),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
});

export type EnvConfig = z.infer<typeof envSchema>;

let parsedEnv: EnvConfig;

try {
  parsedEnv = envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    HOST: process.env.HOST,
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://urbanpulse:urbanpulse_secret@localhost:5432/urbanpulse_db?schema=public',
    REDIS_URL: process.env.REDIS_URL,
    JWT_SECRET: process.env.JWT_SECRET || 'development_jwt_secret_must_be_thirty_two_chars_long_minimum',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'development_refresh_secret_thirty_two_chars_long_minimum',
    ML_SERVICE_URL: process.env.ML_SERVICE_URL,
    OPENAQ_API_KEY: process.env.OPENAQ_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    const issues = error.issues.map((i) => ` - ${i.path.join('.')}: ${i.message}`).join('\n');
    console.error(`\x1b[31m[FATAL] Invalid environment configuration:\x1b[0m\n${issues}`);
  } else {
    console.error('[FATAL] Failed to parse environment variables:', error);
  }
  process.exit(1);
}

export const env = parsedEnv;
process.env.DATABASE_URL = parsedEnv.DATABASE_URL;
export { envSchema };

