import { describe, it, expect } from 'vitest';
import {
  mapScoreToRiskLevel,
  mapRiskLevelToAlertSeverity,
  riskPredictionResponseSchema,
} from '../../src/modules/risk/risk.contract.js';
import { riskService } from '../../src/modules/risk/risk.service.js';

describe('Node <-> ML Shared Contract & Risk Assessment Engine', () => {
  describe('Half-Open Range Risk Level Mapping', () => {
    it('accurately maps exact boundary conditions', () => {
      // [0, 20) => VERY_LOW
      expect(mapScoreToRiskLevel(0)).toBe('VERY_LOW');
      expect(mapScoreToRiskLevel(19.9)).toBe('VERY_LOW');

      // [20, 40) => LOW
      expect(mapScoreToRiskLevel(20.0)).toBe('LOW');
      expect(mapScoreToRiskLevel(39.9)).toBe('LOW');

      // [40, 60) => MODERATE
      expect(mapScoreToRiskLevel(40.0)).toBe('MODERATE');
      expect(mapScoreToRiskLevel(59.9)).toBe('MODERATE');

      // [60, 80) => HIGH
      expect(mapScoreToRiskLevel(60.0)).toBe('HIGH');
      expect(mapScoreToRiskLevel(79.9)).toBe('HIGH');

      // [80, 100] => CRITICAL
      expect(mapScoreToRiskLevel(80.0)).toBe('CRITICAL');
      expect(mapScoreToRiskLevel(100.0)).toBe('CRITICAL');
    });

    it('maps risk levels to standard alert severities', () => {
      expect(mapRiskLevelToAlertSeverity('VERY_LOW')).toBe('LOW');
      expect(mapRiskLevelToAlertSeverity('LOW')).toBe('LOW');
      expect(mapRiskLevelToAlertSeverity('MODERATE')).toBe('MEDIUM');
      expect(mapRiskLevelToAlertSeverity('HIGH')).toBe('HIGH');
      expect(mapRiskLevelToAlertSeverity('CRITICAL')).toBe('CRITICAL');
    });
  });

  describe('Contract Schema Validation', () => {
    it('validates a conforming ML service response payload', () => {
      const sampleMlResponse = {
        locationId: 'loc-delhi-01',
        hazardType: 'FLOOD',
        riskScore: 72.4,
        riskLevel: 'HIGH',
        alertSeverity: 'HIGH',
        confidence: 0.88,
        inputCompletenessPct: 80.0,
        modelName: 'UrbanPulse-PhysicsBaseline-Engine',
        modelVersion: '1.0.0',
        modelType: 'baseline',
        features: {
          precipitationMm: 68.2,
          imperviousSurfacePct: 75.0,
        },
        explanation: {
          primaryDriver: 'precipitationMm',
        },
        timestamp: new Date().toISOString(),
      };

      const result = riskPredictionResponseSchema.safeParse(sampleMlResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Deterministic Node Baseline Engine', () => {
    it('computes deterministic flood risk without random values', async () => {
      const assessment = await riskService.assessRisk({
        locationId: 'delhi-anand-vihar',
        hazardType: 'FLOOD',
        features: {
          precipitationMm: 85.0,
          imperviousSurfacePct: 80.0,
          ndwi: 0.25,
        },
      });

      expect(assessment.riskScore).toBeGreaterThan(60);
      expect(assessment.riskLevel).toBe('HIGH');
      expect(assessment.alertSeverity).toBe('HIGH');
      expect(assessment.confidence).toBeGreaterThan(0.5);
      expect(assessment.modelType).toBe('baseline');
      expect(assessment.explanation).toBeDefined();
    });

    it('computes deterministic heat risk without random values', async () => {
      const assessment = await riskService.assessRisk({
        locationId: 'delhi-anand-vihar',
        hazardType: 'HEAT',
        features: {
          temperatureC: 41.5,
          relativeHumidityPct: 60.0,
          landSurfaceTempC: 45.0,
        },
      });

      expect(assessment.riskScore).toBeGreaterThan(60);
      expect(['HIGH', 'CRITICAL']).toContain(assessment.riskLevel);
      expect(assessment.modelType).toBe('baseline');
    });
  });
});
