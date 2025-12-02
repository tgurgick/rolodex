/**
 * Tests for error classes
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  RolodexError,
  ValidationError,
  NotFoundError,
  DuplicateError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  ApprovalRequiredError,
  isRolodexError,
  wrapError,
} from './index';

describe('Error Classes', () => {
  describe('RolodexError', () => {
    it('should create a base error with correct properties', () => {
      const error = new RolodexError('Test error', 'TEST_ERROR', 500, { key: 'value' });

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ key: 'value' });
      expect(error.name).toBe('RolodexError');
    });

    it('should serialize to JSON correctly', () => {
      const error = new RolodexError('Test error', 'TEST_ERROR', 400);
      const json = error.toJSON();

      expect(json).toEqual({
        error: {
          name: 'RolodexError',
          code: 'TEST_ERROR',
          message: 'Test error',
          details: undefined,
        },
      });
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error with field errors', () => {
      const errors = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'firstName', message: 'Required' },
      ];

      const error = new ValidationError(errors);

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.errors).toEqual(errors);
    });

    it('should create from Zod error', () => {
      const schema = z.object({
        email: z.string().email(),
        name: z.string().min(1),
      });

      const result = schema.safeParse({ email: 'invalid', name: '' });
      if (!result.success) {
        const error = ValidationError.fromZodError(result.error);

        expect(error).toBeInstanceOf(ValidationError);
        expect(error.errors.length).toBe(2);
        expect(error.errors.some((e) => e.field === 'email')).toBe(true);
        expect(error.errors.some((e) => e.field === 'name')).toBe(true);
      }
    });
  });

  describe('NotFoundError', () => {
    it('should create a not found error with resource info', () => {
      const error = new NotFoundError('Contact', '123');

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.resourceType).toBe('Contact');
      expect(error.resourceId).toBe('123');
      expect(error.message).toBe("Contact with id '123' not found");
    });
  });

  describe('DuplicateError', () => {
    it('should create a duplicate error', () => {
      const error = new DuplicateError('Contact', 'email', 'john@example.com');

      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('DUPLICATE_ERROR');
      expect(error.field).toBe('email');
      expect(error.value).toBe('john@example.com');
    });
  });

  describe('AuthenticationError', () => {
    it('should create an authentication error', () => {
      const error = new AuthenticationError();

      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.message).toBe('Authentication required');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid token');

      expect(error.message).toBe('Invalid token');
    });
  });

  describe('AuthorizationError', () => {
    it('should create an authorization error', () => {
      const error = new AuthorizationError('delete', 'contact');

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.action).toBe('delete');
      expect(error.resource).toBe('contact');
    });
  });

  describe('RateLimitError', () => {
    it('should create a rate limit error', () => {
      const error = new RateLimitError(120);

      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.retryAfter).toBe(120);
    });
  });

  describe('ApprovalRequiredError', () => {
    it('should create an approval required error', () => {
      const error = new ApprovalRequiredError('approval-123', 'delete_contact');

      expect(error.statusCode).toBe(202);
      expect(error.code).toBe('APPROVAL_REQUIRED');
      expect(error.approvalId).toBe('approval-123');
      expect(error.operation).toBe('delete_contact');
    });
  });

  describe('isRolodexError', () => {
    it('should return true for RolodexError', () => {
      const error = new RolodexError('Test', 'TEST', 500);
      expect(isRolodexError(error)).toBe(true);
    });

    it('should return true for subclasses', () => {
      const error = new NotFoundError('Contact', '123');
      expect(isRolodexError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Test');
      expect(isRolodexError(error)).toBe(false);
    });

    it('should return false for non-errors', () => {
      expect(isRolodexError('string')).toBe(false);
      expect(isRolodexError(null)).toBe(false);
      expect(isRolodexError(undefined)).toBe(false);
    });
  });

  describe('wrapError', () => {
    it('should return RolodexError as-is', () => {
      const original = new NotFoundError('Contact', '123');
      const wrapped = wrapError(original);

      expect(wrapped).toBe(original);
    });

    it('should convert Zod error to ValidationError', () => {
      const schema = z.object({ email: z.string().email() });
      const result = schema.safeParse({ email: 'invalid' });

      if (!result.success) {
        const wrapped = wrapError(result.error);

        expect(wrapped).toBeInstanceOf(ValidationError);
      }
    });

    it('should wrap regular Error', () => {
      const error = new Error('Something went wrong');
      const wrapped = wrapError(error);

      expect(wrapped).toBeInstanceOf(RolodexError);
      expect(wrapped.message).toBe('Something went wrong');
      expect(wrapped.code).toBe('INTERNAL_ERROR');
    });

    it('should wrap string errors', () => {
      const wrapped = wrapError('Something went wrong');

      expect(wrapped).toBeInstanceOf(RolodexError);
      expect(wrapped.message).toBe('Something went wrong');
    });
  });
});
