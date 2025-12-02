/**
 * Task entity type definitions
 */

import type { BaseEntity } from './common';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface TaskRecurrence {
  frequency: RecurrenceFrequency;
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[];
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: Date;
  reminderAt?: Date;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  assigneeId?: string;
  category?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  recurrence?: TaskRecurrence;
  completedAt?: Date;
  status: TaskStatus;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  reminderAt?: Date;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  assigneeId?: string;
  category?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  recurrence?: TaskRecurrence;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus;
  completedAt?: Date;
}
