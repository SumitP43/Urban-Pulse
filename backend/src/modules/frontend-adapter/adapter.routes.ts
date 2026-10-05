import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { researchAdapterService } from './research-adapter.service.js';

export async function adapterRoutes(fastify: FastifyInstance) {
  // Existing Frontend Route 1: POST /api/research/search
  fastify.post('/api/research/search', async (request: FastifyRequest<{ Body: Record<string, any> }>, reply: FastifyReply) => {
    const body = (request.body || {}) as any;
    const result = await researchAdapterService.search({
      query: body.query || '',
      location: body.location,
      category: body.category,
      timeRange: body.timeRange,
    });
    return reply.status(200).send(result);
  });

  // Existing Frontend Route 2: POST /api/research/smart-summary
  fastify.post('/api/research/smart-summary', async (request: FastifyRequest<{ Body: Record<string, any> }>, reply: FastifyReply) => {
    const body = (request.body || {}) as any;
    const result = await researchAdapterService.generateSmartSummary({
      title: body.title || '',
      content: body.content || '',
      publisher: body.publisher,
      category: body.category,
      sourceId: body.sourceId,
    });
    return reply.status(200).send(result);
  });

  // Existing Frontend Route 3: POST /api/citation/verify
  fastify.post('/api/citation/verify', async (request: FastifyRequest<{ Body: Record<string, any> }>, reply: FastifyReply) => {
    const body = (request.body || {}) as any;
    const result = await researchAdapterService.verifyCitation({
      identifier: body.identifier || '',
      url: body.url,
      documentType: body.documentType,
    });
    return reply.status(200).send(result);
  });

  // Existing Frontend Route 4: GET /api/research/history
  fastify.get('/api/research/history', async (_request: FastifyRequest, reply: FastifyReply) => {
    const result = researchAdapterService.getHistory();
    return reply.status(200).send(result);
  });
}
