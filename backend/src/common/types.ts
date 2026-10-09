export type DataOrigin = 'LIVE' | 'SEED' | 'DERIVED' | 'PREDICTED' | 'FALLBACK';

export type Role = 'ADMIN' | 'RESEARCHER' | 'ANALYST' | 'USER';

export type RiskLevel = 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export type HazardType = 'FLOOD' | 'HEAT' | 'AIR_POLLUTION' | 'WATER_STRESS' | 'MULTI_HAZARD';

export type AQICategory = 'GOOD' | 'SATISFACTORY' | 'MODERATE' | 'POOR' | 'VERY_POOR' | 'SEVERE';

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponseEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export interface Coordinates {
  latitude: number;
  longitude: number;
}
