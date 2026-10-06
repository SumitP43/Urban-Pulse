import { prisma } from '../../database/prisma.js';
import { Prisma } from '@prisma/client';
import { getCachedJson, setCachedJson } from '../../common/redis.js';
import { openAqProvider } from '../../integrations/air-quality/openaq.provider.js';
import { NotFoundError } from '../../common/errors.js';
import { CurrentAirQualityQuery, HistoricalAirQualityQuery } from './air-quality.schema.js';

export class AirQualityService {
  async getCurrentAirQuality(query: CurrentAirQualityQuery) {
    let lat: number;
    let lng: number;
    let locationId = query.locationId;
    let locationName = 'Unknown Location';

    if (locationId) {
      // 1. Check Redis cache
      const cached = await getCachedJson(`airquality:current:${locationId}`);
      if (cached) {
        return {
          ...cached,
          fromCache: true,
        };
      }

      // 2. Fetch location details
      const location = await prisma.location.findUnique({
        where: { id: locationId },
      });
      if (!location) {
        throw new NotFoundError(`Location with id ${locationId} not found`);
      }

      lat = location.latitude;
      lng = location.longitude;
      locationName = location.name;

      // 3. Check latest reading in DB
      const dbReading = await prisma.airQualityReading.findFirst({
        where: { locationId },
        orderBy: { timestamp: 'desc' },
      });

      // If fresh DB reading exists (within last 60 minutes)
      if (dbReading && Date.now() - new Date(dbReading.timestamp).getTime() < 60 * 60 * 1000) {
        await setCachedJson(`airquality:current:${locationId}`, dbReading, 3600);
        return {
          ...dbReading,
          locationName,
          fromCache: false,
        };
      }
    } else {
      lat = query.latitude!;
      lng = query.longitude!;
    }

    // 4. Fallback to provider fetch (populating cache + DB if locationId is known)
    const liveAq = await openAqProvider.fetchAirQuality(lat, lng);

    if (locationId) {
      try {
        await prisma.airQualityReading.upsert({
          where: {
            locationId_timestamp_sourceId: {
              locationId,
              timestamp: liveAq.timestamp,
              sourceId: liveAq.sourceId,
            },
          },
          update: {
            pm25: liveAq.pm25,
            pm10: liveAq.pm10,
            no2: liveAq.no2,
            so2: liveAq.so2,
            co: liveAq.co,
            o3: liveAq.o3,
            aqi: liveAq.aqi,
            aqiCategory: liveAq.aqiCategory && liveAq.aqiCategory !== 'INSUFFICIENT_DATA' ? liveAq.aqiCategory : undefined,
            prominentPollutant: liveAq.prominentPollutant,
            dataOrigin: liveAq.dataOrigin,
          },
          create: {
            locationId,
            timestamp: liveAq.timestamp,
            sourceId: liveAq.sourceId,
            sourceUrl: liveAq.sourceUrl,
            dataOrigin: liveAq.dataOrigin,
            pm25: liveAq.pm25,
            pm10: liveAq.pm10,
            no2: liveAq.no2,
            so2: liveAq.so2,
            co: liveAq.co,
            o3: liveAq.o3,
            aqi: liveAq.aqi,
            aqiCategory: liveAq.aqiCategory && liveAq.aqiCategory !== 'INSUFFICIENT_DATA' ? liveAq.aqiCategory : undefined,
            prominentPollutant: liveAq.prominentPollutant,
            rawPayload: (liveAq.rawPayload ?? {}) as Prisma.InputJsonValue,
          },
        });
        await setCachedJson(`airquality:current:${locationId}`, liveAq, 3600);
      } catch (err) {
        console.warn('[AIR_QUALITY_SERVICE] Failed to persist air quality reading to DB:', (err as Error).message);
      }
    }

    return {
      ...liveAq,
      locationId,
      locationName,
      fromCache: false,
    };
  }

  async getHistoricalAirQuality(query: HistoricalAirQualityQuery) {
    const { locationId, hours, limit } = query;

    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!location) {
      throw new NotFoundError(`Location with id ${locationId} not found`);
    }

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const dbReadings = await prisma.airQualityReading.findMany({
      where: {
        locationId,
        timestamp: { gte: since },
      },
      orderBy: { timestamp: 'asc' },
      take: limit,
    });

    if (dbReadings.length > 0) {
      return {
        locationId,
        locationName: location.name,
        count: dbReadings.length,
        readings: dbReadings,
        fromCache: false,
      };
    }

    // If no readings in DB yet, synthesize historical timeline from provider
    const syntheticHistory = await openAqProvider.fetchHistoricalAirQuality(
      location.latitude,
      location.longitude,
      hours
    );

    return {
      locationId,
      locationName: location.name,
      count: syntheticHistory.length,
      readings: syntheticHistory,
      fromCache: false,
    };
  }
}

export const airQualityService = new AirQualityService();
