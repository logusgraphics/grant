# Service Update Plan for User Context Integration

## Overview

This document outlines the plan to update all services in the identity-central project to properly integrate user context for audit logging. The goal is to ensure that all audit logs include the `performedBy` field with the actual user ID from the authenticated context.

## Current Status

✅ **Completed:**

- `AuditService` base class updated to accept user in constructor
- `UserService` updated to use new pattern
- `RoleService` updated to use new pattern
- `GroupService` updated to use new pattern
- `PermissionService` updated to use new pattern
- `ProjectService` updated to use new pattern
- `OrganizationService` updated to use new pattern
- `TagService` updated to use new pattern
- Services configuration converted to lambda function
- Apollo context updated to use new service factory

🔄 **In Progress:**

- Service factory functions need to be updated across all modules

❌ **Remaining:**

- Update all remaining service classes to accept user parameter
- Update all remaining service factory functions
- Test the complete integration

## Required Changes

### 1. Service Class Updates

Each service class that extends `AuditService` needs to be updated:

```typescript
// Before
export class SomeService extends AuditService implements ISomeService {
  constructor(private readonly someRepository: ISomeRepository) {
    super(someAuditLogs, 'someId');
  }
}

// After
export class SomeService extends AuditService implements ISomeService {
  constructor(
    private readonly someRepository: ISomeRepository,
    user: AuthenticatedUser | null
  ) {
    super(someAuditLogs, 'someId', user);
  }
}
```

### 2. Service Factory Updates

Each service factory function needs to be updated:

```typescript
// Before
export function createSomeService(someRepository: ISomeRepository) {
  return new SomeService(someRepository);
}

// After
export function createSomeService(someRepository: ISomeRepository, user: AuthenticatedUser | null) {
  return new SomeService(someRepository, user);
}
```

### 3. Services Configuration

The services configuration has been updated to pass user context to all factories:

```typescript
export const createServices = ({ user }: { user: AuthenticatedUser | null }): ModuleServices => ({
  users: createUserService(userRepository, user),
  roles: createRoleService(roleRepository, user),
  // ... all other services
});
```

## Services to Update

### Core Entity Services

- [x] `users` - ✅ Updated
- [x] `roles` - ✅ Updated
- [x] `groups` - ✅ Updated
- [x] `permissions` - ✅ Updated
- [x] `projects` - ✅ Updated
- [x] `organizations` - ✅ Updated
- [x] `tags` - ✅ Updated

### Pivot/Relationship Services

- [ ] `user-roles`
- [ ] `user-tags`
- [ ] `project-groups`
- [ ] `project-roles`
- [ ] `project-permissions`
- [ ] `project-tags`
- [ ] `project-users`
- [ ] `organization-users`
- [ ] `organization-roles`
- [ ] `organization-tags`
- [ ] `organization-projects`
- [ ] `organization-permissions`
- [ ] `organization-groups`
- [ ] `role-groups`
- [ ] `role-tags`
- [ ] `group-permissions`
- [ ] `group-tags`
- [ ] `permission-tags`

## Implementation Steps

### Phase 1: Update Service Classes

1. Update constructor to accept `user: AuthenticatedUser | null`
2. Pass user to `super()` call
3. Remove any manual `performedBy` parameters from audit log calls
4. Import `AuthenticatedUser` type

### Phase 2: Update Factory Functions

1. Update factory function signature to accept user parameter
2. Pass user to service constructor
3. Update export statements for better type safety

### Phase 3: Validation and Testing

1. Ensure all services compile without errors
2. Test audit logging functionality
3. Verify user context is properly propagated

## Benefits

1. **Proper User Tracking**: All audit logs will include the actual user who performed the action
2. **Consistent Pattern**: All services follow the same user context pattern
3. **Type Safety**: Better TypeScript support with proper user typing
4. **Maintainability**: Centralized user context management
5. **Compliance**: Better audit trail for compliance requirements

## Migration Notes

- **Breaking Changes**: All service constructors now require user parameter
- **Database Impact**: Audit logs will now have proper `performedBy` values
- **API Changes**: No public API changes, only internal service layer updates

## Next Steps

1. Continue updating remaining services systematically
2. Test the complete integration
3. Update documentation
4. Consider implementing proper JWT token extraction in Apollo context
