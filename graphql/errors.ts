export class GraphQLError extends Error {
  constructor(
    message: string,
    public code: string = 'INTERNAL_SERVER_ERROR',
    public extensions?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GraphQLError';
  }
}

export class NotFoundError extends GraphQLError {
  constructor(message: string) {
    super(message, 'NOT_FOUND');
  }
}

export class ValidationError extends GraphQLError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, 'UNAUTHENTICATED');
  }
}

export class AuthorizationError extends GraphQLError {
  constructor(message: string) {
    super(message, 'FORBIDDEN');
  }
}
