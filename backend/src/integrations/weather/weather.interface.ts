import { DataOrigin } from '../../common/types.js';

export interface NormalizedWeather {
  temperatureC: number;
  relativeHumidityPct: number;
  apparentTemperatureC?: number;
  windSpeedMs: number;
  windDirectionDeg?: number;
  surfacePressureHpa?: number;
  precipitationMm: number;
  cloudCoverPct?: number;
  uvIndex?: number;
  weatherCode?: number;
  weatherCondition?: string;
  dataOrigin: DataOrigin;
  sourceId: string;
  sourceUrl?: string;
  retrievedAt: Date;
  timestamp: Date;
  rawPayload?: Record<string, unknown>;
}

export interface DailyForecastItem {
  date: string;
  temperatureMaxC: number;
  temperatureMinC: number;
  apparentTemperatureMaxC?: number;
  apparentTemperatureMinC?: number;
  precipitationSumMm: number;
  precipitationProbabilityMax?: number;
  weatherCode?: number;
  weatherCondition?: string;
  windSpeedMaxMs?: number;
  uvIndexMax?: number;
}

export interface HourlyForecastItem {
  timestamp: Date;
  temperatureC: number;
  apparentTemperatureC?: number;
  relativeHumidityPct: number;
  precipitationMm: number;
  windSpeedMs: number;
  weatherCode?: number;
  weatherCondition?: string;
}

export interface NormalizedWeatherForecast {
  latitude: number;
  longitude: number;
  timezone: string;
  daily: DailyForecastItem[];
  hourly?: HourlyForecastItem[];
  dataOrigin: DataOrigin;
  sourceId: string;
  sourceUrl?: string;
  retrievedAt: Date;
}

export interface WeatherProvider {
  readonly providerName: string;
  fetchCurrentWeather(latitude: number, longitude: number): Promise<NormalizedWeather>;
  fetchForecast(latitude: number, longitude: number, days?: number): Promise<NormalizedWeatherForecast>;
}
