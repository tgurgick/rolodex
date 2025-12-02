/**
 * Activity tools for MCP server
 */

import { Tool, ToolResult } from './common';

// Note: Activity repository would be implemented similar to other repositories
// For now, we'll provide tool definitions that will work once implemented

export const activityTools: Tool[] = [
  {
    name: 'rolodex_log_activity',
    description: 'Log an activity (call, email, meeting, note) for a contact or deal.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['call', 'email', 'meeting', 'note', 'task'],
          description: 'Type of activity',
        },
        subject: {
          type: 'string',
          description: 'Activity subject/title',
        },
        description: {
          type: 'string',
          description: 'Detailed notes about the activity',
        },
        outcome: {
          type: 'string',
          description: 'Result/outcome of the activity',
        },
        contactId: {
          type: 'string',
          description: 'Related contact ID',
        },
        companyId: {
          type: 'string',
          description: 'Related company ID',
        },
        dealId: {
          type: 'string',
          description: 'Related deal ID',
        },
        duration: {
          type: 'number',
          description: 'Duration in minutes',
        },
        direction: {
          type: 'string',
          enum: ['inbound', 'outbound'],
          description: 'For calls/emails: inbound or outbound',
        },
      },
      required: ['type', 'subject'],
    },
  },
  {
    name: 'rolodex_create_task',
    description: 'Create a follow-up task for a contact or deal.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Task title',
        },
        description: {
          type: 'string',
          description: 'Task description',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Task priority',
        },
        dueDate: {
          type: 'string',
          description: 'Due date (ISO format)',
        },
        contactId: {
          type: 'string',
          description: 'Related contact ID',
        },
        companyId: {
          type: 'string',
          description: 'Related company ID',
        },
        dealId: {
          type: 'string',
          description: 'Related deal ID',
        },
        assigneeId: {
          type: 'string',
          description: 'User ID to assign the task to',
        },
      },
      required: ['title'],
    },
  },
];

export async function registerActivityTools(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult | undefined> {
  switch (name) {
    case 'rolodex_log_activity': {
      // TODO: Implement with ActivityRepository
      const { type, subject, description, contactId, dealId } = args as {
        type: string;
        subject: string;
        description?: string;
        contactId?: string;
        dealId?: string;
      };

      // Placeholder response
      return {
        content: [
          {
            type: 'text',
            text: `Activity logged: ${type} - "${subject}"\n` +
              (description ? `Notes: ${description}\n` : '') +
              (contactId ? `Contact: ${contactId}\n` : '') +
              (dealId ? `Deal: ${dealId}` : ''),
          },
        ],
      };
    }

    case 'rolodex_create_task': {
      // TODO: Implement with TaskRepository
      const { title, priority = 'medium', dueDate, contactId, dealId } = args as {
        title: string;
        priority?: string;
        dueDate?: string;
        contactId?: string;
        dealId?: string;
      };

      return {
        content: [
          {
            type: 'text',
            text: `Task created: "${title}"\n` +
              `Priority: ${priority}\n` +
              (dueDate ? `Due: ${dueDate}\n` : '') +
              (contactId ? `Contact: ${contactId}\n` : '') +
              (dealId ? `Deal: ${dealId}` : ''),
          },
        ],
      };
    }

    default:
      return undefined;
  }
}
