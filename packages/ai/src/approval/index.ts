/**
 * Human Approval System for AI Operations
 *
 * This module provides a human-in-the-loop approval system for sensitive
 * AI operations. Destructive or high-risk operations require explicit
 * human approval before execution.
 */

import { randomUUID } from 'crypto';

export type ApprovalAction =
  | 'delete_contact'
  | 'delete_company'
  | 'delete_deal'
  | 'bulk_delete'
  | 'bulk_update'
  | 'export_data'
  | 'import_data'
  | 'merge_records'
  | 'close_deal'
  | 'update_consent';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface ApprovalRequest {
  id: string;
  action: ApprovalAction;
  resourceType: 'contact' | 'company' | 'deal' | 'activity';
  resourceId?: string;
  resourceIds?: string[];
  description: string;
  requestedBy: string;
  requestedAt: Date;
  expiresAt: Date;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  metadata?: Record<string, unknown>;
}

export interface ApprovalConfig {
  /** Actions that require approval */
  requiresApproval: ApprovalAction[];
  /** Default expiration time in minutes */
  expirationMinutes: number;
  /** Callback when approval is requested */
  onApprovalRequested?: (request: ApprovalRequest) => Promise<void>;
  /** Callback when approval is completed */
  onApprovalCompleted?: (request: ApprovalRequest) => Promise<void>;
}

const DEFAULT_CONFIG: ApprovalConfig = {
  requiresApproval: [
    'delete_contact',
    'delete_company',
    'delete_deal',
    'bulk_delete',
    'bulk_update',
    'export_data',
    'merge_records',
  ],
  expirationMinutes: 60,
};

/**
 * In-memory store for approval requests
 * In production, this would be backed by a database
 */
const pendingApprovals = new Map<string, ApprovalRequest>();

let config: ApprovalConfig = { ...DEFAULT_CONFIG };

/**
 * Configure the approval system
 */
export function configureApprovalSystem(newConfig: Partial<ApprovalConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Check if an action requires approval
 */
export function requiresApproval(action: ApprovalAction): boolean {
  return config.requiresApproval.includes(action);
}

/**
 * Create an approval request
 */
export async function createApprovalRequest(
  action: ApprovalAction,
  resourceType: ApprovalRequest['resourceType'],
  description: string,
  requestedBy: string,
  options?: {
    resourceId?: string;
    resourceIds?: string[];
    metadata?: Record<string, unknown>;
    expirationMinutes?: number;
  }
): Promise<ApprovalRequest> {
  const expirationMinutes = options?.expirationMinutes ?? config.expirationMinutes;
  const now = new Date();

  const request: ApprovalRequest = {
    id: randomUUID(),
    action,
    resourceType,
    resourceId: options?.resourceId,
    resourceIds: options?.resourceIds,
    description,
    requestedBy,
    requestedAt: now,
    expiresAt: new Date(now.getTime() + expirationMinutes * 60 * 1000),
    status: 'pending',
    metadata: options?.metadata,
  };

  pendingApprovals.set(request.id, request);

  if (config.onApprovalRequested) {
    await config.onApprovalRequested(request);
  }

  return request;
}

/**
 * Get a pending approval request
 */
export function getApprovalRequest(id: string): ApprovalRequest | undefined {
  const request = pendingApprovals.get(id);

  if (request && request.status === 'pending' && new Date() > request.expiresAt) {
    request.status = 'expired';
    pendingApprovals.set(id, request);
  }

  return request;
}

/**
 * List all pending approval requests
 */
export function listPendingApprovals(): ApprovalRequest[] {
  const now = new Date();
  const pending: ApprovalRequest[] = [];

  for (const request of pendingApprovals.values()) {
    if (request.status === 'pending') {
      if (now > request.expiresAt) {
        request.status = 'expired';
        pendingApprovals.set(request.id, request);
      } else {
        pending.push(request);
      }
    }
  }

  return pending.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
}

/**
 * Approve a request
 */
export async function approveRequest(
  id: string,
  reviewedBy: string,
  notes?: string
): Promise<ApprovalRequest> {
  const request = getApprovalRequest(id);

  if (!request) {
    throw new Error(`Approval request ${id} not found`);
  }

  if (request.status !== 'pending') {
    throw new Error(`Approval request ${id} is ${request.status}, cannot approve`);
  }

  request.status = 'approved';
  request.reviewedBy = reviewedBy;
  request.reviewedAt = new Date();
  request.reviewNotes = notes;

  pendingApprovals.set(id, request);

  if (config.onApprovalCompleted) {
    await config.onApprovalCompleted(request);
  }

  return request;
}

/**
 * Reject a request
 */
export async function rejectRequest(
  id: string,
  reviewedBy: string,
  notes?: string
): Promise<ApprovalRequest> {
  const request = getApprovalRequest(id);

  if (!request) {
    throw new Error(`Approval request ${id} not found`);
  }

  if (request.status !== 'pending') {
    throw new Error(`Approval request ${id} is ${request.status}, cannot reject`);
  }

  request.status = 'rejected';
  request.reviewedBy = reviewedBy;
  request.reviewedAt = new Date();
  request.reviewNotes = notes;

  pendingApprovals.set(id, request);

  if (config.onApprovalCompleted) {
    await config.onApprovalCompleted(request);
  }

  return request;
}

/**
 * Check if an operation can proceed (either doesn't need approval or is approved)
 */
export async function checkApproval(
  action: ApprovalAction,
  approvalId?: string
): Promise<{ allowed: boolean; reason?: string; request?: ApprovalRequest }> {
  // If action doesn't require approval, allow
  if (!requiresApproval(action)) {
    return { allowed: true };
  }

  // If no approval ID provided, need to create request
  if (!approvalId) {
    return {
      allowed: false,
      reason: `Action "${action}" requires human approval. Please create an approval request first.`,
    };
  }

  const request = getApprovalRequest(approvalId);

  if (!request) {
    return {
      allowed: false,
      reason: `Approval request ${approvalId} not found.`,
    };
  }

  if (request.action !== action) {
    return {
      allowed: false,
      reason: `Approval request ${approvalId} is for action "${request.action}", not "${action}".`,
      request,
    };
  }

  switch (request.status) {
    case 'approved':
      return { allowed: true, request };
    case 'pending':
      return {
        allowed: false,
        reason: `Approval request ${approvalId} is still pending review.`,
        request,
      };
    case 'rejected':
      return {
        allowed: false,
        reason: `Approval request ${approvalId} was rejected.${request.reviewNotes ? ` Reason: ${request.reviewNotes}` : ''}`,
        request,
      };
    case 'expired':
      return {
        allowed: false,
        reason: `Approval request ${approvalId} has expired. Please create a new request.`,
        request,
      };
    default:
      return {
        allowed: false,
        reason: `Unknown approval status.`,
        request,
      };
  }
}

/**
 * Format an approval request for display
 */
export function formatApprovalRequest(request: ApprovalRequest): string {
  const lines: string[] = [
    `## Approval Request: ${request.id}`,
    '',
    `**Action:** ${request.action}`,
    `**Resource Type:** ${request.resourceType}`,
  ];

  if (request.resourceId) {
    lines.push(`**Resource ID:** ${request.resourceId}`);
  }
  if (request.resourceIds && request.resourceIds.length > 0) {
    lines.push(`**Resource IDs:** ${request.resourceIds.length} items`);
  }

  lines.push(
    '',
    `**Description:** ${request.description}`,
    '',
    `**Status:** ${request.status.toUpperCase()}`,
    `**Requested By:** ${request.requestedBy}`,
    `**Requested At:** ${request.requestedAt.toISOString()}`,
    `**Expires At:** ${request.expiresAt.toISOString()}`
  );

  if (request.reviewedBy) {
    lines.push(
      '',
      `**Reviewed By:** ${request.reviewedBy}`,
      `**Reviewed At:** ${request.reviewedAt?.toISOString()}`
    );
    if (request.reviewNotes) {
      lines.push(`**Notes:** ${request.reviewNotes}`);
    }
  }

  return lines.join('\n');
}

/**
 * Clear all approvals (for testing)
 */
export function clearApprovals(): void {
  pendingApprovals.clear();
}
