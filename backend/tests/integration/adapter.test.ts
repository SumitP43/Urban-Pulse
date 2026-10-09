import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../src/app.js';
import { FastifyInstance } from 'fastify';

describe('Frontend Compatibility Adapter Endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/research/history returns session history array for frontend', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/research/history',
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].id).toBeDefined();
    expect(data[0].query).toBeDefined();
  });

  it('POST /api/research/search returns full structured research payload', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/research/search',
      payload: {
        query: 'Delhi air pollution winter emergency',
        location: 'Delhi',
      },
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.executiveSummary).toBeDefined();
    expect(Array.isArray(data.keyFindings)).toBe(true);
    expect(Array.isArray(data.relevantLocations)).toBe(true);
    expect(Array.isArray(data.sources)).toBe(true);
  });

  it('POST /api/research/smart-summary returns 3 bullet points with category impact', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/research/smart-summary',
      payload: {
        title: 'New Metro Corridor Expansion Order',
        content: 'Delhi Transport Corporation approves 14 new electric bus routes to connect outer peripheral wards with high capacity metro stations.',
        category: 'Transit',
      },
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.bullet1).toBeDefined();
    expect(data.bullet2).toBeDefined();
    expect(data.bullet3).toBeDefined();
    expect(data.modelName).toBeDefined();
  });

  it('POST /api/citation/verify returns citation checksum verification', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/citation/verify',
      payload: {
        identifier: 'SRC-01',
      },
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.status).toBe('valid');
    expect(data.docId).toBe('SRC-01');
    expect(data.message).toBeDefined();
  });
});
