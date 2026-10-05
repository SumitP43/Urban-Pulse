import { FastifyRequest, FastifyReply } from 'fastify';
import { usersService } from './users.service.js';
import { sendSuccess } from '../../common/response.js';
import { z } from 'zod';
import { ValidationError } from '../../common/errors.js';
import { Role } from '../../common/types.js';

const roleUpdateSchema = z.object({
  role: z.enum(['ADMIN', 'RESEARCHER', 'ANALYST', 'USER']),
});

export class UsersController {
  async list(request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>, reply: FastifyReply) {
    const page = Math.max(1, Number(request.query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(request.query?.limit) || 20));

    const result = await usersService.listUsers(page, limit);
    return sendSuccess(reply, result.users, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  }

  async updateRole(
    request: FastifyRequest<{ Params: { id: string }; Body: { role: Role } }>,
    reply: FastifyReply
  ) {
    const parsed = roleUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid role selection', parsed.error.format());
    }

    const updated = await usersService.updateRole(request.params.id, parsed.data.role);
    return sendSuccess(reply, updated);
  }
}

export const usersController = new UsersController();
