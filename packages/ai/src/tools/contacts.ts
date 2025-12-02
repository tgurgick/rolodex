/**
 * Contact tools for MCP server
 */

import { ContactRepository } from '@rolodex/adapters';
import { createContactSchema, updateContactSchema } from '@rolodex/core';
import { Tool, ToolResult, formatContact, formatContactList } from './common';

const contactRepo = new ContactRepository();

export const contactTools: Tool[] = [
  {
    name: 'rolodex_search_contacts',
    description: 'Search for contacts in the CRM by name, email, company, or other criteria. Returns matching contacts with their details.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (searches name and email)',
        },
        status: {
          type: 'string',
          enum: ['active', 'inactive', 'archived'],
          description: 'Filter by contact status',
        },
        companyId: {
          type: 'string',
          description: 'Filter by company ID',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 10)',
          default: 10,
        },
      },
    },
  },
  {
    name: 'rolodex_get_contact',
    description: 'Get detailed information about a specific contact by their ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Contact ID (UUID)',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'rolodex_create_contact',
    description: 'Create a new contact in the CRM. Requires at minimum: firstName, lastName, and email.',
    inputSchema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: 'Contact first name',
        },
        lastName: {
          type: 'string',
          description: 'Contact last name',
        },
        email: {
          type: 'string',
          description: 'Contact email address',
        },
        phone: {
          type: 'string',
          description: 'Contact phone number',
        },
        title: {
          type: 'string',
          description: 'Job title',
        },
        companyId: {
          type: 'string',
          description: 'Associated company ID',
        },
        notes: {
          type: 'string',
          description: 'Notes about the contact',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for categorization',
        },
      },
      required: ['firstName', 'lastName', 'email'],
    },
  },
  {
    name: 'rolodex_update_contact',
    description: 'Update an existing contact. Only provide the fields you want to change.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Contact ID to update',
        },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        title: { type: 'string' },
        notes: { type: 'string' },
        status: {
          type: 'string',
          enum: ['active', 'inactive', 'archived'],
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['id'],
    },
  },
];

export async function registerContactTools(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | undefined> {
  switch (name) {
    case 'rolodex_search_contacts': {
      const { query, status, companyId, limit = 10 } = args as {
        query?: string;
        status?: string;
        companyId?: string;
        limit?: number;
      };

      const result = await contactRepo.listContacts(
        { search: query, status, companyId },
        { limit, page: 1 }
      );

      return {
        content: [
          {
            type: 'text',
            text: formatContactList(result.data, result.total),
          },
        ],
      };
    }

    case 'rolodex_get_contact': {
      const { id } = args as { id: string };
      const contact = await contactRepo.getContact(id);

      if (!contact) {
        return {
          content: [{ type: 'text', text: `Contact with ID ${id} not found.` }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: formatContact(contact),
          },
        ],
      };
    }

    case 'rolodex_create_contact': {
      const input = createContactSchema.parse(args);
      const contact = await contactRepo.createContact(input, 'ai-agent');

      return {
        content: [
          {
            type: 'text',
            text: `Contact created successfully!\n\n${formatContact(contact)}`,
          },
        ],
      };
    }

    case 'rolodex_update_contact': {
      const { id, ...updates } = args as { id: string } & Record<string, unknown>;
      const input = updateContactSchema.parse(updates);
      const contact = await contactRepo.updateContact(id, input, 'ai-agent');

      return {
        content: [
          {
            type: 'text',
            text: `Contact updated successfully!\n\n${formatContact(contact)}`,
          },
        ],
      };
    }

    default:
      return undefined;
  }
}
