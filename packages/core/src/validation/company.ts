/**
 * Zod validation schemas for Company entity
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
  moneySchema,
} from './common';

// Company size
export const companySizeSchema = z.enum([
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5000+',
]);

// Company status
export const companyStatusSchema = z.enum([
  'prospect',
  'customer',
  'partner',
  'vendor',
  'competitor',
  'archived',
]);

// Create company input schema
export const createCompanySchema = z.object({
  name: z.string().min(1).max(200),
  domain: z.string().max(255).optional(),
  website: z.string().url().optional(),
  industry: z.string().max(100).optional(),
  size: companySizeSchema.optional(),
  revenue: moneySchema.optional(),
  description: z.string().max(5000).optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  address: addressSchema.optional(),
  socialProfiles: socialProfilesSchema.optional(),
  tags: tagsSchema,
  customFields: customFieldsSchema,
  parentCompanyId: uuidSchema.optional(),
  ownerId: uuidSchema.optional(),
}).strict();

// Update company input schema
export const updateCompanySchema = createCompanySchema.partial().extend({
  status: companyStatusSchema.optional(),
}).strict();

// Full company schema
export const companySchema = createCompanySchema.extend({
  id: uuidSchema,
  status: companyStatusSchema.default('prospect'),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: uuidSchema.optional(),
  updatedBy: uuidSchema.optional(),
});

// Company filter schema
export const companyFilterSchema = z.object({
  status: companyStatusSchema.optional(),
  industry: z.string().optional(),
  size: companySizeSchema.optional(),
  ownerId: uuidSchema.optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
}).strict();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CompanyFilter = z.infer<typeof companyFilterSchema>;
