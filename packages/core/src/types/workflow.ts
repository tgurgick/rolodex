/**
 * Workflow entity type definitions
 */

import type { BaseEntity } from './common';

export type TriggerType = 'event' | 'schedule' | 'manual' | 'webhook';
export type EntityType = 'contact' | 'company' | 'deal' | 'activity' | 'task';
export type EventAction = 'created' | 'updated' | 'deleted' | 'stage_changed';
export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'
  | 'in'
  | 'not_in';

export type ActionType =
  | 'update_record'
  | 'create_record'
  | 'delete_record'
  | 'send_email'
  | 'send_notification'
  | 'create_task'
  | 'assign_owner'
  | 'add_tag'
  | 'remove_tag'
  | 'http_request'
  | 'delay'
  | 'condition'
  | 'ai_analyze';

export type ErrorHandlingStrategy = 'stop' | 'continue' | 'retry';

export interface Condition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
}

export interface Conditions {
  all?: Condition[];
  any?: Condition[];
}

export interface EventTrigger {
  entity: EntityType;
  action: EventAction;
  conditions?: Conditions;
}

export interface ScheduleTrigger {
  cron: string;
  timezone?: string;
}

export interface WebhookTrigger {
  path: string;
  method: 'POST' | 'GET';
  secret?: string;
}

export interface WorkflowTrigger {
  type: TriggerType;
  event?: EventTrigger;
  schedule?: ScheduleTrigger;
  webhook?: WebhookTrigger;
}

export interface WorkflowAction {
  id?: string;
  type: ActionType;
  config?: Record<string, unknown>;
  onSuccess?: WorkflowAction[];
  onFailure?: WorkflowAction[];
}

export interface ErrorHandling {
  onError: ErrorHandlingStrategy;
  maxRetries?: number;
  retryDelay?: number;
  notifyOnError?: boolean;
}

export interface Workflow extends BaseEntity {
  name: string;
  description?: string;
  enabled: boolean;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  errorHandling?: ErrorHandling;
  tags?: string[];
}

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  enabled?: boolean;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  errorHandling?: ErrorHandling;
  tags?: string[];
}

export interface UpdateWorkflowInput extends Partial<CreateWorkflowInput> {}
