/**
 * Zod validation schemas for common types
 */

import { z } from 'zod';

// UUID schema
export const uuidSchema = z.string().uuid();

// Email schema with normalization
export const emailSchema = z.string().email().transform((v) => v.toLowerCase().trim());

// Phone schema - flexible format
export const phoneSchema = z.string().regex(/^[+]?[0-9\s\-().]+$/, 'Invalid phone number format');

// Address schema
export const addressSchema = z.object({
  street1: z.string().max(200).optional(),
  street2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
}).strict();

// Money schema
export const moneySchema = z.object({
  value: z.number().min(0),
  currency: z.string().length(3).default('USD'),
}).strict();

// Social profiles schema
export const socialProfilesSchema = z.object({
  linkedin: z.string().url().optional(),
  twitter: z.string().max(100).optional(),
  github: z.string().max(100).optional(),
  facebook: z.string().url().optional(),
}).strict();

// Tags schema
export const tagsSchema = z.array(z.string().max(50)).max(50).default([]);

// Custom fields schema
export const customFieldsSchema = z.record(z.string(), z.unknown()).default({});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1).max(500),
  fields: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

// Date range schema
export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

// Audit fields schema (auto-generated, not for input)
export const auditFieldsSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().uuid().optional(),
  updatedBy: z.string().uuid().optional(),
});

// Base entity schema
export const baseEntitySchema = z.object({
  id: uuidSchema,
}).merge(auditFieldsSchema);

export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
