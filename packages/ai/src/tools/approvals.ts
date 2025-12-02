/**
 * Approval tools for MCP server
 *
 * These tools allow AI agents to request and check approval for sensitive operations.
 */

import { Tool, ToolResult } from './common';
import {
  createApprovalRequest,
  getApprovalRequest,
  listPendingApprovals,
  checkApproval,
  formatApprovalRequest,
  ApprovalAction,
} from '../approval';

export const approvalTools: Tool[] = [
  {
    name: 'rolodex_request_approval',
    description:
      'Request human approval for a sensitive operation. Required for delete, bulk, export, and merge operations.',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'delete_contact',
            'delete_company',
            'delete_deal',
            'bulk_delete',
            'bulk_update',
            'export_data',
            'import_data',
            'merge_records',
            'close_deal',
            'update_consent',
          ],
          description: 'The action requiring approval',
        },
        resourceType: {
          type: 'string',
          enum: ['contact', 'company', 'deal', 'activity'],
          description: 'Type of resource being acted upon',
        },
        description: {
          type: 'string',
          description: 'Human-readable description of what will be done',
        },
        resourceId: {
          type: 'string',
          description: 'ID of the resource (for single-resource operations)',
        },
        resourceIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'IDs of resources (for bulk operations)',
        },
      },
      required: ['action', 'resourceType', 'description'],
    },
  },
  {
    name: 'rolodex_check_approval',
    description: 'Check the status of an approval request before executing a sensitive operation.',
    inputSchema: {
      type: 'object',
      properties: {
        approvalId: {
          type: 'string',
          description: 'The approval request ID to check',
        },
        action: {
          type: 'string',
          description: 'The action to verify approval for',
        },
      },
      required: ['approvalId', 'action'],
    },
  },
  {
    name: 'rolodex_list_pending_approvals',
    description: 'List all pending approval requests that need human review.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'rolodex_get_approval',
    description: 'Get details of a specific approval request.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Approval request ID',
        },
      },
      required: ['id'],
    },
  },
];

export async function registerApprovalTools(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | undefined> {
  switch (name) {
    case 'rolodex_request_approval': {
      const { action, resourceType, description, resourceId, resourceIds } = args as {
        action: ApprovalAction;
        resourceType: 'contact' | 'company' | 'deal' | 'activity';
        description: string;
        resourceId?: string;
        resourceIds?: string[];
      };

      const request = await createApprovalRequest(
        action,
        resourceType,
        description,
        'ai-agent',
        { resourceId, resourceIds }
      );

      return {
        content: [
          {
            type: 'text',
            text:
              `Approval request created. A human must approve this before the operation can proceed.\n\n` +
              formatApprovalRequest(request) +
              `\n\n**Next step:** Wait for human approval, then use \`rolodex_check_approval\` with ID \`${request.id}\` before executing the operation.`,
          },
        ],
      };
    }

    case 'rolodex_check_approval': {
      const { approvalId, action } = args as {
        approvalId: string;
        action: ApprovalAction;
      };

      const result = await checkApproval(action, approvalId);

      if (result.allowed) {
        return {
          content: [
            {
              type: 'text',
              text: `Approval confirmed. You may proceed with the "${action}" operation.\n\n` +
                (result.request ? formatApprovalRequest(result.request) : ''),
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `Operation not allowed: ${result.reason}\n\n` +
                (result.request ? formatApprovalRequest(result.request) : ''),
            },
          ],
          isError: true,
        };
      }
    }

    case 'rolodex_list_pending_approvals': {
      const pending = listPendingApprovals();

      if (pending.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No pending approval requests.',
            },
          ],
        };
      }

      const lines: string[] = [
        `# Pending Approval Requests (${pending.length})`,
        '',
      ];

      for (const request of pending) {
        lines.push(
          `- **${request.id}**`,
          `  Action: ${request.action} on ${request.resourceType}`,
          `  Description: ${request.description}`,
          `  Requested: ${request.requestedAt.toISOString()}`,
          `  Expires: ${request.expiresAt.toISOString()}`,
          ''
        );
      }

      return {
        content: [
          {
            type: 'text',
            text: lines.join('\n'),
          },
        ],
      };
    }

    case 'rolodex_get_approval': {
      const { id } = args as { id: string };
      const request = getApprovalRequest(id);

      if (!request) {
        return {
          content: [
            {
              type: 'text',
              text: `Approval request ${id} not found.`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: formatApprovalRequest(request),
          },
        ],
      };
    }

    default:
      return undefined;
  }
}
