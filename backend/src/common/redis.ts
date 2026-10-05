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
