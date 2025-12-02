/**
 * Global error handler
 */

import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { RolodexError, wrapError, ValidationError } from '@rolodex/core';
import { ZodError } from 'zod';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationError = ValidationError.fromZodError(error);
    return reply.status(400).send(validationError.toJSON());
  }

  // Handle Rolodex errors
  if (error instanceof RolodexError) {
    return reply.status(error.statusCode).send(error.toJSON());
  }

  // Wrap unknown errors
  const wrapped = wrapError(error);
  return reply.status(wrapped.statusCode).send(wrapped.toJSON());
}
