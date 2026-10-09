import { FastifyInstance } from 'fastify';
import { weatherController } from './weather.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export async function weatherRoutes(fastify: FastifyInstance) {
  // Weather routes require authentication
  fastify.addHook('preHandler', authenticate);

  fastify.get('/current', {
    schema: {
      tags: ['Weather & Meteorological Telemetry'],
      summary: 'Get current normalized weather for an urban location or coordinate pair',
      querystring: {
        type: 'object',
        properties: {
          locationId: { type: 'string', format: 'uuid' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
        },
      },
    },
    handler: weatherController.getCurrent.bind(weatherController),
  });

  fastify.get('/forecast', {
    schema: {
      tags: ['Weather & Meteorological Telemetry'],
      summary: 'Get multi-day normalized weather forecast for an urban location',
      querystring: {
        type: 'object',
        properties: {
          locationId: { type: 'string', format: 'uuid' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          days: { type: 'integer', minimum: 1, maximum: 14, default: 7 },
        },
      },
    },
    handler: weatherController.getForecast.bind(weatherController),
  });
}
