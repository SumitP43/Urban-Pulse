import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '../common/errors.js';
import { Role } from '../common/types.js';

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: Role;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtUserPayload;
    user: JwtUserPayload;
  }
}


export async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  try {
    const payload = await request.jwtVerify<JwtUserPayload>();
    request.user = payload;
  } catch (err) {
    throw new UnauthorizedError('Invalid, expired, or missing bearer token', err);
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw new ForbiddenError(
        `Access denied. Role '${request.user.role}' does not have sufficient permissions. Required one of: ${allowedRoles.join(', ')}`
      );
    }
  };
}
