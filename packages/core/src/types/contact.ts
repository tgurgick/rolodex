/**
 * Contact entity type definitions
 */

import type { Address, BaseEntity, SocialProfiles } from './common';

export interface EmailAddress {
  email: string;
  type: 'work' | 'personal' | 'other';
  primary?: boolean;
}

export interface PhoneNumber {
  number: string;
  type: 'work' | 'mobile' | 'home' | 'other';
  primary?: boolean;
}

export type ContactStatus = 'active' | 'inactive' | 'archived';

export interface Contact extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  emails?: EmailAddress[];
  phone?: string;
  phones?: PhoneNumber[];
  title?: string;
  department?: string;
  companyId?: string;
  address?: Address;
  socialProfiles?: SocialProfiles;
  tags?: string[];
  customFields?: Record<string, unknown>;
  source?: string;
  ownerId?: string;
  status: ContactStatus;
  notes?: string;
}

export interface CreateContactInput {
  firstName: string;
  lastName: string;
  email: string;
  emails?: EmailAddress[];
  phone?: string;
  phones?: PhoneNumber[];
  title?: string;
  department?: string;
  companyId?: string;
  address?: Address;
  socialProfiles?: SocialProfiles;
  tags?: string[];
  customFields?: Record<string, unknown>;
  source?: string;
  ownerId?: string;
  notes?: string;
}

export interface UpdateContactInput extends Partial<CreateContactInput> {
  status?: ContactStatus;
}
