/**
 * Deals table schema
 */

import { pgTable, uuid, varchar, text, timestamp, jsonb, decimal, integer, date } from 'drizzle-orm/pg-core';
import { users } from './users';
import { companies } from './companies';

export const deals = pgTable('deals', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Core fields
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  stage: varchar('stage', { length: 100 }).notNull(),

  // Value
  amountValue: decimal('amount_value', { precision: 15, scale: 2 }),
  amountCurrency: varchar('amount_currency', { length: 3 }).default('USD'),
  probability: integer('probability'), // 0-100

  // Dates
  expectedCloseDate: date('expected_close_date'),
  actualCloseDate: date('actual_close_date'),

  // Relationships
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
  contactIds: jsonb('contact_ids').$type<string[]>().default([]),
  primaryContactId: uuid('primary_contact_id'),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),

  // Additional info
  source: varchar('source', { length: 100 }),
  lostReason: varchar('lost_reason', { length: 500 }),
  competitors: jsonb('competitors').$type<string[]>().default([]),
  products: jsonb('products').$type<Array<{
    productId?: string;
    name: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>>(),

  // Metadata
  tags: jsonb('tags').$type<string[]>().default([]),
  customFields: jsonb('custom_fields').$type<Record<string, unknown>>().default({}),

  // Stage history
  stageHistory: jsonb('stage_history').$type<Array<{
    stage: string;
    enteredAt: string;
    exitedAt?: string;
    changedBy?: string;
  }>>(),

  // Status
  status: varchar('status', { length: 20 }).default('open').notNull(),

  // Audit fields
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export type DealRecord = typeof deals.$inferSelect;
export type NewDealRecord = typeof deals.$inferInsert;
