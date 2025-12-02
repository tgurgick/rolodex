/**
 * Activity entity type definitions
 */

import type { BaseEntity } from './common';

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'other';
export type ActivityStatus = 'scheduled' | 'completed' | 'cancelled';
export type CommunicationDirection = 'inbound' | 'outbound';

export interface ActivityParticipant {
  type: 'user' | 'contact';
  id: string;
  name?: string;
  email?: string;
}

export interface ActivityAttachment {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
}

export interface Activity extends BaseEntity {
  type: ActivityType;
  subject: string;
  description?: string;
  outcome?: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  duration?: number;
  direction?: CommunicationDirection;
  participants?: ActivityParticipant[];
  attachments?: ActivityAttachment[];
  tags?: string[];
  customFields?: Record<string, unknown>;
  ownerId?: string;
  status: ActivityStatus;
}

export interface CreateActivityInput {
  type: ActivityType;
  subject: string;
  description?: string;
  outcome?: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  scheduledAt?: Date;
  duration?: number;
  direction?: CommunicationDirection;
  participants?: ActivityParticipant[];
  attachments?: ActivityAttachment[];
  tags?: string[];
  customFields?: Record<string, unknown>;
  ownerId?: string;
  status?: ActivityStatus;
}

export interface UpdateActivityInput extends Partial<CreateActivityInput> {
  completedAt?: Date;
}
