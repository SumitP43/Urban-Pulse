import { WeatherProvider, NormalizedWeather } from './weather.interface.js';

interface OpenMeteoCurrentResponse {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature?: number;
    precipitation: number;
    surface_pressure?: number;
    cloud_cover?: number;
    wind_speed_10m: number; // in km/h by default
    wind_direction_10m?: number;
    uv_index?: number;
  };
}

export class OpenMeteoProvider implements WeatherProvider {
  readonly providerName = 'open-meteo';

  async fetchCurrentWeather(latitude: number, longitude: number): Promise<NormalizedWeather> {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', latitude.toString());
    url.searchParams.set('longitude', longitude.toString());
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,surface_pressure,cloud_cover,wind_speed_10m,wind_direction_10m,uv_index'
    );
    url.searchParams.set('wind_speed_unit', 'ms'); // Request SI unit m/s directly

    try {
      const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'UrbanPulse-Intelligence-Platform/1.0' },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Open-Meteo API returned status ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as OpenMeteoCurrentResponse;
      if (!data.current) {
        throw new Error('Malformed Open-Meteo response: missing current block');
      }

      return {
        temperatureC: data.current.temperature_2m,
        relativeHumidityPct: data.current.relative_humidity_2m,
        windSpeedMs: data.current.wind_speed_10m,
        windDirectionDeg: data.current.wind_direction_10m,
        surfacePressureHpa: data.current.surface_pressure,
        precipitationMm: data.current.precipitation,
        cloudCoverPct: data.current.cloud_cover,
        uvIndex: data.current.uv_index,
        dataOrigin: 'LIVE',
        sourceId: this.providerName,
        timestamp: new Date(data.current.time + 'Z'),
        rawPayload: data as unknown as Record<string, unknown>,
      };
    } catch (error) {
      console.warn(`[WEATHER] Live Open-Meteo fetch failed for (${latitude}, ${longitude}):`, (error as Error).message);

      // Rule 3: No fake data presented as live. Explicitly mark as SEED data origin.
      return {
        temperatureC: 28.5,
        relativeHumidityPct: 62.0,
        windSpeedMs: 3.4,
        windDirectionDeg: 120,
        surfacePressureHpa: 1012.0,
        precipitationMm: 0.0,
        cloudCoverPct: 25.0,
        uvIndex: 4.5,
        dataOrigin: 'SEED',
        sourceId: `${this.providerName}-fallback`,
        timestamp: new Date(),
        rawPayload: { note: 'Fallback seed weather data due to network disconnection' },
      };
    }
  }
}

export const openMeteoProvider = new OpenMeteoProvider();
