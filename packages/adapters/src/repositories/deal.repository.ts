/**
 * Deal repository
 */

import { eq, ilike, gte, lte, SQL } from 'drizzle-orm';
import { deals, DealRecord, NewDealRecord } from '../db/schema';
import { BaseRepository, PaginatedResult, PaginationOptions } from './base';
import { Deal, CreateDealInput, UpdateDealInput } from '@rolodex/core';
import { Database } from '../db/connection';

export interface DealFilter {
  status?: string;
  stage?: string;
  companyId?: string;
  ownerId?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export class DealRepository extends BaseRepository<
  typeof deals,
  DealRecord,
  NewDealRecord,
  Partial<NewDealRecord>,
  DealFilter
> {
  protected table = deals;
  protected entityName = 'Deal';

  constructor(db?: Database) {
    super(db);
  }

  /**
   * Create a deal
   */
  async createDeal(input: CreateDealInput, actorId?: string): Promise<Deal> {
    const now = new Date().toISOString();

    const record = await this.create(
      {
        name: input.name,
        description: input.description,
        stage: input.stage,
        amountValue: input.amount?.value?.toString(),
        amountCurrency: input.amount?.currency ?? 'USD',
        probability: input.probability,
        expectedCloseDate: input.expectedCloseDate,
        companyId: input.companyId,
        contactIds: input.contactIds ?? [],
        primaryContactId: input.primaryContactId,
        ownerId: input.ownerId,
        source: input.source,
        competitors: input.competitors ?? [],
        products: input.products,
        tags: input.tags ?? [],
        customFields: input.customFields ?? {},
        stageHistory: [
          {
            stage: input.stage,
            enteredAt: now,
            changedBy: actorId,
          },
        ],
        status: 'open',
      },
      actorId
    );

    return this.mapToEntity(record);
  }

  /**
   * Update a deal
   */
  async updateDeal(
    id: string,
    input: UpdateDealInput,
    actorId?: string
  ): Promise<Deal> {
    const data: Partial<NewDealRecord> = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.stage !== undefined) data.stage = input.stage;
    if (input.amount !== undefined) {
      data.amountValue = input.amount.value.toString();
      data.amountCurrency = input.amount.currency;
    }
    if (input.probability !== undefined) data.probability = input.probability;
    if (input.expectedCloseDate !== undefined) data.expectedCloseDate = input.expectedCloseDate;
    if (input.companyId !== undefined) data.companyId = input.companyId;
    if (input.contactIds !== undefined) data.contactIds = input.contactIds;
    if (input.primaryContactId !== undefined) data.primaryContactId = input.primaryContactId;
    if (input.ownerId !== undefined) data.ownerId = input.ownerId;
    if (input.source !== undefined) data.source = input.source;
    if (input.competitors !== undefined) data.competitors = input.competitors;
    if (input.products !== undefined) data.products = input.products;
    if (input.tags !== undefined) data.tags = input.tags;
    if (input.customFields !== undefined) data.customFields = input.customFields;
    if (input.status !== undefined) data.status = input.status;
    if (input.lostReason !== undefined) data.lostReason = input.lostReason;
    if (input.actualCloseDate !== undefined) data.actualCloseDate = input.actualCloseDate;

    const record = await this.update(id, data, actorId);
    return this.mapToEntity(record);
  }

  /**
   * Update deal stage with history tracking
   */
  async updateStage(
    id: string,
    stage: string,
    probability?: number,
    actorId?: string
  ): Promise<Deal> {
    const current = await this.findByIdOrThrow(id);
    const now = new Date().toISOString();

    // Update stage history
    const history = current.stageHistory ?? [];
    const lastEntry = history[history.length - 1];
    if (lastEntry) {
      lastEntry.exitedAt = now;
    }
    history.push({
      stage,
      enteredAt: now,
      changedBy: actorId,
    });

    const data: Partial<NewDealRecord> = {
      stage,
      stageHistory: history,
    };

    if (probability !== undefined) {
      data.probability = probability;
    }

    const record = await this.update(id, data, actorId);
    return this.mapToEntity(record);
  }

  /**
   * Close a deal
   */
  async closeDeal(
    id: string,
    status: 'won' | 'lost',
    lostReason?: string,
    actorId?: string
  ): Promise<Deal> {
    const now = new Date().toISOString();
    const current = await this.findByIdOrThrow(id);

    // Update stage history
    const history = current.stageHistory ?? [];
    const lastEntry = history[history.length - 1];
    if (lastEntry) {
      lastEntry.exitedAt = now;
    }

    const closedStage = status === 'won' ? 'Closed Won' : 'Closed Lost';
    history.push({
      stage: closedStage,
      enteredAt: now,
      changedBy: actorId,
    });

    const data: Partial<NewDealRecord> = {
      status,
      stage: closedStage,
      stageHistory: history,
      actualCloseDate: now,
      probability: status === 'won' ? 100 : 0,
    };

    if (status === 'lost' && lostReason) {
      data.lostReason = lostReason;
    }

    const record = await this.update(id, data, actorId);
    return this.mapToEntity(record);
  }

  /**
   * Get deal as entity
   */
  async getDeal(id: string): Promise<Deal | null> {
    const record = await this.findById(id);
    return record ? this.mapToEntity(record) : null;
  }

  /**
   * List deals with filters
   */
  async listDeals(
    filter?: DealFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Deal>> {
    const result = await this.findAll(filter, pagination);
    return {
      ...result,
      data: result.data.map((r) => this.mapToEntity(r)),
    };
  }

  /**
   * Get pipeline summary
   */
  async getPipelineSummary(): Promise<{
    stages: Array<{ stage: string; count: number; totalValue: number }>;
    totalDeals: number;
    totalValue: number;
  }> {
    const allDeals = await this.db
      .select()
      .from(deals)
      .where(eq(deals.status, 'open'));

    const stageMap = new Map<string, { count: number; totalValue: number }>();
    let totalValue = 0;

    for (const deal of allDeals) {
      const stage = deal.stage;
      const value = deal.amountValue ? parseFloat(deal.amountValue) : 0;
      totalValue += value;

      const current = stageMap.get(stage) ?? { count: 0, totalValue: 0 };
      stageMap.set(stage, {
        count: current.count + 1,
        totalValue: current.totalValue + value,
      });
    }

    const stages = Array.from(stageMap.entries()).map(([stage, data]) => ({
      stage,
      ...data,
    }));

    return {
      stages,
      totalDeals: allDeals.length,
      totalValue,
    };
  }

  /**
   * Build filter conditions
   */
  protected buildFilterConditions(filter?: DealFilter): SQL[] | undefined {
    if (!filter) return undefined;

    const conditions: SQL[] = [];

    if (filter.status) {
      conditions.push(eq(deals.status, filter.status));
    }

    if (filter.stage) {
      conditions.push(eq(deals.stage, filter.stage));
    }

    if (filter.companyId) {
      conditions.push(eq(deals.companyId, filter.companyId));
    }

    if (filter.ownerId) {
      conditions.push(eq(deals.ownerId, filter.ownerId));
    }

    if (filter.minAmount !== undefined) {
      conditions.push(gte(deals.amountValue, filter.minAmount.toString()));
    }

    if (filter.maxAmount !== undefined) {
      conditions.push(lte(deals.amountValue, filter.maxAmount.toString()));
    }

    if (filter.search) {
      const searchCondition = ilike(deals.name, `%${filter.search}%`);
      conditions.push(searchCondition);
    }

    return conditions.length > 0 ? conditions : undefined;
  }

  /**
   * Map database record to entity
   */
  private mapToEntity(record: DealRecord): Deal {
    return {
      id: record.id,
      name: record.name,
      description: record.description ?? undefined,
      stage: record.stage,
      amount: record.amountValue
        ? {
            value: parseFloat(record.amountValue),
            currency: record.amountCurrency ?? 'USD',
          }
        : undefined,
      probability: record.probability ?? undefined,
      expectedCloseDate: record.expectedCloseDate
        ? new Date(record.expectedCloseDate)
        : undefined,
      actualCloseDate: record.actualCloseDate
        ? new Date(record.actualCloseDate)
        : undefined,
      companyId: record.companyId ?? undefined,
      contactIds: record.contactIds ?? [],
      primaryContactId: record.primaryContactId ?? undefined,
      ownerId: record.ownerId ?? undefined,
      source: record.source ?? undefined,
      lostReason: record.lostReason ?? undefined,
      competitors: record.competitors ?? [],
      products: record.products ?? undefined,
      tags: record.tags ?? [],
      customFields: record.customFields ?? {},
      stageHistory: record.stageHistory?.map((h) => ({
        ...h,
        enteredAt: new Date(h.enteredAt),
        exitedAt: h.exitedAt ? new Date(h.exitedAt) : undefined,
      })),
      status: record.status as Deal['status'],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy ?? undefined,
      updatedBy: record.updatedBy ?? undefined,
    };
  }
}
