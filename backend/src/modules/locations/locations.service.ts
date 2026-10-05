import { prisma } from '../../database/prisma.js';
import { CreateLocationInput, UpdateLocationInput } from './locations.schema.js';
import { NotFoundError, ConflictError } from '../../common/errors.js';

export interface LocationGeoJsonFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: string;
    code: string;
    name: string;
    city: string | null;
    district: string | null;
    state: string;
    country: string;
    distanceMeters?: number;
    elevationMeters?: number | null;
    population?: number | null;
  };
}

export interface LocationGeoJsonCollection {
  type: 'FeatureCollection';
  features: LocationGeoJsonFeature[];
  totalFeatures: number;
}

export class LocationsService {
  async createLocation(input: CreateLocationInput) {
    const existing = await prisma.location.findUnique({
      where: { code: input.code },
    });

    if (existing) {
      throw new ConflictError(`Location with code '${input.code}' already exists`);
    }

    // Insert location and synchronize PostGIS Point geometry via raw SQL or standard insert
    // Trigger automatically populates locationPoint from lat/lng
    return prisma.location.create({
      data: {
        code: input.code,
        name: input.name,
        city: input.city || null,
        district: input.district || null,
        state: input.state,
        country: input.country,
        latitude: input.latitude,
        longitude: input.longitude,
        elevationMeters: input.elevationMeters || null,
        areaKm2: input.areaKm2 || null,
        population: input.population || null,
      },
    });
  }

  async getLocationById(id: string) {
    const location = await prisma.location.findFirst({
      where: { id, isDeleted: false },
    });

    if (!location) {
      throw new NotFoundError(`Location with ID ${id} not found`);
    }

    return location;
  }

  async updateLocation(id: string, input: UpdateLocationInput) {
    await this.getLocationById(id);

    return prisma.location.update({
      where: { id },
      data: input,
    });
  }

  async deleteLocation(id: string) {
    await this.getLocationById(id);

    return prisma.location.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async listLocations(filter: { city?: string; state?: string; page: number; limit: number }) {
    const skip = (filter.page - 1) * filter.limit;
    const where = {
      isDeleted: false,
      ...(filter.city ? { city: { contains: filter.city, mode: 'insensitive' as const } } : {}),
      ...(filter.state ? { state: { contains: filter.state, mode: 'insensitive' as const } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.location.findMany({
        where,
        skip,
        take: filter.limit,
        orderBy: { name: 'asc' },
      }),
      prisma.location.count({ where }),
    ]);

    return {
      locations: items,
      total,
      page: filter.page,
      limit: filter.limit,
    };
  }

  /**
   * PostGIS ST_DWithin query returning GeoJSON FeatureCollection
   */
  async findNearbyGeoJson(lat: number, lng: number, radiusMeters: number): Promise<LocationGeoJsonCollection> {
    const rawResults = await prisma.$queryRaw<
      Array<{
        id: string;
        code: string;
        name: string;
        city: string | null;
        district: string | null;
        state: string;
        country: string;
        latitude: number;
        longitude: number;
        elevationMeters: number | null;
        population: number | null;
        distanceMeters: number;
      }>
    >`
      SELECT 
        id, 
        code, 
        name, 
        city,
        district,
        state, 
        country, 
        latitude, 
        longitude,
        "elevationMeters",
        population,
        ROUND(ST_Distance(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        )) AS "distanceMeters"
      FROM locations
      WHERE "isDeleted" = false
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${radiusMeters}
        )
      ORDER BY "distanceMeters" ASC;
    `;

    const features: LocationGeoJsonFeature[] = rawResults.map((r) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [r.longitude, r.latitude],
      },
      properties: {
        id: r.id,
        code: r.code,
        name: r.name,
        city: r.city,
        district: r.district,
        state: r.state,
        country: r.country,
        distanceMeters: Number(r.distanceMeters),
        elevationMeters: r.elevationMeters,
        population: r.population,
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
      totalFeatures: features.length,
    };
  }

  /**
   * PostGIS ST_MakeEnvelope bounding box query returning GeoJSON FeatureCollection
   */
  async findInBBoxGeoJson(minLng: number, minLat: number, maxLng: number, maxLat: number): Promise<LocationGeoJsonCollection> {
    const rawResults = await prisma.$queryRaw<
      Array<{
        id: string;
        code: string;
        name: string;
        city: string | null;
        district: string | null;
        state: string;
        country: string;
        latitude: number;
        longitude: number;
        elevationMeters: number | null;
        population: number | null;
      }>
    >`
      SELECT 
        id, 
        code, 
        name, 
        city,
        district,
        state, 
        country, 
        latitude, 
        longitude,
        "elevationMeters",
        population
      FROM locations
      WHERE "isDeleted" = false
        AND ST_Intersects(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
          ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326)
        )
      ORDER BY name ASC;
    `;

    const features: LocationGeoJsonFeature[] = rawResults.map((r) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [r.longitude, r.latitude],
      },
      properties: {
        id: r.id,
        code: r.code,
        name: r.name,
        city: r.city,
        district: r.district,
        state: r.state,
        country: r.country,
        elevationMeters: r.elevationMeters,
        population: r.population,
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
      totalFeatures: features.length,
    };
  }

  /**
   * PostGIS ST_Distance nearest neighbor search
   */
  async findNearest(lat: number, lng: number, limit = 5) {
    return prisma.$queryRaw<
      Array<{
        id: string;
        code: string;
        name: string;
        city: string | null;
        state: string;
        latitude: number;
        longitude: number;
        distanceMeters: number;
      }>
    >`
      SELECT 
        id, 
        code, 
        name, 
        city,
        state, 
        latitude, 
        longitude,
        ROUND(ST_Distance(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        )) AS "distanceMeters"
      FROM locations
      WHERE "isDeleted" = false
      ORDER BY "distanceMeters" ASC
      LIMIT ${limit};
    `;
  }
}

export const locationsService = new LocationsService();
