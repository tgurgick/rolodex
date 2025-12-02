/**
 * AI Audit Logging System
 *
 * Provides comprehensive logging of all AI agent actions for compliance,
 * debugging, and security purposes.
 */

import { randomUUID } from 'crypto';

export type AuditEventType =
  | 'tool_called'
  | 'tool_completed'
  | 'tool_failed'
  | 'approval_requested'
  | 'approval_granted'
  | 'approval_denied'
  | 'data_accessed'
  | 'data_modified'
  | 'data_deleted'
  | 'pii_accessed'
  | 'consent_checked'
  | 'rate_limit_hit';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  severity: AuditSeverity;
  actorId: string;
  actorType: 'ai_agent' | 'human' | 'system';
  sessionId?: string;
  toolName?: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  description: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
  piiAccessed?: boolean;
  sensitiveFields?: string[];
}

export interface AuditConfig {
  /** Enable audit logging */
  enabled: boolean;
  /** Log level threshold */
  minSeverity: AuditSeverity;
  /** Include input in logs (may contain PII) */
  logInput: boolean;
  /** Include output in logs */
  logOutput: boolean;
  /** Redact PII fields */
  redactPII: boolean;
  /** Fields to always redact */
  redactFields: string[];
  /** Custom handler for audit entries */
  handler?: (entry: AuditEntry) => Promise<void>;
  /** Batch size for async writes */
  batchSize: number;
  /** Flush interval in ms */
  flushInterval: number;
}

const DEFAULT_CONFIG: AuditConfig = {
  enabled: true,
  minSeverity: 'info',
  logInput: true,
  logOutput: true,
  redactPII: true,
  redactFields: ['password', 'token', 'secret', 'apiKey', 'ssn', 'creditCard'],
  batchSize: 100,
  flushInterval: 5000,
};

const SEVERITY_ORDER: Record<AuditSeverity, number> = {
  info: 0,
  warning: 1,
  error: 2,
  critical: 3,
};

const PII_FIELDS = [
  'email',
  'phone',
  'address',
  'ssn',
  'socialSecurityNumber',
  'dateOfBirth',
  'dob',
  'creditCard',
  'bankAccount',
  'passport',
  'driverLicense',
];

/**
 * In-memory audit log store
 * In production, this would be backed by a database or log service
 */
const auditLog: AuditEntry[] = [];
const pendingEntries: AuditEntry[] = [];
let flushTimer: NodeJS.Timeout | null = null;

let config: AuditConfig = { ...DEFAULT_CONFIG };

/**
 * Configure the audit system
 */
export function configureAuditSystem(newConfig: Partial<AuditConfig>): void {
  config = { ...config, ...newConfig };

  if (config.enabled && config.flushInterval > 0 && !flushTimer) {
    flushTimer = setInterval(flushAuditLog, config.flushInterval);
  }
}

/**
 * Redact sensitive fields from an object
 */
function redactSensitiveData(
  obj: Record<string, unknown> | undefined,
  additionalFields: string[] = []
): Record<string, unknown> | undefined {
  if (!obj || !config.redactPII) return obj;

  const fieldsToRedact = new Set([
    ...config.redactFields,
    ...(config.redactPII ? PII_FIELDS : []),
    ...additionalFields,
  ]);

  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const shouldRedact = Array.from(fieldsToRedact).some(
      field => lowerKey.includes(field.toLowerCase())
    );

    if (shouldRedact) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      redacted[key] = redactSensitiveData(value as Record<string, unknown>, additionalFields);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Check if PII was accessed based on input/output
 */
function detectPIIAccess(
  input?: Record<string, unknown>,
  output?: Record<string, unknown>
): { piiAccessed: boolean; sensitiveFields: string[] } {
  const sensitiveFields: string[] = [];

  const checkObject = (obj: Record<string, unknown> | undefined, prefix = '') => {
    if (!obj) return;

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const lowerKey = key.toLowerCase();

      if (PII_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
        sensitiveFields.push(fullKey);
      }

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        checkObject(value as Record<string, unknown>, fullKey);
      }
    }
  };

  checkObject(input, 'input');
  checkObject(output, 'output');

  return {
    piiAccessed: sensitiveFields.length > 0,
    sensitiveFields,
  };
}

/**
 * Log an audit event
 */
export async function logAuditEvent(
  eventType: AuditEventType,
  action: string,
  description: string,
  options: {
    actorId: string;
    actorType?: AuditEntry['actorType'];
    severity?: AuditSeverity;
    sessionId?: string;
    toolName?: string;
    resourceType?: string;
    resourceId?: string;
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    error?: string;
    duration?: number;
    metadata?: Record<string, unknown>;
  }
): Promise<AuditEntry | null> {
  if (!config.enabled) return null;

  const severity = options.severity ?? 'info';
  if (SEVERITY_ORDER[severity] < SEVERITY_ORDER[config.minSeverity]) {
    return null;
  }

  const { piiAccessed, sensitiveFields } = detectPIIAccess(options.input, options.output);

  const entry: AuditEntry = {
    id: randomUUID(),
    timestamp: new Date(),
    eventType,
    severity,
    actorId: options.actorId,
    actorType: options.actorType ?? 'ai_agent',
    sessionId: options.sessionId,
    toolName: options.toolName,
    resourceType: options.resourceType,
    resourceId: options.resourceId,
    action,
    description,
    input: config.logInput ? redactSensitiveData(options.input) : undefined,
    output: config.logOutput ? redactSensitiveData(options.output) : undefined,
    error: options.error,
    duration: options.duration,
    metadata: options.metadata,
    piiAccessed,
    sensitiveFields: piiAccessed ? sensitiveFields : undefined,
  };

  pendingEntries.push(entry);

  if (pendingEntries.length >= config.batchSize) {
    await flushAuditLog();
  }

  if (config.handler) {
    await config.handler(entry);
  }

  return entry;
}

/**
 * Flush pending audit entries to storage
 */
export async function flushAuditLog(): Promise<void> {
  if (pendingEntries.length === 0) return;

  const entries = pendingEntries.splice(0, pendingEntries.length);
  auditLog.push(...entries);

  // In production, this would write to database/log service
  // For now, we keep in memory
}

/**
 * Get audit entries with optional filtering
 */
export function getAuditEntries(options?: {
  startDate?: Date;
  endDate?: Date;
  eventType?: AuditEventType;
  actorId?: string;
  resourceType?: string;
  resourceId?: string;
  severity?: AuditSeverity;
  piiOnly?: boolean;
  limit?: number;
  offset?: number;
}): AuditEntry[] {
  // Include pending entries
  const allEntries = [...auditLog, ...pendingEntries];

  let filtered = allEntries;

  if (options?.startDate) {
    filtered = filtered.filter(e => e.timestamp >= options.startDate!);
  }
  if (options?.endDate) {
    filtered = filtered.filter(e => e.timestamp <= options.endDate!);
  }
  if (options?.eventType) {
    filtered = filtered.filter(e => e.eventType === options.eventType);
  }
  if (options?.actorId) {
    filtered = filtered.filter(e => e.actorId === options.actorId);
  }
  if (options?.resourceType) {
    filtered = filtered.filter(e => e.resourceType === options.resourceType);
  }
  if (options?.resourceId) {
    filtered = filtered.filter(e => e.resourceId === options.resourceId);
  }
  if (options?.severity) {
    filtered = filtered.filter(
      e => SEVERITY_ORDER[e.severity] >= SEVERITY_ORDER[options.severity!]
    );
  }
  if (options?.piiOnly) {
    filtered = filtered.filter(e => e.piiAccessed);
  }

  // Sort by timestamp descending
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Apply pagination
  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? 100;
  return filtered.slice(offset, offset + limit);
}

/**
 * Get audit statistics
 */
export function getAuditStats(startDate?: Date, endDate?: Date): {
  total: number;
  byEventType: Record<string, number>;
  bySeverity: Record<string, number>;
  byActor: Record<string, number>;
  piiAccessCount: number;
  errorCount: number;
} {
  let entries = [...auditLog, ...pendingEntries];

  if (startDate) {
    entries = entries.filter(e => e.timestamp >= startDate);
  }
  if (endDate) {
    entries = entries.filter(e => e.timestamp <= endDate);
  }

  const stats = {
    total: entries.length,
    byEventType: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
    byActor: {} as Record<string, number>,
    piiAccessCount: 0,
    errorCount: 0,
  };

  for (const entry of entries) {
    stats.byEventType[entry.eventType] = (stats.byEventType[entry.eventType] ?? 0) + 1;
    stats.bySeverity[entry.severity] = (stats.bySeverity[entry.severity] ?? 0) + 1;
    stats.byActor[entry.actorId] = (stats.byActor[entry.actorId] ?? 0) + 1;

    if (entry.piiAccessed) stats.piiAccessCount++;
    if (entry.error) stats.errorCount++;
  }

  return stats;
}

/**
 * Format audit entry for display
 */
export function formatAuditEntry(entry: AuditEntry): string {
  const lines: string[] = [
    `## Audit Entry: ${entry.id}`,
    '',
    `**Timestamp:** ${entry.timestamp.toISOString()}`,
    `**Event Type:** ${entry.eventType}`,
    `**Severity:** ${entry.severity.toUpperCase()}`,
    `**Action:** ${entry.action}`,
    '',
    `**Description:** ${entry.description}`,
    '',
    `**Actor:** ${entry.actorId} (${entry.actorType})`,
  ];

  if (entry.sessionId) lines.push(`**Session:** ${entry.sessionId}`);
  if (entry.toolName) lines.push(`**Tool:** ${entry.toolName}`);
  if (entry.resourceType) lines.push(`**Resource Type:** ${entry.resourceType}`);
  if (entry.resourceId) lines.push(`**Resource ID:** ${entry.resourceId}`);
  if (entry.duration !== undefined) lines.push(`**Duration:** ${entry.duration}ms`);

  if (entry.piiAccessed) {
    lines.push('', `**PII Accessed:** Yes`);
    if (entry.sensitiveFields) {
      lines.push(`**Sensitive Fields:** ${entry.sensitiveFields.join(', ')}`);
    }
  }

  if (entry.error) {
    lines.push('', `**Error:** ${entry.error}`);
  }

  return lines.join('\n');
}

/**
 * Cleanup function for shutdown
 */
export async function shutdownAuditSystem(): Promise<void> {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  await flushAuditLog();
}

/**
 * Clear audit log (for testing)
 */
export function clearAuditLog(): void {
  auditLog.length = 0;
  pendingEntries.length = 0;
}

/**
 * Middleware helper to wrap tool execution with audit logging
 */
export async function withAuditLogging<T>(
  toolName: string,
  actorId: string,
  input: Record<string, unknown>,
  fn: () => Promise<T>,
  options?: {
    sessionId?: string;
    resourceType?: string;
    resourceId?: string;
  }
): Promise<T> {
  const startTime = Date.now();

  await logAuditEvent('tool_called', `execute_${toolName}`, `Tool ${toolName} called`, {
    actorId,
    toolName,
    input,
    ...options,
  });

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    await logAuditEvent('tool_completed', `execute_${toolName}`, `Tool ${toolName} completed`, {
      actorId,
      toolName,
      input,
      output: result as Record<string, unknown>,
      duration,
      ...options,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    await logAuditEvent('tool_failed', `execute_${toolName}`, `Tool ${toolName} failed`, {
      actorId,
      severity: 'error',
      toolName,
      input,
      error: errorMessage,
      duration,
      ...options,
    });

    throw error;
  }
}
