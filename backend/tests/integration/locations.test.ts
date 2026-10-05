import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../src/app.js';
import { FastifyInstance } from 'fastify';

describe('Locations & Spatial Intelligence Endpoints', () => {
  let app: FastifyInstance;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();

    // Create user JWT token
    userToken = await app.jwt.sign({
      userId: 'user-test-uuid',
      email: 'analyst@urbanpulse.ai',
      role: 'USER',
    });

    // Create admin JWT token
    adminToken = await app.jwt.sign({
      userId: 'admin-test-uuid',
      email: 'admin@urbanpulse.ai',
      role: 'ADMIN',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/locations rejects unauthenticated requests with 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/locations',
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/v1/locations/nearby rejects invalid radius query parameters', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/locations/nearby?latitude=not-a-number&longitude=77.2',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/locations enforces RBAC and rejects role USER with 403 FORBIDDEN', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/locations',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      payload: {
        code: 'DEL-TEST-01',
        name: 'Test Location',
        state: 'Delhi',
        latitude: 28.6,
        longitude: 77.2,
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('POST /api/v1/locations validates input fields even for ADMIN', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/locations',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      payload: {
        code: 'D', // too short
        latitude: 999.0, // invalid
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
