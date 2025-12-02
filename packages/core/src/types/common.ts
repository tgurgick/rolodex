/**
 * Common types used across all entities
 */

export interface Address {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Money {
  value: number;
  currency: string;
}

export interface SocialProfiles {
  linkedin?: string;
  twitter?: string;
  github?: string;
  facebook?: string;
}

export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface BaseEntity extends AuditFields {
  id: string;
}

export type EntityStatus = 'active' | 'inactive' | 'archived';
