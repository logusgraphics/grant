# Pivot Repository/Service Pattern Migration

## Overview

This document outlines the successful migration of pivot providers from the old provider pattern to the established repository/service pattern. Pivot tables represent many-to-many relationships between core entities and are essential for the RBAC (Role-Based Access Control) system.

## Migrated Pivot Tables

### 1. Group-Permissions Pivot

- **Repository**: `graphql/repositories/group-permissions/`
- **Service**: `graphql/services/group-permissions/`
- **Purpose**: Links groups to permissions for access control
- **Features**: Add/remove permissions from groups, query group permissions

### 2. Organization-Users Pivot

- **Repository**: `graphql/repositories/organization-users/`
- **Service**: `graphql/services/organization-users/`
- **Purpose**: Links users to organizations for multi-tenancy
- **Features**: Add/remove users from organizations, query organization users

### 3. Project-Users Pivot

- **Repository**: `graphql/repositories/project-users/`
- **Service**: `graphql/services/project-users/`
- **Purpose**: Links users to projects for project-level access
- **Features**: Add/remove users from projects, query project users

### 4. Organization-Projects Pivot

- **Repository**: `graphql/repositories/organization-projects/`
- **Service**: `graphql/services/organization-projects/`
- **Purpose**: Links projects to organizations for project management
- **Features**: Query organization projects (read-only relationship)

### 5. Role-Groups Pivot

- **Repository**: `graphql/repositories/role-groups/`
- **Service**: `graphql/services/role-groups/`
- **Purpose**: Links roles to groups for RBAC hierarchy
- **Features**: Query role groups (read-only relationship)

## Architecture Benefits

### 1. **Consistent Pivot Pattern**

- All pivot tables follow the same `PivotRepository` base class
- Consistent handling of soft deletes and reactivation
- Unified approach to many-to-many relationships

### 2. **Smart Relationship Management**

- **Soft Delete Support**: Relationships can be reactivated instead of recreated
- **Duplicate Prevention**: Unique constraints prevent duplicate relationships
- **Audit Trail**: All relationship changes are logged

### 3. **Type Safety**

- Full TypeScript support with proper interfaces
- GraphQL type alignment
- Repository pattern ensures data consistency

## Implementation Details

### Database Schema

Each pivot table includes:

- **Primary Key**: UUID for unique identification
- **Foreign Keys**: References to parent and related entities
- **Timestamps**: Created, updated, and deleted timestamps
- **Unique Constraints**: Prevents duplicate relationships
- **Audit Logs**: Tracks all relationship changes

### Repository Layer

- Extends `PivotRepository` base class
- Implements `add()`, `remove()`, and `query()` methods
- Handles soft delete logic and reactivation
- Manages unique constraint violations

### Service Layer

- Extends `AuditService` base class
- Input/output validation using Zod schemas
- Comprehensive audit logging
- Business logic enforcement

## Key Features

### Soft Delete with Reactivation

```typescript
// When adding a relationship that was previously deleted
const result = await db
  .update(this.table)
  .set({
    deletedAt: null,
    updatedAt: new Date(),
  })
  .where(whereClause)
  .returning();
```

### Unique Constraint Management

```typescript
// Partial unique index (only for active relationships)
uniqueIndex('group_permissions_group_id_permission_id_unique')
  .on(table.groupId, table.permissionId)
  .where(sql`${table.deletedAt} IS NULL`);
```

### Audit Logging

All relationship changes are logged with:

- Action type (CREATE, DELETE)
- Old and new values
- Metadata for context
- Timestamps for compliance

## Usage Examples

### Adding a Permission to a Group

```typescript
import { createGroupPermissionService } from '@/graphql/services/group-permissions';
import { groupPermissionRepository } from '@/graphql/repositories/group-permissions';

const groupPermissionService = createGroupPermissionService(groupPermissionRepository);
const result = await groupPermissionService.addGroupPermission({
  input: {
    groupId: 'group-123',
    permissionId: 'permission-456',
  },
});
```

### Querying Organization Users

```typescript
import { createOrganizationUserService } from '@/graphql/services/organization-users';
import { organizationUserRepository } from '@/graphql/repositories/organization-users';

const organizationUserService = createOrganizationUserService(organizationUserRepository);
const users = await organizationUserService.getOrganizationUsers({
  organizationId: 'org-123',
});
```

### Removing a User from a Project

```typescript
import { createProjectUserService } from '@/graphql/services/project-users';
import { projectUserRepository } from '@/graphql/repositories/project-users';

const projectUserService = createProjectUserService(projectUserRepository);
const result = await projectUserService.removeProjectUser({
  input: {
    projectId: 'project-123',
    userId: 'user-456',
  },
});
```

## Database Migration

To apply the new pivot table schemas:

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed with sample data (when implemented)
npm run db:seed
```

## Testing

Each pivot service includes comprehensive validation schemas:

```typescript
import { addGroupPermissionParamsSchema } from '@/graphql/services/group-permissions/schemas';

// Validate input
const result = addGroupPermissionParamsSchema.safeParse(input);
if (!result.success) {
  console.log('Validation errors:', result.error.errors);
}
```

## Migration Status

### ✅ Completed

- [x] Group-Permissions pivot (repository + service)
- [x] Organization-Users pivot (repository + service)
- [x] Project-Users pivot (repository + service)
- [x] Organization-Projects pivot (repository + service)
- [x] Role-Groups pivot (repository + service)
- [x] Database schemas
- [x] Validation schemas
- [x] Audit logging
- [x] Type definitions

### 🔄 Next Steps

- [ ] Migrate remaining pivot providers (tags, roles, etc.)
- [ ] Update GraphQL resolvers to use new services
- [ ] Migrate existing provider implementations
- [ ] Update configuration files
- [ ] Add comprehensive tests
- [ ] Update documentation

## Remaining Pivot Tables to Migrate

### Tag Relationships

- `user-tags` - Links users to tags
- `role-tags` - Links roles to tags
- `group-tags` - Links groups to tags
- `permission-tags` - Links permissions to tags
- `project-tags` - Links projects to tags
- `organization-tags` - Links organizations to tags

### Role Relationships

- `user-roles` - Links users to roles (already migrated)
- `organization-roles` - Links organizations to roles
- `project-roles` - Links projects to roles

### Group Relationships

- `organization-groups` - Links organizations to groups
- `project-groups` - Links projects to groups

### Permission Relationships

- `organization-permissions` - Links organizations to permissions
- `project-permissions` - Links projects to permissions

## Conclusion

The migration of pivot providers to the repository/service pattern provides:

- **Consistent Data Access**: All pivot tables follow the same pattern
- **Smart Relationship Management**: Soft deletes with reactivation support
- **Comprehensive Audit Trail**: All relationship changes are tracked
- **Type Safety**: Full TypeScript support with proper interfaces
- **Maintainability**: Clear separation of concerns and consistent patterns

This foundation can now be extended to the remaining pivot tables, completing the migration from the old provider pattern to the modern repository/service architecture.
