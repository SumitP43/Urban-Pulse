import { FastifyInstance } from 'fastify';
import { usersController } from './users.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

export async function usersRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', requireRole('ADMIN'));

  fastify.get('/', {
    schema: {
      tags: ['Users Management'],
      summary: 'Admin-only list of platform users with pagination',
    },
    handler: usersController.list.bind(usersController),
  });

  fastify.patch('/:id/role', {
    schema: {
      tags: ['Users Management'],
      summary: 'Admin-only role change for a user (ADMIN, RESEARCHER, ANALYST, USER)',
    },
    handler: usersController.updateRole.bind(usersController),
  });
}
