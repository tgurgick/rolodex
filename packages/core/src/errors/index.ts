/**
 * Custom error classes for Rolodex
 */

import { ZodError } from 'zod';

/**
 * Base error class for all Rolodex errors
 */
export class RolodexError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

/**
 * Validation error - thrown when input validation fails
 */
export class ValidationError extends RolodexError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(
    errors: Array<{ field: string; message: string }>,
    message: string = 'Validation failed'
  ) {
    super(message, 'VALIDATION_ERROR', 400, { errors });
    this.errors = errors;
  }

  static fromZodError(zodError: ZodError): ValidationError {
    const errors = zodError.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return new ValidationError(errors);
  }
}

/**
 * Not found error - thrown when a resource is not found
 */
export class NotFoundError extends RolodexError {
  public readonly resourceType: string;
  public readonly resourceId: string;

  constructor(resourceType: string, resourceId: string) {
    super(
      `${resourceType} with id '${resourceId}' not found`,
      'NOT_FOUND',
      404,
      { resourceType, resourceId }
    );
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * Duplicate error - thrown when attempting to create a duplicate resource
 */
export class DuplicateError extends RolodexError {
  public readonly field: string;
  public readonly value: string;

  constructor(resourceType: string, field: string, value: string) {
    super(
      `${resourceType} with ${field} '${value}' already exists`,
      'DUPLICATE_ERROR',
      409,
      { resourceType, field, value }
    );
    this.field = field;
    this.value = value;
  }
}

/**
 * Authentication error - thrown when authentication fails
 */
export class AuthenticationError extends RolodexError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

/**
 * Authorization error - thrown when user lacks permission
 */
export class AuthorizationError extends RolodexError {
  public readonly action: string;
  public readonly resource: string;

  constructor(action: string, resource: string) {
    super(
      `You do not have permission to ${action} this ${resource}`,
      'AUTHORIZATION_ERROR',
      403,
      { action, resource }
    );
    this.action = action;
    this.resource = resource;
  }
}

/**
 * Rate limit error - thrown when rate limit is exceeded
 */
export class RateLimitError extends RolodexError {
  public readonly retryAfter: number;

  constructor(retryAfter: number = 60) {
    super(
      `Rate limit exceeded. Try again in ${retryAfter} seconds`,
      'RATE_LIMIT_ERROR',
      429,
      { retryAfter }
    );
    this.retryAfter = retryAfter;
  }
}

/**
 * Conflict error - thrown when there's a state conflict
 */
export class ConflictError extends RolodexError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFLICT_ERROR', 409, details);
  }
}

/**
 * Approval required error - thrown when human approval is needed
 */
export class ApprovalRequiredError extends RolodexError {
  public readonly approvalId: string;
  public readonly operation: string;

  constructor(approvalId: string, operation: string) {
    super(
      `Human approval required for operation: ${operation}`,
      'APPROVAL_REQUIRED',
      202,
      { approvalId, operation }
    );
    this.approvalId = approvalId;
    this.operation = operation;
  }
}

/**
 * Database error - thrown when a database operation fails
 */
export class DatabaseError extends RolodexError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', 500, details);
  }
}

/**
 * External service error - thrown when an external service fails
 */
export class ExternalServiceError extends RolodexError {
  public readonly service: string;

  constructor(service: string, message: string) {
    super(
      `External service error (${service}): ${message}`,
      'EXTERNAL_SERVICE_ERROR',
      502,
      { service }
    );
    this.service = service;
  }
}

/**
 * Configuration error - thrown when configuration is invalid
 */
export class ConfigurationError extends RolodexError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR', 500);
  }
}

/**
 * Check if an error is a RolodexError
 */
export function isRolodexError(error: unknown): error is RolodexError {
  return error instanceof RolodexError;
}

/**
 * Wrap unknown errors in a RolodexError
 */
export function wrapError(error: unknown): RolodexError {
  if (isRolodexError(error)) {
    return error;
  }

  if (error instanceof ZodError) {
    return ValidationError.fromZodError(error);
  }

  if (error instanceof Error) {
    return new RolodexError(error.message, 'INTERNAL_ERROR', 500);
  }

  return new RolodexError(String(error), 'INTERNAL_ERROR', 500);
}
