/**
 * Generic error classes for both REST and GraphQL APIs
 *
 * These errors extend the base Error class and include metadata
 * that can be used by both REST controllers and GraphQL formatters.
 */

export interface ErrorOptions {
  /**
   * HTTP status code for REST responses
   */
  statusCode?: number;
  /**
   * Error code for both REST and GraphQL
   */
  code?: string;
  /**
   * Additional metadata to include in error response
   */
  extensions?: Record<string, any>;
}

/**
 * Base error class for all API errors
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly extensions?: Record<string, any>;

  constructor(message: string, options: ErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = options.statusCode || 500;
    this.code = options.code || 'INTERNAL_SERVER_ERROR';
    this.extensions = options.extensions;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error for resource not found scenarios
 */
export class NotFoundError extends ApiError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, {
      statusCode: 404,
      code: 'NOT_FOUND',
      extensions,
    });
    this.name = 'NotFoundError';
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends ApiError {
  constructor(
    message: string,
    public readonly errors: any[] = [],
    extensions?: Record<string, any>
  ) {
    super(message, {
      statusCode: 400,
      code: 'BAD_USER_INPUT',
      extensions: {
        ...extensions,
        validationErrors: errors,
      },
    });
    this.name = 'ValidationError';
  }
}

/**
 * Error for authentication failures
 */
export class AuthenticationError extends ApiError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, {
      statusCode: 401,
      code: 'UNAUTHENTICATED',
      extensions,
    });
    this.name = 'AuthenticationError';
  }
}

/**
 * Error for authorization failures
 */
export class AuthorizationError extends ApiError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, {
      statusCode: 403,
      code: 'FORBIDDEN',
      extensions,
    });
    this.name = 'AuthorizationError';
  }
}

/**
 * Error for conflicts (e.g., duplicate resources)
 */
export class ConflictError extends ApiError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, {
      statusCode: 409,
      code: 'CONFLICT',
      extensions,
    });
    this.name = 'ConflictError';
  }
}

/**
 * Error for bad requests
 */
export class BadRequestError extends ApiError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, {
      statusCode: 400,
      code: 'BAD_REQUEST',
      extensions,
    });
    this.name = 'BadRequestError';
  }
}
