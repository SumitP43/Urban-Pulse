import { describe, it, expect } from 'vitest';
import { envSchema } from '../../src/config/env.js';

describe('Environment Configuration Schema (Zod)', () => {
  it('should accept valid production configuration', () => {
    const validConfig = {
      NODE_ENV: 'production',
      PORT: '5000',
      HOST: '0.0.0.0',
      DATABASE_URL: 'postgresql://postgres:secret@db:5432/urbanpulse?schema=public',
      REDIS_URL: 'redis://redis:6379',
      JWT_SECRET: 'this_is_a_very_secure_secret_key_with_at_least_32_characters_length',
      JWT_REFRESH_SECRET: 'this_is_a_very_secure_refresh_key_with_at_least_32_characters_length',
      ML_SERVICE_URL: 'http://ml:8000',
    };

    const parsed = envSchema.parse(validConfig);
    expect(parsed.PORT).toBe(5000);
    expect(parsed.NODE_ENV).toBe('production');
    expect(parsed.DATABASE_URL).toBe(validConfig.DATABASE_URL);
  });

  it('should reject JWT_SECRET if shorter than 32 characters', () => {
    const invalidConfig = {
      DATABASE_URL: 'postgresql://postgres:secret@localhost:5432/db',
      JWT_SECRET: 'short_secret_under_32_chars',
      JWT_REFRESH_SECRET: 'valid_refresh_secret_that_has_at_least_32_characters',
    };

    expect(() => envSchema.parse(invalidConfig)).toThrow();
  });

  it('should reject invalid NODE_ENV', () => {
    const invalidConfig = {
      NODE_ENV: 'invalid_env',
      DATABASE_URL: 'postgresql://postgres:secret@localhost:5432/db',
      JWT_SECRET: 'this_is_a_very_secure_secret_key_with_at_least_32_characters_length',
      JWT_REFRESH_SECRET: 'this_is_a_very_secure_refresh_key_with_at_least_32_characters_length',
    };

    expect(() => envSchema.parse(invalidConfig)).toThrow();
  });
});
