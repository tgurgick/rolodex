# AI Integration Guide

This document explains how AI agents interact with Rolodex CRM.

## Overview

Rolodex is designed from the ground up to work with AI agents. Every feature considers:

1. **Machine-readable formats** - TOML, JSON, Markdown
2. **Semantic clarity** - Clear field names and documentation
3. **Safety guardrails** - Human approval for sensitive operations
4. **Audit trails** - Every AI action is logged

## MCP Server

Rolodex exposes a Model Context Protocol (MCP) server that AI assistants can connect to.

### Configuration

Add to your Claude Desktop or AI assistant configuration:

```json
{
  "mcpServers": {
    "rolodex": {
      "command": "npx",
      "args": ["@rolodex/mcp-server"],
      "env": {
        "ROLODEX_API_URL": "http://localhost:3000",
        "ROLODEX_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Available Tools

#### Contact Management

| Tool | Description | Requires Approval |
|------|-------------|-------------------|
| `rolodex_search_contacts` | Search contacts by any field | No |
| `rolodex_get_contact` | Get a specific contact by ID | No |
| `rolodex_create_contact` | Create a new contact | No |
| `rolodex_update_contact` | Update contact fields | No |
| `rolodex_delete_contact` | Delete a contact | **Yes** |

#### Company Management

| Tool | Description | Requires Approval |
|------|-------------|-------------------|
| `rolodex_search_companies` | Search companies | No |
| `rolodex_get_company` | Get company details | No |
| `rolodex_create_company` | Create a new company | No |
| `rolodex_update_company` | Update company fields | No |
| `rolodex_delete_company` | Delete a company | **Yes** |

#### Deal Management

| Tool | Description | Requires Approval |
|------|-------------|-------------------|
| `rolodex_list_deals` | List deals with filters | No |
| `rolodex_get_deal` | Get deal details | No |
| `rolodex_create_deal` | Create a new deal | No |
| `rolodex_update_deal_stage` | Move deal to new stage | No |
| `rolodex_close_deal` | Mark deal as won/lost | No |

#### Activity & Tasks

| Tool | Description | Requires Approval |
|------|-------------|-------------------|
| `rolodex_log_activity` | Log a call, email, meeting, etc. | No |
| `rolodex_create_task` | Create a new task | No |
| `rolodex_complete_task` | Mark task as complete | No |

#### Analytics

| Tool | Description | Requires Approval |
|------|-------------|-------------------|
| `rolodex_get_pipeline_summary` | Get pipeline overview | No |
| `rolodex_get_activity_summary` | Get activity metrics | No |

#### Bulk Operations

| Tool | Description | Requires Approval |
|------|-------------|-------------------|
| `rolodex_bulk_update` | Update multiple records | **Yes** |
| `rolodex_bulk_delete` | Delete multiple records | **Yes** |
| `rolodex_export_data` | Export data to CSV/JSON | **Yes** |

## Human-in-the-Loop

Certain operations require human approval before execution:

### How It Works

1. AI requests a sensitive operation (e.g., delete contact)
2. Rolodex returns a pending approval request
3. Human receives notification (email, Slack, web UI)
4. Human approves or rejects
5. AI receives the result

### Configuration

```toml
[ai]
human_approval_required = [
  "delete_contact",
  "delete_company",
  "bulk_update",
  "bulk_delete",
  "export_data",
  "workflow_create",
]

# Approval timeout (auto-reject after this period)
approval_timeout = "24h"

# Notification channels
approval_notifications = ["email", "slack"]
```

### Approval Flow Example

```
AI: I'd like to delete the contact "John Smith" as requested.

[System: Approval required for delete_contact]