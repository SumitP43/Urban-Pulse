import { NormalizedWeather } from '../../integrations/weather/weather.interface.js';
import { NormalizedAirQuality } from '../../integrations/air-quality/air-quality.interface.js';
import { NormalizedSatelliteIndices } from '../../integrations/satellite/satellite.interface.js';

export interface DerivedEnvironmentalSnapshot {
  temperatureC: number;
  humidityPct: number;
  heatIndexC: number;
  aqi?: number;
  prominentPollutant?: string;
  ndvi?: number;
  ndwi?: number;
  floodRiskScore: number;
  heatRiskScore: number;
  overallRiskScore: number;
  dataOrigin: 'DERIVED';
}

/**
 * Computes the National Weather Service (NOAA) Heat Index in °C
 * using the full Steadman / Rothfusz multiple regression equation.
 */
export function calculateHeatIndex(tempC: number, humidityPct: number): number {
  // If temperature is below 27°C (80°F), apparent heat index is roughly ambient temperature
  if (tempC < 27 || humidityPct < 40) {
    return Math.round(tempC * 10) / 10;
  }

  // Convert to Fahrenheit for standard NOAA equation
  const T = (tempC * 9) / 5 + 32;
  const R = humidityPct;

  let HI =
    -42.379 +
    2.04901523 * T +
    10.14333127 * R -
    0.22475541 * T * R -
    0.00683783 * T * T -
    0.05481717 * R * R +
    0.00122874 * T * T * R +
    0.00085282 * T * R * R -
    0.00000199 * T * T * R * R;

  // Low humidity adjustment
  if (R < 13 && T >= 80 && T <= 112) {
    const adj = ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    HI -= adj;
  } else if (R > 85 && T >= 80 && T <= 87) {
    // High humidity adjustment
    const adj = ((R - 85) / 10) * ((87 - T) / 5);
    HI += adj;
  }

  // Convert back to Celsius
  const hiC = ((HI - 32) * 5) / 9;
  return Math.round(hiC * 10) / 10;
}

export class EnvironmentalAnalyticsService {
  /**
   * Merges raw weather, air quality, and satellite data into a unified
   * location environmental snapshot with derived heat index and synthetic hazard indices.
   *
   * Note on architecture:
   * - WeatherReading stores raw meteorological observations from the provider.
   * - EnvironmentalReading stores derived multi-sensor composite matrices (heatIndex, composite risk).
   */
  synthesizeSnapshot(
    weather: NormalizedWeather,
    airQuality: NormalizedAirQuality,
    satellite: NormalizedSatelliteIndices
  ): DerivedEnvironmentalSnapshot {
    const heatIndexC = calculateHeatIndex(weather.temperatureC, weather.relativeHumidityPct);

    // Heat risk index (0 - 100) combining ambient heat index and built-up NDBI index
    const baseHeatScore = Math.min(Math.max(((heatIndexC - 25) / 25) * 100, 0), 100);
    const ndbiBonus = (satellite.ndbi ?? 0.2) > 0.2 ? 15 : 0;
    const heatRiskScore = Math.min(Math.round(baseHeatScore + ndbiBonus), 100);

    // Flood risk index (0 - 100) combining precipitation and negative surface water absorption
    const precipFactor = Math.min((weather.precipitationMm / 60) * 100, 70);
    const ndwiFactor = (satellite.ndwi ?? 0) > 0.1 ? 25 : 5;
    const floodRiskScore = Math.min(Math.round(precipFactor + ndwiFactor), 100);

    // Overall composite risk score (0 - 100)
    const aqiScore = Math.min(((airQuality.aqi ?? 50) / 500) * 100, 100);
    const overallRiskScore = Math.round((heatRiskScore * 0.35 + floodRiskScore * 0.35 + aqiScore * 0.3));

    return {
      temperatureC: weather.temperatureC,
      humidityPct: weather.relativeHumidityPct,
      heatIndexC,
      aqi: airQuality.aqi ?? undefined,
      prominentPollutant: airQuality.prominentPollutant ?? undefined,
      ndvi: satellite.ndvi,
      ndwi: satellite.ndwi,
      floodRiskScore,
      heatRiskScore,
      overallRiskScore,
      dataOrigin: 'DERIVED',
    };
  }
}

export const environmentalAnalyticsService = new EnvironmentalAnalyticsService();
