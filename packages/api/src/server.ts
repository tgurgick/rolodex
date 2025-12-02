/**
 * Fastify API server
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';

import { initDatabase } from '@rolodex/adapters';
import { errorHandler } from './middleware/error-handler';
import { contactRoutes } from './routes/contacts';
import { companyRoutes } from './routes/companies';
import { dealRoutes } from './routes/deals';
import { healthRoutes } from './routes/health';

export interface ServerConfig {
  port?: number;
  host?: string;
  databaseUrl: string;
  jwtSecret: string;
  corsOrigins?: string[];
  rateLimit?: {
    max: number;
    timeWindow: string;
  };
}

export async function buildServer(config: ServerConfig): Promise<FastifyInstance> {
  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: { colorize: true },
            }
          : undefined,
    },
  });

  // Initialize database
  initDatabase({ url: config.databaseUrl });

  // Security headers
  await server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
      },
    },
  });

  // CORS
  await server.register(cors, {
    origin: config.corsOrigins ?? ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Rate limiting
  await server.register(rateLimit, {
    max: config.rateLimit?.max ?? 100,
    timeWindow: config.rateLimit?.timeWindow ?? '1 minute',
  });

  // JWT authentication
  await server.register(jwt, {
    secret: config.jwtSecret,
    sign: {
      expiresIn: '24h',
    },
  });

  // Swagger documentation
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'Rolodex CRM API',
        description: 'AI-first CRM API',
        version: '0.1.0',
      },
      servers: [
        {
          url: `http://${config.host ?? 'localhost'}:${config.port ?? 3000}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
          },
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await server.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Error handler
  server.setErrorHandler(errorHandler);

  // Routes
  await server.register(healthRoutes, { prefix: '/api/v1' });
  await server.register(contactRoutes, { prefix: '/api/v1' });
  await server.register(companyRoutes, { prefix: '/api/v1' });
  await server.register(dealRoutes, { prefix: '/api/v1' });

  return server;
}

// Start server if run directly
async function start() {
  const config: ServerConfig = {
    port: parseInt(process.env.PORT ?? '3000'),
    host: process.env.HOST ?? '0.0.0.0',
    databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/rolodex',
    jwtSecret: process.env.JWT_SECRET ?? 'development-secret-change-in-production',
    corsOrigins: process.env.CORS_ORIGINS?.split(','),
  };

  const server = await buildServer(config);

  try {
    await server.listen({ port: config.port, host: config.host });
    console.log(`Server running at http://${config.host}:${config.port}`);
    console.log(`API docs at http://${config.host}:${config.port}/docs`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
