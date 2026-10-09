import { z } from 'zod';

export const currentAirQualityQuerySchema = z.object({
  locationId: z.string().uuid().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
}).refine(
  (data) => data.locationId !== undefined || (data.latitude !== undefined && data.longitude !== undefined),
  { message: 'Either locationId or both latitude and longitude must be provided' }
);

export const historicalAirQualityQuerySchema = z.object({
  locationId: z.string().uuid(),
  hours: z.coerce.number().int().min(1).max(168).default(24),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export type CurrentAirQualityQuery = z.infer<typeof currentAirQualityQuerySchema>;
export type HistoricalAirQualityQuery = z.infer<typeof historicalAirQualityQuerySchema>;
