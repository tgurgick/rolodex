/**
 * Deal routes
 */

import { FastifyInstance } from 'fastify';
import { DealRepository } from '@rolodex/adapters';
import {
  createDealSchema,
  updateDealSchema,
  updateDealStageSchema,
  closeDealSchema,
  paginationSchema,
  dealFilterSchema,
} from '@rolodex/core';
import { authenticate } from '../middleware/auth';

export async function dealRoutes(server: FastifyInstance) {
  const dealRepo = new DealRepository();

  // List deals
  server.get('/deals', {
    schema: {
      description: 'List deals with optional filtering and pagination',
      tags: ['Deals'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
          sortBy: { type: 'string', default: 'createdAt' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          status: { type: 'string' },
          stage: { type: 'string' },
          companyId: { type: 'string' },
          ownerId: { type: 'string' },
          minAmount: { type: 'number' },
          maxAmount: { type: 'number' },
          search: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'array' },
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
    preHandler: [authenticate],
  }, async (request, _reply) => {
    const query = request.query as Record<string, unknown>;

    const pagination = paginationSchema.parse({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    const filter = dealFilterSchema.parse({
      status: query.status,
      stage: query.stage,
      companyId: query.companyId,
      ownerId: query.ownerId,
      minAmount: query.minAmount,
      maxAmount: query.maxAmount,
      search: query.search,
    });

    return dealRepo.listDeals(filter, pagination);
  });

  // Get pipeline summary
  server.get('/pipeline', {
    schema: {
      description: 'Get pipeline summary with stage breakdown',
      tags: ['Deals', 'Pipeline'],
      response: {
        200: {
          type: 'object',
          properties: {
            stages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  stage: { type: 'string' },
                  count: { type: 'number' },
                  totalValue: { type: 'number' },
                },
              },
            },
            totalDeals: { type: 'number' },
            totalValue: { type: 'number' },
          },
        },
      },
    },
    preHandler: [authenticate],
  }, async (_request, _reply) => {
    return dealRepo.getPipelineSummary();
  });

  // Get deal by ID
  server.get('/deals/:id', {
    schema: {
      description: 'Get a deal by ID',
      tags: ['Deals'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const deal = await dealRepo.getDeal(id);

    if (!deal) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: `Deal with id '${id}' not found` },
      });
    }

    return deal;
  });

  // Create deal
  server.post('/deals', {
    schema: {
      description: 'Create a new deal',
      tags: ['Deals'],
      body: {
        type: 'object',
        required: ['name', 'stage'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          stage: { type: 'string' },
          amount: {
            type: 'object',
            properties: {
              value: { type: 'number' },
              currency: { type: 'string' },
            },
          },
          probability: { type: 'number', minimum: 0, maximum: 100 },
          expectedCloseDate: { type: 'string', format: 'date-time' },
          companyId: { type: 'string', format: 'uuid' },
          contactIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
          primaryContactId: { type: 'string', format: 'uuid' },
          ownerId: { type: 'string', format: 'uuid' },
          source: { type: 'string' },
          competitors: { type: 'array', items: { type: 'string' } },
          products: { type: 'array' },
          tags: { type: 'array', items: { type: 'string' } },
          customFields: { type: 'object' },
        },
      },
      response: {
        201: {
          type: 'object',
        },
      },
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const input = createDealSchema.parse(request.body);
    const deal = await dealRepo.createDeal(input, request.user?.id);

    return reply.status(201).send(deal);
  });

  // Update deal
  server.patch('/deals/:id', {
    schema: {
      description: 'Update a deal',
      tags: ['Deals'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
      },
    },
    preHandler: [authenticate],
  }, async (request, _reply) => {
    const { id } = request.params as { id: string };
    const input = updateDealSchema.parse(request.body);

    return dealRepo.updateDeal(id, input, request.user?.id);
  });

  // Update deal stage
  server.patch('/deals/:id/stage', {
    schema: {
      description: 'Update deal stage (with history tracking)',
      tags: ['Deals', 'Pipeline'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['stage'],
        properties: {
          stage: { type: 'string' },
          probability: { type: 'number', minimum: 0, maximum: 100 },
        },
      },
    },
    preHandler: [authenticate],
  }, async (request, _reply) => {
    const { id } = request.params as { id: string };
    const { stage, probability } = updateDealStageSchema.parse(request.body);

    return dealRepo.updateStage(id, stage, probability, request.user?.id);
  });

  // Close deal
  server.post('/deals/:id/close', {
    schema: {
      description: 'Close a deal as won or lost',
      tags: ['Deals', 'Pipeline'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['won', 'lost'] },
          lostReason: { type: 'string' },
        },
      },
    },
    preHandler: [authenticate],
  }, async (request, _reply) => {
    const { id } = request.params as { id: string };
    const { status, lostReason } = closeDealSchema.parse(request.body);

    return dealRepo.closeDeal(id, status, lostReason, request.user?.id);
  });

  // Delete deal
  server.delete('/deals/:id', {
    schema: {
      description: 'Delete a deal',
      tags: ['Deals'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        204: {
          type: 'null',
        },
      },
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await dealRepo.delete(id);

    return reply.status(204).send();
  });
}
