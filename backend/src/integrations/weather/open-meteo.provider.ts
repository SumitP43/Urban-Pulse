import {
  WeatherProvider,
  NormalizedWeather,
  NormalizedWeatherForecast,
  DailyForecastItem,
  HourlyForecastItem,
} from './weather.interface.js';

export class ProviderError extends Error {
  constructor(
    public readonly providerName: string,
    message: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(`[${providerName}] ${message}`);
    this.name = 'ProviderError';
  }
}

export function mapWmoWeatherCode(code?: number): string {
  if (code === undefined || code === null) return 'Unknown';
  switch (code) {
    case 0:
      return 'Clear sky';
    case 1:
      return 'Mainly clear';
    case 2:
      return 'Partly cloudy';
    case 3:
      return 'Overcast';
    case 45:
      return 'Fog';
    case 48:
      return 'Depositing rime fog';
    case 51:
    case 53:
    case 55:
      return 'Drizzle';
    case 56:
    case 57:
      return 'Freezing drizzle';
    case 61:
    case 63:
    case 65:
      return 'Rain';
    case 66:
    case 67:
      return 'Freezing rain';
    case 71:
    case 73:
    case 75:
      return 'Snow fall';
    case 77:
      return 'Snow grains';
    case 80:
    case 81:
    case 82:
      return 'Rain showers';
    case 85:
    case 86:
      return 'Snow showers';
    case 95:
      return 'Thunderstorm';
    case 96:
    case 99:
      return 'Thunderstorm with hail';
    default:
      return 'Cloudy';
  }
}

interface OpenMeteoApiResponse {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature?: number;
    precipitation: number;
    surface_pressure?: number;
    cloud_cover?: number;
    wind_speed_10m: number;
    wind_direction_10m?: number;
    weather_code?: number;
    uv_index?: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max?: number[];
    apparent_temperature_min?: number[];
    precipitation_sum: number[];
    precipitation_probability_max?: number[];
    weather_code?: number[];
    wind_speed_10m_max?: number[];
    uv_index_max?: number[];
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    apparent_temperature?: number[];
    precipitation: number[];
    wind_speed_10m: number[];
    weather_code?: number[];
  };
  timezone?: string;
}

export class OpenMeteoProvider implements WeatherProvider {
  readonly providerName = 'open-meteo';
  readonly baseUrl = 'https://api.open-meteo.com/v1/forecast';
  private readonly defaultTimeoutMs = 8000;
  private readonly maxRetries = 2;

  private async fetchWithRetry(url: string, retries: number = this.maxRetries): Promise<Response> {
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'UrbanPulse-Intelligence-Platform/1.0 (+https://github.com/SumitP43/Urban-Pulse)',
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(this.defaultTimeoutMs),
        });

        if (response.ok) {
          return response;
        }

        // Only retry 5xx server errors or 429 rate limit
        if (response.status < 500 && response.status !== 429) {
          throw new ProviderError(
            this.providerName,
            `API responded with client error HTTP ${response.status}`,
            response.status
          );
        }

        throw new ProviderError(
          this.providerName,
          `API server error HTTP ${response.status}`,
          response.status
        );
      } catch (err) {
        attempt++;
        if (attempt > retries) {
          throw err;
        }
        // Exponential backoff: 500ms, 1000ms
        const delay = 500 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new ProviderError(this.providerName, 'Exceeded maximum retries');
  }

  async fetchCurrentWeather(latitude: number, longitude: number): Promise<NormalizedWeather> {
    const url = new URL(this.baseUrl);
    url.searchParams.set('latitude', latitude.toFixed(4));
    url.searchParams.set('longitude', longitude.toFixed(4));
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,surface_pressure,cloud_cover,wind_speed_10m,wind_direction_10m,weather_code,uv_index'
    );
    url.searchParams.set('wind_speed_unit', 'ms');
    url.searchParams.set('timeformat', 'iso8601');

    const retrievedAt = new Date();

    try {
      const response = await this.fetchWithRetry(url.toString());
      const data = (await response.json()) as OpenMeteoApiResponse;

      if (!data.current) {
        throw new ProviderError(this.providerName, 'Malformed response: missing "current" payload');
      }

      const weatherCondition = mapWmoWeatherCode(data.current.weather_code);

      // UTC timestamp normalization
      const timestamp = new Date(data.current.time.endsWith('Z') ? data.current.time : `${data.current.time}Z`);

      return {
        temperatureC: Number(data.current.temperature_2m.toFixed(1)),
        relativeHumidityPct: Math.round(data.current.relative_humidity_2m),
        apparentTemperatureC: data.current.apparent_temperature !== undefined ? Number(data.current.apparent_temperature.toFixed(1)) : undefined,
        windSpeedMs: Number(data.current.wind_speed_10m.toFixed(2)),
        windDirectionDeg: data.current.wind_direction_10m,
        surfacePressureHpa: data.current.surface_pressure !== undefined ? Number(data.current.surface_pressure.toFixed(1)) : undefined,
        precipitationMm: Number(data.current.precipitation.toFixed(1)),
        cloudCoverPct: data.current.cloud_cover,
        uvIndex: data.current.uv_index,
        weatherCode: data.current.weather_code,
        weatherCondition,
        dataOrigin: 'LIVE',
        sourceId: this.providerName,
        sourceUrl: 'https://api.open-meteo.com',
        retrievedAt,
        timestamp,
        rawPayload: data as unknown as Record<string, unknown>,
      };
    } catch (error) {
      console.warn(`[WEATHER] Live Open-Meteo fetch failed for (${latitude}, ${longitude}):`, (error as Error).message);

      // Rule 3 & 8: Explicitly labeled SEED fallback data. Never hide fallback as LIVE.
      return {
        temperatureC: 28.5,
        relativeHumidityPct: 62.0,
        apparentTemperatureC: 30.2,
        windSpeedMs: 3.4,
        windDirectionDeg: 120,
        surfacePressureHpa: 1012.0,
        precipitationMm: 0.0,
        cloudCoverPct: 25.0,
        uvIndex: 4.5,
        weatherCode: 1,
        weatherCondition: 'Mainly clear',
        dataOrigin: 'FALLBACK',
        sourceId: `${this.providerName}-fallback`,
        sourceUrl: 'https://api.open-meteo.com',
        retrievedAt,
        timestamp: new Date(),
        rawPayload: { note: 'Fallback seed weather data due to network disconnection or timeout', error: (error as Error).message },
      };
    }
  }

  async fetchForecast(latitude: number, longitude: number, days: number = 7): Promise<NormalizedWeatherForecast> {
    const clampedDays = Math.min(Math.max(1, days), 14);
    const url = new URL(this.baseUrl);
    url.searchParams.set('latitude', latitude.toFixed(4));
    url.searchParams.set('longitude', longitude.toFixed(4));
    url.searchParams.set('forecast_days', clampedDays.toString());
    url.searchParams.set(
      'daily',
      'temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,weather_code,wind_speed_10m_max,uv_index_max'
    );
    url.searchParams.set(
      'hourly',
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code'
    );
    url.searchParams.set('wind_speed_unit', 'ms');
    url.searchParams.set('timeformat', 'iso8601');

    const retrievedAt = new Date();

    try {
      const response = await this.fetchWithRetry(url.toString());
      const data = (await response.json()) as OpenMeteoApiResponse;

      if (!data.daily || !data.daily.time) {
        throw new ProviderError(this.providerName, 'Malformed forecast response: missing daily array');
      }

      const daily: DailyForecastItem[] = data.daily.time.map((dateStr, idx) => ({
        date: dateStr,
        temperatureMaxC: data.daily?.temperature_2m_max?.[idx] ?? 30.0,
        temperatureMinC: data.daily?.temperature_2m_min?.[idx] ?? 20.0,
        apparentTemperatureMaxC: data.daily?.apparent_temperature_max?.[idx],
        apparentTemperatureMinC: data.daily?.apparent_temperature_min?.[idx],
        precipitationSumMm: data.daily?.precipitation_sum?.[idx] ?? 0.0,
        precipitationProbabilityMax: data.daily?.precipitation_probability_max?.[idx],
        weatherCode: data.daily?.weather_code?.[idx],
        weatherCondition: mapWmoWeatherCode(data.daily?.weather_code?.[idx]),
        windSpeedMaxMs: data.daily?.wind_speed_10m_max?.[idx],
        uvIndexMax: data.daily?.uv_index_max?.[idx],
      }));

      const hourly: HourlyForecastItem[] = [];
      if (data.hourly && data.hourly.time) {
        // Return up to 24-48 hours for performance
        const limit = Math.min(data.hourly.time.length, 48);
        for (let i = 0; i < limit; i++) {
          const t = data.hourly.time[i];
          hourly.push({
            timestamp: new Date(t.endsWith('Z') ? t : `${t}Z`),
            temperatureC: data.hourly.temperature_2m[i] ?? 25.0,
            apparentTemperatureC: data.hourly.apparent_temperature?.[i],
            relativeHumidityPct: data.hourly.relative_humidity_2m[i] ?? 50,
            precipitationMm: data.hourly.precipitation[i] ?? 0,
            windSpeedMs: data.hourly.wind_speed_10m[i] ?? 3,
            weatherCode: data.hourly.weather_code?.[i],
            weatherCondition: mapWmoWeatherCode(data.hourly.weather_code?.[i]),
          });
        }
      }

      return {
        latitude,
        longitude,
        timezone: data.timezone || 'UTC',
        daily,
        hourly,
        dataOrigin: 'LIVE',
        sourceId: this.providerName,
        sourceUrl: 'https://api.open-meteo.com',
        retrievedAt,
      };
    } catch (error) {
      console.warn(`[WEATHER] Live Open-Meteo forecast failed for (${latitude}, ${longitude}):`, (error as Error).message);

      // Deterministic synthetic fallback days
      const fallbackDaily: DailyForecastItem[] = Array.from({ length: clampedDays }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
          date: d.toISOString().split('T')[0],
          temperatureMaxC: 32.0 - (i % 3),
          temperatureMinC: 22.0 + (i % 2),
          precipitationSumMm: i % 2 === 0 ? 0.0 : 2.5,
          weatherCondition: i % 2 === 0 ? 'Clear sky' : 'Partly cloudy',
          uvIndexMax: 6.0,
        };
      });

      return {
        latitude,
        longitude,
        timezone: 'UTC',
        daily: fallbackDaily,
        dataOrigin: 'FALLBACK',
        sourceId: `${this.providerName}-fallback`,
        sourceUrl: 'https://api.open-meteo.com',
        retrievedAt,
      };
    }
  }
}

export const openMeteoProvider = new OpenMeteoProvider();
