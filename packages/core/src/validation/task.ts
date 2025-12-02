/**
 * Zod validation schemas for Task entity
 */

import { z } from 'zod';
import {
  uuidSchema,
  tagsSchema,
  customFieldsSchema,
} from './common';

// Task priority
export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

// Task status
export const taskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);

// Recurrence frequency
export const recurrenceFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

// Task recurrence
export const taskRecurrenceSchema = z.object({
  frequency: recurrenceFrequencySchema,
  interval: z.number().int().min(1).max(100),
  endDate: z.string().datetime().optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
}).strict();

// Create task input schema
export const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  priority: taskPrioritySchema.default('medium'),
  dueDate: z.string().datetime().optional(),
  reminderAt: z.string().datetime().optional(),
  contactId: uuidSchema.optional(),
  companyId: uuidSchema.optional(),
  dealId: uuidSchema.optional(),
  assigneeId: uuidSchema.optional(),
  category: z.string().max(100).optional(),
  tags: tagsSchema,
  customFields: customFieldsSchema,
  recurrence: taskRecurrenceSchema.optional(),
}).strict();

// Update task input schema
export const updateTaskSchema = createTaskSchema.partial().extend({
  status: taskStatusSchema.optional(),
  completedAt: z.string().datetime().optional(),
}).strict();

// Complete task input
export const completeTaskSchema = z.object({
  completedAt: z.string().datetime().optional(),
}).strict();

// Full task schema
export const taskSchema = createTaskSchema.extend({
  id: uuidSchema,
  status: taskStatusSchema.default('pending'),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: uuidSchema.optional(),
  updatedBy: uuidSchema.optional(),
});

// Task filter schema
export const taskFilterSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: uuidSchema.optional(),
  contactId: uuidSchema.optional(),
  companyId: uuidSchema.optional(),
  dealId: uuidSchema.optional(),
  category: z.string().optional(),
  dueBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
  overdue: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
}).strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
export type TaskFilter = z.infer<typeof taskFilterSchema>;
