# Privacy & Data Protection

This document outlines Rolodex's approach to privacy and data protection, including GDPR, CCPA, and other regulatory compliance.

---

## Privacy Principles

1. **Data Minimization** - Collect only what's necessary
2. **Purpose Limitation** - Use data only for stated purposes
3. **Transparency** - Clear about what data we process and why
4. **User Control** - Users can access, correct, and delete their data
5. **Security** - Protect data with appropriate technical measures
6. **Accountability** - Document and demonstrate compliance

---

## Personal Data Classification

### PII Categories

Rolodex classifies personal data by sensitivity level:

| Level | Category | Examples | Protection |
|-------|----------|----------|------------|
| **Critical** | Special Category Data | Health info, biometrics | Explicit consent, encryption, access logging |
| **High** | Direct Identifiers | SSN, passport, financial | Encryption, strict access control |
| **Medium** | Contact Information | Email, phone, address | Standard encryption |
| **Low** | Business Information | Job title, company | Standard protection |
| **Minimal** | Non-PII | Preferences, settings | Basic protection |

### Field-Level Classification

Each field in Rolodex schemas is classified:

```json
{
  "email": {
    "type": "string",
    "format": "email",
    "x-pii-level": "medium",
    "x-pii-category": "contact",
    "x-retention": "account_lifetime",
    "x-exportable": true,
    "x-anonymizable": true
  }
}
```

### Data Classification by Entity

#### Contact Entity

| Field | PII Level | Category | Retention |
|-------|-----------|----------|-----------|
| firstName | Medium | Identity | Account lifetime |
| lastName | Medium | Identity | Account lifetime |
| email | Medium | Contact | Account lifetime |
| phone | Medium | Contact | Account lifetime |
| address | Medium | Location | Account lifetime |
| socialProfiles | Low | Public | Account lifetime |
| notes | Varies | User content | Account lifetime |
| customFields | Varies | User defined | Account lifetime |

#### Company Entity

| Field | PII Level | Category | Retention |
|-------|-----------|----------|-----------|
| name | Minimal | Business | Account lifetime |
| domain | Minimal | Business | Account lifetime |
| address | Low | Business | Account lifetime |
| phone | Low | Business | Account lifetime |

#### Activity Entity

| Field | PII Level | Category | Retention |
|-------|-----------|----------|-----------|
| description | Varies | User content | Configurable |
| participants | Medium | Contact | Account lifetime |
| attachments | Varies | User content | Configurable |

---

## Consent Management

### Consent Types

```toml
[privacy.consent]
# Types of consent tracked
consent_types = [
  "data_processing",      # Basic data processing
  "marketing_email",      # Marketing communications
  "analytics",            # Usage analytics
  "third_party_sharing",  # Sharing with integrations
  "ai_processing",        # AI analysis of data
]

# Require explicit consent for these purposes
explicit_consent_required = [
  "marketing_email",
  "third_party_sharing",
  "ai_processing",
]

# Consent for these can be implied from account creation
implicit_consent_allowed = [
  "data_processing",
]
```

### Consent Record Schema

```json
{
  "id": "uuid",
  "userId": "uuid",
  "consentType": "marketing_email",
  "granted": true,
  "grantedAt": "2024-12-02T10:30:00Z",
  "expiresAt": null,
  "source": "signup_form",
  "ipAddress": "192.168.1.1",
  "userAgent": "...",
  "version": "1.0",
  "withdrawnAt": null
}
```

### Consent UI Requirements

- Clear, plain language explanation
- Separate consent for each purpose
- No pre-checked boxes
- Easy to withdraw consent
- Record of all consent changes

---

## Data Subject Rights

### GDPR Article 15-22 Implementation

#### Right to Access (Art. 15)

```toml
[privacy.rights.access]
enabled = true

# Response time (must be within 30 days)
response_deadline_days = 30

# Format options
export_formats = ["json", "csv", "pdf"]

# Include related data
include_activities = true
include_notes = true
include_audit_logs = true
```

**API Endpoint:**
```
POST /api/v1/privacy/data-export
Authorization: Bearer <token>

Response: Download link valid for 24 hours
```

#### Right to Rectification (Art. 16)

Users can update their data through:
- Web UI profile settings
- API calls
- Support request

All changes are logged in the audit trail.

#### Right to Erasure (Art. 17)

```toml
[privacy.rights.erasure]
enabled = true

# Soft delete first, hard delete after retention period
soft_delete_enabled = true
hard_delete_after_days = 30

# Data that cannot be deleted (legal requirements)
exempt_from_deletion = [
  "audit_logs",
  "financial_records",
  "legal_holds",
]

# Anonymization as alternative to deletion
anonymization_enabled = true
```

**Erasure Process:**
1. User requests deletion
2. System verifies identity
3. Check for legal holds or exemptions
4. Soft delete (mark as deleted)
5. Notify integrations to delete
6. Hard delete after retention period
7. Confirm deletion to user

#### Right to Data Portability (Art. 20)

```toml
[privacy.rights.portability]
enabled = true

# Export formats
formats = ["json", "csv"]

# Include schema for reimport
include_schema = true

# Machine-readable format
machine_readable = true
```

**Export includes:**
- All contacts owned by user
- All companies owned by user
- All deals owned by user
- All activities logged by user
- All tasks assigned to user
- User profile information

#### Right to Object (Art. 21)

Users can object to:
- Direct marketing
- Profiling
- AI-based processing

```toml
[privacy.rights.objection]
enabled = true

# Processing that can be objected to
objectable_processing = [
  "marketing",
  "profiling",
  "ai_analysis",
  "automated_decisions",
]
```

---

## Data Retention

### Retention Policies

```toml
[privacy.retention]
# Default retention (account lifetime means until account deleted)
default_retention = "account_lifetime"

# Specific retention periods
[privacy.retention.policies]
# Core data - kept until account deletion
contacts = "account_lifetime"
companies = "account_lifetime"
deals = "account_lifetime"

# Activity data - configurable
activities = "3y"
tasks = "3y"

# Logs
audit_logs = "7y"  # Legal requirement
access_logs = "1y"
error_logs = "90d"

# Temporary data
sessions = "30d"
exports = "24h"
uploads_temp = "7d"

# After account deletion
deleted_account_data = "30d"  # For recovery requests
```

### Retention Enforcement

```toml
[privacy.retention.enforcement]
# Run retention cleanup job
cleanup_schedule = "0 2 * * *"  # Daily at 2 AM

# Notify before deletion
notify_before_deletion = true
notification_days = 30

# Archive before deletion
archive_before_delete = true
archive_storage = "cold"
```

---

## Data Processing Records

### Record of Processing Activities (ROPA)

Required under GDPR Article 30:

```json
{
  "processingActivity": "contact_management",
  "purposes": ["customer_relationship_management"],
  "legalBasis": "legitimate_interest",
  "dataCategories": ["contact_info", "business_info"],
  "dataSubjects": ["customers", "prospects"],
  "recipients": ["crm_users", "integrations"],
  "transfers": {
    "countries": ["US", "EU"],
    "safeguards": "standard_contractual_clauses"
  },
  "retention": "account_lifetime",
  "securityMeasures": ["encryption", "access_control", "audit_logging"]
}
```

---

## Cross-Border Data Transfers

### Data Residency

```toml
[privacy.residency]
# Where data can be stored
allowed_regions = ["us", "eu", "uk"]

# Primary data location
primary_region = "us"

# Per-tenant data residency
tenant_specific_residency = true

# EU data stays in EU
eu_data_in_eu = true
```

### Transfer Mechanisms

| Destination | Mechanism |
|-------------|-----------|
| EU to US | Standard Contractual Clauses (SCCs) |
| EU to UK | UK Adequacy Decision |
| US to EU | SCCs + supplementary measures |

### Transfer Safeguards

```toml
[privacy.transfers]
# Encryption for all transfers
encrypt_in_transit = true

# Additional safeguards for sensitive data
additional_safeguards = [
  "pseudonymization",
  "access_restrictions",
  "transfer_logging",
]

# Transfer impact assessments
require_tia = true  # Transfer Impact Assessment
```

---

## Third-Party Data Processing

### Sub-Processors

All sub-processors must:
- Sign Data Processing Agreement (DPA)
- Implement equivalent security measures
- Notify of further sub-processing
- Allow audits

### Integration Privacy Controls

```toml
[privacy.integrations]
# Require DPA for integrations
require_dpa = true

# Data shared with integrations
[privacy.integrations.data_sharing]
share_contact_data = "opt_in"
share_activity_data = "opt_in"
share_deal_data = "opt_in"

# Log all data shared with integrations
log_all_sharing = true

# User consent required for each integration
per_integration_consent = true
```

---

## AI & Privacy

### AI Data Processing

```toml
[privacy.ai]
# AI processing requires consent
require_consent = true

# What AI can access
[privacy.ai.access]
contacts = true
companies = true
deals = true
activities = true

# What AI cannot access without explicit consent
restricted_fields = [
  "contact.notes",
  "activity.description",
  "deal.amount",
]

# AI cannot export or share data externally
ai_export_allowed = false
ai_external_sharing = false

# All AI processing logged
audit_all_ai_access = true
```

### AI Model Training

```toml
[privacy.ai.training]
# Customer data is NOT used for model training
use_customer_data_for_training = false

# Anonymized/aggregated data only
use_anonymized_data = true

# Opt-in for contributing anonymized data
opt_in_data_contribution = true
```

---

## Privacy by Design

### Development Requirements

All new features must:

1. **Data Inventory** - Document what data is collected
2. **Purpose Specification** - Define why data is needed
3. **Minimization Review** - Confirm minimum necessary data
4. **Retention Definition** - Set appropriate retention period
5. **Security Assessment** - Verify protection measures
6. **Privacy Impact Assessment** - For high-risk processing

### Privacy Impact Assessment (PIA)

Required for:
- New data categories
- New processing purposes
- AI/ML features
- Third-party sharing
- Cross-border transfers

PIA Template:
```markdown
## Processing Description
- What data?
- What purpose?
- What legal basis?

## Necessity Assessment
- Is this data necessary?
- Can we use less data?
- Can we anonymize?

## Risk Assessment
- What are the risks to data subjects?
- What is the likelihood?
- What is the impact?

## Mitigation Measures
- Technical measures
- Organizational measures
- Contractual measures

## Decision
- Approved / Approved with conditions / Rejected
```

---

## Privacy Configuration

### Example Privacy Configuration

```toml
# config/rolodex.toml

[privacy]
# Enable privacy features
enabled = true

# Data Protection Officer contact
dpo_email = "dpo@yourcompany.com"

# Privacy policy URL
privacy_policy_url = "https://yourcompany.com/privacy"

# GDPR mode (stricter controls)
gdpr_mode = true

# CCPA mode
ccpa_mode = true

# Default lawful basis
default_legal_basis = "legitimate_interest"

# Consent management
[privacy.consent]
enabled = true
double_opt_in = true
consent_expiry_days = 365

# Data subject rights
[privacy.rights]
access_enabled = true
erasure_enabled = true
portability_enabled = true
objection_enabled = true

# Retention
[privacy.retention]
default = "account_lifetime"
enforce_automatically = true

# Anonymization
[privacy.anonymization]
enabled = true
method = "pseudonymization"  # pseudonymization, generalization, suppression
```

---

## Compliance Checklist

### GDPR Compliance

- [ ] Privacy policy published and accessible
- [ ] Consent mechanism implemented
- [ ] Data subject rights implemented
- [ ] Data Processing Agreement with processors
- [ ] Record of Processing Activities maintained
- [ ] Privacy Impact Assessments conducted
- [ ] Data breach notification procedure in place
- [ ] DPO appointed (if required)
- [ ] Cross-border transfer mechanisms in place

### CCPA Compliance

- [ ] Privacy notice includes CCPA disclosures
- [ ] "Do Not Sell My Personal Information" link
- [ ] Data access/deletion request mechanism
- [ ] Opt-out mechanism for sale of data
- [ ] Non-discrimination policy
- [ ] Service provider agreements in place

---

## Breach Notification

### Breach Response

```toml
[privacy.breach]
# Internal notification
internal_notification_hours = 24

# Regulatory notification (GDPR requires 72 hours)
regulatory_notification_hours = 72

# User notification
notify_affected_users = true
user_notification_hours = 72

# Notification channels
notification_channels = ["email", "in_app"]

# Breach log retention
breach_log_retention_years = 7
```

### Breach Notification Template

```markdown
## Data Breach Notification

**Date of Discovery:** [Date]
**Date of Incident:** [Date]
**Type of Breach:** [Confidentiality/Integrity/Availability]

**Data Affected:**
- Categories: [e.g., contact information, email addresses]
- Number of records: [Number]
- Number of individuals: [Number]

**Description:**
[What happened]

**Potential Impact:**
[Risks to data subjects]

**Actions Taken:**
[Containment and remediation steps]

**Recommendations:**
[What affected individuals should do]

**Contact:**
[How to reach us for questions]
```

---

## Resources

- [GDPR Official Text](https://gdpr.eu/)
- [CCPA Official Text](https://oag.ca.gov/privacy/ccpa)
- [ICO GDPR Guidance](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/)
