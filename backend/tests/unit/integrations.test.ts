import { describe, it, expect } from 'vitest';
import { openMeteoProvider } from '../../src/integrations/weather/open-meteo.provider.js';
import { openAqProvider } from '../../src/integrations/air-quality/openaq.provider.js';
import { satelliteProvider } from '../../src/integrations/satellite/satellite.provider.js';
import {
  calculateHeatIndex,
  environmentalAnalyticsService,
} from '../../src/modules/environmental/environmental.service.js';

describe('External Integrations & Environmental Analytics', () => {
  describe('Weather Provider (Open-Meteo)', () => {
    it('returns normalized weather data with SI units and origin tag', async () => {
      // Testing provider fallback and schema normalization
      const weather = await openMeteoProvider.fetchCurrentWeather(28.6139, 77.2090);

      expect(weather.temperatureC).toBeDefined();
      expect(typeof weather.temperatureC).toBe('number');
      expect(weather.relativeHumidityPct).toBeGreaterThanOrEqual(0);
      expect(weather.relativeHumidityPct).toBeLessThanOrEqual(100);
      expect(weather.windSpeedMs).toBeGreaterThanOrEqual(0);
      expect(['LIVE', 'SEED']).toContain(weather.dataOrigin);
    });
  });

  describe('Air Quality Provider (OpenAQ v3)', () => {
    it('returns normalized pollutant readings and CPCB AQI computation', async () => {
      const airQuality = await openAqProvider.fetchAirQuality(28.6139, 77.2090);

      expect(airQuality.aqi).toBeDefined();
      expect(typeof airQuality.aqi).toBe('number');
      expect(airQuality.aqiCategory).toBeDefined();
      expect(airQuality.prominentPollutant).toBeDefined();
      expect(['LIVE', 'SEED']).toContain(airQuality.dataOrigin);
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
