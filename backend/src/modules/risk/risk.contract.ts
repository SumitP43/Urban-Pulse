import { z } from 'zod';
import { RiskLevel, AlertSeverity } from '../../common/types.js';


export const riskPredictionRequestSchema = z.object({
  locationId: z.string(),
  hazardType: z.enum(['FLOOD', 'HEAT', 'AIR_POLLUTION', 'WATER_STRESS', 'MULTI_HAZARD']),
  features: z.object({
    temperatureC: z.number().optional(),
    relativeHumidityPct: z.number().optional(),
    precipitationMm: z.number().optional(),
    windSpeedMs: z.number().optional(),
    aqi: z.number().optional(),
    pm25: z.number().optional(),
    pm10: z.number().optional(),
    ndvi: z.number().optional(),
    ndwi: z.number().optional(),
    ndbi: z.number().optional(),
    landSurfaceTempC: z.number().optional(),
    elevationMeters: z.number().optional(),
    drainageDensityKmPerKm2: z.number().optional(),
    imperviousSurfacePct: z.number().optional(),
  }),
  dataTimestamp: z.string().datetime().optional(),
});

export const riskPredictionResponseSchema = z.object({
  locationId: z.string(),
  hazardType: z.enum(['FLOOD', 'HEAT', 'AIR_POLLUTION', 'WATER_STRESS', 'MULTI_HAZARD']),
  riskScore: z.number().min(0).max(100),
  riskLevel: z.enum(['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL']),
  alertSeverity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  confidence: z.number().min(0).max(1),
  inputCompletenessPct: z.number().min(0).max(100),
  modelName: z.string(),
  modelVersion: z.string(),
  modelType: z.enum(['baseline', 'trained']),
  features: z.record(z.unknown()),
  explanation: z.record(z.unknown()),
  timestamp: z.string(),
});

export type RiskPredictionRequest = z.infer<typeof riskPredictionRequestSchema>;
export type RiskPredictionResponse = z.infer<typeof riskPredictionResponseSchema>;

/**
 * Deterministic mapping of risk level using exact half-open intervals specified in master brief:
 * [0, 20)   => VERY_LOW
 * [20, 40)  => LOW
 * [40, 60)  => MODERATE
 * [60, 80)  => HIGH
 * [80, 100] => CRITICAL
 */
export function mapScoreToRiskLevel(score: number): RiskLevel {
  const boundedScore = Math.max(0, Math.min(score, 100));
  if (boundedScore < 20) return 'VERY_LOW';
  if (boundedScore < 40) return 'LOW';
  if (boundedScore < 60) return 'MODERATE';
  if (boundedScore < 80) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Deterministic mapping to alert severity specified in master brief:
 * VERY_LOW / LOW => LOW
 * MODERATE       => MEDIUM
 * HIGH           => HIGH
 * CRITICAL       => CRITICAL
 */
export function mapRiskLevelToAlertSeverity(level: RiskLevel): AlertSeverity {
  switch (level) {
    case 'VERY_LOW':
    case 'LOW':
      return 'LOW';
    case 'MODERATE':
      return 'MEDIUM';
    case 'HIGH':
      return 'HIGH';
    case 'CRITICAL':
      return 'CRITICAL';
  }
}
