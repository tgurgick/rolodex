/**
 * Tasks table schema
 */

import { pgTable, uuid, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';
import { contacts } from './contacts';
import { companies } from './companies';
import { deals } from './deals';

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Core fields
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  priority: varchar('priority', { length: 20 }).default('medium').notNull(), // low, medium, high, urgent

  // Timing
  dueDate: timestamp('due_date', { withTimezone: true }),
  reminderAt: timestamp('reminder_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),

  // Relationships
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'set null' }),
  assigneeId: uuid('assignee_id').references(() => users.id, { onDelete: 'set null' }),

  // Categorization
  category: varchar('category', { length: 100 }),

  // Recurrence
  recurrence: jsonb('recurrence').$type<{
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
  }>(),

  // Metadata
  tags: jsonb('tags').$type<string[]>().default([]),
  customFields: jsonb('custom_fields').$type<Record<string, unknown>>().default({}),

  // Status
  status: varchar('status', { length: 20 }).default('pending').notNull(),

  // Audit fields
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export type TaskRecord = typeof tasks.$inferSelect;
export type NewTaskRecord = typeof tasks.$inferInsert;
