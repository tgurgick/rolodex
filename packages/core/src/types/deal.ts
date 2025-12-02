/**
 * Deal entity type definitions
 */

import type { BaseEntity, Money } from './common';

export type DealStatus = 'open' | 'won' | 'lost';

export interface DealProduct {
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface StageHistoryEntry {
  stage: string;
  enteredAt: Date;
  exitedAt?: Date;
  changedBy?: string;
}

export interface Deal extends BaseEntity {
  name: string;
  description?: string;
  stage: string;
  amount?: Money;
  probability?: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  companyId?: string;
  contactIds?: string[];
  primaryContactId?: string;
  ownerId?: string;
  source?: string;
  lostReason?: string;
  competitors?: string[];
  products?: DealProduct[];
  tags?: string[];
  customFields?: Record<string, unknown>;
  stageHistory?: StageHistoryEntry[];
  status: DealStatus;
}

export interface CreateDealInput {
  name: string;
  description?: string;
  stage: string;
  amount?: Money;
  probability?: number;
  expectedCloseDate?: Date;
  companyId?: string;
  contactIds?: string[];
  primaryContactId?: string;
  ownerId?: string;
  source?: string;
  competitors?: string[];
  products?: DealProduct[];
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export interface UpdateDealInput extends Partial<CreateDealInput> {
  status?: DealStatus;
  lostReason?: string;
  actualCloseDate?: Date;
}
