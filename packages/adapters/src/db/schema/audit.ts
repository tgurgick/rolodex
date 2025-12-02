/**
 * Audit log table schema
 */

import { pgTable, uuid, varchar, timestamp, jsonb, text } from 'drizzle-orm/pg-core';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Timestamp
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),

  // Actor information
  actorType: varchar('actor_type', { length: 20 }).notNull(), // user, ai_agent, system
  actorId: uuid('actor_id'),
  actorIp: varchar('actor_ip', { length: 45 }), // IPv6 max length
  actorUserAgent: text('actor_user_agent'),

  // Action information
  action: varchar('action', { length: 100 }).notNull(), // e.g., contact.create, deal.update
  resourceType: varchar('resource_type', { length: 50 }).notNull(),
  resourceId: uuid('resource_id'),

  // Changes
  changesBefore: jsonb('changes_before').$type<Record<string, unknown>>(),
  changesAfter: jsonb('changes_after').$type<Record<string, unknown>>(),

  // Result
  result: varchar('result', { length: 20 }).notNull(), // success, failure
  errorMessage: text('error_message'),

  // Additional context
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),

  // Integrity protection (hash chain)
  previousHash: varchar('previous_hash', { length: 64 }),
  currentHash: varchar('current_hash', { length: 64 }).notNull(),
});

// AI approval requests
export const approvalRequests = pgTable('approval_requests', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Request info
  operation: varchar('operation', { length: 100 }).notNull(),
  description: text('description'),

  // Actor (AI agent requesting)
  agentId: varchar('agent_id', { length: 100 }).notNull(),
  agentContext: jsonb('agent_context').$type<Record<string, unknown>>(),

  // Target resource
  resourceType: varchar('resource_type', { length: 50 }),
  resourceId: uuid('resource_id'),
  requestData: jsonb('request_data').$type<Record<string, unknown>>(),

  // Status
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, approved, denied, expired

  // Approval info
  approvedBy: uuid('approved_by'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  denialReason: text('denial_reason'),

  // Timing
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type AuditLogRecord = typeof auditLogs.$inferSelect;
export type NewAuditLogRecord = typeof auditLogs.$inferInsert;
export type ApprovalRequestRecord = typeof approvalRequests.$inferSelect;
export type NewApprovalRequestRecord = typeof approvalRequests.$inferInsert;
