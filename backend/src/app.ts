import fastify, { FastifyInstance, FastifyError } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './config/env.js';
import { AppError } from './common/errors.js';
import { sendError } from './common/response.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { riskRoutes } from './modules/risk/risk.routes.js';
import { alertsRoutes } from './modules/alerts/alerts.routes.js';
import { adapterRoutes } from './modules/frontend-adapter/adapter.routes.js';



export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: env.NODE_ENV === 'test' ? false : {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // 1. CORS plugin
  app.register(cors, {
    origin: [env.CORS_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // 2. Cookie plugin
  app.register(cookie, {
    secret: env.JWT_SECRET,
    hook: 'onRequest',
  });

  // 3. JWT plugin
  app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // 4. OpenAPI / Swagger Documentation at /api/docs
  app.register(swagger, {
    openapi: {
      info: {
        title: 'UrbanPulse API',
        description: 'AI-Powered Urban Intelligence and Digital Twin Platform API',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${env.HOST}:${env.PORT}`,
          description: 'Current Environment',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  app.register(swaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Centralized Error Handling
  app.setErrorHandler((error: FastifyError | Error, _request, reply) => {
    if (error instanceof AppError) {
      return sendError(reply, error.code, error.message, error.details, error.statusCode);
    }

    // Fastify built-in validation error
    const fastifyErr = error as FastifyError;
    if (fastifyErr.validation) {
      return sendError(reply, 'VALIDATION_ERROR', 'Request validation failed', fastifyErr.validation, 400);
    }

    // Default 500 error (hide internal details in production)
    const message = env.NODE_ENV === 'production' ? 'An internal server error occurred' : error.message;
    const details = env.NODE_ENV === 'production' ? undefined : { stack: error.stack };

    app.log.error(error);
    return sendError(reply, 'INTERNAL_SERVER_ERROR', message, details, 500);
  });

  // System Health Endpoint
  app.get('/health', async () => {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'urbanpulse-backend',
      version: '1.0.0',
    };
  });

  // Register Modules
  app.register(authRoutes, { prefix: '/api/v1/auth' });
  app.register(riskRoutes, { prefix: '/api/v1/risk' });
  app.register(alertsRoutes, { prefix: '/api/v1/alerts' });

  // Register Frontend Compatibility Adapter (supports existing frontend endpoints)
  app.register(adapterRoutes);

  return app;
}
