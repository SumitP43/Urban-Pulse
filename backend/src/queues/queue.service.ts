import { Queue } from 'bullmq';
import { redis, isRedisConnected } from '../common/redis.js';

export interface LocationJobData {
  locationId: string;
  latitude: number;
  longitude: number;
  locationName: string;
}

let syncQueue: Queue | null = null;
let riskQueue: Queue | null = null;

export function getSyncQueue(): Queue {
  if (!syncQueue) {
    syncQueue = new Queue('environmental-sync', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
  }
  return syncQueue;
}

export function getRiskQueue(): Queue {
  if (!riskQueue) {
    riskQueue = new Queue('risk-analysis', {
      connection: redis,
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
  }
  return riskQueue;
}

export async function enqueueLocationSync(data: LocationJobData): Promise<boolean> {
  if (!isRedisConnected()) {
    console.warn(`[QUEUE] Redis unavailable: Skipping background enqueue for location ${data.locationId}. Operating fail-open.`);
    return false;
  }

  try {
    const queue = getSyncQueue();
    await queue.add('sync-telemetry', data, {
      jobId: `sync-${data.locationId}-${Math.floor(Date.now() / 60000)}`, // Dedupe within 1-minute window
    });
    return true;
  } catch (error) {
    console.warn('[QUEUE] Failed to enqueue location sync job:', (error as Error).message);
    return false;
  }
}
