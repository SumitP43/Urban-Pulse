import { prisma } from '../../database/prisma.js';

export interface SpatialLocationResult {
  id: string;
  code: string;
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  distanceMeters?: number;
}

export class SpatialService {
  /**
   * Find locations within a radial distance in meters using PostGIS ST_DWithin on geography
   */
  async findLocationsWithinRadius(
    centerLat: number,
    centerLng: number,
    radiusMeters: number
  ): Promise<SpatialLocationResult[]> {
    return prisma.$queryRaw<SpatialLocationResult[]>`
      SELECT 
        id, 
        code, 
        name, 
        state, 
        country, 
        latitude, 
        longitude,
        ROUND(ST_Distance(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${centerLng}, ${centerLat}), 4326)::geography
        )) AS "distanceMeters"
      FROM locations
      WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${centerLng}, ${centerLat}), 4326)::geography,
        ${radiusMeters}
      )
      ORDER BY "distanceMeters" ASC;
    `;
  }

  /**
   * Find locations inside a bounding box envelope using PostGIS ST_MakeEnvelope
   */
  async findLocationsInBoundingBox(
    minLng: number,
    minLat: number,
    maxLng: number,
    maxLat: number
  ): Promise<SpatialLocationResult[]> {
    return prisma.$queryRaw<SpatialLocationResult[]>`
      SELECT 
        id, 
        code, 
        name, 
        state, 
        country, 
        latitude, 
        longitude
      FROM locations
      WHERE ST_Intersects(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
        ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326)
      );
    `;
  }

  /**
   * Calculate exact ellipsoidal distance in meters between two coordinates via PostGIS ST_Distance
   */
  async calculateDistanceMeters(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): Promise<number> {
    const result = await prisma.$queryRaw<[{ distance: number }]>`
      SELECT ST_Distance(
        ST_SetSRID(ST_MakePoint(${lng1}, ${lat1}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${lng2}, ${lat2}), 4326)::geography
      ) AS distance;
    `;
    return result[0]?.distance ?? 0;
  }
}

export const spatialService = new SpatialService();
