import { DataOrigin } from '../../common/types.js';

export interface NormalizedWeather {
  temperatureC: number;
  relativeHumidityPct: number;
  windSpeedMs: number;
  windDirectionDeg?: number;
  surfacePressureHpa?: number;
  precipitationMm: number;
  cloudCoverPct?: number;
  uvIndex?: number;
  dataOrigin: DataOrigin;
  sourceId: string;
  timestamp: Date;
  rawPayload?: Record<string, unknown>;
}

export interface WeatherProvider {
  readonly providerName: string;
  fetchCurrentWeather(latitude: number, longitude: number): Promise<NormalizedWeather>;
}
