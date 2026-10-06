import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../src/app.js';
import { FastifyInstance } from 'fastify';

describe('Weather & Air Quality Integration Endpoints', () => {
  let app: FastifyInstance;
  let userToken: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();

    userToken = await app.jwt.sign({
      userId: 'test-researcher-uuid',
      email: 'researcher@urbanpulse.ai',
      role: 'RESEARCHER',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Enforcement', () => {
    it('GET /api/v1/weather/current rejects unauthenticated requests with 401', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/weather/current?latitude=28.6139&longitude=77.2090',
      });

      expect(res.statusCode).toBe(401);
      const json = JSON.parse(res.body);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/v1/air-quality/current rejects unauthenticated requests with 401', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/air-quality/current?latitude=28.6139&longitude=77.2090',
      });

      expect(res.statusCode).toBe(401);
      const json = JSON.parse(res.body);
      expect(json.success).toBe(false);
    });
  });

  describe('Weather Endpoints', () => {
    it('GET /api/v1/weather/current returns validated SI telemetry for coordinate pair', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/weather/current?latitude=28.6139&longitude=77.2090',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      expect(json.success).toBe(true);
      expect(json.data.temperatureC).toBeDefined();
      expect(json.data.relativeHumidityPct).toBeDefined();
      expect(json.data.windSpeedMs).toBeDefined();
      expect(json.data.sourceId).toMatch(/^open-meteo/);
      expect(['LIVE', 'SEED']).toContain(json.data.dataOrigin);
    });

    it('GET /api/v1/weather/forecast returns multi-day forecast array', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/weather/forecast?latitude=28.6139&longitude=77.2090&days=5',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      expect(json.success).toBe(true);
      expect(json.data.daily).toBeInstanceOf(Array);
      expect(json.data.daily.length).toBeGreaterThanOrEqual(1);
      expect(json.data.daily[0].date).toBeDefined();
      expect(json.data.daily[0].temperatureMaxC).toBeDefined();
    });

    it('GET /api/v1/weather/current returns 400 when coordinates and locationId are omitted', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/weather/current',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      });

      expect(res.statusCode).toBe(400);
      const json = JSON.parse(res.body);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Air Quality Endpoints', () => {
    it('GET /api/v1/air-quality/current returns air quality reading with CPCB indicators', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/air-quality/current?latitude=28.6139&longitude=77.2090',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      expect(json.success).toBe(true);
      expect(json.data.sourceId).toMatch(/^openaq/);
      expect(['LIVE', 'SEED']).toContain(json.data.dataOrigin);
    });

    it('GET /api/v1/air-quality/history requires locationId query parameter', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/air-quality/history',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      });

      expect(res.statusCode).toBe(400);
      const json = JSON.parse(res.body);
      expect(json.success).toBe(false);
    });
  });
});
