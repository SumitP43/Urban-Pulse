import { describe, it, expect } from 'vitest';
import {
  calculateSubIndex,
  calculateCpcbAqi,
  getAQICategory,
} from '../../src/modules/air-quality/aqi-calculator.js';

describe('Indian CPCB NAQI Calculator Engine', () => {
  describe('Sub-Index Breakpoint Calculations', () => {
    it('calculates PM2.5 sub-index accurately across breakpoints', () => {
      // 0-30 -> 0-50
      expect(calculateSubIndex('pm25', 0)).toBe(0);
      expect(calculateSubIndex('pm25', 15)).toBe(25);
      expect(calculateSubIndex('pm25', 30)).toBe(50);

      // 31-60 -> 51-100
      expect(calculateSubIndex('pm25', 45)).toBe(75);
      expect(calculateSubIndex('pm25', 60)).toBe(100);

      // 61-90 -> 101-200
      expect(calculateSubIndex('pm25', 75)).toBe(149);
      expect(calculateSubIndex('pm25', 90)).toBe(200);

      // 91-120 -> 201-300
      expect(calculateSubIndex('pm25', 105)).toBe(249);
      expect(calculateSubIndex('pm25', 120)).toBe(300);

      // 121-250 -> 301-400
      expect(calculateSubIndex('pm25', 250)).toBe(400);

      // > 250 -> Severe (401-500)
      expect(calculateSubIndex('pm25', 350)).toBeGreaterThan(400);
      expect(calculateSubIndex('pm25', 500)).toBe(500);
    });

    it('calculates PM10 sub-index accurately across boundaries', () => {
      expect(calculateSubIndex('pm10', 0)).toBe(0);
      expect(calculateSubIndex('pm10', 25)).toBe(25);
      expect(calculateSubIndex('pm10', 50)).toBe(50);
      expect(calculateSubIndex('pm10', 100)).toBe(100);
      expect(calculateSubIndex('pm10', 175)).toBe(150);
      expect(calculateSubIndex('pm10', 250)).toBe(200);
      expect(calculateSubIndex('pm10', 350)).toBe(300);
      expect(calculateSubIndex('pm10', 430)).toBe(400);
    });

    it('calculates CO sub-index accurately (mg/m³)', () => {
      expect(calculateSubIndex('co', 0)).toBe(0);
      expect(calculateSubIndex('co', 1.0)).toBe(50);
      expect(calculateSubIndex('co', 2.0)).toBe(100);
      expect(calculateSubIndex('co', 6.0)).toBe(150);
      expect(calculateSubIndex('co', 10.0)).toBe(200);
      expect(calculateSubIndex('co', 17.0)).toBe(300);
      expect(calculateSubIndex('co', 34.0)).toBe(400);
    });

    it('calculates NO2, SO2, and O3 sub-indices accurately', () => {
      expect(calculateSubIndex('no2', 40)).toBe(50);
      expect(calculateSubIndex('no2', 80)).toBe(100);
      expect(calculateSubIndex('so2', 40)).toBe(50);
      expect(calculateSubIndex('so2', 80)).toBe(100);
      expect(calculateSubIndex('o3', 50)).toBe(50);
      expect(calculateSubIndex('o3', 100)).toBe(100);
    });

    it('handles negative, NaN, and extreme out-of-range values', () => {
      expect(calculateSubIndex('pm25', -10)).toBe(0);
      expect(calculateSubIndex('pm25', NaN)).toBe(0);
      expect(calculateSubIndex('pm25', Infinity)).toBe(0);
      // Extremely high concentration caps at 500
      expect(calculateSubIndex('pm25', 1200)).toBe(500);
    });
  });

  describe('Category Mapping', () => {
    it('maps AQI numbers to exact CPCB descriptive categories', () => {
      expect(getAQICategory(0)).toBe('GOOD');
      expect(getAQICategory(50)).toBe('GOOD');
      expect(getAQICategory(51)).toBe('SATISFACTORY');
      expect(getAQICategory(100)).toBe('SATISFACTORY');
      expect(getAQICategory(101)).toBe('MODERATE');
      expect(getAQICategory(200)).toBe('MODERATE');
      expect(getAQICategory(201)).toBe('POOR');
      expect(getAQICategory(300)).toBe('POOR');
      expect(getAQICategory(301)).toBe('VERY_POOR');
      expect(getAQICategory(400)).toBe('VERY_POOR');
      expect(getAQICategory(401)).toBe('SEVERE');
      expect(getAQICategory(500)).toBe('SEVERE');
    });
  });

  describe('Official CPCB NAQI Formulation & Criteria', () => {
    it('computes overall AQI as maximum sub-index when 3+ pollutants are present with particulates', () => {
      const result = calculateCpcbAqi({
        pm25: 110, // sub-index ~ 267 (Poor)
        pm10: 90,  // sub-index 90 (Satisfactory)
        no2: 30,   // sub-index ~ 38 (Good)
        so2: 15,   // sub-index ~ 19 (Good)
      });

      expect(result.calculationStatus).toBe('VALID');
      expect(result.dominantPollutant).toBe('PM25');
      expect(result.category).toBe('POOR');
      expect(result.aqi).toBeGreaterThan(250);
      expect(result.pollutantsUsed).toEqual(['pm25', 'pm10', 'no2', 'so2']);
      expect(result.subIndices.pm25).toBeGreaterThan(250);
    });

    it('identifies dominant pollutant dynamically based on highest sub-index', () => {
      // Scenario where NO2 has the highest sub-index
      const result = calculateCpcbAqi({
        pm25: 25,  // sub-index ~ 42 (Good)
        pm10: 40,  // sub-index ~ 40 (Good)
        no2: 250,  // sub-index ~ 271 (Poor)
      });

      expect(result.calculationStatus).toBe('VALID');
      expect(result.dominantPollutant).toBe('NO2');
      expect(result.category).toBe('POOR');
      expect(result.aqi).toBe(result.subIndices.no2);
    });

    it('identifies SEVERE conditions during winter smog episode', () => {
      const result = calculateCpcbAqi({
        pm25: 350, // Severe
        pm10: 480, // Severe
        no2: 120,
        so2: 45,
        co: 3.5,
      });

      expect(result.calculationStatus).toBe('VALID');
      expect(result.category).toBe('SEVERE');
      expect(result.aqi).toBeGreaterThanOrEqual(400);
    });

    it('rejects calculation if both PM2.5 and PM10 are missing', () => {
      const result = calculateCpcbAqi({
        no2: 60,
        so2: 30,
        co: 1.5,
        o3: 40,
      });

      expect(result.calculationStatus).toBe('MISSING_PARTICULATE');
      expect(result.aqi).toBeNull();
      expect(result.category).toBe('INSUFFICIENT_DATA');
      expect(result.dominantPollutant).toBeNull();
    });

    it('rejects calculation if fewer than 3 pollutants are provided', () => {
      const result = calculateCpcbAqi({
        pm25: 45,
        no2: 30,
      });

      expect(result.calculationStatus).toBe('BELOW_MINIMUM_POLLUTANTS');
      expect(result.aqi).toBeNull();
      expect(result.category).toBe('INSUFFICIENT_DATA');
      expect(result.dominantPollutant).toBeNull();
    });

    it('handles undefined and null pollutant values gracefully without throwing', () => {
      const result = calculateCpcbAqi({
        pm25: 85,
        pm10: null,
        no2: 45,
        so2: undefined,
        co: 2.2,
      });

      expect(result.calculationStatus).toBe('VALID');
      expect(result.pollutantsUsed).toEqual(['pm25', 'no2', 'co']);
      expect(result.dominantPollutant).toBeDefined();
    });
  });
});
