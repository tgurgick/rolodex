/**
 * Zod validation schemas for Deal entity
 */

import { z } from 'zod';
import {
  uuidSchema,
  tagsSchema,
  customFieldsSchema,
  moneySchema,
} from './common';

// Deal status
export const dealStatusSchema = z.enum(['open', 'won', 'lost']);

// Deal product
export const dealProductSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(1).max(200),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).max(100).optional(),
}).strict();

// Stage history entry
export const stageHistoryEntrySchema = z.object({
  stage: z.string().min(1),
  enteredAt: z.date(),
  exitedAt: z.date().optional(),
  changedBy: uuidSchema.optional(),
}).strict();

// Create deal input schema
export const createDealSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  stage: z.string().min(1).max(100),
  amount: moneySchema.optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().datetime().optional(),
  companyId: uuidSchema.optional(),
  contactIds: z.array(uuidSchema).optional(),
  primaryContactId: uuidSchema.optional(),
  ownerId: uuidSchema.optional(),
  source: z.string().max(100).optional(),
  competitors: z.array(z.string().max(200)).optional(),
  products: z.array(dealProductSchema).optional(),
  tags: tagsSchema,
  customFields: customFieldsSchema,
}).strict();

// Update deal input schema
export const updateDealSchema = createDealSchema.partial().extend({
  status: dealStatusSchema.optional(),
  lostReason: z.string().max(500).optional(),
  actualCloseDate: z.string().datetime().optional(),
}).strict();

// Update deal stage input
export const updateDealStageSchema = z.object({
  stage: z.string().min(1).max(100),
  probability: z.number().min(0).max(100).optional(),
}).strict();

// Close deal input
export const closeDealSchema = z.object({
  status: z.enum(['won', 'lost']),
  lostReason: z.string().max(500).optional(),
  actualCloseDate: z.string().datetime().optional(),
}).strict();

// Full deal schema
export const dealSchema = createDealSchema.extend({
  id: uuidSchema,
  status: dealStatusSchema.default('open'),
  lostReason: z.string().optional(),
  actualCloseDate: z.date().optional(),
  stageHistory: z.array(stageHistoryEntrySchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: uuidSchema.optional(),
  updatedBy: uuidSchema.optional(),
});

// Deal filter schema
export const dealFilterSchema = z.object({
  status: dealStatusSchema.optional(),
  stage: z.string().optional(),
  companyId: uuidSchema.optional(),
  contactId: uuidSchema.optional(),
  ownerId: uuidSchema.optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  expectedCloseBefore: z.string().datetime().optional(),
  expectedCloseAfter: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
}).strict();

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type UpdateDealStageInput = z.infer<typeof updateDealStageSchema>;
export type CloseDealInput = z.infer<typeof closeDealSchema>;
export type DealFilter = z.infer<typeof dealFilterSchema>;
