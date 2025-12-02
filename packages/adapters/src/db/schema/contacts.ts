/**
 * Contacts table schema
 */

import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';
import { companies } from './companies';

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Core fields
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),

  // Contact info (encrypted in production)
  phone: varchar('phone', { length: 50 }),
  emails: jsonb('emails').$type<Array<{ email: string; type: string; primary?: boolean }>>(),
  phones: jsonb('phones').$type<Array<{ number: string; type: string; primary?: boolean }>>(),

  // Professional info
  title: varchar('title', { length: 200 }),
  department: varchar('department', { length: 100 }),

  // Relationships
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),

  // Address (encrypted in production)
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
    github?: string;
  }>(),

  // Metadata
  tags: jsonb('tags').$type<string[]>().default([]),
  customFields: jsonb('custom_fields').$type<Record<string, unknown>>().default({}),
  source: varchar('source', { length: 100 }),
  notes: text('notes'),

  // Privacy & Consent
  consent: jsonb('consent').$type<{
    dataProcessing?: boolean;
    marketingEmail?: boolean;
    thirdPartySharing?: boolean;
    aiProcessing?: boolean;
    consentDate?: string;
    consentSource?: string;
  }>(),
  doNotContact: boolean('do_not_contact').default(false),

  // Status
  status: varchar('status', { length: 20 }).default('active').notNull(),

  // Audit fields
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

// Indexes are defined separately for clarity
export type ContactRecord = typeof contacts.$inferSelect;
export type NewContactRecord = typeof contacts.$inferInsert;
