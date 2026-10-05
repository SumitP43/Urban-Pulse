import { describe, it, expect } from 'vitest';
import {
  calculateSubIndex,
  calculateCpcbAqi,
  getAQICategory,
} from '../../src/modules/air-quality/aqi-calculator.js';

describe('Indian CPCB NAQI Calculator', () => {
  describe('Sub-Index Breakpoint Calculations', () => {
    it('calculates PM2.5 sub-index accurately across breakpoints', () => {
      // 0-30 -> 0-50
      expect(calculateSubIndex('pm25', 15)).toBe(25);
      expect(calculateSubIndex('pm25', 30)).toBe(50);

      // 30.1-60 -> 51-100
      expect(calculateSubIndex('pm25', 60)).toBe(100);

      // 60.1-90 -> 101-200
      expect(calculateSubIndex('pm25', 75)).toBe(150);

      // 90.1-120 -> 201-300
      expect(calculateSubIndex('pm25', 105)).toBe(250);

      // 120.1-250 -> 301-400
      expect(calculateSubIndex('pm25', 250)).toBe(400);

      // > 250 -> Severe (401-500)
      expect(calculateSubIndex('pm25', 350)).toBeGreaterThan(400);
    });

    it('calculates PM10 sub-index accurately', () => {
      expect(calculateSubIndex('pm10', 25)).toBe(25);
      expect(calculateSubIndex('pm10', 50)).toBe(50);
      expect(calculateSubIndex('pm10', 100)).toBe(100);
      expect(calculateSubIndex('pm10', 175)).toBe(150);
    });

    it('calculates CO sub-index accurately', () => {
      expect(calculateSubIndex('co', 1.0)).toBe(50);
      expect(calculateSubIndex('co', 2.0)).toBe(100);
      expect(calculateSubIndex('co', 6.0)).toBe(150);
    });
  });

  describe('Category Mapping', () => {
    it('maps AQI numbers to correct CPCB descriptive categories', () => {
      expect(getAQICategory(30)).toBe('GOOD');
      expect(getAQICategory(75)).toBe('SATISFACTORY');
      expect(getAQICategory(150)).toBe('MODERATE');
      expect(getAQICategory(250)).toBe('POOR');
      expect(getAQICategory(350)).toBe('VERY_POOR');
      expect(getAQICategory(450)).toBe('SEVERE');
    });
  });

  describe('Comprehensive CPCB NAQI Formulation', () => {
    it('computes overall AQI as maximum sub-index when 3+ pollutants are present with particulates', () => {
      const result = calculateCpcbAqi({
        pm25: 110, // sub-index ~ 267 (Poor)
        pm10: 90,  // sub-index 90 (Satisfactory)
        no2: 30,   // sub-index ~ 38 (Good)
        so2: 15,   // sub-index ~ 19 (Good)
      });

      expect(result.isComputable).toBe(true);
      expect(result.prominentPollutant).toBe('PM25');
      expect(result.category).toBe('POOR');
      expect(result.aqi).toBeGreaterThan(250);
      expect(result.subIndices.length).toBe(4);
    });

    it('identifies SEVERE conditions during winter smog scenario', () => {
      const result = calculateCpcbAqi({
        pm25: 320, // Severe
        pm10: 480, // Severe
        no2: 120,
        so2: 45,
      });

      expect(result.isComputable).toBe(true);
      expect(result.category).toBe('SEVERE');
      expect(result.aqi).toBeGreaterThanOrEqual(400);
    });

    it('rejects calculation if PM2.5 and PM10 are missing (CPCB minimum requirement)', () => {
      const result = calculateCpcbAqi({
        no2: 60,
        so2: 30,
        co: 1.5,
      });

      expect(result.isComputable).toBe(false);
      expect(result.reasonIfNotComputable).toContain('At least one particulate pollutant (PM2.5 or PM10) must be monitored');
    });

    it('rejects calculation if fewer than 3 pollutants are provided (CPCB minimum requirement)', () => {
      const result = calculateCpcbAqi({
        pm25: 45,
        no2: 30,
      });

      expect(result.isComputable).toBe(false);
      expect(result.reasonIfNotComputable).toContain('Minimum 3 pollutants required');
    });
  });
});
