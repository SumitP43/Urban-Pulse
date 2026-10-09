import { z } from 'zod';

export const currentWeatherQuerySchema = z.object({
  locationId: z.string().uuid().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
}).refine(
  (data) => data.locationId !== undefined || (data.latitude !== undefined && data.longitude !== undefined),
  { message: 'Either locationId or both latitude and longitude must be provided' }
);

export const forecastWeatherQuerySchema = z.object({
  locationId: z.string().uuid().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  days: z.coerce.number().int().min(1).max(14).default(7),
}).refine(
  (data) => data.locationId !== undefined || (data.latitude !== undefined && data.longitude !== undefined),
  { message: 'Either locationId or both latitude and longitude must be provided' }
);

export type CurrentWeatherQuery = z.infer<typeof currentWeatherQuerySchema>;
export type ForecastWeatherQuery = z.infer<typeof forecastWeatherQuerySchema>;
