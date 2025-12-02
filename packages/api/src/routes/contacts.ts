/**
 * Contact routes
 */

import { FastifyInstance } from 'fastify';
import { ContactRepository } from '@rolodex/adapters';
import {
  createContactSchema,
  updateContactSchema,
  paginationSchema,
  contactFilterSchema,
} from '@rolodex/core';
import { authenticate } from '../middleware/auth';

export async function contactRoutes(server: FastifyInstance) {
  const contactRepo = new ContactRepository();

  // List contacts
  server.get('/contacts', {
    schema: {
      description: 'List contacts with optional filtering and pagination',
      tags: ['Contacts'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
          sortBy: { type: 'string', default: 'createdAt' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          status: { type: 'string' },
          companyId: { type: 'string' },
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

    const filter = contactFilterSchema.parse({
      status: query.status,
      companyId: query.companyId,
      ownerId: query.ownerId,
      search: query.search,
    });

    return contactRepo.listContacts(filter, pagination);
  });

  // Get contact by ID
  server.get('/contacts/:id', {
    schema: {
      description: 'Get a contact by ID',
      tags: ['Contacts'],
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
    const contact = await contactRepo.getContact(id);

    if (!contact) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: `Contact with id '${id}' not found` },
      });
    }

    return contact;
  });

  // Create contact
  server.post('/contacts', {
    schema: {
      description: 'Create a new contact',
      tags: ['Contacts'],
      body: {
        type: 'object',
        required: ['firstName', 'lastName', 'email'],
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          title: { type: 'string' },
          department: { type: 'string' },
          companyId: { type: 'string', format: 'uuid' },
          address: { type: 'object' },
          socialProfiles: { type: 'object' },
          tags: { type: 'array', items: { type: 'string' } },
          customFields: { type: 'object' },
          source: { type: 'string' },
          ownerId: { type: 'string', format: 'uuid' },
          notes: { type: 'string' },
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
    const input = createContactSchema.parse(request.body);
    const contact = await contactRepo.createContact(input, request.user?.id);

    return reply.status(201).send(contact);
  });

  // Update contact
  server.patch('/contacts/:id', {
    schema: {
      description: 'Update a contact',
      tags: ['Contacts'],
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
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          title: { type: 'string' },
          department: { type: 'string' },
          companyId: { type: 'string', format: 'uuid' },
          address: { type: 'object' },
          socialProfiles: { type: 'object' },
          tags: { type: 'array', items: { type: 'string' } },
          customFields: { type: 'object' },
          source: { type: 'string' },
          ownerId: { type: 'string', format: 'uuid' },
          notes: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive', 'archived'] },
        },
      },
    },
    preHandler: [authenticate],
  }, async (request, _reply) => {
    const { id } = request.params as { id: string };
    const input = updateContactSchema.parse(request.body);

    return contactRepo.updateContact(id, input, request.user?.id);
  });

  // Delete contact
  server.delete('/contacts/:id', {
    schema: {
      description: 'Delete a contact',
      tags: ['Contacts'],
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
    await contactRepo.delete(id);

    return reply.status(204).send();
  });
}
