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

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

/**
 * Verify JWT token and extract user
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
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

    // Extract user from token
    const payload = request.user as unknown as AuthUser;
    request.user = payload;
  } catch (err) {
    throw new AuthenticationError('Invalid or missing authentication token');
  }
}

/**
 * Check if user has required role
 */
export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new AuthenticationError();
    }

    if (!roles.includes(request.user.role)) {
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
    const payload = request.user as unknown as AuthUser;
    request.user = payload;
  } catch {
    // No-op - authentication is optional
  }
}
