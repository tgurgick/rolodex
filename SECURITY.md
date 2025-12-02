# Security Policy

## Reporting Security Vulnerabilities

**Do not report security vulnerabilities through public GitHub issues.**

Please report security vulnerabilities by emailing: security@rolodex.dev

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work with you to understand and address the issue.

---

## Security Architecture

### Defense in Depth

Rolodex implements multiple layers of security:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Layer 1: Edge Security                        │
│         WAF, DDoS Protection, TLS Termination, Rate Limiting    │
├─────────────────────────────────────────────────────────────────┤
│                    Layer 2: Authentication                       │
│            API Keys, JWT, OAuth 2.0, SAML, MFA                  │
├─────────────────────────────────────────────────────────────────┤
│                    Layer 3: Authorization                        │
│              RBAC, Resource-level Permissions, ABAC             │
├─────────────────────────────────────────────────────────────────┤
│                    Layer 4: Input Validation                     │
│         Schema Validation, Sanitization, Content-Type Check     │
├─────────────────────────────────────────────────────────────────┤
│                    Layer 5: Data Protection                      │
│      Encryption at Rest, Field-level Encryption, Key Mgmt       │
├─────────────────────────────────────────────────────────────────┤
│                    Layer 6: Audit & Monitoring                   │
│         Immutable Audit Logs, Anomaly Detection, Alerting       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication

### Supported Methods

| Method | Use Case | Security Level |
|--------|----------|----------------|
| API Key | Service-to-service, CLI | Medium |
| JWT | Web/mobile apps | High |
| OAuth 2.0 | Third-party integrations | High |
| SAML | Enterprise SSO | High |

### API Key Security

```toml
[auth.api_keys]
# Keys must be at least 32 characters
min_length = 32

# Keys expire after 90 days by default
default_expiry_days = 90

# Maximum keys per user
max_keys_per_user = 5

# Key rotation reminder (days before expiry)
rotation_reminder_days = 14

# Require key rotation for production
require_rotation = true
```

**API Key Best Practices:**
- Never commit API keys to version control
- Use environment variables or secret managers
- Rotate keys every 90 days minimum
- Use separate keys for different environments
- Revoke keys immediately when compromised

### JWT Configuration

```toml
[auth.jwt]
# Algorithm (RS256 recommended for production)
algorithm = "RS256"

# Token expiry
access_token_expiry = "15m"
refresh_token_expiry = "7d"

# Issuer and audience validation
issuer = "https://auth.rolodex.dev"
audience = "https://api.rolodex.dev"

# Token binding (prevents token theft)
bind_to_ip = false  # Enable for high-security environments
bind_to_fingerprint = true
```

### Multi-Factor Authentication (MFA)

```toml
[auth.mfa]
enabled = true

# Supported methods
methods = ["totp", "webauthn", "sms"]

# Require MFA for these roles
required_for_roles = ["admin", "owner"]

# Require MFA for sensitive operations
required_for_operations = [
  "delete_account",
  "export_all_data",
  "change_email",
  "api_key_create",
]
```

### Session Security

```toml
[auth.session]
# Session timeout
idle_timeout = "30m"
absolute_timeout = "24h"

# Regenerate session ID after authentication
regenerate_on_auth = true

# Concurrent session limit
max_concurrent_sessions = 3

# Session binding
bind_to_user_agent = true

# Secure cookie settings (enforced in production)
cookie_secure = true
cookie_http_only = true
cookie_same_site = "strict"
```

### Brute Force Protection

```toml
[auth.brute_force]
# Lock account after failed attempts
max_failed_attempts = 5
lockout_duration = "15m"

# Progressive delays
enable_progressive_delay = true
initial_delay_ms = 100
max_delay_ms = 5000

# CAPTCHA after failed attempts
captcha_after_attempts = 3

# IP-based rate limiting
ip_rate_limit = 10  # attempts per minute per IP

# Notify user of failed attempts
notify_on_failed_attempt = true
notify_on_lockout = true
```

---

## Authorization

### Role-Based Access Control (RBAC)

**Default Roles:**

| Role | Description | Permissions |
|------|-------------|-------------|
| `viewer` | Read-only access | Read contacts, companies, deals |
| `member` | Standard user | CRUD on own records, read team records |
| `manager` | Team lead | CRUD on team records, reports |
| `admin` | Administrator | Full access except billing |
| `owner` | Account owner | Full access including billing |

### Permission Model

```typescript
interface Permission {
  resource: 'contact' | 'company' | 'deal' | 'activity' | 'task' | 'workflow';
  action: 'create' | 'read' | 'update' | 'delete' | 'export';
  scope: 'own' | 'team' | 'organization' | 'all';
  conditions?: Record<string, unknown>;
}
```

### Resource-Level Permissions

```toml
[authorization.resources]
# Contacts
[authorization.resources.contact]
create = ["member", "manager", "admin", "owner"]
read = ["viewer", "member", "manager", "admin", "owner"]
update = ["member:own", "manager:team", "admin", "owner"]
delete = ["manager:team", "admin", "owner"]
export = ["manager", "admin", "owner"]

# Deals (more restrictive)
[authorization.resources.deal]
read_amount = ["manager", "admin", "owner"]  # Hide amounts from viewers/members
```

---

## Input Validation & Sanitization

### Schema Validation

All input is validated against JSON Schema before processing:

```typescript
// Every API endpoint validates input
const validated = await validateSchema(input, contactSchema);
if (!validated.success) {
  throw new ValidationError(validated.errors);
}
```

### Sanitization Rules

| Field Type | Sanitization |
|------------|--------------|
| String | Trim, normalize unicode, limit length |
| Email | Lowercase, validate format |
| Phone | Normalize format, remove invalid chars |
| URL | Validate protocol, sanitize path |
| HTML | Strip all tags (or allowlist if needed) |
| SQL | Parameterized queries only |

### Injection Prevention

```typescript
// NEVER do this
const query = `SELECT * FROM contacts WHERE email = '${email}'`;  // SQL Injection!

// ALWAYS do this
const query = db.query('SELECT * FROM contacts WHERE email = $1', [email]);
```

**XSS Prevention:**
- All output is escaped by default
- Content-Security-Policy headers enforced
- No `dangerouslySetInnerHTML` without sanitization

**Command Injection Prevention:**
- No shell execution of user input
- Allowlist for any dynamic commands
- Sandboxed workflow execution

---

## Encryption

### Encryption at Rest

```toml
[security.encryption]
# Enable encryption at rest
at_rest = true

# Encryption algorithm
algorithm = "AES-256-GCM"

# Key management
key_provider = "aws-kms"  # aws-kms, gcp-kms, azure-keyvault, vault, local
key_rotation_days = 90
```

### Field-Level Encryption

Sensitive fields can be encrypted individually:

```toml
[security.encryption.fields]
# Fields to encrypt at the application level
encrypted_fields = [
  "contact.phone",
  "contact.address",
  "contact.notes",
  "deal.amount",
  "activity.description",
]

# Searchable encryption (allows searching encrypted fields)
searchable_encrypted_fields = [
  "contact.email",
]
```

### Encryption in Transit

```toml
[security.tls]
# Minimum TLS version
min_version = "1.2"

# Preferred TLS version
preferred_version = "1.3"

# Cipher suites (TLS 1.2)
cipher_suites = [
  "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
  "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
]

# HSTS settings
hsts_enabled = true
hsts_max_age = 31536000
hsts_include_subdomains = true
hsts_preload = true
```

---

## AI Security

### AI Operation Controls

```toml
[ai.security]
# Rate limiting for AI operations
rate_limit_per_minute = 60
rate_limit_per_hour = 500

# Maximum records per AI operation
max_records_per_operation = 100

# Require human approval for sensitive operations
human_approval_required = [
  "delete_contact",
  "delete_company",
  "bulk_update",
  "bulk_delete",
  "export_data",
  "workflow_create",
  "send_email",
  "modify_permissions",
]

# AI action audit (always enabled, cannot be disabled)
audit_all_ai_actions = true

# Rollback window for AI actions
rollback_window_hours = 24

# Anomaly detection
detect_unusual_patterns = true
alert_on_anomaly = true
```

### AI Sandboxing

```toml
[ai.sandbox]
# AI workflows run in isolated environment
enabled = true

# Resource limits
max_memory_mb = 256
max_cpu_seconds = 30
max_network_requests = 10

# Network restrictions
allowed_domains = []  # Empty = no external requests
blocked_domains = ["*"]

# File system access
filesystem_access = "none"  # none, read-only, restricted
```

### AI Prompt Injection Protection

- All user input is treated as data, never as instructions
- AI context is separated from user-provided content
- Input length limits prevent context overflow
- Canary tokens detect prompt injection attempts

---

## Audit Logging

### What's Logged

| Event Category | Examples |
|----------------|----------|
| Authentication | Login, logout, failed attempts, MFA events |
| Authorization | Permission checks, access denied |
| Data Access | Read, create, update, delete operations |
| AI Operations | All AI tool invocations and results |
| Admin Actions | User management, settings changes |
| Security Events | Rate limiting, blocked requests |

### Audit Log Schema

```json
{
  "id": "uuid",
  "timestamp": "2024-12-02T10:30:00Z",
  "actor": {
    "type": "user|ai_agent|system",
    "id": "uuid",
    "ip": "192.168.1.1",
    "userAgent": "..."
  },
  "action": "contact.update",
  "resource": {
    "type": "contact",
    "id": "uuid"
  },
  "changes": {
    "before": {},
    "after": {}
  },
  "result": "success|failure",
  "metadata": {}
}
```

### Audit Log Protection

```toml
[audit]
# Audit logs cannot be modified or deleted
immutable = true

# Cryptographic integrity (hash chain)
integrity_protection = true

# Separate storage for audit logs
separate_storage = true

# Retention
retention_days = 365
archive_after_days = 90

# Real-time streaming to SIEM
siem_integration = true
siem_endpoint = "${SIEM_ENDPOINT}"
```

---

## Security Headers

All responses include security headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## Dependency Security

```toml
[security.dependencies]
# Automated vulnerability scanning
scan_enabled = true
scan_frequency = "daily"

# Block deployment on critical vulnerabilities
block_on_critical = true
block_on_high = true

# Allowed licenses
allowed_licenses = ["MIT", "Apache-2.0", "BSD-3-Clause", "ISC"]

# Dependency lockfile required
require_lockfile = true
```

---

## Incident Response

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| Critical | Active exploitation, data breach | 1 hour |
| High | Vulnerability with exploit available | 4 hours |
| Medium | Vulnerability without known exploit | 24 hours |
| Low | Minor security issue | 1 week |

### Response Process

1. **Detect** - Automated monitoring and alerting
2. **Contain** - Isolate affected systems
3. **Investigate** - Determine scope and impact
4. **Remediate** - Fix the vulnerability
5. **Recover** - Restore normal operations
6. **Review** - Post-incident analysis

---

## Compliance

### Supported Frameworks

- SOC 2 Type II
- GDPR (see PRIVACY.md)
- CCPA
- HIPAA (with BAA)
- ISO 27001

### Security Certifications

Self-hosted deployments can achieve compliance with proper configuration. See deployment guides for compliance-specific settings.

---

## Security Checklist for Deployment

- [ ] TLS 1.2+ enabled with valid certificates
- [ ] All secrets in environment variables or secret manager
- [ ] Database encryption at rest enabled
- [ ] Audit logging enabled and streaming to SIEM
- [ ] Rate limiting configured
- [ ] CORS properly restricted
- [ ] Security headers enabled
- [ ] MFA enabled for admin accounts
- [ ] API keys rotated from defaults
- [ ] Backup encryption enabled
- [ ] Vulnerability scanning enabled
- [ ] Incident response plan documented
