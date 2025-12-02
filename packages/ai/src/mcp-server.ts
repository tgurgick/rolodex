#!/usr/bin/env node
/**
 * Rolodex MCP Server
 *
 * Model Context Protocol server for AI agent integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { initDatabase } from '@rolodex/adapters';
import { contactTools, registerContactTools } from './tools/contacts';
import { companyTools, registerCompanyTools } from './tools/companies';
import { dealTools, registerDealTools } from './tools/deals';
import { activityTools, registerActivityTools } from './tools/activities';
import { approvalTools, registerApprovalTools } from './tools/approvals';
import { withAuditLogging, configureAuditSystem, shutdownAuditSystem } from './audit';
import type { ToolResult } from './tools/common';

// Configure audit system
configureAuditSystem({
  enabled: process.env.ROLODEX_AUDIT_ENABLED !== 'false',
  redactPII: process.env.ROLODEX_AUDIT_REDACT_PII !== 'false',
});

// Initialize database
const databaseUrl = process.env.ROLODEX_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgres://postgres:postgres@localhost:5432/rolodex';

initDatabase({ url: databaseUrl });

// Create MCP server
const server = new Server(
  {
    name: 'rolodex',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Collect all tools
const allTools = [
  ...contactTools,
  ...companyTools,
  ...dealTools,
  ...activityTools,
  ...approvalTools,
];

// Register tool listing handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools,
  };
});

// Helper to execute tools
async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  // Contact tools
  const contactResult = await registerContactTools(name, args);
  if (contactResult !== undefined) return contactResult;

  // Company tools
  const companyResult = await registerCompanyTools(name, args);
  if (companyResult !== undefined) return companyResult;

  // Deal tools
  const dealResult = await registerDealTools(name, args);
  if (dealResult !== undefined) return dealResult;

  // Activity tools
  const activityResult = await registerActivityTools(name, args);
  if (activityResult !== undefined) return activityResult;

  // Approval tools
  const approvalResult = await registerApprovalTools(name, args);
  if (approvalResult !== undefined) return approvalResult;

  // Unknown tool
  return {
    content: [
      {
        type: 'text' as const,
        text: `Unknown tool: ${name}`,
      },
    ],
    isError: true,
  };
}

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  const toolArgs = args as Record<string, unknown>;

  try {
    // Wrap all tool calls with audit logging
    const result = await withAuditLogging(
      name,
      'ai-agent',
      toolArgs,
      async () => executeTool(name, toolArgs)
    );

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: ${message}`,
        },
      ],
      isError: true,
    };
  }
});

// Graceful shutdown
async function shutdown() {
  console.error('Shutting down Rolodex MCP server...');
  await shutdownAuditSystem();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Rolodex MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
