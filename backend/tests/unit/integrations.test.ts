import { describe, it, expect } from 'vitest';
import { openMeteoProvider, mapWmoWeatherCode } from '../../src/integrations/weather/open-meteo.provider.js';
import { openAqProvider } from '../../src/integrations/air-quality/openaq.provider.js';
import { satelliteProvider } from '../../src/integrations/satellite/satellite.provider.js';
import {
  calculateHeatIndex,
  environmentalAnalyticsService,
} from '../../src/modules/environmental/environmental.service.js';

describe('External Integrations & Environmental Analytics', () => {
  describe('Weather Provider (Open-Meteo)', () => {
    it('returns normalized weather data with SI units and origin tag', async () => {
      const weather = await openMeteoProvider.fetchCurrentWeather(28.6139, 77.2090);

      expect(weather.temperatureC).toBeDefined();
      expect(typeof weather.temperatureC).toBe('number');
      expect(weather.relativeHumidityPct).toBeGreaterThanOrEqual(0);
      expect(weather.relativeHumidityPct).toBeLessThanOrEqual(100);
      expect(weather.windSpeedMs).toBeGreaterThanOrEqual(0);
      expect(weather.precipitationMm).toBeGreaterThanOrEqual(0);
      expect(['LIVE', 'SEED']).toContain(weather.dataOrigin);
      expect(weather.sourceId).toMatch(/^open-meteo/);
      expect(weather.timestamp).toBeInstanceOf(Date);
      expect(weather.retrievedAt).toBeInstanceOf(Date);
    });

    it('returns multi-day normalized forecast with daily and hourly records', async () => {
      const forecast = await openMeteoProvider.fetchForecast(28.6139, 77.2090, 7);

      expect(forecast.latitude).toBeCloseTo(28.6139, 2);
      expect(forecast.longitude).toBeCloseTo(77.2090, 2);
      expect(forecast.daily.length).toBe(7);
      expect(forecast.daily[0].date).toBeDefined();
      expect(forecast.daily[0].temperatureMaxC).toBeGreaterThanOrEqual(forecast.daily[0].temperatureMinC);
      expect(forecast.daily[0].precipitationSumMm).toBeGreaterThanOrEqual(0);
      expect(['LIVE', 'SEED']).toContain(forecast.dataOrigin);
    });

    it('maps WMO weather codes to human-readable condition descriptions', () => {
      expect(mapWmoWeatherCode(0)).toBe('Clear sky');
      expect(mapWmoWeatherCode(1)).toBe('Mainly clear');
      expect(mapWmoWeatherCode(2)).toBe('Partly cloudy');
      expect(mapWmoWeatherCode(3)).toBe('Overcast');
      expect(mapWmoWeatherCode(45)).toBe('Fog');
      expect(mapWmoWeatherCode(61)).toBe('Rain');
      expect(mapWmoWeatherCode(71)).toBe('Snow fall');
      expect(mapWmoWeatherCode(95)).toBe('Thunderstorm');
      expect(mapWmoWeatherCode(undefined)).toBe('Unknown');
    });
  });

  describe('Air Quality Provider (OpenAQ v3)', () => {
    it('returns normalized pollutant readings and CPCB AQI computation', async () => {
      const airQuality = await openAqProvider.fetchAirQuality(28.6139, 77.2090);

      expect(airQuality.sourceId).toMatch(/^openaq/);
      expect(['LIVE', 'SEED']).toContain(airQuality.dataOrigin);
      expect(airQuality.retrievedAt).toBeInstanceOf(Date);

      // Verify CPCB NAQI calculation was performed
      if (airQuality.calculationStatus === 'VALID') {
        expect(airQuality.aqi).toBeDefined();
        expect(typeof airQuality.aqi).toBe('number');
        expect(airQuality.aqiCategory).toBeDefined();
        expect(airQuality.prominentPollutant).toBeDefined();
      }
    });

    it('generates multi-hour historical air quality timeseries', async () => {
      const history = await openAqProvider.fetchHistoricalAirQuality(28.6139, 77.2090, 12);

      expect(history.length).toBe(12);
      expect(history[0].timestamp.getTime()).toBeLessThan(history[11].timestamp.getTime());
      expect(['LIVE', 'SEED']).toContain(history[0].dataOrigin);
    });
  });

  describe('Satellite Provider (Sentinel-2 & Landsat/MODIS)', () => {
    it('extracts spectral indices and separates LST source', async () => {
      const sat = await satelliteProvider.fetchSatelliteIndices(28.6139, 77.2090);

      expect(sat.ndvi).toBeDefined();
      expect(sat.ndwi).toBeDefined();
      expect(sat.ndbi).toBeDefined();
      expect(sat.landSurfaceTempC).toBeDefined();
      expect(sat.dataOrigin).toBe('SEED');
      expect(sat.sourceId).toContain('landsat');
    });
  });

  describe('Derived Environmental Analytics & Heat Index', () => {
    it('accurately computes Rothfusz Heat Index across standard meteorological ranges', () => {
      // Below threshold (25°C), heat index equals ambient temperature
      expect(calculateHeatIndex(25, 50)).toBe(25);

      // Severe heat conditions: 35°C with 65% relative humidity
      const highHeat = calculateHeatIndex(35, 65);
      expect(highHeat).toBeGreaterThan(45); // Feels like > 45°C
    });

    it('synthesizes unified environmental snapshot with composite scores', async () => {
      const weather = await openMeteoProvider.fetchCurrentWeather(28.6139, 77.2090);
      const airQuality = await openAqProvider.fetchAirQuality(28.6139, 77.2090);
      const satellite = await satelliteProvider.fetchSatelliteIndices(28.6139, 77.2090);

      const snapshot = environmentalAnalyticsService.synthesizeSnapshot(weather, airQuality, satellite);

      expect(snapshot.dataOrigin).toBe('DERIVED');
      expect(snapshot.heatRiskScore).toBeGreaterThanOrEqual(0);
      expect(snapshot.heatRiskScore).toBeLessThanOrEqual(100);
      expect(snapshot.floodRiskScore).toBeGreaterThanOrEqual(0);
      expect(snapshot.overallRiskScore).toBeGreaterThanOrEqual(0);
      expect(snapshot.overallRiskScore).toBeLessThanOrEqual(100);
    });
  });
});
