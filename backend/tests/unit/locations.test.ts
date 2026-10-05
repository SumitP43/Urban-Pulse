import { describe, it, expect } from 'vitest';
import {
  createLocationSchema,
  nearbyQuerySchema,
  bboxQuerySchema,
} from '../../src/modules/locations/locations.schema.js';

describe('Locations & Geospatial Schemas', () => {
  describe('Location Creation Validation', () => {
    it('accepts valid Indian urban location coordinates', () => {
      const valid = {
        code: 'DEL-NCR-CP',
        name: 'Connaught Place',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        latitude: 28.6315,
        longitude: 77.2167,
        elevationMeters: 216.0,
      };

      const result = createLocationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid latitude out of [-90, 90]', () => {
      const invalid = {
        code: 'DEL-INV',
        name: 'Invalid Lat',
        state: 'Delhi',
        latitude: 105.0,
        longitude: 77.0,
      };

      const result = createLocationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('PostGIS Query Parameter Schemas', () => {
    it('validates nearby radius query parameters', () => {
      const query = {
        latitude: '28.6469',
        longitude: '77.3164',
        radiusMeters: '5000',
      };

      const result = nearbyQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.latitude).toBe(28.6469);
        expect(result.data.radiusMeters).toBe(5000);
      }
    });

    it('validates bounding box envelope coordinates', () => {
      const bbox = {
        minLng: '76.8',
        minLat: '28.4',
        maxLng: '77.5',
        maxLat: '28.9',
      };

      const result = bboxQuerySchema.safeParse(bbox);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.minLng).toBe(76.8);
        expect(result.data.maxLat).toBe(28.9);
      }
    });
  });
});
