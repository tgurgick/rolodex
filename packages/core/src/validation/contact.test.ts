/**
 * Tests for contact validation schemas
 */

import { describe, it, expect } from 'vitest';
import { createContactSchema, updateContactSchema, contactFilterSchema } from './contact';

describe('Contact Validation', () => {
  describe('createContactSchema', () => {
    it('should validate a minimal valid contact', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const result = createContactSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.firstName).toBe('John');
        expect(result.data.lastName).toBe('Doe');
        expect(result.data.email).toBe('john@example.com');
        expect(result.data.tags).toEqual([]);
        expect(result.data.customFields).toEqual({});
      }
    });

    it('should normalize email to lowercase', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'JOHN@EXAMPLE.COM',
      };

      const result = createContactSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('john@example.com');
      }
    });

    it('should validate a full contact', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        title: 'VP of Engineering',
        department: 'Engineering',
        address: {
          street1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94102',
          country: 'USA',
        },
        tags: ['enterprise', 'technical'],
        customFields: { priority: 'high' },
        source: 'website',
        notes: 'Met at conference',
        doNotContact: false,
      };

      const result = createContactSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject empty firstName', () => {
      const input = {
        firstName: '',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const result = createContactSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
      };

      const result = createContactSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone format', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: 'not-a-phone',
      };

      const result = createContactSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should validate multiple emails', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        emails: [
          { email: 'john@work.com', type: 'work', primary: true },
          { email: 'john@personal.com', type: 'personal' },
        ],
      };

      const result = createContactSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject unknown properties in strict mode', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        unknownField: 'value',
      };

      const result = createContactSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should validate consent object', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        consent: {
          dataProcessing: true,
          marketingEmail: false,
          aiProcessing: true,
          consentDate: '2024-01-01T00:00:00Z',
          consentSource: 'signup_form',
        },
      };

      const result = createContactSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('updateContactSchema', () => {
    it('should allow partial updates', () => {
      const input = {
        firstName: 'Jane',
      };

      const result = updateContactSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should allow status update', () => {
      const input = {
        status: 'archived',
      };

      const result = updateContactSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const input = {
        status: 'invalid',
      };

      const result = updateContactSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('contactFilterSchema', () => {
    it('should validate empty filter', () => {
      const result = contactFilterSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate filter with status', () => {
      const result = contactFilterSchema.safeParse({ status: 'active' });
      expect(result.success).toBe(true);
    });

    it('should validate filter with multiple criteria', () => {
      const input = {
        status: 'active',
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        tags: ['enterprise'],
        search: 'john',
      };

      const result = contactFilterSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });
});
