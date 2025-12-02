# Rolodex

**An AI-first, open-source CRM for the modern era**

Rolodex is a modular, cloud-agnostic Customer Relationship Management system designed from the ground up for AI agents and human users alike. Think of it as an open-source Salesforce that speaks fluent AI.

## Vision

Traditional CRMs are built for humans clicking buttons. Rolodex is built for a world where AI agents manage relationships, analyze pipelines, and automate workflows—while keeping humans in control of what matters.

## Key Principles

- **AI-Native**: Configuration via TOML/JSON/Markdown that AI agents can read, write, and reason about
- **Cloud-Agnostic**: Deploy on AWS, GCP, Azure, or your own infrastructure
- **Modular**: Use only what you need; swap components freely
- **Safe by Default**: Role-based access, audit trails, and human-in-the-loop for critical actions
- **Open Source**: MIT licensed, community-driven

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
├─────────────┬─────────────┬─────────────┬──────────────────────┤
│   Web UI    │  CLI Tool   │  AI Agents  │   REST/GraphQL API   │
└─────────────┴─────────────┴─────────────┴──────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                        Core Services                             │
├─────────────┬─────────────┬─────────────┬──────────────────────┤
│  Contacts   │    Deals    │  Activities │     Workflows        │
├─────────────┼─────────────┼─────────────┼──────────────────────┤
│  Companies  │  Pipeline   │    Tasks    │    Integrations      │
└─────────────┴─────────────┴─────────────┴──────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     Infrastructure Layer                         │
├─────────────┬─────────────┬─────────────┬──────────────────────┤
│  Database   │   Storage   │    Queue    │      Cache           │
│  Adapter    │   Adapter   │   Adapter   │     Adapter          │
└─────────────┴─────────────┴─────────────┴──────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│              Cloud Provider (AWS / GCP / Azure / Self-hosted)    │
└─────────────────────────────────────────────────────────────────┘
```

## Core Modules

| Module | Description | Status |
|--------|-------------|--------|
| `@rolodex/core` | Core entities, types, and business logic | Planned |
| `@rolodex/api` | REST and GraphQL API server | Planned |
| `@rolodex/web` | React-based web interface | Planned |
| `@rolodex/cli` | Command-line interface for power users | Planned |
| `@rolodex/ai` | AI agent integration and MCP server | Planned |
| `@rolodex/adapters` | Cloud provider adapters (DB, storage, etc.) | Planned |
| `@rolodex/workflows` | Automation and workflow engine | Planned |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/rolodex.git
cd rolodex

# Install dependencies
npm install

# Copy example configuration
cp config/rolodex.example.toml config/rolodex.toml

# Start development server
npm run dev
```

## Configuration

Rolodex uses TOML for configuration, designed to be human-readable and AI-parseable:

```toml
# config/rolodex.toml

[app]
name = "My CRM"
environment = "development"

[database]
adapter = "postgresql"  # postgresql, mysql, sqlite, dynamodb
url = "${DATABASE_URL}"

[storage]
adapter = "s3"  # s3, gcs, azure-blob, local
bucket = "rolodex-files"

[ai]
enabled = true
provider = "anthropic"  # anthropic, openai, local
human_approval_required = ["delete", "bulk_update", "export"]

[modules]
contacts = true
companies = true
deals = true
pipeline = true
activities = true
tasks = true
workflows = true
```

## AI Agent Integration

Rolodex exposes an MCP (Model Context Protocol) server for seamless AI integration:

```json
{
  "mcpServers": {
    "rolodex": {
      "command": "npx",
      "args": ["@rolodex/mcp-server"],
      "env": {
        "ROLODEX_API_URL": "http://localhost:3000",
        "ROLODEX_API_KEY": "${ROLODEX_API_KEY}"
      }
    }
  }
}
```

### Available AI Tools

- `rolodex_search_contacts` - Find contacts by any criteria
- `rolodex_create_contact` - Add new contacts
- `rolodex_update_deal` - Update deal information
- `rolodex_get_pipeline` - View sales pipeline
- `rolodex_log_activity` - Record interactions
- `rolodex_run_workflow` - Trigger automated workflows

## Data Schemas

All data schemas are defined in JSON Schema format for validation and AI comprehension:

```
schemas/
├── contact.schema.json
├── company.schema.json
├── deal.schema.json
├── activity.schema.json
├── task.schema.json
└── workflow.schema.json
```

## Security

- **Authentication**: OAuth 2.0, API keys, or SSO integration
- **Authorization**: Role-based access control (RBAC)
- **Audit Trail**: Every action is logged with actor, timestamp, and changes
- **Human-in-the-Loop**: Configurable approval requirements for sensitive operations
- **Data Encryption**: At rest and in transit

## Cloud Deployment

### AWS
```bash
npm run deploy:aws
```

### Google Cloud
```bash
npm run deploy:gcp
```

### Azure
```bash
npm run deploy:azure
```

### Docker (Self-hosted)
```bash
docker-compose up -d
```

## Project Structure

```
rolodex/
├── packages/
│   ├── core/           # Core business logic
│   ├── api/            # API server
│   ├── web/            # Web frontend
│   ├── cli/            # CLI tool
│   ├── ai/             # AI integration
│   ├── adapters/       # Cloud adapters
│   └── workflows/      # Workflow engine
├── config/             # Configuration files
├── schemas/            # JSON schemas
├── docs/               # Documentation (Markdown)
├── deploy/             # Deployment configurations
│   ├── aws/
│   ├── gcp/
│   ├── azure/
│   └── docker/
└── examples/           # Example configurations
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Roadmap

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for the detailed development roadmap.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Rolodex** - CRM that AI can actually use.
