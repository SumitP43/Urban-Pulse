import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, hashToken, generateRandomToken } from '../../src/utils/crypto.js';

describe('Cryptographic Utilities (Argon2 & Token Hashing)', () => {
  it('correctly hashes and verifies passwords using Argon2', async () => {
    const password = 'SuperSecretUrbanPulsePassword#2026';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.startsWith('$argon2')).toBe(true);

    const isMatch = await verifyPassword(hash, password);
    expect(isMatch).toBe(true);

    const isMismatch = await verifyPassword(hash, 'WrongPassword');
    expect(isMismatch).toBe(false);
  });

  it('generates unique random tokens and predictable SHA-256 hashes', () => {
    const token1 = generateRandomToken(32);
    const token2 = generateRandomToken(32);

    expect(token1).not.toBe(token2);
    expect(token1.length).toBe(64); // 32 bytes hex encoded

    const hash1 = hashToken(token1);
    const hash2 = hashToken(token1);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });
});
