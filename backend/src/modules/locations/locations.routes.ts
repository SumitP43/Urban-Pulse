import { FastifyInstance } from 'fastify';
import { locationsController } from './locations.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

export async function locationsRoutes(fastify: FastifyInstance) {
  // All location reads require authentication
  fastify.addHook('preHandler', authenticate);

  // Spatial search endpoints
  fastify.get('/nearby', {
    schema: {
      tags: ['Locations & Spatial Intelligence'],
      summary: 'Find locations within radial distance via PostGIS ST_DWithin (GeoJSON FeatureCollection)',
    },
    handler: locationsController.nearby.bind(locationsController),
  });

  fastify.get('/bbox', {
    schema: {
      tags: ['Locations & Spatial Intelligence'],
      summary: 'Find locations inside bounding box via PostGIS ST_MakeEnvelope (GeoJSON FeatureCollection)',
    },
    handler: locationsController.bbox.bind(locationsController),
  });

  fastify.get('/nearest', {
    schema: {
      tags: ['Locations & Spatial Intelligence'],
      summary: 'Find nearest locations sorted by PostGIS ST_Distance',
    },
    handler: locationsController.nearest.bind(locationsController),
  });

  // Standard CRUD
  fastify.get('/', {
    schema: {
      tags: ['Locations & Spatial Intelligence'],
      summary: 'List locations with pagination and city/state filtering',
    },
    handler: locationsController.list.bind(locationsController),
  });

  fastify.get('/:id', {
    schema: {
      tags: ['Locations & Spatial Intelligence'],
      summary: 'Get location details by UUID',
    },
    handler: locationsController.getById.bind(locationsController),
  });

  // Write operations restricted to ADMIN and ANALYST
  fastify.post('/', {
    schema: {
      tags: ['Locations & Spatial Intelligence'],
      summary: 'Create new urban location (Admin/Analyst only)',
    },
    preHandler: [requireRole('ADMIN', 'ANALYST')],
    handler: locationsController.create.bind(locationsController),
  });

  fastify.patch('/:id', {
    schema: {
      tags: ['Locations & Spatial Intelligence'],
      summary: 'Update urban location details (Admin/Analyst only)',
    },
    preHandler: [requireRole('ADMIN', 'ANALYST')],
    handler: locationsController.update.bind(locationsController),
  });

  fastify.delete('/:id', {
    schema: {
      tags: ['Locations & Spatial Intelligence'],
      summary: 'Soft-delete urban location (Admin/Analyst only)',
    },
    preHandler: [requireRole('ADMIN', 'ANALYST')],
    handler: locationsController.delete.bind(locationsController),
  });
}
