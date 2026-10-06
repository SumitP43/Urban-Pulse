import { AQICategory } from '../../common/types.js';

export interface PollutantConcentrations {
  pm25?: number | null; // µg/m³ (24-hr avg)
  pm10?: number | null; // µg/m³ (24-hr avg)
  no2?: number | null;  // µg/m³ (24-hr avg)
  so2?: number | null;  // µg/m³ (24-hr avg)
  co?: number | null;   // mg/m³ (8-hr avg)
  o3?: number | null;   // µg/m³ (8-hr avg)
}

export type CalculationStatus =
  | 'VALID'
  | 'INSUFFICIENT_DATA'
  | 'MISSING_PARTICULATE'
  | 'BELOW_MINIMUM_POLLUTANTS';

export interface CpcbAqiResult {
  aqi: number | null;
  category: AQICategory | 'INSUFFICIENT_DATA';
  dominantPollutant: string | null;
  subIndices: Record<string, number>;
  pollutantsUsed: string[];
  calculationStatus: CalculationStatus;
  isComputable?: boolean; // backwards compatibility
  prominentPollutant?: string; // backwards compatibility alias
}

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

/**
 * Official Indian Central Pollution Control Board (CPCB 2014) Breakpoints
 * Reference: National Air Quality Index, CPCB, Ministry of Environment, Forest and Climate Change
 */
export const CPCB_BREAKPOINTS: Record<keyof PollutantConcentrations, Breakpoint[]> = {
  pm25: [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
    { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
    { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
    { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
    { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
    { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
    { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
    { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
    { cLow: 431, cHigh: 600, iLow: 401, iHigh: 500 },
  ],
  no2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200 },
    { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300 },
    { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400 },
    { cLow: 401, cHigh: 800, iLow: 401, iHigh: 500 },
  ],
  so2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 380, iLow: 101, iHigh: 200 },
    { cLow: 381, cHigh: 800, iLow: 201, iHigh: 300 },
    { cLow: 801, cHigh: 1600, iLow: 301, iHigh: 400 },
    { cLow: 1601, cHigh: 2400, iLow: 401, iHigh: 500 },
  ],
  co: [
    { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
    { cLow: 1.1, cHigh: 2.0, iLow: 51, iHigh: 100 },
    { cLow: 2.1, cHigh: 10.0, iLow: 101, iHigh: 200 },
    { cLow: 10.1, cHigh: 17.0, iLow: 201, iHigh: 300 },
    { cLow: 17.1, cHigh: 34.0, iLow: 301, iHigh: 400 },
    { cLow: 34.1, cHigh: 50.0, iLow: 401, iHigh: 500 },
  ],
  o3: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 168, iLow: 101, iHigh: 200 },
    { cLow: 169, cHigh: 208, iLow: 201, iHigh: 300 },
    { cLow: 209, cHigh: 748, iLow: 301, iHigh: 400 },
    { cLow: 749, cHigh: 1000, iLow: 401, iHigh: 500 },
  ],
};

/**
 * Computes individual sub-index using standard linear interpolation
 * formula: I = I_low + ((I_high - I_low) / (C_high - C_low)) * (C - C_low)
 */
export function calculateSubIndex(pollutant: keyof PollutantConcentrations, concentration: number): number {
  if (concentration < 0 || isNaN(concentration) || !isFinite(concentration)) {
    return 0;
  }

  const ranges = CPCB_BREAKPOINTS[pollutant];
  if (!ranges) return 0;

  // Check matching breakpoint range (using floating tolerance between consecutive ranges)
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    const prevRange = i > 0 ? ranges[i - 1] : null;
    const effectiveLow = prevRange ? prevRange.cHigh : range.cLow;

    if (concentration >= effectiveLow && concentration <= range.cHigh) {
      const sub =
        range.iLow +
        ((range.iHigh - range.iLow) / (range.cHigh - range.cLow)) *
          (concentration - range.cLow);
      return Math.round(Math.max(0, sub));
    }
  }

  // If concentration is above highest range
  const highest = ranges[ranges.length - 1];
  if (concentration > highest.cHigh) {
    const sub =
      highest.iHigh +
      ((highest.iHigh - highest.iLow) / (highest.cHigh - highest.cLow)) *
        (concentration - highest.cHigh);
    return Math.round(Math.min(sub, 500));
  }

  return 0;
}

export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'GOOD';
  if (aqi <= 100) return 'SATISFACTORY';
  if (aqi <= 200) return 'MODERATE';
  if (aqi <= 300) return 'POOR';
  if (aqi <= 400) return 'VERY_POOR';
  return 'SEVERE';
}

/**
 * Pure function to compute Indian CPCB National Air Quality Index (NAQI):
 *
 * Requirements:
 * 1. Minimum 3 monitored pollutants required.
 * 2. At least one must be a particulate pollutant: PM2.5 OR PM10.
 * 3. Highest applicable pollutant sub-index becomes composite NAQI.
 * 4. When minimum pollutant requirements are not satisfied, returns calculationStatus
 *    and aqi: null.
 */
export function calculateCpcbAqi(concentrations: PollutantConcentrations): CpcbAqiResult {
  const subIndices: Record<string, number> = {};
  const pollutantsUsed: string[] = [];

  const pollutantKeys: (keyof PollutantConcentrations)[] = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3'];

  for (const key of pollutantKeys) {
    const val = concentrations[key];
    if (typeof val === 'number' && !isNaN(val) && isFinite(val) && val >= 0) {
      pollutantsUsed.push(key);
      subIndices[key] = calculateSubIndex(key, val);
    }
  }

  const hasParticulate = pollutantsUsed.includes('pm25') || pollutantsUsed.includes('pm10');
  const hasMinCount = pollutantsUsed.length >= 3;

  if (!hasParticulate) {
    return {
      aqi: null,
      category: 'INSUFFICIENT_DATA',
      dominantPollutant: null,
      subIndices,
      pollutantsUsed,
      calculationStatus: 'MISSING_PARTICULATE',
      isComputable: false,
      prominentPollutant: 'NONE',
    };
  }

  if (!hasMinCount) {
    return {
      aqi: null,
      category: 'INSUFFICIENT_DATA',
      dominantPollutant: null,
      subIndices,
      pollutantsUsed,
      calculationStatus: 'BELOW_MINIMUM_POLLUTANTS',
      isComputable: false,
      prominentPollutant: 'NONE',
    };
  }

  // Find dominant pollutant (maximum sub-index)
  let maxSubIndex = -1;
  let dominant: string | null = null;

  for (const key of pollutantsUsed) {
    const sub = subIndices[key];
    if (sub > maxSubIndex) {
      maxSubIndex = sub;
      dominant = key.toUpperCase();
    }
  }

  const finalAqi = maxSubIndex >= 0 ? maxSubIndex : 0;
  const category = getAQICategory(finalAqi);

  return {
    aqi: finalAqi,
    category,
    dominantPollutant: dominant,
    subIndices,
    pollutantsUsed,
    calculationStatus: 'VALID',
    isComputable: true,
    prominentPollutant: dominant ?? 'NONE',
  };
}
