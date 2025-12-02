/**
 * @rolodex/core
 *
 * Core entities, types, validation, and utilities for Rolodex CRM
 */

// Entity types
export * from './types/contact';
export * from './types/company';
export * from './types/deal';
export * from './types/activity';
export * from './types/task';
export * from './types/workflow';
export * from './types/common';

// Validation schemas
export * from './validation';

// Error classes
export * from './errors';

// Event system
export * from './events';

// Utilities
export * from './utils';

// Version
export const VERSION = '0.1.0';
