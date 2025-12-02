/**
 * Companies table schema
 */

import { pgTable, uuid, varchar, text, timestamp, jsonb, decimal } from 'drizzle-orm/pg-core';
import { users } from './users';

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Core fields
  name: varchar('name', { length: 200 }).notNull(),
  domain: varchar('domain', { length: 255 }),
  website: varchar('website', { length: 500 }),

  // Business info
  industry: varchar('industry', { length: 100 }),
  size: varchar('size', { length: 20 }), // 1-10, 11-50, etc.
  revenueAmount: decimal('revenue_amount', { precision: 15, scale: 2 }),
  revenueCurrency: varchar('revenue_currency', { length: 3 }).default('USD'),
  description: text('description'),

  // Contact info
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),

  // Address
  address: jsonb('address').$type<{
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>(),

  // Social profiles
  socialProfiles: jsonb('social_profiles').$type<{
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  }>(),

  // Metadata
  tags: jsonb('tags').$type<string[]>().default([]),
  customFields: jsonb('custom_fields').$type<Record<string, unknown>>().default({}),

  // Relationships
  parentCompanyId: uuid('parent_company_id'),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),

  // Status
  status: varchar('status', { length: 20 }).default('prospect').notNull(),

  // Audit fields
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export type CompanyRecord = typeof companies.$inferSelect;
export type NewCompanyRecord = typeof companies.$inferInsert;
