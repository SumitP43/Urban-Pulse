import { prisma } from '../../database/prisma.js';
import { Prisma } from '@prisma/client';
import { env } from '../../config/env.js';

import {
  RiskPredictionRequest,
  RiskPredictionResponse,
  mapScoreToRiskLevel,
  mapRiskLevelToAlertSeverity,
} from './risk.contract.js';
import { HazardType, RiskLevel, AlertSeverity } from '../../common/types.js';

export class RiskService {
  /**
   * Assesses hazard risk for a location by querying the ML service,
   * with a deterministic fallback if ML service is unreachable.
   */
  async assessRisk(request: RiskPredictionRequest): Promise<RiskPredictionResponse> {
    try {
      const response = await fetch(`${env.ML_SERVICE_URL}/predict/risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(4000),
      });

      if (response.ok) {
        const mlResult = (await response.json()) as RiskPredictionResponse;
        await this.persistAssessment(mlResult);
        return mlResult;
      }
    } catch {
      // Fail open: compute using internal deterministic baseline
    }

    const localResult = this.computeLocalBaseline(request);
    await this.persistAssessment(localResult);
    return localResult;
  }

  private computeLocalBaseline(request: RiskPredictionRequest): RiskPredictionResponse {
    const { features, hazardType, locationId } = request;
    let score = 25.0;
    const missing: string[] = [];

    if (hazardType === 'FLOOD') {
      const precip = features.precipitationMm ?? 0;
      const ndwi = features.ndwi ?? 0;
      const impervious = features.imperviousSurfacePct ?? 60;
      score = Math.min((precip / 100) * 50 + (impervious / 100) * 25 + Math.max(0, ndwi + 0.2) * 15, 100);
      if (features.elevationMeters === undefined) missing.push('elevationMeters');
      if (features.drainageDensityKmPerKm2 === undefined) missing.push('drainageDensityKmPerKm2');
    } else if (hazardType === 'HEAT') {
      const temp = features.temperatureC ?? 30;
      const lst = features.landSurfaceTempC ?? temp + 4;
      score = Math.min(Math.max((temp - 25) / 20, 0) * 55 + Math.max((lst - 30) / 18, 0) * 25, 100);
      if (features.ndbi === undefined) missing.push('ndbi');
    } else if (hazardType === 'AIR_POLLUTION') {
      const aqi = features.aqi ?? (features.pm25 ? features.pm25 * 2.5 : 100);
      score = Math.min((aqi / 400) * 80 + 10, 100);
    }

    const riskLevel: RiskLevel = mapScoreToRiskLevel(score);
    const alertSeverity: AlertSeverity = mapRiskLevelToAlertSeverity(riskLevel);
    const confidence = missing.length > 0 ? 0.65 : 0.90;

    return {
      locationId,
      hazardType,
      riskScore: Math.round(score * 10) / 10,
      riskLevel,
      alertSeverity,
      confidence,
      inputCompletenessPct: missing.length > 0 ? 60.0 : 100.0,
      modelName: 'UrbanPulse-NodeFallbackBaseline',
      modelVersion: '1.0.0',
      modelType: 'baseline',
      features: features as Record<string, unknown>,
      explanation: {
        rule: 'Deterministic physics-guided baseline algorithm',
        missingInputs: missing,
      },
      timestamp: new Date().toISOString(),
    };
  }

  private async persistAssessment(result: RiskPredictionResponse): Promise<void> {
    try {
      const saved = await prisma.riskAssessment.create({
        data: {
          locationId: result.locationId,
          timestamp: new Date(result.timestamp),
          hazardType: result.hazardType as HazardType,
          riskScore: result.riskScore,
          riskLevel: result.riskLevel as RiskLevel,
          confidence: result.confidence,
          inputCompletenessPct: result.inputCompletenessPct,
          modelName: result.modelName,
          modelVersion: result.modelVersion,
          modelType: result.modelType,
          features: result.features as Prisma.InputJsonValue,
          explanation: result.explanation as Prisma.InputJsonValue,
          dataOrigin: 'PREDICTED',
        },
      });

      // Automatically generate Alert if risk level is elevated (MODERATE, HIGH, CRITICAL)
      if (['MODERATE', 'HIGH', 'CRITICAL'].includes(result.riskLevel)) {
        await prisma.alert.create({
          data: {
            locationId: result.locationId,
            riskAssessmentId: saved.id,
            title: `${result.hazardType} ${result.riskLevel} Risk Detected`,
            message: `Telemetry and satellite analysis detected elevated ${result.hazardType.toLowerCase()} vulnerability (Score: ${result.riskScore}/100).`,
            severity: result.alertSeverity as AlertSeverity,
            hazardType: result.hazardType as HazardType,
            status: 'ACTIVE',
            dataOrigin: 'DERIVED',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });
      }
    } catch (err) {
      console.warn('[RISK_SERVICE] Failed to save risk assessment to database:', (err as Error).message);
    }
  }

  async getAssessmentsByLocation(locationId: string) {
    return prisma.riskAssessment.findMany({
      where: { locationId },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });
  }
}

export const riskService = new RiskService();
