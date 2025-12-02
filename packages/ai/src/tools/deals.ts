/**
 * Deal tools for MCP server
 */

import { DealRepository } from '@rolodex/adapters';
import { createDealSchema } from '@rolodex/core';
import { Tool, ToolResult, formatDeal, formatDealList, formatPipeline } from './common';

const dealRepo = new DealRepository();

export const dealTools: Tool[] = [
  {
    name: 'rolodex_list_deals',
    description: 'List deals in the pipeline with optional filtering by status, stage, or company.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['open', 'won', 'lost'],
          description: 'Filter by deal status',
        },
        stage: {
          type: 'string',
          description: 'Filter by pipeline stage',
        },
        companyId: {
          type: 'string',
          description: 'Filter by company ID',
        },
        minAmount: {
          type: 'number',
          description: 'Minimum deal value',
        },
        maxAmount: {
          type: 'number',
          description: 'Maximum deal value',
        },
        search: {
          type: 'string',
          description: 'Search in deal names',
        },
        limit: {
          type: 'number',
          description: 'Maximum results (default: 10)',
          default: 10,
        },
      },
    },
  },
  {
    name: 'rolodex_get_deal',
    description: 'Get detailed information about a specific deal including stage history.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Deal ID (UUID)',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'rolodex_get_pipeline',
    description: 'Get a summary of the sales pipeline showing deal counts and values by stage.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'rolodex_create_deal',
    description: 'Create a new deal in the pipeline.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Deal name/title',
        },
        stage: {
          type: 'string',
          description: 'Initial pipeline stage',
        },
        amount: {
          type: 'object',
          properties: {
            value: { type: 'number' },
            currency: { type: 'string', default: 'USD' },
          },
          description: 'Deal value',
        },
        probability: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Win probability percentage',
        },
        expectedCloseDate: {
          type: 'string',
          description: 'Expected close date (ISO format)',
        },
        companyId: {
          type: 'string',
          description: 'Associated company ID',
        },
        primaryContactId: {
          type: 'string',
          description: 'Primary contact ID',
        },
        description: {
          type: 'string',
          description: 'Deal description',
        },
        source: {
          type: 'string',
          description: 'Lead source',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['name', 'stage'],
    },
  },
  {
    name: 'rolodex_update_deal_stage',
    description: 'Move a deal to a different stage in the pipeline. This tracks stage history.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Deal ID',
        },
        stage: {
          type: 'string',
          description: 'New pipeline stage',
        },
        probability: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Updated win probability',
        },
      },
      required: ['id', 'stage'],
    },
  },
  {
    name: 'rolodex_close_deal',
    description: 'Mark a deal as won or lost. This is a final action.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Deal ID',
        },
        status: {
          type: 'string',
          enum: ['won', 'lost'],
          description: 'Final status',
        },
        lostReason: {
          type: 'string',
          description: 'Reason for losing (required if status is lost)',
        },
      },
      required: ['id', 'status'],
    },
  },
];

export async function registerDealTools(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | undefined> {
  switch (name) {
    case 'rolodex_list_deals': {
      const { status, stage, companyId, minAmount, maxAmount, search, limit = 10 } = args as {
        status?: string;
        stage?: string;
        companyId?: string;
        minAmount?: number;
        maxAmount?: number;
        search?: string;
        limit?: number;
      };

      const result = await dealRepo.listDeals(
        { status, stage, companyId, minAmount, maxAmount, search },
        { limit, page: 1 }
      );

      return {
        content: [
          {
            type: 'text',
            text: formatDealList(result.data, result.total),
          },
        ],
      };
    }

    case 'rolodex_get_deal': {
      const { id } = args as { id: string };
      const deal = await dealRepo.getDeal(id);

      if (!deal) {
        return {
          content: [{ type: 'text', text: `Deal with ID ${id} not found.` }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: formatDeal(deal),
          },
        ],
      };
    }

    case 'rolodex_get_pipeline': {
      const summary = await dealRepo.getPipelineSummary();

      return {
        content: [
          {
            type: 'text',
            text: formatPipeline(summary),
          },
        ],
      };
    }

    case 'rolodex_create_deal': {
      const input = createDealSchema.parse(args);
      const deal = await dealRepo.createDeal(input, 'ai-agent');

      return {
        content: [
          {
            type: 'text',
            text: `Deal created successfully!\n\n${formatDeal(deal)}`,
          },
        ],
      };
    }

    case 'rolodex_update_deal_stage': {
      const { id, stage, probability } = args as {
        id: string;
        stage: string;
        probability?: number;
      };

      const deal = await dealRepo.updateStage(id, stage, probability, 'ai-agent');

      return {
        content: [
          {
            type: 'text',
            text: `Deal stage updated to "${stage}"!\n\n${formatDeal(deal)}`,
          },
        ],
      };
    }

    case 'rolodex_close_deal': {
      const { id, status, lostReason } = args as {
        id: string;
        status: 'won' | 'lost';
        lostReason?: string;
      };

      const deal = await dealRepo.closeDeal(id, status, lostReason, 'ai-agent');
      const emoji = status === 'won' ? '🎉' : '😔';

      return {
        content: [
          {
            type: 'text',
            text: `${emoji} Deal marked as ${status}!\n\n${formatDeal(deal)}`,
          },
        ],
      };
    }

    default:
      return undefined;
  }
}
