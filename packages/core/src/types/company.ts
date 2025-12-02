/**
 * Company entity type definitions
 */

import type { Address, BaseEntity, Money, SocialProfiles } from './common';

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1001-5000' | '5000+';

export type CompanyStatus = 'prospect' | 'customer' | 'partner' | 'vendor' | 'competitor' | 'archived';

export interface Company extends BaseEntity {
  name: string;
  domain?: string;
  website?: string;
  industry?: string;
  size?: CompanySize;
  revenue?: Money;
  description?: string;
  phone?: string;
  email?: string;
  address?: Address;
  socialProfiles?: SocialProfiles;
  tags?: string[];
  customFields?: Record<string, unknown>;
  parentCompanyId?: string;
  ownerId?: string;
  status: CompanyStatus;
}

export interface CreateCompanyInput {
  name: string;
  domain?: string;
  website?: string;
  industry?: string;
  size?: CompanySize;
  revenue?: Money;
  description?: string;
  phone?: string;
  email?: string;
  address?: Address;
  socialProfiles?: SocialProfiles;
  tags?: string[];
  customFields?: Record<string, unknown>;
  parentCompanyId?: string;
  ownerId?: string;
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {
  status?: CompanyStatus;
}
