# Service Layer Implementation

## Overview

This directory contains the service layer implementation that separates business logic from the repository layer in our GraphQL service architecture.

## Architecture

The service layer follows this pattern:

```
Query/Mutation -> Resolver -> Provider -> Service -> Repository
```

### Responsibilities

- **Repository**: Pure data access operations (CRUD)
- **Service**: Business logic, validation, audit logging, complex workflows
- **Provider**: Interface between resolvers and services
- **Resolver**: GraphQL operation handling

## Users Module Service

### Structure

```
services/users/
├── index.ts          # Exports and factory function
├── service.ts        # Service implementation
└── types.ts          # Service interfaces
```

### Features

1. **Business Logic Separation**: Input validation, business rules, and complex workflows
2. **Audit Logging**: Automatic logging of all user operations (CREATE, UPDATE, DELETE, SOFT_DELETE)
3. **Input Validation**: Email format validation, search term validation, pagination limits
4. **Error Handling**: Comprehensive error handling with meaningful messages

### Audit Logging

The service automatically logs all user operations to the `user_audit_logs` table:

- **CREATE**: Logs new user data
- **UPDATE**: Logs old and new values for comparison
- **DELETE**: Logs user data before soft deletion
- **Metadata**: Includes source information (e.g., "create_user_mutation")

### Usage

```typescript
// In a provider
import { createUserService } from '@/graphql/services/users';

const userService = createUserService(userRepository);

// The service handles business logic and audit logging automatically
const user = await userService.createUser({
  input: { name: 'John Doe', email: 'john@example.com' },
});
```

## Benefits

1. **Separation of Concerns**: Business logic is separated from data access
2. **Reusability**: Services can be used by multiple providers
3. **Testability**: Business logic can be tested independently
4. **Maintainability**: Clear boundaries between layers
5. **Audit Trail**: Comprehensive logging for compliance and debugging

## Future Enhancements

- Transaction management for complex operations
- Event-driven architecture for business events
- Caching strategies for frequently accessed data
- Rate limiting and throttling
- Advanced validation rules
