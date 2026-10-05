import { FastifyReply } from 'fastify';
import { ApiSuccessEnvelope, ApiErrorEnvelope } from './types.js';

export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  meta?: Record<string, unknown>,
  statusCode = 200
): FastifyReply {
  const payload: ApiSuccessEnvelope<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  return reply.status(statusCode).send(payload);
}

export function sendError(
  reply: FastifyReply,
  code: string,
  message: string,
  details?: unknown,
  statusCode = 500
): FastifyReply {
  const payload: ApiErrorEnvelope = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return reply.status(statusCode).send(payload);
}
