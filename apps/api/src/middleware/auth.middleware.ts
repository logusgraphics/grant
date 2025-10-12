import { NextFunction, Response } from 'express';

import { extractUserFromToken } from '@/lib/auth.lib';
import { AuthenticatedRequest } from '@/types';

/**
 * Middleware that extracts and validates authentication from the request
 * Injects the user object and audience into the request for downstream middleware
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const user = extractUserFromToken(authHeader || null);

  // If Authorization header is present but user is null, token is invalid
  if (authHeader && authHeader.startsWith('Bearer ') && !user) {
    return res.status(401).json({
      error: 'Invalid or expired authentication token',
      code: 'UNAUTHENTICATED',
    });
  }

  req.user = user;
  next();
}

/**
 * Middleware that requires authentication
 * Should be used after authMiddleware
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'UNAUTHENTICATED',
    });
  }
  next();
}

/**
 * Global error handler middleware
 * Should be registered last in the middleware chain
 */
export function errorHandler(
  error: Error,
  _: AuthenticatedRequest,
  res: Response,
  __: NextFunction
) {
  console.error('API Error:', error);

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: error.message,
      code: 'VALIDATION_ERROR',
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { details: error.message }),
  });
}
