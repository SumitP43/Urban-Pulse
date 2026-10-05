import { AQICategory } from '../../common/types.js';

export interface PollutantConcentrations {
  pm25?: number | null; // µg/m³ (24-hr avg)
  pm10?: number | null; // µg/m³ (24-hr avg)
  no2?: number | null;  // µg/m³ (24-hr avg)
  so2?: number | null;  // µg/m³ (24-hr avg)
  co?: number | null;   // mg/m³ (8-hr avg)
  o3?: number | null;   // µg/m³ (8-hr avg)
}

export interface SubIndexResult {
  pollutant: keyof PollutantConcentrations;
  concentration: number;
  subIndex: number;
}

export interface CpcbAqiResult {
  aqi: number;
  category: AQICategory;
  prominentPollutant: string;
  subIndices: SubIndexResult[];
  isComputable: boolean;
  reasonIfNotComputable?: string;
}

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

const BREAKPOINTS: Record<keyof PollutantConcentrations, Breakpoint[]> = {
  pm25: [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
    { cLow: 30.1, cHigh: 60, iLow: 51, iHigh: 100 },
    { cLow: 60.1, cHigh: 90, iLow: 101, iHigh: 200 },
    { cLow: 90.1, cHigh: 120, iLow: 201, iHigh: 300 },
    { cLow: 120.1, cHigh: 250, iLow: 301, iHigh: 400 },
    { cLow: 250.1, cHigh: 500, iLow: 401, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 50.1, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 100.1, cHigh: 250, iLow: 101, iHigh: 200 },
    { cLow: 250.1, cHigh: 350, iLow: 201, iHigh: 300 },
    { cLow: 350.1, cHigh: 430, iLow: 301, iHigh: 400 },
    { cLow: 430.1, cHigh: 600, iLow: 401, iHigh: 500 },
  ],
  no2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 40.1, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 80.1, cHigh: 180, iLow: 101, iHigh: 200 },
    { cLow: 180.1, cHigh: 280, iLow: 201, iHigh: 300 },
    { cLow: 280.1, cHigh: 400, iLow: 301, iHigh: 400 },
    { cLow: 400.1, cHigh: 800, iLow: 401, iHigh: 500 },
  ],
  so2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 40.1, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 80.1, cHigh: 380, iLow: 101, iHigh: 200 },
    { cLow: 380.1, cHigh: 800, iLow: 201, iHigh: 300 },
    { cLow: 800.1, cHigh: 1600, iLow: 301, iHigh: 400 },
    { cLow: 1600.1, cHigh: 2400, iLow: 401, iHigh: 500 },
  ],
  co: [
    { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
    { cLow: 1.01, cHigh: 2.0, iLow: 51, iHigh: 100 },
    { cLow: 2.01, cHigh: 10.0, iLow: 101, iHigh: 200 },
    { cLow: 10.01, cHigh: 17.0, iLow: 201, iHigh: 300 },
    { cLow: 17.01, cHigh: 34.0, iLow: 301, iHigh: 400 },
    { cLow: 34.01, cHigh: 50.0, iLow: 401, iHigh: 500 },
  ],
  o3: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 50.1, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 100.1, cHigh: 168, iLow: 101, iHigh: 200 },
    { cLow: 168.1, cHigh: 208, iLow: 201, iHigh: 300 },
    { cLow: 208.1, cHigh: 748, iLow: 301, iHigh: 400 },
    { cLow: 748.1, cHigh: 1000, iLow: 401, iHigh: 500 },
  ],
};

export function calculateSubIndex(pollutant: keyof PollutantConcentrations, concentration: number): number {
  if (concentration < 0 || isNaN(concentration)) {
    return 0;
  }

  const ranges = BREAKPOINTS[pollutant];
  if (!ranges) return 0;

  for (const range of ranges) {
    if (concentration >= range.cLow && concentration <= range.cHigh) {
      const sub = range.iLow + ((range.iHigh - range.iLow) / (range.cHigh - range.cLow)) * (concentration - range.cLow);
      return Math.round(sub);
    }
  }

  // If concentration exceeds the highest defined range, cap at max or project from last range
  const highest = ranges[ranges.length - 1];
  if (concentration > highest.cHigh) {
    const sub = highest.iHigh + ((highest.iHigh - highest.iLow) / (highest.cHigh - highest.cLow)) * (concentration - highest.cHigh);
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
 * Pure function to compute Indian CPCB NAQI compliant with CPCB 2014 criteria:
 * 1. Minimum 3 pollutants required.
 * 2. At least one must be PM2.5 or PM10.
 * 3. Final AQI is the maximum of computed sub-indices.
 */
export function calculateCpcbAqi(concentrations: PollutantConcentrations): CpcbAqiResult {
  const subIndices: SubIndexResult[] = [];
  const validPollutants: (keyof PollutantConcentrations)[] = [];

  for (const key of ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3'] as const) {
    const val = concentrations[key];
    if (typeof val === 'number' && !isNaN(val) && val >= 0) {
      validPollutants.push(key);
      const sub = calculateSubIndex(key, val);
      subIndices.push({
        pollutant: key,
        concentration: val,
        subIndex: sub,
      });
    }
  }

  const hasParticulate = validPollutants.includes('pm25') || validPollutants.includes('pm10');
  const hasMinCount = validPollutants.length >= 3;

  if (!hasParticulate || !hasMinCount) {
    let reason = 'Insufficient data for official CPCB NAQI calculation.';
    if (!hasParticulate) {
      reason += ' At least one particulate pollutant (PM2.5 or PM10) must be monitored.';
    }
    if (!hasMinCount) {
      reason += ` Minimum 3 pollutants required (only ${validPollutants.length} present).`;
    }

    // Sort subindices descending for informational display
    subIndices.sort((a, b) => b.subIndex - a.subIndex);
    const top = subIndices[0];

    return {
      aqi: top ? top.subIndex : 0,
      category: top ? getAQICategory(top.subIndex) : 'GOOD',
      prominentPollutant: top ? top.pollutant.toUpperCase() : 'NONE',
      subIndices,
      isComputable: false,
      reasonIfNotComputable: reason,
    };
  }

  // Sort descending to find max sub-index
  subIndices.sort((a, b) => b.subIndex - a.subIndex);
  const maxSub = subIndices[0];

  return {
    aqi: maxSub.subIndex,
    category: getAQICategory(maxSub.subIndex),
    prominentPollutant: maxSub.pollutant.toUpperCase(),
    subIndices,
    isComputable: true,
  };
}
