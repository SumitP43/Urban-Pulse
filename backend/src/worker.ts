import { Worker, Job } from 'bullmq';
import { redis, connectRedis } from './common/redis.js';
import { connectDatabase, disconnectDatabase, prisma } from './database/prisma.js';
import { openMeteoProvider } from './integrations/weather/open-meteo.provider.js';
import { openAqProvider } from './integrations/air-quality/openaq.provider.js';
import { satelliteProvider } from './integrations/satellite/satellite.provider.js';
import { environmentalAnalyticsService } from './modules/environmental/environmental.service.js';
import { LocationJobData } from './queues/queue.service.js';

console.log('[WORKER] Initializing UrbanPulse Background Worker Process...');

async function processLocationSync(job: Job<LocationJobData>) {
  const { locationId, latitude, longitude, locationName } = job.data;
  console.log(`[WORKER] Processing environmental telemetry sync for: ${locationName} (${locationId})`);

  // 1. Fetch raw weather, air quality, and satellite indicators
  const weather = await openMeteoProvider.fetchCurrentWeather(latitude, longitude);
  const airQuality = await openAqProvider.fetchAirQuality(latitude, longitude);
  const satellite = await satelliteProvider.fetchSatelliteIndices(latitude, longitude);

  // 2. Synthesize derived snapshot
  const snapshot = environmentalAnalyticsService.synthesizeSnapshot(weather, airQuality, satellite);

  // 3. Persist to PostgreSQL tables
  try {
    // Weather Reading
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
      },
      create: {
        locationId,
        timestamp: weather.timestamp,
        sourceId: weather.sourceId,
        dataOrigin: weather.dataOrigin,
        temperatureC: weather.temperatureC,
        relativeHumidityPct: weather.relativeHumidityPct,
        windSpeedMs: weather.windSpeedMs,
        precipitationMm: weather.precipitationMm,
        windDirectionDeg: weather.windDirectionDeg,
        surfacePressureHpa: weather.surfacePressureHpa,
        cloudCoverPct: weather.cloudCoverPct,
        uvIndex: weather.uvIndex,
      },
    });

    // Air Quality Reading
    await prisma.airQualityReading.upsert({
      where: {
        locationId_timestamp_sourceId: {
          locationId,
          timestamp: airQuality.timestamp,
          sourceId: airQuality.sourceId,
        },
      },
      update: {
        aqi: airQuality.aqi,
        aqiCategory: airQuality.aqiCategory,
        pm25: airQuality.pm25,
        pm10: airQuality.pm10,
      },
      create: {
        locationId,
        timestamp: airQuality.timestamp,
        sourceId: airQuality.sourceId,
        dataOrigin: airQuality.dataOrigin,
        pm25: airQuality.pm25,
        pm10: airQuality.pm10,
        no2: airQuality.no2,
        so2: airQuality.so2,
        co: airQuality.co,
        o3: airQuality.o3,
        aqi: airQuality.aqi,
        aqiCategory: airQuality.aqiCategory,
        prominentPollutant: airQuality.prominentPollutant,
      },
    });

    // Environmental Reading (Derived composite snapshot)
    await prisma.environmentalReading.upsert({
      where: {
        locationId_timestamp: {
          locationId,
          timestamp: weather.timestamp,
        },
      },
      update: {
        heatIndexC: snapshot.heatIndexC,
        overallRiskScore: snapshot.overallRiskScore,
      },
      create: {
        locationId,
        timestamp: weather.timestamp,
        dataOrigin: snapshot.dataOrigin,
        temperatureC: snapshot.temperatureC,
        humidityPct: snapshot.humidityPct,
        heatIndexC: snapshot.heatIndexC,
        aqi: snapshot.aqi,
        prominentPollutant: snapshot.prominentPollutant,
        ndvi: snapshot.ndvi,
        ndwi: snapshot.ndwi,
        floodRiskScore: snapshot.floodRiskScore,
        heatRiskScore: snapshot.heatRiskScore,
        overallRiskScore: snapshot.overallRiskScore,
      },
    });

    console.log(`[WORKER] Telemetry synchronized successfully for ${locationName}`);
  } catch (dbErr) {
    console.warn(`[WORKER] Database save failed during job ${job.id}:`, (dbErr as Error).message);
  }
}

async function startWorker() {
  await connectDatabase();
  const redisReady = await connectRedis();

  if (!redisReady) {
    console.warn('[WORKER] Redis is offline. Worker process will sleep until Redis is restored.');
  }

  const worker = new Worker<LocationJobData>('environmental-sync', processLocationSync, {
    connection: redis,
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    console.log(`[WORKER] Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[WORKER] Job ${job?.id} failed with error:`, err.message);
  });

  const shutdown = async (signal: string) => {
    console.log(`[WORKER] Received ${signal}. Closing worker gracefully...`);
    await worker.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startWorker().catch((err) => {
  console.error('[WORKER] Fatal error in worker process:', err);
  process.exit(1);
});
