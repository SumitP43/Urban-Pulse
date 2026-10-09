import { Worker, Job } from 'bullmq';
import { Prisma } from '@prisma/client';
import { redis, connectRedis, isRedisConnected, setCachedJson } from './common/redis.js';
import { connectDatabase, disconnectDatabase, prisma } from './database/prisma.js';
import { openMeteoProvider } from './integrations/weather/open-meteo.provider.js';
import { openAqProvider } from './integrations/air-quality/openaq.provider.js';
import { catalogService } from './integrations/catalog.service.js';
import {
  LocationJobData,
  enqueueWeatherSync,
  enqueueAirQualitySync,
  schedulePeriodicIngestion,
  closeQueues,
} from './queues/queue.service.js';

console.log('[WORKER] Initializing UrbanPulse Background Worker Process...');

/**
 * Weather Ingestion Job Processor
 */
async function processWeatherJob(job: Job): Promise<void> {
  // Handle repeatable sweep job
  if (job.name === 'scheduled-weather-sweep') {
    console.log('[WORKER] Executing scheduled weather sweep across all active locations...');
    try {
      const locations = await prisma.location.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, latitude: true, longitude: true },
      });

      for (const loc of locations) {
        await enqueueWeatherSync({
          locationId: loc.id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          locationName: loc.name,
        });
      }
      console.log(`[WORKER] Weather sweep enqueued ${locations.length} location sync jobs.`);
    } catch (err) {
      console.warn('[WORKER] Scheduled weather sweep query failed:', (err as Error).message);
    }
    return;
  }

  // Handle individual location weather sync
  const data = job.data as LocationJobData;
  const { locationId, latitude, longitude, locationName } = data;
  console.log(`[WORKER] Ingesting weather for: ${locationName} (${locationId})`);

  const jobId = await catalogService.recordJobStart('weather_sync', 'open-meteo', {
    bullJobId: job.id,
    locationId,
    locationName,
  });

  try {
    const weather = await openMeteoProvider.fetchCurrentWeather(latitude, longitude);

    await prisma.weatherReading.upsert({
      where: {
        locationId_timestamp_sourceId: {
          locationId,
          timestamp: weather.timestamp,
          sourceId: weather.sourceId,
        },
      },
      update: {
        temperatureC: weather.temperatureC,
        relativeHumidityPct: weather.relativeHumidityPct,
        windSpeedMs: weather.windSpeedMs,
        precipitationMm: weather.precipitationMm,
        windDirectionDeg: weather.windDirectionDeg,
        surfacePressureHpa: weather.surfacePressureHpa,
        cloudCoverPct: weather.cloudCoverPct,
        uvIndex: weather.uvIndex,
        dataOrigin: weather.dataOrigin,
      },
      create: {
        locationId,
        timestamp: weather.timestamp,
        sourceId: weather.sourceId,
        sourceUrl: weather.sourceUrl,
        dataOrigin: weather.dataOrigin,
        temperatureC: weather.temperatureC,
        relativeHumidityPct: weather.relativeHumidityPct,
        windSpeedMs: weather.windSpeedMs,
        windDirectionDeg: weather.windDirectionDeg,
        surfacePressureHpa: weather.surfacePressureHpa,
        precipitationMm: weather.precipitationMm,
        cloudCoverPct: weather.cloudCoverPct,
        uvIndex: weather.uvIndex,
        rawPayload: (weather.rawPayload ?? {}) as Prisma.InputJsonValue,
      },
    });

    // Cache current weather in Redis for Fastify API fast-path
    await setCachedJson(`weather:current:${locationId}`, weather, 1800); // 30 minutes

    await catalogService.recordJobSuccess(jobId, 'open-meteo', 1, {
      locationId,
      temperatureC: weather.temperatureC,
      dataOrigin: weather.dataOrigin,
    });

    console.log(`[WORKER] Weather successfully ingested and persisted for ${locationName} [Origin: ${weather.dataOrigin}]`);
  } catch (err) {
    const errorMsg = (err as Error).message;
    console.error(`[WORKER] Weather ingestion failed for ${locationName}:`, errorMsg);
    await catalogService.recordJobFailure(jobId, 'open-meteo', errorMsg, { locationId });
    throw err; // Trigger BullMQ retry
  }
}

/**
 * Air Quality Ingestion Job Processor
 */
async function processAirQualityJob(job: Job): Promise<void> {
  // Handle repeatable sweep job
  if (job.name === 'scheduled-air-quality-sweep') {
    console.log('[WORKER] Executing scheduled air quality sweep across all active locations...');
    try {
      const locations = await prisma.location.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, latitude: true, longitude: true },
      });

      for (const loc of locations) {
        await enqueueAirQualitySync({
          locationId: loc.id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          locationName: loc.name,
        });
      }
      console.log(`[WORKER] Air quality sweep enqueued ${locations.length} location sync jobs.`);
    } catch (err) {
      console.warn('[WORKER] Scheduled air quality sweep query failed:', (err as Error).message);
    }
    return;
  }

  // Handle individual location air quality sync
  const data = job.data as LocationJobData;
  const { locationId, latitude, longitude, locationName } = data;
  console.log(`[WORKER] Ingesting air quality for: ${locationName} (${locationId})`);

  const jobId = await catalogService.recordJobStart('air_quality_sync', 'openaq', {
    bullJobId: job.id,
    locationId,
    locationName,
  });

  try {
    const airQuality = await openAqProvider.fetchAirQuality(latitude, longitude);

    await prisma.airQualityReading.upsert({
      where: {
        locationId_timestamp_sourceId: {
          locationId,
          timestamp: airQuality.timestamp,
          sourceId: airQuality.sourceId,
        },
      },
      update: {
        pm25: airQuality.pm25,
        pm10: airQuality.pm10,
        no2: airQuality.no2,
        so2: airQuality.so2,
        co: airQuality.co,
        o3: airQuality.o3,
        aqi: airQuality.aqi,
        aqiCategory: airQuality.aqiCategory && airQuality.aqiCategory !== 'INSUFFICIENT_DATA' ? airQuality.aqiCategory : undefined,
        prominentPollutant: airQuality.prominentPollutant,
        dataOrigin: airQuality.dataOrigin,
      },
      create: {
        locationId,
        timestamp: airQuality.timestamp,
        sourceId: airQuality.sourceId,
        sourceUrl: airQuality.sourceUrl,
        dataOrigin: airQuality.dataOrigin,
        pm25: airQuality.pm25,
        pm10: airQuality.pm10,
        no2: airQuality.no2,
        so2: airQuality.so2,
        co: airQuality.co,
        o3: airQuality.o3,
        aqi: airQuality.aqi,
        aqiCategory: airQuality.aqiCategory && airQuality.aqiCategory !== 'INSUFFICIENT_DATA' ? airQuality.aqiCategory : undefined,
        prominentPollutant: airQuality.prominentPollutant,
        rawPayload: (airQuality.rawPayload ?? {}) as Prisma.InputJsonValue,
      },
    });

    // Cache current air quality in Redis for Fastify API fast-path
    await setCachedJson(`airquality:current:${locationId}`, airQuality, 3600); // 60 minutes

    await catalogService.recordJobSuccess(jobId, 'openaq', 1, {
      locationId,
      aqi: airQuality.aqi,
      category: airQuality.aqiCategory,
      dataOrigin: airQuality.dataOrigin,
    });

    console.log(`[WORKER] Air quality successfully ingested and persisted for ${locationName} [Origin: ${airQuality.dataOrigin}]`);
  } catch (err) {
    const errorMsg = (err as Error).message;
    console.error(`[WORKER] Air quality ingestion failed for ${locationName}:`, errorMsg);
    await catalogService.recordJobFailure(jobId, 'openaq', errorMsg, { locationId });
    throw err; // Trigger BullMQ retry
  }
}

async function startWorker() {
  await connectDatabase();
  await catalogService.ensureDefaultDataSources();

  const redisReady = await connectRedis();
  if (!redisReady) {
    console.warn('[WORKER] Redis is offline. Worker process will sleep until Redis is restored.');
  }

  // Weather Ingestion Worker
  const weatherWorker = new Worker('weather-ingestion', processWeatherJob, {
    connection: redis,
    concurrency: 3,
  });

  // Air Quality Ingestion Worker
  const airQualityWorker = new Worker('air-quality-ingestion', processAirQualityJob, {
    connection: redis,
    concurrency: 3,
  });

  weatherWorker.on('completed', (job) => {
    console.log(`[WORKER:weather] Job ${job.id} (${job.name}) completed successfully.`);
  });

  weatherWorker.on('failed', (job, err) => {
    console.error(`[WORKER:weather] Job ${job?.id} failed:`, err.message);
  });

  airQualityWorker.on('completed', (job) => {
    console.log(`[WORKER:air-quality] Job ${job.id} (${job.name}) completed successfully.`);
  });

  airQualityWorker.on('failed', (job, err) => {
    console.error(`[WORKER:air-quality] Job ${job?.id} failed:`, err.message);
  });

  // Register repeatable schedule jobs if Redis is active
  if (isRedisConnected()) {
    await schedulePeriodicIngestion();
  }

  console.log('[WORKER] BullMQ ingestion workers listening on weather-ingestion and air-quality-ingestion queues.');

  const shutdown = async (signal: string) => {
    console.log(`[WORKER] Received ${signal}. Closing workers gracefully...`);
    try {
      await weatherWorker.close();
      await airQualityWorker.close();
      await closeQueues();
      await disconnectDatabase();
      console.log('[WORKER] Shutdown completed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('[WORKER] Error during graceful shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startWorker().catch((err) => {
  console.error('[WORKER] Fatal error in worker process:', err);
  process.exit(1);
});
