/**
 * @rolodex/core
 *
 * Core entities, types, validation, and utilities for Rolodex CRM
 */

// Entity types (excluding Create/Update Input types - those come from validation)
export type {
  Contact,
  ContactStatus,
  EmailAddress,
  PhoneNumber,
} from './types/contact';

export type {
  Company,
  CompanyStatus,
  CompanySize,
} from './types/company';

export type {
  Deal,
  DealStatus,
  DealProduct,
  StageHistoryEntry,
} from './types/deal';

export type {
  Activity,
  ActivityType,
  ActivityStatus,
  CommunicationDirection,
  ActivityParticipant,
  ActivityAttachment,
} from './types/activity';

export type {
  Task,
  TaskStatus,
  TaskPriority,
  RecurrenceFrequency,
  TaskRecurrence,
} from './types/task';

export type {
  Workflow,
  WorkflowTrigger,
  WorkflowAction,
  TriggerType,
  EntityType,
  EventAction,
  ConditionOperator,
  ActionType,
  ErrorHandlingStrategy,
  Condition,
  Conditions,
  EventTrigger,
  ScheduleTrigger,
  WebhookTrigger,
  ErrorHandling,
} from './types/workflow';

export * from './types/common';

// Validation schemas (includes inferred Input types)
export * from './validation';

// Error classes
export * from './errors';

// Event system
export * from './events';

// Utilities
export * from './utils';

// Version
export const VERSION = '0.1.0';
