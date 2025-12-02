# Rolodex Project Plan

## Overview

This document outlines the development roadmap for Rolodex, an AI-first, cloud-agnostic CRM platform.

---

## Phase 1: Foundation

### 1.1 Project Setup
- [ ] Initialize monorepo with npm workspaces or Turborepo
- [ ] Set up TypeScript configuration
- [ ] Configure ESLint, Prettier, and Husky
- [ ] Set up Jest/Vitest for testing
- [ ] Create CI/CD pipeline (GitHub Actions)
- [ ] Set up documentation site (Docusaurus or similar)

### 1.2 Core Package (`@rolodex/core`)
- [ ] Define base entity types and interfaces
- [ ] Implement Contact entity
- [ ] Implement Company entity
- [ ] Implement Deal entity
- [ ] Implement Activity entity
- [ ] Implement Task entity
- [ ] Create validation layer using JSON Schema
- [ ] Implement event system for entity changes
- [ ] Write comprehensive unit tests

### 1.3 Database Adapter Layer
- [ ] Define adapter interface
- [ ] Implement PostgreSQL adapter
- [ ] Implement SQLite adapter (for development/testing)
- [ ] Add migration system
- [ ] Implement connection pooling
- [ ] Add query builder abstraction

---

## Phase 2: API Layer

### 2.1 REST API (`@rolodex/api`)
- [ ] Set up Express/Fastify server
- [ ] Implement CRUD endpoints for all entities
- [ ] Add filtering, sorting, and pagination
- [ ] Implement search functionality
- [ ] Add request validation middleware
- [ ] Implement rate limiting
- [ ] Add OpenAPI/Swagger documentation

### 2.2 GraphQL API
- [ ] Set up GraphQL server (Apollo/Mercurius)
- [ ] Define schema for all entities
- [ ] Implement resolvers
- [ ] Add subscriptions for real-time updates
- [ ] Implement DataLoader for N+1 prevention

### 2.3 Authentication & Authorization
- [ ] Implement API key authentication
- [ ] Add OAuth 2.0 support
- [ ] Implement JWT tokens
- [ ] Create RBAC system
- [ ] Define permission schemas
- [ ] Add audit logging

---

## Phase 3: AI Integration

### 3.1 MCP Server (`@rolodex/ai`)
- [ ] Set up MCP server infrastructure
- [ ] Implement `rolodex_search_contacts` tool
- [ ] Implement `rolodex_create_contact` tool
- [ ] Implement `rolodex_update_contact` tool
- [ ] Implement `rolodex_delete_contact` tool (with approval)
- [ ] Implement `rolodex_get_company` tool
- [ ] Implement `rolodex_list_deals` tool
- [ ] Implement `rolodex_update_deal_stage` tool
- [ ] Implement `rolodex_log_activity` tool
- [ ] Implement `rolodex_create_task` tool
- [ ] Implement `rolodex_get_pipeline_summary` tool
- [ ] Add human-in-the-loop approval system
- [ ] Write tool documentation in AI-readable format

### 3.2 AI-Friendly Data Formats
- [ ] Create Markdown export for contacts/companies
- [ ] Implement TOML configuration parsing
- [ ] Add JSON-LD support for semantic data
- [ ] Create natural language query parser
- [ ] Implement context-aware response formatting

### 3.3 AI Safety Features
- [ ] Implement action confirmation for destructive operations
- [ ] Add rollback capability for AI actions
- [ ] Create action audit trail with AI attribution
- [ ] Implement rate limiting for AI operations
- [ ] Add anomaly detection for unusual AI behavior

---

## Phase 4: User Interfaces

### 4.1 Web Application (`@rolodex/web`)
- [ ] Set up React + Vite project
- [ ] Implement design system / component library
- [ ] Create authentication flows
- [ ] Build contact management views
- [ ] Build company management views
- [ ] Build deal pipeline (Kanban board)
- [ ] Build activity timeline
- [ ] Build task management
- [ ] Implement search and filtering
- [ ] Add dashboard with analytics
- [ ] Implement responsive design

### 4.2 CLI Tool (`@rolodex/cli`)
- [ ] Set up CLI framework (Commander.js/Oclif)
- [ ] Implement authentication commands
- [ ] Add contact CRUD commands
- [ ] Add company CRUD commands
- [ ] Add deal management commands
- [ ] Implement bulk import/export
- [ ] Add pipeline visualization (ASCII)
- [ ] Create interactive mode

---

## Phase 5: Workflow Engine

### 5.1 Workflow Definition (`@rolodex/workflows`)
- [ ] Design workflow schema (TOML/JSON)
- [ ] Implement trigger system (event-based, scheduled, manual)
- [ ] Create action library
- [ ] Implement condition evaluation
- [ ] Add branching logic support
- [ ] Create workflow validator

### 5.2 Workflow Execution
- [ ] Implement workflow executor
- [ ] Add async job queue integration
- [ ] Implement retry logic
- [ ] Add workflow state persistence
- [ ] Create execution history/logs
- [ ] Implement workflow debugging tools

### 5.3 Pre-built Workflows
- [ ] Lead scoring workflow
- [ ] Follow-up reminder workflow
- [ ] Deal stage transition notifications
- [ ] Welcome email sequence
- [ ] Data enrichment workflow

---

## Phase 6: Cloud Adapters

### 6.1 AWS Adapter (`@rolodex/adapters`)
- [ ] DynamoDB adapter
- [ ] S3 storage adapter
- [ ] SQS queue adapter
- [ ] ElastiCache adapter
- [ ] Cognito auth adapter
- [ ] CloudFormation/CDK templates
- [ ] Lambda deployment support

### 6.2 GCP Adapter
- [ ] Cloud Firestore adapter
- [ ] Cloud Storage adapter
- [ ] Cloud Pub/Sub adapter
- [ ] Memorystore adapter
- [ ] Firebase Auth adapter
- [ ] Terraform templates
- [ ] Cloud Run deployment

### 6.3 Azure Adapter
- [ ] Cosmos DB adapter
- [ ] Blob Storage adapter
- [ ] Service Bus adapter
- [ ] Azure Cache adapter
- [ ] Azure AD adapter
- [ ] ARM templates
- [ ] Container Apps deployment

### 6.4 Self-Hosted
- [ ] Docker Compose configuration
- [ ] Kubernetes Helm charts
- [ ] Nginx/Caddy reverse proxy configs
- [ ] Backup and restore scripts

---

## Phase 7: Integrations

### 7.1 Email Integration
- [ ] Gmail integration
- [ ] Outlook integration
- [ ] SMTP/IMAP generic adapter
- [ ] Email tracking (opens, clicks)
- [ ] Email template system

### 7.2 Calendar Integration
- [ ] Google Calendar sync
- [ ] Outlook Calendar sync
- [ ] CalDAV adapter
- [ ] Meeting scheduling links

### 7.3 Communication Platforms
- [ ] Slack integration
- [ ] Microsoft Teams integration
- [ ] Discord integration
- [ ] Webhook system for custom integrations

### 7.4 Data Enrichment
- [ ] Clearbit integration
- [ ] LinkedIn integration (where API allows)
- [ ] Company data providers
- [ ] Custom enrichment API support

---

## Phase 8: Analytics & Reporting

### 8.1 Built-in Analytics
- [ ] Pipeline analytics
- [ ] Conversion rate tracking
- [ ] Activity metrics
- [ ] Team performance dashboards
- [ ] Revenue forecasting

### 8.2 Export & Reporting
- [ ] CSV/Excel export
- [ ] PDF report generation
- [ ] Scheduled reports
- [ ] Custom report builder
- [ ] API for BI tool integration

---

## Phase 9: Enterprise Features

### 9.1 Multi-tenancy
- [ ] Tenant isolation
- [ ] Custom domains
- [ ] Tenant-specific configuration
- [ ] Usage metering

### 9.2 Advanced Security
- [ ] SSO (SAML, OIDC)
- [ ] MFA support
- [ ] IP whitelisting
- [ ] Session management
- [ ] Security audit logs

### 9.3 Compliance
- [ ] GDPR compliance tools
- [ ] Data retention policies
- [ ] Right to deletion
- [ ] Data export (portability)
- [ ] Consent management

---

## Technical Decisions

### Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Language | TypeScript | Type safety, AI-friendly, wide adoption |
| Runtime | Node.js | Ecosystem, async performance |
| API | Fastify | Performance, plugin system |
| Database | PostgreSQL (primary) | Reliability, features, JSON support |
| ORM | Drizzle/Prisma | Type-safe queries |
| Queue | BullMQ | Redis-based, reliable |
| Cache | Redis | Performance, versatility |
| Frontend | React + Vite | Component ecosystem, DX |
| Styling | Tailwind CSS | Utility-first, customizable |
| Testing | Vitest + Playwright | Speed, compatibility |
| Monorepo | Turborepo | Build performance, caching |

### Configuration Format Comparison

| Format | Use Case |
|--------|----------|
| TOML | Primary configuration files (human + AI readable) |
| JSON | API payloads, schemas, programmatic configs |
| JSON Schema | Validation, documentation, AI understanding |
| Markdown | Documentation, notes, AI context |
| YAML | Kubernetes/deployment configs (industry standard) |

### API Design Principles

1. **RESTful by default** - Standard HTTP methods and status codes
2. **GraphQL for flexibility** - Complex queries, real-time subscriptions
3. **JSON:API compliance** - Consistent response format
4. **HATEOAS links** - Discoverability for AI agents
5. **OpenAPI documentation** - Auto-generated, always current

---

## Success Metrics

### Phase 1-2 (Foundation)
- All CRUD operations functional
- 90%+ test coverage on core
- API response time < 100ms (p95)
- Zero critical security vulnerabilities

### Phase 3 (AI Integration)
- AI agents can perform all basic CRM operations
- Human approval flow works reliably
- Audit trail captures all AI actions
- Tool documentation enables zero-shot usage

### Phase 4-5 (UI & Workflows)
- Web UI usable for daily CRM tasks
- CLI enables power-user workflows
- Workflow engine handles 1000+ concurrent workflows
- User satisfaction score > 4/5

### Phase 6-7 (Cloud & Integrations)
- Deploy to any major cloud in < 1 hour
- Email/calendar sync works reliably
- Integration setup takes < 30 minutes

### Phase 8-9 (Enterprise)
- Multi-tenant isolation verified by security audit
- GDPR compliance certified
- 99.9% uptime SLA achievable

---

## Getting Started (For Contributors)

1. **Read the README** - Understand the project vision
2. **Check open issues** - Find something to work on
3. **Join discussions** - Share ideas in GitHub Discussions
4. **Start small** - Begin with documentation or tests
5. **Follow conventions** - Use established patterns

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2024-12-02 | Initial project plan |

---

*This is a living document. Update as the project evolves.*
