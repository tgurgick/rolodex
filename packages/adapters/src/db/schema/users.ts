/**
 * Users table schema
 */

import { pgTable, uuid, varchar, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Core fields
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),

  // Auth (password hash stored separately or via auth provider)
  passwordHash: varchar('password_hash', { length: 255 }),

  // Role and permissions
  role: varchar('role', { length: 50 }).default('member').notNull(), // viewer, member, manager, admin, owner
  permissions: jsonb('permissions').$type<string[]>().default([]),

  // Team/organization
  teamId: uuid('team_id'),
  organizationId: uuid('organization_id'),

  // Settings
  settings: jsonb('settings').$type<Record<string, unknown>>().default({}),

  // Status
  status: varchar('status', { length: 20 }).default('active').notNull(),
  emailVerified: boolean('email_verified').default(false),

  // Timestamps
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// API Keys table
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),

  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  name: varchar('name', { length: 100 }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).notNull(), // Store hash, not actual key
  keyPrefix: varchar('key_prefix', { length: 10 }).notNull(), // First few chars for identification

  scopes: jsonb('scopes').$type<string[]>().default([]),

  expiresAt: timestamp('expires_at', { withTimezone: true }),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),

  status: varchar('status', { length: 20 }).default('active').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type UserRecord = typeof users.$inferSelect;
export type NewUserRecord = typeof users.$inferInsert;
export type ApiKeyRecord = typeof apiKeys.$inferSelect;
export type NewApiKeyRecord = typeof apiKeys.$inferInsert;
