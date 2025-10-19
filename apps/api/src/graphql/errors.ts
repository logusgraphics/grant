/**
 * @deprecated This file is deprecated. Use @/lib/errors instead.
 *
 * This file now re-exports from @/lib/errors for backward compatibility.
 * The new error classes work with both REST and GraphQL APIs.
 *
 * Migration guide:
 * - Old: import { ApiError } from '@/graphql/errors'
 * - New: import { ApiError } from '@/lib/errors'
 */

export {
  ApiError,
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors';
