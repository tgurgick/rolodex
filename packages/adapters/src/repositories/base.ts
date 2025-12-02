/**
 * Base repository with common CRUD operations
 */

import { eq, and, or, ilike, sql, SQL, desc, asc } from 'drizzle-orm';
import { PgTable, PgColumn, TableConfig } from 'drizzle-orm/pg-core';
import { Database, getDatabase } from '../db/connection';
import { NotFoundError, DatabaseError } from '@rolodex/core';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BaseFilter {
  search?: string;
}

export abstract class BaseRepository<
  TTable extends PgTable<TableConfig>,
  TRecord,
  TCreateInput,
  TUpdateInput,
  TFilter extends BaseFilter = BaseFilter
> {
  protected db: Database;
  protected abstract table: TTable;
  protected abstract entityName: string;

  constructor(db?: Database) {
    this.db = db ?? getDatabase();
  }

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<TRecord | null> {
    try {
      const idColumn = (this.table as unknown as { id: PgColumn<unknown> }).id;
      const results = await this.db
        .select()
        .from(this.table)
        .where(eq(idColumn, id))
        .limit(1);

      return (results[0] as TRecord) ?? null;
    } catch (error) {
      throw new DatabaseError(`Failed to find ${this.entityName}: ${error}`);
    }
  }

  /**
   * Find a record by ID or throw NotFoundError
   */
  async findByIdOrThrow(id: string): Promise<TRecord> {
    const record = await this.findById(id);
    if (!record) {
      throw new NotFoundError(this.entityName, id);
    }
    return record;
  }

  /**
   * Find all records with optional pagination
   */
  async findAll(
    filter?: TFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<TRecord>> {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination ?? {};
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = this.buildFilterConditions(filter);

      // Get total count
      const countResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(this.table)
        .where(conditions ? and(...conditions) : undefined);

      const total = Number(countResult[0]?.count ?? 0);

      // Get paginated results
      const sortColumn = (this.table as unknown as Record<string, PgColumn<unknown>>)[sortBy];
      const orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

      const results = await this.db
        .select()
        .from(this.table)
        .where(conditions ? and(...conditions) : undefined)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      return {
        data: results as TRecord[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new DatabaseError(`Failed to find ${this.entityName}s: ${error}`);
    }
  }

  /**
   * Create a new record
   */
  async create(input: TCreateInput, actorId?: string): Promise<TRecord> {
    try {
      const now = new Date();
      const data = {
        ...input,
        createdAt: now,
        updatedAt: now,
        createdBy: actorId,
        updatedBy: actorId,
      };

      const results = await this.db
        .insert(this.table)
        .values(data as unknown as TTable['$inferInsert'])
        .returning();

      return results[0] as TRecord;
    } catch (error) {
      throw new DatabaseError(`Failed to create ${this.entityName}: ${error}`);
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, input: TUpdateInput, actorId?: string): Promise<TRecord> {
    try {
      const idColumn = (this.table as unknown as { id: PgColumn<unknown> }).id;
      const data = {
        ...input,
        updatedAt: new Date(),
        updatedBy: actorId,
      };

      const results = await this.db
        .update(this.table)
        .set(data as unknown as Partial<TTable['$inferInsert']>)
        .where(eq(idColumn, id))
        .returning();

      if (results.length === 0) {
        throw new NotFoundError(this.entityName, id);
      }

      return results[0] as TRecord;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to update ${this.entityName}: ${error}`);
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const idColumn = (this.table as unknown as { id: PgColumn<unknown> }).id;
      const results = await this.db
        .delete(this.table)
        .where(eq(idColumn, id))
        .returning({ id: idColumn });

      if (results.length === 0) {
        throw new NotFoundError(this.entityName, id);
      }
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to delete ${this.entityName}: ${error}`);
    }
  }

  /**
   * Check if a record exists
   */
  async exists(id: string): Promise<boolean> {
    const record = await this.findById(id);
    return record !== null;
  }

  /**
   * Build filter conditions for queries
   * Override in subclasses to add entity-specific filters
   */
  protected buildFilterConditions(_filter?: TFilter): SQL[] | undefined {
    return undefined;
  }

  /**
   * Helper to create search conditions
   */
  protected buildSearchCondition(
    searchTerm: string,
    columns: PgColumn<unknown>[]
  ): SQL {
    const conditions = columns.map((col) => ilike(col, `%${searchTerm}%`));
    return or(...conditions) as SQL;
  }
}
