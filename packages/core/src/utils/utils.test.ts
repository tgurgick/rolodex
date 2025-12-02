/**
 * Tests for utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  generateId,
  isValidUUID,
  deepClone,
  diff,
  pick,
  omit,
  truncate,
  normalizeEmail,
  mask,
  maskEmail,
  maskPhone,
  paginate,
} from './index';

describe('Utility Functions', () => {
  describe('generateId', () => {
    it('should generate a valid UUID', () => {
      const id = generateId();
      expect(isValidUUID(id)).toBe(true);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(1000);
    });
  });

  describe('isValidUUID', () => {
    it('should return true for valid UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should return false for invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(null)).toBe(null);
    });

    it('should clone objects deeply', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
    });

    it('should clone arrays deeply', () => {
      const original = [1, [2, 3], { a: 4 }];
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[1]).not.toBe(original[1]);
    });

    it('should clone dates', () => {
      const original = new Date('2024-01-01');
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });
  });

  describe('diff', () => {
    it('should return empty object for identical objects', () => {
      const obj = { a: 1, b: 2 };
      expect(diff(obj, obj)).toEqual({});
    });

    it('should return changed fields', () => {
      const before = { a: 1, b: 2, c: 3 };
      const after = { a: 1, b: 5, c: 3 };

      expect(diff(before, after)).toEqual({ b: 5 });
    });

    it('should detect added fields', () => {
      const before = { a: 1 } as Record<string, number>;
      const after = { a: 1, b: 2 };

      expect(diff(before, after)).toEqual({ b: 2 });
    });

    it('should detect nested changes', () => {
      const before = { a: { b: 1 } };
      const after = { a: { b: 2 } };

      expect(diff(before, after)).toEqual({ a: { b: 2 } });
    });
  });

  describe('pick', () => {
    it('should pick specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('should ignore missing keys', () => {
      const obj = { a: 1, b: 2 };
      expect(pick(obj, ['a', 'c' as keyof typeof obj])).toEqual({ a: 1 });
    });
  });

  describe('omit', () => {
    it('should omit specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('truncate', () => {
    it('should not truncate short strings', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should truncate long strings', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
    });

    it('should use custom suffix', () => {
      expect(truncate('hello world', 8, '…')).toBe('hello w…');
    });
  });

  describe('normalizeEmail', () => {
    it('should lowercase and trim email', () => {
      expect(normalizeEmail('  JOHN@EXAMPLE.COM  ')).toBe('john@example.com');
    });
  });

  describe('mask', () => {
    it('should mask middle of string', () => {
      expect(mask('1234567890', 3)).toBe('123****890');
    });

    it('should mask entire short strings', () => {
      expect(mask('abc', 3)).toBe('***');
    });
  });

  describe('maskEmail', () => {
    it('should mask local part of email', () => {
      expect(maskEmail('john.doe@example.com')).toBe('jo****oe@example.com');
    });
  });

  describe('maskPhone', () => {
    it('should show only last 4 digits', () => {
      expect(maskPhone('+1 (555) 123-4567')).toBe('*******4567');
    });
  });

  describe('paginate', () => {
    it('should paginate array', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      const page1 = paginate(items, 1, 3);
      expect(page1.data).toEqual([1, 2, 3]);
      expect(page1.total).toBe(10);
      expect(page1.page).toBe(1);
      expect(page1.limit).toBe(3);
      expect(page1.totalPages).toBe(4);

      const page2 = paginate(items, 2, 3);
      expect(page2.data).toEqual([4, 5, 6]);

      const page4 = paginate(items, 4, 3);
      expect(page4.data).toEqual([10]);
    });

    it('should handle empty array', () => {
      const result = paginate([], 1, 10);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });
});
