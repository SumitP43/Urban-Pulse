import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { alertsService } from './alerts.service.js';
import { sendSuccess } from '../../common/response.js';
import { AlertStatus } from '../../common/types.js';
import { z } from 'zod';
import { ValidationError } from '../../common/errors.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED']),
});

export async function alertsRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    schema: {
      tags: ['Civic & Environmental Alerts'],
      summary: 'Get active alerts and disaster dispatches',
    },
    handler: async (
      request: FastifyRequest<{ Querystring: { status?: AlertStatus; locationId?: string } }>,
      reply: FastifyReply
    ) => {
      const alerts = await alertsService.getAlerts(request.query);
      return sendSuccess(reply, alerts);
    },
  });

  fastify.patch('/:id/status', {
    schema: {
      tags: ['Civic & Environmental Alerts'],
      summary: 'Update alert status (ACTIVE, ACKNOWLEDGED, RESOLVED)',
    },
    preHandler: [authenticate],
    handler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const parsed = updateStatusSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid status value', parsed.error.format());
      }

      const updated = await alertsService.updateAlertStatus(request.params.id, parsed.data.status);
      return sendSuccess(reply, updated);
    },
  });
}
