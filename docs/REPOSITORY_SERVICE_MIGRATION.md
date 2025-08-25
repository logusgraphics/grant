# Repository/Service Pattern Migration for Core Modules

## Overview

This document outlines the successful migration of the remaining core modules from the old provider pattern to the established repository/service pattern. The migration follows the same architectural principles already established for users, roles, and tags.

## Migrated Modules

### 1. Groups Module

- **Repository**: `graphql/repositories/groups/`
- **Service**: `graphql/services/groups/`
- **Features**: CRUD operations, audit logging, validation
- **Database Schema**: Groups table with audit logs

### 2. Permissions Module

- **Repository**: `graphql/repositories/permissions/`
- **Service**: `graphql/services/permissions/`
- **Features**: CRUD operations, audit logging, validation
- **Database Schema**: Permissions table with audit logs

### 3. Projects Module

- **Repository**: `graphql/repositories/projects/`
- **Service**: `graphql/services/projects/`
- **Features**: CRUD operations, audit logging, validation, auto-slug generation
- **Database Schema**: Projects table with audit logs

### 4. Organizations Module

- **Repository**: `graphql/repositories/organizations/`
- **Service**: `graphql/services/organizations/`
- **Features**: CRUD operations, audit logging, validation, auto-slug generation
- **Database Schema**: Organizations table with audit logs

## Architecture Benefits

### 1. **Separation of Concerns**

- **Repository Layer**: Handles data access and database operations
- **Service Layer**: Handles business logic, validation, and audit logging
- **Interface Layer**: Provides type-safe contracts between layers

### 2. **Consistency**

- All core modules now follow the same architectural pattern
- Consistent error handling and validation approaches
- Unified audit logging across all entities

### 3. **Maintainability**

- Clear separation between data access and business logic
- Easier to test individual components
- Consistent patterns make onboarding easier

### 4. **Scalability**

- Repository pattern allows for easy database optimization
- Service layer can be extended with additional business rules
- Clear interfaces make it easier to add new features

## Implementation Details

### Database Schema

Each module includes:

- Main entity table (e.g., `groups`, `permissions`, `projects`, `organizations`)
- Audit log table (e.g., `group_audit_logs`, `permission_audit_logs`)
- Proper indexes for performance
- Soft delete support

### Repository Layer

- Extends `EntityRepository` base class
- Implements CRUD operations
- Handles search, pagination, and sorting
- Type-safe database operations

### Service Layer

- Extends `AuditService` base class
- Input/output validation using Zod schemas
- Comprehensive audit logging
- Business logic enforcement

### Validation Schemas

- Input validation for all operations
- Output validation for data consistency
- Type-safe schema definitions
- Clear error messages

## Key Features

### Auto-Slug Generation

Projects and Organizations automatically generate slugs from names:

```typescript
private generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
```

### Audit Logging

All operations are logged with:

- Action type (CREATE, UPDATE, DELETE, SOFT_DELETE)
- Old and new values
- Metadata for context
- Timestamps for compliance

### Soft Deletes

All entities support soft deletion:

- Records are marked as deleted rather than removed
- Audit trail is maintained
- Data can be restored if needed

## Migration Status

### ✅ Completed

- [x] Groups module (repository + service)
- [x] Permissions module (repository + service)
- [x] Projects module (repository + service)
- [x] Organizations module (repository + service)
- [x] Database schemas
- [x] Validation schemas
- [x] Audit logging
- [x] Type definitions

### 🔄 Next Steps

- [ ] Update GraphQL resolvers to use new services
- [ ] Migrate existing provider implementations
- [ ] Update configuration files
- [ ] Add comprehensive tests
- [ ] Update documentation

## Usage Examples

### Creating a Group

```typescript
import { createGroupService } from '@/graphql/services/groups';
import { groupRepository } from '@/graphql/repositories/groups';

const groupService = createGroupService(groupRepository);
const newGroup = await groupService.createGroup({
  input: {
    name: 'Admin Group',
    description: 'Administrative users',
  },
});
```

### Querying Projects

```typescript
import { createProjectService } from '@/graphql/services/projects';
import { projectRepository } from '@/graphql/repositories/projects';

const projectService = createProjectService(projectRepository);
const projects = await projectService.getProjects({
  organizationId: 'org-123',
  page: 1,
  limit: 10,
  search: 'dashboard',
});
```

## Database Migration

To apply the new database schemas:

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed with sample data (when implemented)
npm run db:seed
```

## Testing

Each module includes comprehensive validation schemas that can be used for testing:

```typescript
import { createGroupParamsSchema } from '@/graphql/services/groups/schemas';

// Validate input
const result = createGroupParamsSchema.safeParse(input);
if (!result.success) {
  console.log('Validation errors:', result.error.errors);
}
```

## Conclusion

The migration to the repository/service pattern for core modules provides a solid foundation for:

- Consistent data access patterns
- Comprehensive audit logging
- Type-safe operations
- Maintainable and testable code
- Scalable architecture

This pattern can now be extended to other modules and provides a clear template for future development.
