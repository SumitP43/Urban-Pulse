import { FastifyInstance } from 'fastify';
import { airQualityController } from './air-quality.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export async function airQualityRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/current', {
    schema: {
      tags: ['Air Quality & Environmental Health'],
      summary: 'Get current CPCB NAQI and pollutant concentrations for a location',
      querystring: {
        type: 'object',
        properties: {
          locationId: { type: 'string', format: 'uuid' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
        },
      },
    },
    handler: airQualityController.getCurrent.bind(airQualityController),
  });

  fastify.get('/history', {
    schema: {
      tags: ['Air Quality & Environmental Health'],
      summary: 'Get historical air quality readings for a location',
      querystring: {
        type: 'object',
        required: ['locationId'],
        properties: {
          locationId: { type: 'string', format: 'uuid' },
          hours: { type: 'integer', minimum: 1, maximum: 168, default: 24 },
          limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 },
        },
      },
    },
    handler: airQualityController.getHistory.bind(airQualityController),
  });
}
