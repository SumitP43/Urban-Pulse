import { Redis } from 'ioredis';
import { env } from '../config/env.js';

let isConnected = false;

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  retryStrategy(times) {
    if (times > 3) {
      // Degrade gracefully after 3 failed attempts
      return null;
    }
    return Math.min(times * 200, 1000);
  },
});

redis.on('connect', () => {
  isConnected = true;
});

redis.on('ready', () => {
  isConnected = true;
});

redis.on('error', (err) => {
  if (isConnected) {
    console.warn('[REDIS] Connection degraded or lost. Operating in fail-open fallback mode:', err.message);
  }
  isConnected = false;
});

redis.on('close', () => {
  isConnected = false;
});

export async function connectRedis(): Promise<boolean> {
  try {
    await redis.connect();
    isConnected = true;
    return true;
  } catch (error) {
    console.warn('[REDIS] Redis server unreachable. Queueing and cache degraded in fail-open mode:', (error as Error).message);
    isConnected = false;
    return false;
  }
}

export function isRedisConnected(): boolean {
  return isConnected && redis.status === 'ready';
}

/**
 * Safe Redis JSON Cache Get with fail-open semantics
 */
export async function getCachedJson<T>(key: string): Promise<T | null> {
  if (!isRedisConnected()) return null;
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[CACHE] Failed to get key ${key}:`, (err as Error).message);
    return null;
  }
}

/**
 * Safe Redis JSON Cache Set with TTL and fail-open semantics
 */
export async function setCachedJson<T>(key: string, data: T, ttlSeconds: number = 300): Promise<boolean> {
  if (!isRedisConnected()) return false;
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    return true;
  } catch (err) {
    console.warn(`[CACHE] Failed to set key ${key}:`, (err as Error).message);
    return false;
  }
}

/**
 * Safe Redis Cache Delete
 */
export async function deleteCached(key: string): Promise<boolean> {
  if (!isRedisConnected()) return false;
  try {
    await redis.del(key);
    return true;
  } catch {
    return false;
  }
}
