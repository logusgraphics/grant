# Audit Log Standardization

## Overview

This document outlines the standardization of audit log schemas across all repositories in the identity-central project. All repositories now follow a consistent pattern for audit logging, ensuring data consistency, performance, and maintainability.

## Standardized Audit Log Schema

All repositories now use the following consistent audit log structure:

```typescript
export const entityAuditLogs = pgTable(
  'entity_audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entityId: uuid('entity_id')
      .references(() => entity.id)
      .notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    oldValues: varchar('old_values', { length: 1000 }),
    newValues: varchar('new_values', { length: 1000 }),
    metadata: varchar('metadata', { length: 1000 }),
    performedBy: uuid('performed_by').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('entity_audit_logs_entity_id_idx').on(t.entityId),
    index('entity_audit_logs_action_idx').on(t.action),
  ]
);
```

## Key Standardization Changes

### 1. Data Type Consistency

- **Before**: Mixed usage of `text` (unlimited) and `varchar` (limited) fields
- **After**: All audit log fields now use `varchar` with appropriate length constraints
  - `action`: `varchar(50)` - sufficient for action names like "CREATE", "UPDATE", "DELETE"
  - `oldValues`, `newValues`, `metadata`: `varchar(1000)` - sufficient for JSON data storage

### 2. Field Naming Standardization

- **Before**: Inconsistent field names (`changes` vs `oldValues`/`newValues`, `performedAt` vs `createdAt`)
- **After**: Consistent field naming across all repositories:
  - `oldValues` - stores previous state as JSON string
  - `newValues` - stores new state as JSON string
  - `metadata` - stores additional context information
  - `performedBy` - tracks which user performed the action
  - `createdAt` - timestamp of when the audit log was created

### 3. Enhanced Audit Tracking

- **Added**: `performedBy` field to all audit logs for better user accountability
- **Standardized**: All repositories now track who performed each action

### 4. Performance Optimization

- **Added**: Proper database indexing on foreign keys and action fields
- **Consistent**: All audit log tables have indexes on `entity_id` and `action` fields

## Repositories Updated

The following 25 repositories have been standardized:

### Core Entity Repositories

- `users/schema.ts`
- `organizations/schema.ts`
- `projects/schema.ts`
- `roles/schema.ts`
- `groups/schema.ts`
- `permissions/schema.ts`
- `tags/schema.ts`

### Pivot/Relationship Repositories

- `user-roles/schema.ts`
- `user-tags/schema.ts`
- `project-groups/schema.ts`
- `project-roles/schema.ts`
- `project-permissions/schema.ts`
- `project-tags/schema.ts`
- `project-users/schema.ts`
- `organization-users/schema.ts`
- `organization-roles/schema.ts`
- `organization-tags/schema.ts`
- `organization-projects/schema.ts`
- `organization-permissions/schema.ts`
- `organization-groups/schema.ts`
- `role-groups/schema.ts`
- `role-tags/schema.ts`
- `group-permissions/schema.ts`
- `group-tags/schema.ts`
- `permission-tags/schema.ts`

## Benefits of Standardization

### 1. **Data Consistency**

- All audit logs now store data in the same format
- Consistent field types and constraints across all modules
- Easier to query and analyze audit data across the system

### 2. **Performance**

- Consistent indexing strategy improves query performance
- Optimized varchar lengths balance storage efficiency with flexibility
- Standardized foreign key relationships

### 3. **Maintainability**

- Single source of truth for audit log structure
- Easier to implement cross-module audit reporting
- Consistent API patterns for audit log operations

### 4. **Compliance & Debugging**

- Enhanced user tracking with `performedBy` field
- Consistent audit trail across all system operations
- Better support for compliance requirements and debugging

## Migration Notes

### Breaking Changes

- **Database Schema**: Existing audit log tables will need migration to add the `performedBy` field
- **API Changes**: All audit log creation operations now require a `performedBy` parameter
- **Type Updates**: TypeScript types have been updated to reflect the new schema

### Required Actions

1. **Database Migration**: Add `performed_by` column to existing audit log tables
2. **Code Updates**: Update all audit log creation calls to include `performedBy` parameter
3. **Testing**: Verify audit log functionality across all modules

## Future Considerations

### 1. **Audit Log Retention**

- Consider implementing audit log retention policies
- Archive old audit logs to maintain performance

### 2. **Enhanced Metadata**

- The `metadata` field can be used to store additional context
- Consider standardizing metadata structure for common operations

### 3. **Audit Log Queries**

- Implement standardized audit log query interfaces
- Consider adding audit log aggregation and reporting features

## Conclusion

The audit log standardization ensures that all repositories in the identity-central project follow consistent patterns for tracking changes, user actions, and system modifications. This standardization provides a solid foundation for compliance, debugging, and system monitoring while maintaining performance and maintainability.

All repositories now use the same audit log structure, making the system more predictable, easier to maintain, and better suited for enterprise-level audit requirements.
