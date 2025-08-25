# GraphQL Services with Zod Validation

This directory contains the service layer for the GraphQL API with comprehensive input and output validation using Zod schemas.

## Architecture

The services follow a lean pattern with composition over inheritance:

- **BaseAuditService**: Provides audit logging functionality
- **Service Classes**: Implement business logic and validation
- **Validation Schemas**: Zod schemas for input/output validation
- **Common Utilities**: Shared validation functions and schemas

## Validation System

### Input Validation

All service method parameters are validated using Zod schemas before processing:

```typescript
const validatedParams = validateInput(createUserParamsSchema, params, 'createUser method');
```

### Output Validation

All service method return values are validated using Zod schemas:

```typescript
return validateOutput(userSchema, user, 'createUser method');
```

### Error Handling

Validation errors are wrapped in a custom `ValidationError` class with detailed error messages and context.

## Service Modules

### Users Service (`/users`)

- **Input Schemas**: `createUserParamsSchema`, `updateUserParamsSchema`, `deleteUserParamsSchema`
- **Output Schemas**: `userSchema`, `userPageSchema`
- **Validation**: Email format, name requirements, search term length, pagination limits

### Roles Service (`/roles`)

- **Input Schemas**: `createRoleParamsSchema`, `updateRoleParamsSchema`, `deleteRoleParamsSchema`
- **Output Schemas**: `roleSchema`, `rolePageSchema`
- **Validation**: Name requirements, description length, search term length, pagination limits

### User-Roles Service (`/user-roles`)

- **Input Schemas**: `addUserRoleParamsSchema`, `removeUserRoleParamsSchema`
- **Output Schemas**: `userRoleSchema`
- **Validation**: User and role existence, duplicate role prevention

## Common Schemas

Shared validation schemas in `/common/schemas.ts`:

- `idSchema`: ID validation
- `emailSchema`: Email format validation
- `nameSchema`: Name length validation
- `limitSchema`: Pagination limit validation
- `pageSchema`: Page number validation
- `searchSchema`: Search term validation
- `tenantSchema`: Tenant enum validation
- `scopeSchema`: Scope object validation
- `sortOrderSchema`: Sort order validation

## Usage Example

```typescript
import { UserService } from '@/graphql/services';
import { validateInput, validateOutput } from '@/graphql/services/common';

export class UserController {
  constructor(private userService: UserService) {}

  async createUser(input: CreateUserInput): Promise<User> {
    // Input validation
    const validatedInput = validateInput(createUserInputSchema, input, 'createUser');

    // Business logic
    const user = await this.userService.createUser(validatedInput);

    // Output validation
    return validateOutput(userSchema, user, 'createUser');
  }
}
```

## Benefits

1. **Type Safety**: Runtime validation ensures data integrity
2. **Consistency**: Uniform validation across all services
3. **Maintainability**: Centralized schema definitions
4. **Error Handling**: Detailed validation error messages
5. **Performance**: Early validation prevents unnecessary processing
6. **Documentation**: Schemas serve as API documentation

## Adding New Services

1. Create validation schemas in `/services/{service-name}/schemas.ts`
2. Import common schemas from `/common/schemas.ts`
3. Use `validateInput` and `validateOutput` in service methods
4. Export schemas and service from index files
5. Add to main services index with proper type exports
