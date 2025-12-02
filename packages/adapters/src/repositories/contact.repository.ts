/**
 * Contact repository
 */

import { eq, ilike, or, SQL } from 'drizzle-orm';
import type { EmailAddress, PhoneNumber } from '@rolodex/core';
import { contacts, ContactRecord, NewContactRecord } from '../db/schema';
import { BaseRepository, PaginatedResult, PaginationOptions } from './base';
import { Contact, CreateContactInput, UpdateContactInput, DuplicateError } from '@rolodex/core';
import { Database } from '../db/connection';

export interface ContactFilter {
  status?: string;
  companyId?: string;
  ownerId?: string;
  tags?: string[];
  search?: string;
}

export class ContactRepository extends BaseRepository<
  typeof contacts,
  ContactRecord,
  NewContactRecord,
  Partial<NewContactRecord>,
  ContactFilter
> {
  protected table = contacts;
  protected entityName = 'Contact';

  constructor(db?: Database) {
    super(db);
  }

  /**
   * Find contact by email
   */
  async findByEmail(email: string): Promise<ContactRecord | null> {
    const results = await this.db
      .select()
      .from(contacts)
      .where(eq(contacts.email, email.toLowerCase()))
      .limit(1);

    return results[0] ?? null;
  }

  /**
   * Create a contact with duplicate check
   */
  async createContact(input: CreateContactInput, actorId?: string): Promise<Contact> {
    // Check for duplicate email
    const existing = await this.findByEmail(input.email);
    if (existing) {
      throw new DuplicateError('Contact', 'email', input.email);
    }

    const record = await this.create(
      {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email.toLowerCase(),
        phone: input.phone,
        emails: input.emails,
        phones: input.phones,
        title: input.title,
        department: input.department,
        companyId: input.companyId,
        address: input.address,
        socialProfiles: input.socialProfiles,
        tags: input.tags ?? [],
        customFields: input.customFields ?? {},
        source: input.source,
        ownerId: input.ownerId,
        notes: input.notes,
        consent: input.consent,
        doNotContact: input.doNotContact ?? false,
        status: 'active',
      },
      actorId
    );

    return this.mapToEntity(record);
  }

  /**
   * Update a contact
   */
  async updateContact(
    id: string,
    input: UpdateContactInput,
    actorId?: string
  ): Promise<Contact> {
    // If email is being changed, check for duplicates
    if (input.email) {
      const existing = await this.findByEmail(input.email);
      if (existing && existing.id !== id) {
        throw new DuplicateError('Contact', 'email', input.email);
      }
    }

    const data: Partial<NewContactRecord> = {};

    if (input.firstName !== undefined) data.firstName = input.firstName;
    if (input.lastName !== undefined) data.lastName = input.lastName;
    if (input.email !== undefined) data.email = input.email.toLowerCase();
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.emails !== undefined) data.emails = input.emails;
    if (input.phones !== undefined) data.phones = input.phones;
    if (input.title !== undefined) data.title = input.title;
    if (input.department !== undefined) data.department = input.department;
    if (input.companyId !== undefined) data.companyId = input.companyId;
    if (input.address !== undefined) data.address = input.address;
    if (input.socialProfiles !== undefined) data.socialProfiles = input.socialProfiles;
    if (input.tags !== undefined) data.tags = input.tags;
    if (input.customFields !== undefined) data.customFields = input.customFields;
    if (input.source !== undefined) data.source = input.source;
    if (input.ownerId !== undefined) data.ownerId = input.ownerId;
    if (input.notes !== undefined) data.notes = input.notes;
    if (input.consent !== undefined) data.consent = input.consent;
    if (input.doNotContact !== undefined) data.doNotContact = input.doNotContact;
    if (input.status !== undefined) data.status = input.status;

    const record = await this.update(id, data, actorId);
    return this.mapToEntity(record);
  }

  /**
   * Get contact as entity
   */
  async getContact(id: string): Promise<Contact | null> {
    const record = await this.findById(id);
    return record ? this.mapToEntity(record) : null;
  }

  /**
   * List contacts with filters
   */
  async listContacts(
    filter?: ContactFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Contact>> {
    const result = await this.findAll(filter, pagination);
    return {
      ...result,
      data: result.data.map((r) => this.mapToEntity(r)),
    };
  }

  /**
   * Build filter conditions
   */
  protected buildFilterConditions(filter?: ContactFilter): SQL[] | undefined {
    if (!filter) return undefined;

    const conditions: SQL[] = [];

    if (filter.status) {
      conditions.push(eq(contacts.status, filter.status));
    }

    if (filter.companyId) {
      conditions.push(eq(contacts.companyId, filter.companyId));
    }

    if (filter.ownerId) {
      conditions.push(eq(contacts.ownerId, filter.ownerId));
    }

    if (filter.search) {
      const searchCondition = or(
        ilike(contacts.firstName, `%${filter.search}%`),
        ilike(contacts.lastName, `%${filter.search}%`),
        ilike(contacts.email, `%${filter.search}%`)
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    return conditions.length > 0 ? conditions : undefined;
  }

  /**
   * Map database record to entity
   */
  private mapToEntity(record: ContactRecord): Contact {
    return {
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      emails: record.emails as EmailAddress[] | undefined,
      phone: record.phone ?? undefined,
      phones: record.phones as PhoneNumber[] | undefined,
      title: record.title ?? undefined,
      department: record.department ?? undefined,
      companyId: record.companyId ?? undefined,
      address: record.address ?? undefined,
      socialProfiles: record.socialProfiles ?? undefined,
      tags: record.tags ?? [],
      customFields: record.customFields ?? {},
      source: record.source ?? undefined,
      ownerId: record.ownerId ?? undefined,
      status: record.status as 'active' | 'inactive' | 'archived',
      notes: record.notes ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy ?? undefined,
      updatedBy: record.updatedBy ?? undefined,
    };
  }
}
