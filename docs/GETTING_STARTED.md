# Getting Started with Rolodex Development

This guide will help you set up your development environment and start contributing to Rolodex.

---

## Prerequisites

### Required

- **Node.js** 20.x or later
- **npm** 10.x or later
- **Git** 2.40+
- **Docker** (for running databases locally)

### Optional

- **PostgreSQL** 16+ (if not using Docker)
- **Redis** 7+ (if not using Docker)

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/rolodex.git
cd rolodex
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
# Copy example configuration
cp config/rolodex.example.toml config/rolodex.toml

# Copy environment variables
cp .env.example .env
```

### 4. Start Infrastructure

```bash
# Start PostgreSQL and Redis
docker-compose up -d
```

### 5. Run Migrations

```bash
npm run db:migrate
```

### 6. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

---

## Project Structure

```
rolodex/
├── packages/                 # Monorepo packages
│   ├── core/                # Core types and business logic
│   ├── api/                 # REST/GraphQL API server
│   ├── web/                 # React web application
│   ├── cli/                 # Command-line interface
│   ├── ai/                  # AI integration (MCP server)
│   ├── adapters/            # Database and service adapters
│   └── workflows/           # Workflow engine
├── config/                  # Configuration files
├── schemas/                 # JSON schemas for entities
├── docs/                    # Documentation
├── deploy/                  # Deployment configurations
└── examples/                # Example configurations
```

---

## Development Workflow

### Working on a Package

Each package can be developed independently:

```bash
# Work on core package
cd packages/core
npm run dev

# Work on API
cd packages/api
npm run dev

# Work on web
cd packages/web
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific package
npm test --workspace=@rolodex/core

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Linting and Formatting

```bash
# Run linter
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format
```

### Type Checking

```bash
npm run typecheck
```

---

## Package Development Guide

### @rolodex/core

The foundation package containing shared types and logic.

**Key Files:**
- `src/types/` - Entity type definitions
- `src/validation/` - JSON Schema validators
- `src/events/` - Event definitions

**Example: Adding a New Entity Type**

1. Create the type definition:

```typescript
// packages/core/src/types/newEntity.ts
import type { BaseEntity } from './common';

export interface NewEntity extends BaseEntity {
  name: string;
  // ... other fields
}

export interface CreateNewEntityInput {
  name: string;
}

export interface UpdateNewEntityInput extends Partial<CreateNewEntityInput> {}
```

2. Export from index:

```typescript
// packages/core/src/index.ts
export * from './types/newEntity';
```

3. Create JSON Schema:

```json
// schemas/new-entity.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://rolodex.dev/schemas/new-entity.json",
  "title": "NewEntity",
  "type": "object",
  "required": ["id", "name"],
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "name": { "type": "string" }
  }
}
```

### @rolodex/api

REST and GraphQL API server built with Fastify.

**Key Files:**
- `src/routes/` - REST API routes
- `src/graphql/` - GraphQL schema and resolvers
- `src/middleware/` - Express/Fastify middleware
- `src/services/` - Business logic services

**Example: Adding a New Endpoint**

1. Create the service:

```typescript
// packages/api/src/services/contact.service.ts
import type { Contact, CreateContactInput } from '@rolodex/core';
import { db } from '../db';

export async function createContact(input: CreateContactInput): Promise<Contact> {
  // Validate input
  // Create record
  // Emit event
  // Return contact
}
```

2. Create the route:

```typescript
// packages/api/src/routes/contacts.ts
import { FastifyInstance } from 'fastify';
import { createContact } from '../services/contact.service';

export async function contactRoutes(fastify: FastifyInstance) {
  fastify.post('/contacts', async (request, reply) => {
    const contact = await createContact(request.body);
    return reply.status(201).send(contact);
  });
}
```

### @rolodex/ai

AI integration using Model Context Protocol (MCP).

**Key Files:**
- `src/mcp/server.ts` - MCP server setup
- `src/mcp/tools/` - AI-callable tools
- `src/approval/` - Human-in-the-loop system

**Example: Adding a New AI Tool**

```typescript
// packages/ai/src/mcp/tools/contacts.ts
import { Tool } from '@modelcontextprotocol/sdk';

export const searchContactsTool: Tool = {
  name: 'rolodex_search_contacts',
  description: 'Search for contacts in the CRM by name, email, company, or tags',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query'
      },
      limit: {
        type: 'number',
        description: 'Maximum results to return',
        default: 10
      }
    },
    required: ['query']
  },
  handler: async (input) => {
    // Implement search logic
    // Return results
  }
};
```

---

## Database Migrations

### Creating a Migration

```bash
npm run db:migration:create -- --name add_contacts_table
```

### Running Migrations

```bash
# Run pending migrations
npm run db:migrate

# Rollback last migration
npm run db:migrate:rollback

# Rollback all migrations
npm run db:migrate:rollback:all
```

### Migration Example

```typescript
// migrations/001_add_contacts_table.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('contacts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('phone', 50);
    table.uuid('company_id').references('id').inTable('companies');
    table.uuid('owner_id').references('id').inTable('users');
    table.string('status', 20).defaultTo('active');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('contacts');
}
```

---

## Testing Guide

### Unit Tests

```typescript
// packages/core/src/__tests__/contact.test.ts
import { describe, it, expect } from 'vitest';
import { validateContact } from '../validation/contact';

describe('Contact Validation', () => {
  it('should validate a valid contact', () => {
    const contact = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    };

    const result = validateContact(contact);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const contact = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid'
    };

    const result = validateContact(contact);
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'email' })
    );
  });
});
```

### Integration Tests

```typescript
// packages/api/src/__tests__/contacts.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestServer, createTestDatabase } from '../test-utils';

describe('Contacts API', () => {
  let server: FastifyInstance;
  let db: TestDatabase;

  beforeAll(async () => {
    db = await createTestDatabase();
    server = await createTestServer({ db });
  });

  afterAll(async () => {
    await server.close();
    await db.destroy();
  });

  it('POST /contacts should create a contact', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/contacts',
      payload: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    });
  });
});
```

---

## Debugging

### VS Code Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev", "--workspace=@rolodex/api"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test", "--", "--run"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Environment Variables

```bash
# .env
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/rolodex

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-development-secret-key

# AI (optional)
AI_API_KEY=your-anthropic-api-key

# Debug
DEBUG=rolodex:*
LOG_LEVEL=debug
```

---

## Common Tasks

### Adding a New Feature

1. Create an issue describing the feature
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Implement the feature with tests
4. Update documentation
5. Submit a pull request

### Fixing a Bug

1. Create an issue with reproduction steps
2. Create a fix branch: `git checkout -b fix/issue-description`
3. Write a failing test for the bug
4. Fix the bug
5. Verify the test passes
6. Submit a pull request

### Updating Dependencies

```bash
# Check for outdated dependencies
npm outdated

# Update a specific package
npm update package-name

# Update all packages
npm update
```

---

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [React Documentation](https://react.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [MCP Specification](https://modelcontextprotocol.io/)

---

## Getting Help

- **Questions**: Open a Discussion on GitHub
- **Bugs**: Open an Issue with reproduction steps
- **Chat**: Join our Discord server

Welcome to the Rolodex community!
