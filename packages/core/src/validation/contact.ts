/**
 * Zod validation schemas for Contact entity
 */

import { z } from 'zod';
import {
  uuidSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
  socialProfilesSchema,
  tagsSchema,
  customFieldsSchema,
} from './common';

// Email address entry
export const emailAddressSchema = z.object({
  email: emailSchema,
  type: z.enum(['work', 'personal', 'other']),
  primary: z.boolean().default(false),
}).strict();

// Phone number entry
export const phoneNumberSchema = z.object({
  number: phoneSchema,
  type: z.enum(['work', 'mobile', 'home', 'other']),
  primary: z.boolean().default(false),
}).strict();

// Contact status
export const contactStatusSchema = z.enum(['active', 'inactive', 'archived']);

// Consent schema
export const consentSchema = z.object({
  dataProcessing: z.boolean().optional(),
  marketingEmail: z.boolean().optional(),
  thirdPartySharing: z.boolean().optional(),
  aiProcessing: z.boolean().optional(),
  consentDate: z.string().datetime().optional(),
  consentSource: z.string().max(100).optional(),
}).strict();

// Create contact input schema
export const createContactSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: emailSchema,
  emails: z.array(emailAddressSchema).optional(),
  phone: phoneSchema.optional(),
  phones: z.array(phoneNumberSchema).optional(),
  title: z.string().max(200).optional(),
  department: z.string().max(100).optional(),
  companyId: uuidSchema.optional(),
  address: addressSchema.optional(),
  socialProfiles: socialProfilesSchema.optional(),
  tags: tagsSchema,
  customFields: customFieldsSchema,
  source: z.string().max(100).optional(),
  ownerId: uuidSchema.optional(),
  notes: z.string().max(10000).optional(),
  consent: consentSchema.optional(),
  doNotContact: z.boolean().default(false),
}).strict();

// Update contact input schema
export const updateContactSchema = createContactSchema.partial().extend({
  status: contactStatusSchema.optional(),
}).strict();

// Full contact schema (includes id and audit fields)
export const contactSchema = createContactSchema.extend({
  id: uuidSchema,
  status: contactStatusSchema.default('active'),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: uuidSchema.optional(),
  updatedBy: uuidSchema.optional(),
});

// Contact filter schema
export const contactFilterSchema = z.object({
  status: contactStatusSchema.optional(),
  companyId: uuidSchema.optional(),
  ownerId: uuidSchema.optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
}).strict();

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ContactFilter = z.infer<typeof contactFilterSchema>;
