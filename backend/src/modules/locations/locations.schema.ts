import { z } from 'zod';

export const createLocationSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(100),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().min(2).max(100),
  country: z.string().default('India'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  elevationMeters: z.number().optional(),
  areaKm2: z.number().positive().optional(),
  population: z.number().int().positive().optional(),
});

export const updateLocationSchema = createLocationSchema.partial();

export const nearbyQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusMeters: z.coerce.number().positive().default(10000), // Default 10km
});

export const bboxQuerySchema = z.object({
  minLng: z.coerce.number().min(-180).max(180),
  minLat: z.coerce.number().min(-90).max(90),
  maxLng: z.coerce.number().min(-180).max(180),
  maxLat: z.coerce.number().min(-90).max(90),
});

export const nearestQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  limit: z.coerce.number().int().positive().max(50).default(5),
});

export const listLocationsQuerySchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
