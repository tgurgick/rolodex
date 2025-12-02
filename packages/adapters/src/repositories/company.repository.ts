/**
 * Company repository
 */

import { eq, ilike, or, SQL } from 'drizzle-orm';
import { companies, CompanyRecord, NewCompanyRecord } from '../db/schema';
import { BaseRepository, PaginatedResult, PaginationOptions } from './base';
import { Company, CreateCompanyInput, UpdateCompanyInput, DuplicateError } from '@rolodex/core';
import { Database } from '../db/connection';

export interface CompanyFilter {
  status?: string;
  industry?: string;
  size?: string;
  ownerId?: string;
  tags?: string[];
  search?: string;
}

export class CompanyRepository extends BaseRepository<
  typeof companies,
  CompanyRecord,
  NewCompanyRecord,
  Partial<NewCompanyRecord>,
  CompanyFilter
> {
  protected table = companies;
  protected entityName = 'Company';

  constructor(db?: Database) {
    super(db);
  }

  /**
   * Find company by domain
   */
  async findByDomain(domain: string): Promise<CompanyRecord | null> {
    const results = await this.db
      .select()
      .from(companies)
      .where(eq(companies.domain, domain.toLowerCase()))
      .limit(1);

    return results[0] ?? null;
  }

  /**
   * Create a company
   */
  async createCompany(input: CreateCompanyInput, actorId?: string): Promise<Company> {
    // Check for duplicate domain if provided
    if (input.domain) {
      const existing = await this.findByDomain(input.domain);
      if (existing) {
        throw new DuplicateError('Company', 'domain', input.domain);
      }
    }

    const record = await this.create(
      {
        name: input.name,
        domain: input.domain?.toLowerCase(),
        website: input.website,
        industry: input.industry,
        size: input.size,
        revenueAmount: input.revenue?.value?.toString(),
        revenueCurrency: input.revenue?.currency ?? 'USD',
        description: input.description,
        phone: input.phone,
        email: input.email?.toLowerCase(),
        address: input.address,
        socialProfiles: input.socialProfiles,
        tags: input.tags ?? [],
        customFields: input.customFields ?? {},
        parentCompanyId: input.parentCompanyId,
        ownerId: input.ownerId,
        status: 'prospect',
      },
      actorId
    );

    return this.mapToEntity(record);
  }

  /**
   * Update a company
   */
  async updateCompany(
    id: string,
    input: UpdateCompanyInput,
    actorId?: string
  ): Promise<Company> {
    // Check for duplicate domain if being changed
    if (input.domain) {
      const existing = await this.findByDomain(input.domain);
      if (existing && existing.id !== id) {
        throw new DuplicateError('Company', 'domain', input.domain);
      }
    }

    const data: Partial<NewCompanyRecord> = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.domain !== undefined) data.domain = input.domain?.toLowerCase();
    if (input.website !== undefined) data.website = input.website;
    if (input.industry !== undefined) data.industry = input.industry;
    if (input.size !== undefined) data.size = input.size;
    if (input.revenue !== undefined) {
      data.revenueAmount = input.revenue.value.toString();
      data.revenueCurrency = input.revenue.currency;
    }
    if (input.description !== undefined) data.description = input.description;
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.email !== undefined) data.email = input.email?.toLowerCase();
    if (input.address !== undefined) data.address = input.address;
    if (input.socialProfiles !== undefined) data.socialProfiles = input.socialProfiles;
    if (input.tags !== undefined) data.tags = input.tags;
    if (input.customFields !== undefined) data.customFields = input.customFields;
    if (input.parentCompanyId !== undefined) data.parentCompanyId = input.parentCompanyId;
    if (input.ownerId !== undefined) data.ownerId = input.ownerId;
    if (input.status !== undefined) data.status = input.status;

    const record = await this.update(id, data, actorId);
    return this.mapToEntity(record);
  }

  /**
   * Get company as entity
   */
  async getCompany(id: string): Promise<Company | null> {
    const record = await this.findById(id);
    return record ? this.mapToEntity(record) : null;
  }

  /**
   * List companies with filters
   */
  async listCompanies(
    filter?: CompanyFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Company>> {
    const result = await this.findAll(filter, pagination);
    return {
      ...result,
      data: result.data.map((r) => this.mapToEntity(r)),
    };
  }

  /**
   * Build filter conditions
   */
  protected buildFilterConditions(filter?: CompanyFilter): SQL[] | undefined {
    if (!filter) return undefined;

    const conditions: SQL[] = [];

    if (filter.status) {
      conditions.push(eq(companies.status, filter.status));
    }

    if (filter.industry) {
      conditions.push(eq(companies.industry, filter.industry));
    }

    if (filter.size) {
      conditions.push(eq(companies.size, filter.size));
    }

    if (filter.ownerId) {
      conditions.push(eq(companies.ownerId, filter.ownerId));
    }

    if (filter.search) {
      const searchCondition = or(
        ilike(companies.name, `%${filter.search}%`),
        ilike(companies.domain, `%${filter.search}%`)
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    return conditions.length > 0 ? conditions : undefined;
  }

  /**
   * Map database record to entity
   */
  private mapToEntity(record: CompanyRecord): Company {
    return {
      id: record.id,
      name: record.name,
      domain: record.domain ?? undefined,
      website: record.website ?? undefined,
      industry: record.industry ?? undefined,
      size: record.size as Company['size'],
      revenue: record.revenueAmount
        ? {
            value: parseFloat(record.revenueAmount),
            currency: record.revenueCurrency ?? 'USD',
          }
        : undefined,
      description: record.description ?? undefined,
      phone: record.phone ?? undefined,
      email: record.email ?? undefined,
      address: record.address ?? undefined,
      socialProfiles: record.socialProfiles ?? undefined,
      tags: record.tags ?? [],
      customFields: record.customFields ?? {},
      parentCompanyId: record.parentCompanyId ?? undefined,
      ownerId: record.ownerId ?? undefined,
      status: record.status as Company['status'],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy ?? undefined,
      updatedBy: record.updatedBy ?? undefined,
    };
  }
}
