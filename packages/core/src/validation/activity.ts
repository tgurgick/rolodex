/**
 * Zod validation schemas for Activity entity
 */

import { z } from 'zod';
import {
  uuidSchema,
  tagsSchema,
  customFieldsSchema,
} from './common';

// Activity type
export const activityTypeSchema = z.enum(['call', 'email', 'meeting', 'note', 'task', 'other']);

// Activity status
export const activityStatusSchema = z.enum(['scheduled', 'completed', 'cancelled']);

// Communication direction
export const communicationDirectionSchema = z.enum(['inbound', 'outbound']);

// Activity participant
export const activityParticipantSchema = z.object({
  type: z.enum(['user', 'contact']),
  id: uuidSchema,
  name: z.string().max(200).optional(),
  email: z.string().email().optional(),
}).strict();

// Activity attachment
export const activityAttachmentSchema = z.object({
  id: z.string(),
  name: z.string().max(255),
  url: z.string().url(),
  mimeType: z.string().max(100).optional(),
  size: z.number().int().min(0).optional(),
}).strict();

// Create activity input schema
export const createActivitySchema = z.object({
  type: activityTypeSchema,
  subject: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  outcome: z.string().max(1000).optional(),
  contactId: uuidSchema.optional(),
  companyId: uuidSchema.optional(),
  dealId: uuidSchema.optional(),
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().int().min(0).optional(),
  direction: communicationDirectionSchema.optional(),
  participants: z.array(activityParticipantSchema).optional(),
  attachments: z.array(activityAttachmentSchema).optional(),
  tags: tagsSchema,
  customFields: customFieldsSchema,
  ownerId: uuidSchema.optional(),
  status: activityStatusSchema.default('completed'),
}).strict();

// Update activity input schema
export const updateActivitySchema = createActivitySchema.partial().extend({
  completedAt: z.string().datetime().optional(),
}).strict();

// Full activity schema
export const activitySchema = createActivitySchema.extend({
  id: uuidSchema,
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: uuidSchema.optional(),
  updatedBy: uuidSchema.optional(),
});

// Activity filter schema
export const activityFilterSchema = z.object({
  type: activityTypeSchema.optional(),
  status: activityStatusSchema.optional(),
  contactId: uuidSchema.optional(),
  companyId: uuidSchema.optional(),
  dealId: uuidSchema.optional(),
  ownerId: uuidSchema.optional(),
  direction: communicationDirectionSchema.optional(),
  scheduledAfter: z.string().datetime().optional(),
  scheduledBefore: z.string().datetime().optional(),
  search: z.string().optional(),
}).strict();

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type ActivityFilter = z.infer<typeof activityFilterSchema>;
