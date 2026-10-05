import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { riskService } from './risk.service.js';
import { riskPredictionRequestSchema } from './risk.contract.js';
import { sendSuccess } from '../../common/response.js';
import { ValidationError } from '../../common/errors.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export async function riskRoutes(fastify: FastifyInstance) {
  fastify.post('/assess', {
    schema: {
      tags: ['Risk & Hazard Assessment'],
      summary: 'Trigger ML risk prediction for a location',
    },
    preHandler: [authenticate],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = riskPredictionRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid risk assessment request body', parsed.error.format());
      }

      const result = await riskService.assessRisk(parsed.data);
      return sendSuccess(reply, result);
    },
  });

  fastify.get('/locations/:id', {
    schema: {
      tags: ['Risk & Hazard Assessment'],
      summary: 'Retrieve historical risk assessments for a location',
    },
    handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const results = await riskService.getAssessmentsByLocation(request.params.id);
      return sendSuccess(reply, results);
    },
  });
}
