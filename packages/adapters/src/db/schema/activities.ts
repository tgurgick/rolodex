/**
 * Activities table schema
 */

import { pgTable, uuid, varchar, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { contacts } from './contacts';
import { companies } from './companies';
import { deals } from './deals';

export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Core fields
  type: varchar('type', { length: 50 }).notNull(), // call, email, meeting, note, task, other
  subject: varchar('subject', { length: 500 }).notNull(),
  description: text('description'),
  outcome: text('outcome'),

  // Timing
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  duration: integer('duration'), // minutes

  // Direction (for calls/emails)
  direction: varchar('direction', { length: 20 }), // inbound, outbound

  // Relationships
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'set null' }),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),

  // Participants
  participants: jsonb('participants').$type<Array<{
    type: 'user' | 'contact';
    id: string;
    name?: string;
    email?: string;
  }>>(),

  // Attachments
  attachments: jsonb('attachments').$type<Array<{
    id: string;
    name: string;
    url: string;
    mimeType?: string;
    size?: number;
  }>>(),

  // Metadata
  tags: jsonb('tags').$type<string[]>().default([]),
  customFields: jsonb('custom_fields').$type<Record<string, unknown>>().default({}),

  // Status
  status: varchar('status', { length: 20 }).default('completed').notNull(),

  // Audit fields
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

export type ActivityRecord = typeof activities.$inferSelect;
export type NewActivityRecord = typeof activities.$inferInsert;
