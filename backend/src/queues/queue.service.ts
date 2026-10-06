import { Queue } from 'bullmq';
import { redis, isRedisConnected } from '../common/redis.js';
import { env } from '../config/env.js';

export interface LocationJobData {
  locationId: string;
  latitude: number;
  longitude: number;
  locationName: string;
}

let weatherQueue: Queue | null = null;
let airQualityQueue: Queue | null = null;
let riskQueue: Queue | null = null;

export function getWeatherQueue(): Queue {
  if (!weatherQueue) {
    weatherQueue = new Queue('weather-ingestion', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
  }
  return weatherQueue;
}

export function getAirQualityQueue(): Queue {
  if (!airQualityQueue) {
    airQualityQueue = new Queue('air-quality-ingestion', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
  }
  return airQualityQueue;
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

export async function enqueueWeatherSync(data: LocationJobData): Promise<boolean> {
  if (!isRedisConnected()) {
    console.warn(`[QUEUE] Redis unavailable: Skipping background weather enqueue for location ${data.locationId}. Operating fail-open.`);
    return false;
  }

  try {
    const queue = getWeatherQueue();
    // Deduplicate within 5-minute window
    const window = Math.floor(Date.now() / (5 * 60 * 1000));
    await queue.add('sync-weather', data, {
      jobId: `weather-${data.locationId}-${window}`,
    });
    return true;
  } catch (error) {
    console.warn('[QUEUE] Failed to enqueue weather sync job:', (error as Error).message);
    return false;
  }
}

export async function enqueueAirQualitySync(data: LocationJobData): Promise<boolean> {
  if (!isRedisConnected()) {
    console.warn(`[QUEUE] Redis unavailable: Skipping background air quality enqueue for location ${data.locationId}. Operating fail-open.`);
    return false;
  }

  try {
    const queue = getAirQualityQueue();
    // Deduplicate within 10-minute window
    const window = Math.floor(Date.now() / (10 * 60 * 1000));
    await queue.add('sync-air-quality', data, {
      jobId: `air-quality-${data.locationId}-${window}`,
    });
    return true;
  } catch (error) {
    console.warn('[QUEUE] Failed to enqueue air quality sync job:', (error as Error).message);
    return false;
  }
}

/**
 * Register scheduled repeatable ingestion sweeps for all active locations
 */
export async function schedulePeriodicIngestion(): Promise<void> {
  if (!isRedisConnected()) {
    console.warn('[QUEUE] Redis is not connected. Skipping periodic ingestion scheduler initialization.');
    return;
  }

  const weatherIntervalMs = env.WEATHER_INGEST_INTERVAL_MINUTES * 60 * 1000;
  const aqiIntervalMs = env.AIR_QUALITY_INGEST_INTERVAL_MINUTES * 60 * 1000;

  try {
    const wQueue = getWeatherQueue();
    await wQueue.add(
      'scheduled-weather-sweep',
      { type: 'SWEEP_ALL_LOCATIONS' },
      {
        repeat: {
          every: weatherIntervalMs,
        },
        jobId: 'repeatable-weather-sweep',
      }
    );

    const aqQueue = getAirQualityQueue();
    await aqQueue.add(
      'scheduled-air-quality-sweep',
      { type: 'SWEEP_ALL_LOCATIONS' },
      {
        repeat: {
          every: aqiIntervalMs,
        },
        jobId: 'repeatable-air-quality-sweep',
      }
    );

    console.log(`[QUEUE] Registered repeatable ingestion sweeps: Weather every ${env.WEATHER_INGEST_INTERVAL_MINUTES}m, AQI every ${env.AIR_QUALITY_INGEST_INTERVAL_MINUTES}m`);
  } catch (err) {
    console.warn('[QUEUE] Failed to schedule repeatable ingestion jobs:', (err as Error).message);
  }
}

export async function closeQueues(): Promise<void> {
  if (weatherQueue) await weatherQueue.close();
  if (airQualityQueue) await airQualityQueue.close();
  if (riskQueue) await riskQueue.close();
}
