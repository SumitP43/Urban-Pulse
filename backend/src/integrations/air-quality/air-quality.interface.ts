import { DataOrigin, AQICategory } from '../../common/types.js';
import { CalculationStatus } from '../../modules/air-quality/aqi-calculator.js';

export interface NormalizedAirQuality {
  pm25?: number | null;
  pm10?: number | null;
  no2?: number | null;
  so2?: number | null;
  co?: number | null;
  o3?: number | null;
  aqi?: number | null;
  aqiCategory?: AQICategory | 'INSUFFICIENT_DATA';
  prominentPollutant?: string | null;
  subIndices?: Record<string, number>;
  pollutantsUsed?: string[];
  calculationStatus?: CalculationStatus;
  stationName?: string;
  stationDistanceM?: number;
  dataOrigin: DataOrigin;
  sourceId: string;
  sourceUrl?: string;
  retrievedAt: Date;
  timestamp: Date;
  rawPayload?: Record<string, unknown>;
}

export interface AirQualityProvider {
  readonly providerName: string;
  fetchAirQuality(latitude: number, longitude: number): Promise<NormalizedAirQuality>;
  fetchHistoricalAirQuality?(latitude: number, longitude: number, hours?: number): Promise<NormalizedAirQuality[]>;
}
