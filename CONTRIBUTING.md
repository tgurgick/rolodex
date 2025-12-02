# Contributing to Rolodex

Thank you for your interest in contributing to Rolodex! This document provides guidelines and instructions for contributing.

---

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Assume good intentions
- Respect differing viewpoints

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Git
- PostgreSQL 14+ (for full testing)
- Redis (optional, for queue testing)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/rolodex.git
cd rolodex

# Install dependencies
npm install

# Copy example configuration
cp config/rolodex.example.toml config/rolodex.toml

# Set up environment variables
cp .env.example .env

# Start development database (Docker)
docker-compose up -d postgres redis

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Project Structure

```
rolodex/
├── packages/
│   ├── core/           # Core business logic and types
│   ├── api/            # REST and GraphQL API
│   ├── web/            # React web application
│   ├── cli/            # Command-line interface
│   ├── ai/             # AI integration and MCP server
│   ├── adapters/       # Cloud provider adapters
│   └── workflows/      # Workflow engine
├── config/             # Configuration files
├── schemas/            # JSON schemas
├── docs/               # Documentation
├── deploy/             # Deployment configurations
└── examples/           # Example configurations
```

---

## Development Workflow

### 1. Find or Create an Issue

- Check existing issues for something to work on
- Comment on an issue to claim it
- For new features, open an issue first to discuss

### 2. Create a Branch

```bash
# For features
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b fix/issue-description

# For documentation
git checkout -b docs/what-you-documented
```

### 3. Make Your Changes

- Follow the code style guidelines
- Write tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 4. Test Your Changes

```bash
# Run all tests
npm test

# Run tests for a specific package
npm test --workspace=@rolodex/core

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

### 5. Submit a Pull Request

- Fill out the PR template completely
- Link related issues
- Request review from maintainers
- Address feedback promptly

---

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Prefer interfaces over types for objects
- Use explicit return types for public functions
- Avoid `any` - use `unknown` if type is truly unknown

```typescript
// Good
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
}

function getContact(id: string): Promise<Contact | null> {
  // ...
}

// Avoid
type Contact = {
  id: any;
  firstName: any;
  lastName: any;
}

function getContact(id) {
  // ...
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `contact-service.ts` |
| Classes | PascalCase | `ContactService` |
| Interfaces | PascalCase | `Contact` |
| Functions | camelCase | `getContact` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Variables | camelCase | `contactList` |

### Code Organization

```typescript
// 1. Imports (external first, then internal)
import { z } from 'zod';
import type { Contact } from '@rolodex/core';
import { db } from '../db';

// 2. Types/Interfaces
interface CreateContactInput {
  firstName: string;
  lastName: string;
  email: string;
}

// 3. Constants
const MAX_CONTACTS_PER_PAGE = 100;

// 4. Main exports
export async function createContact(input: CreateContactInput): Promise<Contact> {
  // Implementation
}

// 5. Helper functions (private)
function validateEmail(email: string): boolean {
  // Implementation
}
```

### Comments

- Write self-documenting code
- Use JSDoc for public APIs
- Explain "why", not "what"
- Keep comments up to date

```typescript
/**
 * Creates a new contact in the CRM.
 *
 * @param input - Contact information
 * @returns The created contact with generated ID
 * @throws {ValidationError} If email is invalid
 * @throws {DuplicateError} If contact with email already exists
 */
export async function createContact(input: CreateContactInput): Promise<Contact> {
  // Normalize email to prevent duplicates with different casing
  const normalizedEmail = input.email.toLowerCase();

  // ...
}
```

---

## Testing Guidelines

### Test Structure

```typescript
describe('ContactService', () => {
  describe('createContact', () => {
    it('should create a contact with valid input', async () => {
      // Arrange
      const input = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };

      // Act
      const result = await createContact(input);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.firstName).toBe('John');
      expect(result.email).toBe('john@example.com');
    });

    it('should throw ValidationError for invalid email', async () => {
      // Arrange
      const input = { firstName: 'John', lastName: 'Doe', email: 'invalid' };

      // Act & Assert
      await expect(createContact(input)).rejects.toThrow(ValidationError);
    });
  });
});
```

### Test Coverage Requirements

| Package | Minimum Coverage |
|---------|-----------------|
| @rolodex/core | 90% |
| @rolodex/api | 85% |
| @rolodex/workflows | 85% |
| @rolodex/adapters | 80% |
| @rolodex/cli | 75% |
| @rolodex/web | 70% |

### What to Test

- **Unit tests**: Individual functions and classes
- **Integration tests**: API endpoints, database operations
- **E2E tests**: Critical user flows (web app)

---

## Security Guidelines

### Security Checklist for PRs

- [ ] No secrets or credentials in code
- [ ] Input validation for all user input
- [ ] Parameterized queries (no SQL injection)
- [ ] Output encoding (no XSS)
- [ ] Authorization checks for all endpoints
- [ ] Audit logging for sensitive operations
- [ ] No unnecessary dependencies added

### Sensitive Operations

PRs touching these areas require security review:

- Authentication/authorization
- Cryptography
- User data handling
- File uploads
- External API calls
- Database queries

---

## Documentation Guidelines

### What to Document

- Public APIs (JSDoc)
- Configuration options
- Architecture decisions (ADRs)
- User-facing features
- Breaking changes

### Documentation Style

- Use clear, simple language
- Include code examples
- Keep docs close to code
- Update docs with code changes

---

## Commit Guidelines

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation only |
| style | Formatting, no code change |
| refactor | Code change that neither fixes a bug nor adds a feature |
| perf | Performance improvement |
| test | Adding or fixing tests |
| chore | Build process or auxiliary tool changes |

### Examples

```
feat(contacts): add bulk import from CSV

- Support CSV and Excel formats
- Validate data before import
- Show import progress

Closes #123
```

```
fix(api): prevent SQL injection in search endpoint

The search query was not properly parameterized, allowing
potential SQL injection attacks.

Security: HIGH
```

---

## Pull Request Process

### PR Template

```markdown
## Description
[What does this PR do?]

## Related Issues
Closes #[issue number]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Security
- [ ] Security checklist reviewed
- [ ] No sensitive data exposed

## Documentation
- [ ] Code documented
- [ ] README updated (if needed)
- [ ] CHANGELOG updated

## Screenshots (if applicable)
[Add screenshots for UI changes]
```

### Review Process

1. Automated checks must pass (tests, lint, security scan)
2. At least one maintainer approval required
3. Security-sensitive PRs require security team review
4. Breaking changes require documentation update

---

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Changelog

Update CHANGELOG.md for every PR:

```markdown
## [Unreleased]

### Added
- Bulk import for contacts (#123)

### Fixed
- SQL injection in search endpoint (#124)

### Changed
- Updated dependencies

### Deprecated
- Old API endpoint (will be removed in v2.0)

### Removed
- Legacy import format support

### Security
- Fixed XSS vulnerability in notes field
```

---

## Getting Help

- **Questions**: Open a Discussion on GitHub
- **Bugs**: Open an Issue with reproduction steps
- **Security**: Email security@rolodex.dev (do not open public issues)
- **Chat**: Join our Discord server

---

## Recognition

Contributors are recognized in:

- CONTRIBUTORS.md file
- Release notes
- Project README

Thank you for contributing to Rolodex!
