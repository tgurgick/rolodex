/**
 * Authentication middleware
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticationError, AuthorizationError } from '@rolodex/core';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  organizationId?: string;
}

/**
 * Verify JWT token and extract user
 */
export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    // Check for API key first
    const apiKey = request.headers['x-api-key'];
    if (apiKey) {
      // TODO: Implement API key validation
      // For now, we'll skip this and require JWT
    }

    // Verify JWT token
    await request.jwtVerify();
  } catch {
    throw new AuthenticationError('Invalid or missing authentication token');
  }
}

/**
 * Check if user has required role
 */
export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const user = request.user as AuthUser | undefined;
    if (!user) {
      throw new AuthenticationError();
    }

    if (!roles.includes(user.role)) {
      throw new AuthorizationError('access', 'resource');
    }
  };
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    // No-op - authentication is optional
  }
}

/**
 * Helper to get the authenticated user from request
 */
export function getUser(request: FastifyRequest): AuthUser | undefined {
  return request.user as AuthUser | undefined;
}
