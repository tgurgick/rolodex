/**
 * Health check routes
 */

import { FastifyInstance } from 'fastify';
import { healthCheck } from '@rolodex/adapters';

export async function healthRoutes(server: FastifyInstance) {
  // Basic health check
  server.get('/health', {
    schema: {
      description: 'Basic health check',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
  }, async (_request, _reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  });

  // Detailed health check with dependencies
  server.get('/health/ready', {
    schema: {
      description: 'Readiness check with dependencies',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            dependencies: {
              type: 'object',
              properties: {
                database: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  }, async (_request, _reply) => {
    const dbHealthy = await healthCheck();

    const status = dbHealthy ? 'ok' : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      dependencies: {
        database: dbHealthy,
      },
    };
  });
}
