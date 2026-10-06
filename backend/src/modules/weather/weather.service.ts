import { prisma } from '../../database/prisma.js';
import { Prisma } from '@prisma/client';
import { getCachedJson, setCachedJson } from '../../common/redis.js';
import { openMeteoProvider } from '../../integrations/weather/open-meteo.provider.js';
import { NotFoundError } from '../../common/errors.js';
import { CurrentWeatherQuery, ForecastWeatherQuery } from './weather.schema.js';

export class WeatherService {
  async getCurrentWeather(query: CurrentWeatherQuery) {
    let lat: number;
    let lng: number;
    let locationId = query.locationId;
    let locationName = 'Unknown Location';

    if (locationId) {
      // 1. Check Redis cache
      const cached = await getCachedJson(`weather:current:${locationId}`);
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
      const dbReading = await prisma.weatherReading.findFirst({
        where: { locationId },
        orderBy: { timestamp: 'desc' },
      });

      // If fresh DB reading exists (within last 30 minutes)
      if (dbReading && Date.now() - new Date(dbReading.timestamp).getTime() < 30 * 60 * 1000) {
        await setCachedJson(`weather:current:${locationId}`, dbReading, 1800);
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

    // 4. Fallback to live provider fetch (populating cache + DB if locationId is known)
    const liveWeather = await openMeteoProvider.fetchCurrentWeather(lat, lng);

    if (locationId) {
      try {
        await prisma.weatherReading.upsert({
          where: {
            locationId_timestamp_sourceId: {
              locationId,
              timestamp: liveWeather.timestamp,
              sourceId: liveWeather.sourceId,
            },
          },
          update: {
            temperatureC: liveWeather.temperatureC,
            relativeHumidityPct: liveWeather.relativeHumidityPct,
            windSpeedMs: liveWeather.windSpeedMs,
            precipitationMm: liveWeather.precipitationMm,
            dataOrigin: liveWeather.dataOrigin,
          },
          create: {
            locationId,
            timestamp: liveWeather.timestamp,
            sourceId: liveWeather.sourceId,
            sourceUrl: liveWeather.sourceUrl,
            dataOrigin: liveWeather.dataOrigin,
            temperatureC: liveWeather.temperatureC,
            relativeHumidityPct: liveWeather.relativeHumidityPct,
            windSpeedMs: liveWeather.windSpeedMs,
            windDirectionDeg: liveWeather.windDirectionDeg,
            surfacePressureHpa: liveWeather.surfacePressureHpa,
            precipitationMm: liveWeather.precipitationMm,
            cloudCoverPct: liveWeather.cloudCoverPct,
            uvIndex: liveWeather.uvIndex,
            rawPayload: (liveWeather.rawPayload ?? {}) as Prisma.InputJsonValue,
          },
        });
        await setCachedJson(`weather:current:${locationId}`, liveWeather, 1800);
      } catch (err) {
        console.warn('[WEATHER_SERVICE] Failed to persist weather reading to DB:', (err as Error).message);
      }
    }

    return {
      ...liveWeather,
      locationId,
      locationName,
      fromCache: false,
    };
  }

  async getWeatherForecast(query: ForecastWeatherQuery) {
    let lat: number;
    let lng: number;
    let locationId = query.locationId;
    let locationName = 'Unknown Location';

    if (locationId) {
      const cacheKey = `weather:forecast:${locationId}:${query.days}`;
      const cached = await getCachedJson(cacheKey);
      if (cached) {
        return {
          ...cached,
          fromCache: true,
        };
      }

      const location = await prisma.location.findUnique({
        where: { id: locationId },
      });
      if (!location) {
        throw new NotFoundError(`Location with id ${locationId} not found`);
      }

      lat = location.latitude;
      lng = location.longitude;
      locationName = location.name;
    } else {
      lat = query.latitude!;
      lng = query.longitude!;
    }

    const forecast = await openMeteoProvider.fetchForecast(lat, lng, query.days);

    if (locationId) {
      await setCachedJson(`weather:forecast:${locationId}:${query.days}`, forecast, 3600); // 1 hour TTL
    }

    return {
      ...forecast,
      locationId,
      locationName,
      fromCache: false,
    };
  }
}

export const weatherService = new WeatherService();
