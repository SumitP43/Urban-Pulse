import { DataOrigin, AQICategory } from '../../common/types.js';

export interface NormalizedAirQuality {
  pm25?: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
  aqi?: number;
  aqiCategory?: AQICategory;
  prominentPollutant?: string;
  dataOrigin: DataOrigin;
  sourceId: string;
  timestamp: Date;
  rawPayload?: Record<string, unknown>;
}

export interface AirQualityProvider {
  readonly providerName: string;
  fetchAirQuality(latitude: number, longitude: number): Promise<NormalizedAirQuality>;
}
