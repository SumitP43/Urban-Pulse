import { AirQualityProvider, NormalizedAirQuality } from './air-quality.interface.js';
import { calculateCpcbAqi } from '../../modules/air-quality/aqi-calculator.js';
import { env } from '../../config/env.js';

export class OpenAQProvider implements AirQualityProvider {
  readonly providerName = 'openaq-v3';

  async fetchAirQuality(latitude: number, longitude: number): Promise<NormalizedAirQuality> {
    const apiKey = env.OPENAQ_API_KEY;

    if (!apiKey) {
      return this.getFallbackSeedReading(latitude, longitude, 'OPENAQ_API_KEY not configured in environment');
    }

    try {
      const url = `https://api.openaq.org/v3/locations?coordinates=${latitude},${longitude}&radius=25000&limit=1`;
      const response = await fetch(url, {
        headers: {
          'X-API-Key': apiKey,
          'User-Agent': 'UrbanPulse-AirQuality/1.0',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`OpenAQ responded with HTTP ${response.status}`);
      }

      const json = await response.json() as { results?: Array<{ sensors?: Array<{ parameter?: { name: string }; latest?: { value: number } }> }> };
      const location = json.results?.[0];
      if (!location || !location.sensors) {
        throw new Error('No OpenAQ monitoring sensor found near requested coordinates');
      }

      const concentrations: Record<string, number> = {};
      for (const sensor of location.sensors) {
        const param = sensor.parameter?.name?.toLowerCase();
        const value = sensor.latest?.value;
        if (param && typeof value === 'number') {
          if (param === 'pm25' || param === 'pm2.5') concentrations.pm25 = value;
          else if (param === 'pm10') concentrations.pm10 = value;
          else if (param === 'no2') concentrations.no2 = value;
          else if (param === 'so2') concentrations.so2 = value;
          else if (param === 'co') concentrations.co = value;
          else if (param === 'o3' || param === 'ozone') concentrations.o3 = value;
        }
      }

      const aqiResult = calculateCpcbAqi(concentrations);

      return {
        pm25: concentrations.pm25,
        pm10: concentrations.pm10,
        no2: concentrations.no2,
        so2: concentrations.so2,
        co: concentrations.co,
        o3: concentrations.o3,
        aqi: aqiResult.aqi,
        aqiCategory: aqiResult.category,
        prominentPollutant: aqiResult.prominentPollutant,
        dataOrigin: 'LIVE',
        sourceId: this.providerName,
        timestamp: new Date(),
        rawPayload: json as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return this.getFallbackSeedReading(latitude, longitude, (error as Error).message);
    }
  }

  private getFallbackSeedReading(lat: number, lng: number, reason: string): NormalizedAirQuality {
    // Explicitly labeled seed baseline values
    const seedConcentrations = {
      pm25: 78.4,
      pm10: 142.1,
      no2: 44.2,
      so2: 12.8,
      co: 1.2,
      o3: 38.5,
    };

    const aqiResult = calculateCpcbAqi(seedConcentrations);

    return {
      ...seedConcentrations,
      aqi: aqiResult.aqi,
      aqiCategory: aqiResult.category,
      prominentPollutant: aqiResult.prominentPollutant,
      dataOrigin: 'SEED',
      sourceId: `${this.providerName}-fallback`,
      timestamp: new Date(),
      rawPayload: { note: `Fallback seed air quality due to: ${reason}`, coordinates: { lat, lng } },
    };
  }
}

export const openAqProvider = new OpenAQProvider();
