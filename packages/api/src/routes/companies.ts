/**
 * Company routes
 */

import { FastifyInstance } from 'fastify';
import { CompanyRepository } from '@rolodex/adapters';
import {
  createCompanySchema,
  updateCompanySchema,
  paginationSchema,
  companyFilterSchema,
} from '@rolodex/core';
import { authenticate } from '../middleware/auth';

export async function companyRoutes(server: FastifyInstance) {
  const companyRepo = new CompanyRepository();

  // List companies
  server.get('/companies', {
    schema: {
      description: 'List companies with optional filtering and pagination',
      tags: ['Companies'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
          sortBy: { type: 'string', default: 'createdAt' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          status: { type: 'string' },
          industry: { type: 'string' },
          size: { type: 'string' },
          ownerId: { type: 'string' },
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

    const filter = companyFilterSchema.parse({
      status: query.status,
      industry: query.industry,
      size: query.size,
      ownerId: query.ownerId,
      search: query.search,
    });

    return companyRepo.listCompanies(filter, pagination);
  });

  // Get company by ID
  server.get('/companies/:id', {
    schema: {
      description: 'Get a company by ID',
      tags: ['Companies'],
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
    const company = await companyRepo.getCompany(id);

    if (!company) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: `Company with id '${id}' not found` },
      });
    }

    return company;
  });

  // Create company
  server.post('/companies', {
    schema: {
      description: 'Create a new company',
      tags: ['Companies'],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          domain: { type: 'string' },
          website: { type: 'string', format: 'uri' },
          industry: { type: 'string' },
          size: { type: 'string' },
          revenue: {
            type: 'object',
            properties: {
              value: { type: 'number' },
              currency: { type: 'string' },
            },
          },
          description: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          address: { type: 'object' },
          socialProfiles: { type: 'object' },
          tags: { type: 'array', items: { type: 'string' } },
          customFields: { type: 'object' },
          parentCompanyId: { type: 'string', format: 'uuid' },
          ownerId: { type: 'string', format: 'uuid' },
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
    const input = createCompanySchema.parse(request.body);
    const company = await companyRepo.createCompany(input, request.user?.id);

    return reply.status(201).send(company);
  });

  // Update company
  server.patch('/companies/:id', {
    schema: {
      description: 'Update a company',
      tags: ['Companies'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          domain: { type: 'string' },
          website: { type: 'string', format: 'uri' },
          industry: { type: 'string' },
          size: { type: 'string' },
          revenue: { type: 'object' },
          description: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          address: { type: 'object' },
          socialProfiles: { type: 'object' },
          tags: { type: 'array', items: { type: 'string' } },
          customFields: { type: 'object' },
          parentCompanyId: { type: 'string', format: 'uuid' },
          ownerId: { type: 'string', format: 'uuid' },
          status: { type: 'string' },
        },
      },
    },
    preHandler: [authenticate],
  }, async (request, _reply) => {
    const { id } = request.params as { id: string };
    const input = updateCompanySchema.parse(request.body);

    return companyRepo.updateCompany(id, input, request.user?.id);
  });

  // Delete company
  server.delete('/companies/:id', {
    schema: {
      description: 'Delete a company',
      tags: ['Companies'],
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
    await companyRepo.delete(id);

    return reply.status(204).send();
  });
}
