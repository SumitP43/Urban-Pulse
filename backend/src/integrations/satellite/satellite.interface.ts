import { DataOrigin } from '../../common/types.js';

export interface NormalizedSatelliteIndices {
  ndvi?: number;             // Normalized Difference Vegetation Index [-1, 1] (Sentinel-2 B8 & B4)
  ndwi?: number;             // Normalized Difference Water Index [-1, 1] (Sentinel-2 B3 & B8)
  ndbi?: number;             // Normalized Difference Built-up Index [-1, 1] (Sentinel-2 B11 & B8)
  landSurfaceTempC?: number; // Land Surface Temperature in °C (derived from Landsat 8/9 TIRS or MODIS)
  cloudCoveragePct?: number; // Cloud obscuration percentage
  dataOrigin: DataOrigin;
  sourceId: string;
  timestamp: Date;
  rawPayload?: Record<string, unknown>;
}

export interface SatelliteProvider {
  readonly providerName: string;
  fetchSatelliteIndices(latitude: number, longitude: number): Promise<NormalizedSatelliteIndices>;
}
