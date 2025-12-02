/**
 * Company tools for MCP server
 */

import { CompanyRepository } from '@rolodex/adapters';
import { createCompanySchema, updateCompanySchema } from '@rolodex/core';
import { Tool, ToolResult, formatCompany, formatCompanyList } from './common';

const companyRepo = new CompanyRepository();

export const companyTools: Tool[] = [
  {
    name: 'rolodex_search_companies',
    description: 'Search for companies in the CRM by name, domain, industry, or other criteria.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (searches name and domain)',
        },
        status: {
          type: 'string',
          enum: ['prospect', 'customer', 'partner', 'vendor', 'competitor', 'archived'],
          description: 'Filter by company status',
        },
        industry: {
          type: 'string',
          description: 'Filter by industry',
        },
        size: {
          type: 'string',
          enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'],
          description: 'Filter by company size',
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
    name: 'rolodex_get_company',
    description: 'Get detailed information about a specific company by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Company ID (UUID)',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'rolodex_create_company',
    description: 'Create a new company in the CRM.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Company name',
        },
        domain: {
          type: 'string',
          description: 'Company website domain (e.g., example.com)',
        },
        website: {
          type: 'string',
          description: 'Full website URL',
        },
        industry: {
          type: 'string',
          description: 'Industry sector',
        },
        size: {
          type: 'string',
          enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'],
          description: 'Number of employees',
        },
        description: {
          type: 'string',
          description: 'Company description',
        },
        phone: {
          type: 'string',
          description: 'Main phone number',
        },
        email: {
          type: 'string',
          description: 'General contact email',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for categorization',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'rolodex_update_company',
    description: 'Update an existing company. Only provide fields you want to change.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Company ID to update',
        },
        name: { type: 'string' },
        domain: { type: 'string' },
        website: { type: 'string' },
        industry: { type: 'string' },
        size: { type: 'string' },
        description: { type: 'string' },
        status: {
          type: 'string',
          enum: ['prospect', 'customer', 'partner', 'vendor', 'competitor', 'archived'],
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

export async function registerCompanyTools(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | undefined> {
  switch (name) {
    case 'rolodex_search_companies': {
      const { query, status, industry, size, limit = 10 } = args as {
        query?: string;
        status?: string;
        industry?: string;
        size?: string;
        limit?: number;
      };

      const result = await companyRepo.listCompanies(
        { search: query, status, industry, size },
        { limit, page: 1 }
      );

      return {
        content: [
          {
            type: 'text',
            text: formatCompanyList(result.data, result.total),
          },
        ],
      };
    }

    case 'rolodex_get_company': {
      const { id } = args as { id: string };
      const company = await companyRepo.getCompany(id);

      if (!company) {
        return {
          content: [{ type: 'text', text: `Company with ID ${id} not found.` }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: formatCompany(company),
          },
        ],
      };
    }

    case 'rolodex_create_company': {
      const input = createCompanySchema.parse(args);
      const company = await companyRepo.createCompany(input, 'ai-agent');

      return {
        content: [
          {
            type: 'text',
            text: `Company created successfully!\n\n${formatCompany(company)}`,
          },
        ],
      };
    }

    case 'rolodex_update_company': {
      const { id, ...updates } = args as { id: string } & Record<string, unknown>;
      const input = updateCompanySchema.parse(updates);
      const company = await companyRepo.updateCompany(id, input, 'ai-agent');

      return {
        content: [
          {
            type: 'text',
            text: `Company updated successfully!\n\n${formatCompany(company)}`,
          },
        ],
      };
    }

    default:
      return undefined;
  }
}
