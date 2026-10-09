import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from './auth.service.js';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema.js';
import { sendSuccess } from '../../common/response.js';
import { ValidationError, UnauthorizedError } from '../../common/errors.js';
import { env } from '../../config/env.js';

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid registration data', parseResult.error.format());
    }

    const user = await authService.register(parseResult.data);

    // Sign JWT access token (15 minutes)
    const accessToken = await reply.jwtSign(
      { userId: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' }
    );

    const refreshToken = await authService.createRefreshToken(user.id);

    reply.setCookie('refreshToken', refreshToken, {
      path: '/api/v1/auth',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return sendSuccess(reply, { user, accessToken, refreshToken }, undefined, 201);
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid login data', parseResult.error.format());
    }

    const user = await authService.validateUserCredentials(parseResult.data);

    const accessToken = await reply.jwtSign(
      { userId: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' }
    );

    const refreshToken = await authService.createRefreshToken(user.id);

    reply.setCookie('refreshToken', refreshToken, {
      path: '/api/v1/auth',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return sendSuccess(reply, { user, accessToken, refreshToken });
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const bodyResult = refreshSchema.safeParse(request.body || {});
    const tokenFromCookie = request.cookies?.refreshToken;
    const rawToken = bodyResult.success && bodyResult.data.refreshToken ? bodyResult.data.refreshToken : tokenFromCookie;

    if (!rawToken) {
      throw new UnauthorizedError('No refresh token provided in body or cookies');
    }

    const { user, newRefreshToken } = await authService.rotateRefreshToken(rawToken);

    const accessToken = await reply.jwtSign(
      { userId: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' }
    );

    reply.setCookie('refreshToken', newRefreshToken, {
      path: '/api/v1/auth',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return sendSuccess(reply, { user, accessToken, refreshToken: newRefreshToken });
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const tokenFromCookie = request.cookies?.refreshToken;
    const bodyResult = refreshSchema.safeParse(request.body || {});
    const rawToken = bodyResult.success && bodyResult.data.refreshToken ? bodyResult.data.refreshToken : tokenFromCookie;

    if (rawToken) {
      await authService.revokeToken(rawToken);
    }

    reply.clearCookie('refreshToken', { path: '/api/v1/auth' });
    return sendSuccess(reply, { message: 'Logged out successfully' });
  }

  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    const user = await authService.getUserById(request.user.userId);
    return sendSuccess(reply, { user });
  }
}

export const authController = new AuthController();
