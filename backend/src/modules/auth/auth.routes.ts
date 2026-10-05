import { FastifyInstance } from 'fastify';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', {
    schema: {
      tags: ['Authentication'],
      summary: 'Register new user account (Always creates role USER)',
    },
    handler: authController.register.bind(authController),
  });

  fastify.post('/login', {
    schema: {
      tags: ['Authentication'],
      summary: 'Log in with email and password',
    },
    handler: authController.login.bind(authController),
  });

  fastify.post('/refresh', {
    schema: {
      tags: ['Authentication'],
      summary: 'Rotate refresh token and obtain fresh access token',
    },
    handler: authController.refresh.bind(authController),
  });

  fastify.post('/logout', {
    schema: {
      tags: ['Authentication'],
      summary: 'Revoke refresh token and clear session cookies',
    },
    handler: authController.logout.bind(authController),
  });

  fastify.get('/me', {
    schema: {
      tags: ['Authentication'],
      summary: 'Get profile details of the authenticated user',
    },
    preHandler: [authenticate],
    handler: authController.getCurrentUser.bind(authController),
  });
}
