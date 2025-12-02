# Architecture Overview

This document describes the technical architecture of Rolodex, an AI-first, cloud-agnostic CRM.

---

## Design Principles

### 1. AI-First
- Every feature considers AI agent interaction
- Machine-readable configuration (TOML, JSON, Markdown)
- MCP (Model Context Protocol) for AI integration
- Human-in-the-loop for sensitive operations

### 2. Cloud-Agnostic
- Adapter pattern for all infrastructure
- No cloud-specific code in core logic
- Deploy anywhere: AWS, GCP, Azure, self-hosted

### 3. Modular
- Independent packages with clear boundaries
- Enable/disable features via configuration
- Plugin architecture for extensions

### 4. Secure by Default
- Defense in depth
- Encryption everywhere
- Audit logging
- Principle of least privilege

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              Clients                                        │
├──────────────┬──────────────┬──────────────┬──────────────┬───────────────┤
│   Web App    │   CLI Tool   │  AI Agents   │  Mobile App  │  Integrations │
│   (React)    │   (Node.js)  │   (MCP)      │   (Future)   │   (Webhooks)  │
└──────────────┴──────────────┴──────────────┴──────────────┴───────────────┘
                                     │
                              ┌──────┴──────┐
                              │   Gateway   │
                              │  (nginx/    │
                              │   Caddy)    │
                              └──────┬──────┘
                                     │
┌────────────────────────────────────┴───────────────────────────────────────┐
│                              API Layer                                      │
├────────────────────────────────────┬───────────────────────────────────────┤
│           REST API                 │           GraphQL API                  │
│         (Fastify)                  │          (Mercurius)                   │
└────────────────────────────────────┴───────────────────────────────────────┘
                                     │
┌────────────────────────────────────┴───────────────────────────────────────┐
│                           Service Layer                                     │
├──────────┬──────────┬──────────┬──────────┬──────────┬────────────────────┤
│ Contact  │ Company  │  Deal    │ Activity │  Task    │     Workflow       │
│ Service  │ Service  │ Service  │ Service  │ Service  │     Service        │
└──────────┴──────────┴──────────┴──────────┴──────────┴────────────────────┘
                                     │
┌────────────────────────────────────┴───────────────────────────────────────┐
│                            Core Layer                                       │
├──────────────────┬──────────────────┬──────────────────┬──────────────────┤
│   Entities &     │   Validation     │    Events &      │   Repository     │
│     Types        │   (JSON Schema)  │    Pub/Sub       │    Pattern       │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
                                     │
┌────────────────────────────────────┴───────────────────────────────────────┐
│                          Adapter Layer                                      │
├──────────┬──────────┬──────────┬──────────┬──────────┬────────────────────┤
│ Database │ Storage  │  Queue   │  Cache   │  Auth    │     Email          │
│ Adapter  │ Adapter  │ Adapter  │ Adapter  │ Adapter  │    Adapter         │
└──────────┴──────────┴──────────┴──────────┴──────────┴────────────────────┘
                                     │
┌────────────────────────────────────┴───────────────────────────────────────┐
│                       Infrastructure                                        │
├──────────┬──────────┬──────────┬──────────┬──────────┬────────────────────┤
│PostgreSQL│   S3     │  Redis   │  Redis   │ Cognito  │      SES           │
│ DynamoDB │   GCS    │  SQS     │Memorysto│  Auth0   │    SendGrid        │
│ Firestore│  Azure   │ Pub/Sub  │ re       │  Okta    │    Mailgun         │
└──────────┴──────────┴──────────┴──────────┴──────────┴────────────────────┘
```

---

## Package Architecture

### Package Dependency Graph

```
@rolodex/web ─────┐
@rolodex/cli ─────┼──► @rolodex/api ──► @rolodex/core
@rolodex/ai  ─────┘         │                 │
                            ▼                 │
                   @rolodex/workflows         │
                            │                 │
                            ▼                 ▼
                   @rolodex/adapters ◄────────┘
```

### Package Descriptions

#### @rolodex/core

The foundation package containing:

- **Entities**: Contact, Company, Deal, Activity, Task, Workflow
- **Types**: TypeScript interfaces and types
- **Validation**: JSON Schema validators
- **Events**: Event definitions and emitters
- **Errors**: Custom error classes

```typescript
// Core exports
export * from './entities';
export * from './types';
export * from './validation';
export * from './events';
export * from './errors';
```

#### @rolodex/api

REST and GraphQL API server:

- **Routes**: HTTP endpoints
- **Resolvers**: GraphQL resolvers
- **Middleware**: Auth, validation, rate limiting
- **Controllers**: Request handlers

```typescript
// API structure
src/
├── routes/
│   ├── contacts.ts
│   ├── companies.ts
│   └── deals.ts
├── graphql/
│   ├── schema.graphql
│   └── resolvers/
├── middleware/
│   ├── auth.ts
│   ├── validation.ts
│   └── rateLimit.ts
└── server.ts
```

#### @rolodex/web

React-based web application:

- **Pages**: Route components
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks
- **State**: Zustand/React Query state management

```typescript
// Web structure
src/
├── pages/
│   ├── contacts/
│   ├── companies/
│   └── deals/
├── components/
│   ├── ui/
│   └── domain/
├── hooks/
├── state/
└── App.tsx
```

#### @rolodex/cli

Command-line interface:

- **Commands**: CLI commands
- **Output**: Formatters for terminal output
- **Config**: CLI configuration handling

```typescript
// CLI structure
src/
├── commands/
│   ├── contacts.ts
│   ├── companies.ts
│   └── deals.ts
├── output/
│   ├── table.ts
│   └── json.ts
└── cli.ts
```

#### @rolodex/ai

AI integration and MCP server:

- **MCP Server**: Model Context Protocol implementation
- **Tools**: AI-callable tools
- **Approval**: Human-in-the-loop system
- **Safety**: Rate limiting, anomaly detection

```typescript
// AI structure
src/
├── mcp/
│   ├── server.ts
│   └── tools/
│       ├── contacts.ts
│       ├── companies.ts
│       └── deals.ts
├── approval/
│   ├── queue.ts
│   └── handlers.ts
└── safety/
    ├── rateLimit.ts
    └── anomaly.ts
```

#### @rolodex/adapters

Infrastructure adapters:

- **Database**: PostgreSQL, MySQL, SQLite, DynamoDB, Firestore
- **Storage**: S3, GCS, Azure Blob, Local
- **Queue**: BullMQ, SQS, Pub/Sub
- **Cache**: Redis, Memcached, Memory

```typescript
// Adapter interface example
interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}
```

#### @rolodex/workflows

Workflow and automation engine:

- **Engine**: Workflow execution
- **Triggers**: Event, schedule, webhook triggers
- **Actions**: Built-in action library
- **Conditions**: Condition evaluation

```typescript
// Workflow structure
src/
├── engine/
│   ├── executor.ts
│   └── scheduler.ts
├── triggers/
│   ├── event.ts
│   ├── schedule.ts
│   └── webhook.ts
├── actions/
│   ├── createRecord.ts
│   ├── sendEmail.ts
│   └── httpRequest.ts
└── conditions/
    └── evaluator.ts
```

---

## Data Flow

### Request Lifecycle

```
1. Client Request
       │
       ▼
2. Gateway (TLS termination, routing)
       │
       ▼
3. Rate Limiter
       │
       ▼
4. Authentication Middleware
       │
       ▼
5. Authorization Middleware
       │
       ▼
6. Input Validation (JSON Schema)
       │
       ▼
7. Controller/Resolver
       │
       ▼
8. Service Layer (business logic)
       │
       ▼
9. Repository (data access)
       │
       ▼
10. Database Adapter
       │
       ▼
11. Database
       │
       ▼
12. Response (with audit logging)
```

### Event Flow

```
1. Entity Change (create/update/delete)
       │
       ▼
2. Event Emitted
       │
       ├──► Audit Log
       │
       ├──► Workflow Engine (trigger evaluation)
       │
       ├──► Cache Invalidation
       │
       ├──► Search Index Update
       │
       └──► Webhook Dispatch
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Company   │───┐   │   Contact   │   ┌───│    Deal     │
├─────────────┤   │   ├─────────────┤   │   ├─────────────┤
│ id          │   └──►│ companyId   │   │   │ id          │
│ name        │       │ id          │◄──┼───│ contactIds  │
│ domain      │       │ firstName   │   │   │ companyId   │───┐
│ ...         │       │ lastName    │   │   │ name        │   │
└─────────────┘       │ email       │   │   │ stage       │   │
                      │ ...         │   │   │ amount      │   │
                      └─────────────┘   │   │ ...         │   │
                             │          │   └─────────────┘   │
                             │          │          │          │
                             ▼          │          ▼          │
                      ┌─────────────┐   │   ┌─────────────┐   │
                      │  Activity   │   │   │    Task     │   │
                      ├─────────────┤   │   ├─────────────┤   │
                      │ id          │   │   │ id          │   │
                      │ contactId   │───┘   │ contactId   │───┤
                      │ companyId   │───────│ companyId   │───┤
                      │ dealId      │───────│ dealId      │───┘
                      │ type        │       │ title       │
                      │ ...         │       │ ...         │
                      └─────────────┘       └─────────────┘
```

### Core Tables

```sql
-- Contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  title VARCHAR(200),
  company_id UUID REFERENCES companies(id),
  owner_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,

  -- PII fields encrypted
  phone_encrypted BYTEA,
  address_encrypted BYTEA,

  CONSTRAINT contacts_email_unique UNIQUE (email)
);

-- Audit Log (append-only)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor_type VARCHAR(20) NOT NULL,  -- user, ai_agent, system
  actor_id UUID,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  changes JSONB,
  metadata JSONB,

  -- Integrity protection
  previous_hash VARCHAR(64),
  current_hash VARCHAR(64) NOT NULL
);
```

---

## API Design

### REST API

```
Base URL: /api/v1

# Contacts
GET    /contacts              # List contacts
POST   /contacts              # Create contact
GET    /contacts/:id          # Get contact
PUT    /contacts/:id          # Update contact
DELETE /contacts/:id          # Delete contact

# Companies
GET    /companies             # List companies
POST   /companies             # Create company
GET    /companies/:id         # Get company
PUT    /companies/:id         # Update company
DELETE /companies/:id         # Delete company

# Deals
GET    /deals                 # List deals
POST   /deals                 # Create deal
GET    /deals/:id             # Get deal
PUT    /deals/:id             # Update deal
PATCH  /deals/:id/stage       # Update deal stage
DELETE /deals/:id             # Delete deal

# Pipeline
GET    /pipeline              # Get pipeline overview
GET    /pipeline/stages       # Get stages

# Activities
GET    /activities            # List activities
POST   /activities            # Log activity

# Tasks
GET    /tasks                 # List tasks
POST   /tasks                 # Create task
PATCH  /tasks/:id/complete    # Complete task

# Workflows
GET    /workflows             # List workflows
POST   /workflows             # Create workflow
PUT    /workflows/:id         # Update workflow
POST   /workflows/:id/trigger # Manually trigger

# Search
POST   /search                # Global search
```

### GraphQL API

```graphql
type Query {
  contact(id: ID!): Contact
  contacts(filter: ContactFilter, pagination: Pagination): ContactConnection!
  company(id: ID!): Company
  companies(filter: CompanyFilter, pagination: Pagination): CompanyConnection!
  deal(id: ID!): Deal
  deals(filter: DealFilter, pagination: Pagination): DealConnection!
  pipeline: Pipeline!
  search(query: String!, types: [EntityType!]): SearchResults!
}

type Mutation {
  createContact(input: CreateContactInput!): Contact!
  updateContact(id: ID!, input: UpdateContactInput!): Contact!
  deleteContact(id: ID!): DeleteResult!

  createDeal(input: CreateDealInput!): Deal!
  updateDealStage(id: ID!, stage: String!): Deal!

  logActivity(input: LogActivityInput!): Activity!
  createTask(input: CreateTaskInput!): Task!
  completeTask(id: ID!): Task!
}

type Subscription {
  contactUpdated(id: ID): Contact!
  dealStageChanged: Deal!
  newActivity(contactId: ID): Activity!
}
```

---

## Authentication & Authorization

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌──────┐    ┌──────────┐    ┌─────────┐    ┌───────────────┐  │
│  │Client│───►│ Gateway  │───►│  Auth   │───►│ Identity      │  │
│  │      │    │          │    │Middleware│   │ Provider      │  │
│  └──────┘    └──────────┘    └─────────┘    │(Cognito/Auth0)│  │
│      ▲                            │          └───────────────┘  │
│      │                            │                              │
│      │           ┌────────────────┘                              │
│      │           │                                               │
│      │           ▼                                               │
│      │    ┌─────────────┐                                        │
│      └────│   JWT/      │                                        │
│           │  Session    │                                        │
│           └─────────────┘                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Authorization Model

```typescript
interface AuthContext {
  user: {
    id: string;
    roles: string[];
    permissions: Permission[];
    teamId?: string;
    organizationId: string;
  };
  isAI: boolean;
  aiAgentId?: string;
}

interface Permission {
  resource: string;
  action: string;
  scope: 'own' | 'team' | 'organization' | 'all';
  conditions?: Record<string, unknown>;
}

// Authorization check
function canAccess(
  context: AuthContext,
  resource: string,
  action: string,
  resourceOwnerId?: string
): boolean {
  const permission = context.user.permissions.find(
    p => p.resource === resource && p.action === action
  );

  if (!permission) return false;

  switch (permission.scope) {
    case 'own':
      return resourceOwnerId === context.user.id;
    case 'team':
      return /* check team membership */;
    case 'organization':
      return true; // Same org
    case 'all':
      return true;
  }
}
```

---

## Caching Strategy

### Cache Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    L1: In-Memory Cache                          │
│                    (per-instance, LRU)                          │
│                    TTL: 1 minute                                │
├─────────────────────────────────────────────────────────────────┤
│                    L2: Distributed Cache                        │
│                    (Redis)                                      │
│                    TTL: 5-15 minutes                            │
├─────────────────────────────────────────────────────────────────┤
│                    L3: Database                                 │
│                    (PostgreSQL)                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cache Keys

```
# Entity cache
contact:{id}
company:{id}
deal:{id}

# List cache (invalidated on any change)
contacts:list:{hash(filters)}
deals:pipeline:{userId}

# Computed cache
contact:{id}:activities:count
deal:{id}:probability
```

### Cache Invalidation

```typescript
// Event-based invalidation
events.on('contact.updated', async (contact) => {
  await cache.del(`contact:${contact.id}`);
  await cache.del(`contacts:list:*`); // Pattern delete
});
```

---

## Scalability Considerations

### Horizontal Scaling

```
                    ┌──────────────┐
                    │Load Balancer │
                    └──────┬───────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ API Pod  │    │ API Pod  │    │ API Pod  │
    │    1     │    │    2     │    │    3     │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        ┌──────────┐         ┌──────────┐
        │  Redis   │         │PostgreSQL│
        │ Cluster  │         │ Primary  │
        └──────────┘         │ + Replicas
                             └──────────┘
```

### Performance Targets

| Metric | Target |
|--------|--------|
| API Response (p50) | < 50ms |
| API Response (p95) | < 200ms |
| API Response (p99) | < 500ms |
| Throughput | 1000 req/s per pod |
| Database connections | 100 per pod |

---

## Monitoring & Observability

### Metrics

```typescript
// Key metrics to track
const metrics = {
  // Request metrics
  'http.request.duration': histogram,
  'http.request.count': counter,
  'http.request.error_rate': gauge,

  // Business metrics
  'contacts.created': counter,
  'deals.won': counter,
  'deals.total_value': gauge,

  // AI metrics
  'ai.operations.count': counter,
  'ai.approval.pending': gauge,
  'ai.approval.latency': histogram,
};
```

### Logging

```typescript
// Structured logging
logger.info('Contact created', {
  contactId: contact.id,
  userId: context.user.id,
  duration: endTime - startTime,
  traceId: context.traceId,
});
```

### Tracing

```
Request → Gateway → API → Service → Repository → Database
   │         │        │       │          │           │
   └─────────┴────────┴───────┴──────────┴───────────┘
                    Distributed Trace
```

---

## Deployment Architecture

### Container-Based Deployment

```yaml
# docker-compose.yml (development)
services:
  api:
    build: ./packages/api
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://...
      - REDIS_URL=redis://...
    depends_on:
      - postgres
      - redis

  web:
    build: ./packages/web
    ports:
      - "3001:80"

  postgres:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
```

### Kubernetes Deployment

```yaml
# Simplified k8s deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rolodex-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rolodex-api
  template:
    spec:
      containers:
        - name: api
          image: rolodex/api:latest
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
```

---

## Security Architecture

See [SECURITY.md](../SECURITY.md) for detailed security architecture.

---

## Future Considerations

### Planned Improvements

1. **Event Sourcing** - For complete audit trail and replay
2. **CQRS** - Separate read and write models for scale
3. **Multi-Region** - Active-active deployment
4. **Edge Computing** - Deploy close to users
5. **Real-time Sync** - Offline-first mobile support
