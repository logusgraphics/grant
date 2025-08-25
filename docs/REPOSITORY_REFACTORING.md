# Repository Refactoring: Removing Business Logic

## Overview

This document outlines the refactoring of the user repository to remove business logic and delegate constraints to PostgreSQL, following the provider pattern principles.

## Key Changes Made

### 1. Removed Business Logic from Repository

**Before (Business Logic in Repository):**

- Email uniqueness checks before insert/update
- User existence validation
- Audit logging logic
- Complex validation rules

**After (Database Constraints):**

- Repository only handles CRUD operations
- Database handles email uniqueness via partial unique index
- Database handles foreign key constraints
- Database handles NOT NULL constraints

### 2. Updated Database Schema

**Added Database Constraints:**

```sql
-- Partial unique index for email uniqueness (only for non-deleted users)
CREATE UNIQUE INDEX users_email_unique_idx ON users(email) WHERE deleted_at IS NULL;

-- Indexes for performance
CREATE INDEX users_deleted_at_idx ON users(deleted_at);
CREATE INDEX users_created_at_idx ON users(created_at);
```

**Note:** Using the modern Drizzle ORM syntax with array-based indexes:

```typescript
export const users = pgTable(
  'users',
  {
    // ... column definitions
  },
  (t) => [
    // Partial unique index for email uniqueness (only for non-deleted users)
    index('users_email_unique_idx')
      .on(t.email)
      .where(sql`${t.deletedAt} IS NULL`),
    // Index for soft delete queries
    index('users_deleted_at_idx').on(t.deletedAt),
    // Index for created date sorting
    index('users_created_at_idx').on(t.createdAt),
  ]
);
```

**Benefits:**

- Email uniqueness enforced at database level
- Better performance for soft delete queries
- Better performance for date-based sorting
- Modern, non-deprecated Drizzle ORM syntax

### 3. Simplified Repository Methods

**Create Method:**

```typescript
async create(params: MutationCreateUserArgs): Promise<User> {
  try {
    // No business logic - let database constraints handle email uniqueness
    const [insertedUser] = await db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return this.toOutput(insertedUser);
  } catch (error) {
    // Database will throw error if email already exists
    console.error('Error creating user:', error);
    throw error;
  }
}
```

**Update Method:**

```typescript
async update(params: MutationUpdateUserArgs): Promise<User> {
  try {
    // No business logic - let database constraints handle email uniqueness
    const updateValues: Partial<UserModel> = { updatedAt: new Date() };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.email !== undefined) updateValues.email = input.email;

    const [updatedUser] = await db
      .update(users)
      .set(updateValues)
      .where(eq(users.id, id))
      .returning();

    return this.toOutput(updatedUser);
  } catch (error) {
    // Database will throw error if email already exists
    console.error('Error updating user:', error);
    throw error;
  }
}
```

## Benefits of This Approach

### 1. **Separation of Concerns**

- Repository focuses only on data access
- Business logic moves to service layer or resolvers
- Database handles data integrity

### 2. **Performance Improvements**

- Database constraints are more efficient than application-level checks
- Indexes improve query performance
- Reduced round trips to database

### 3. **Data Consistency**

- Database constraints are always enforced
- No risk of application-level validation being bypassed
- Atomic operations at database level

### 4. **Maintainability**

- Simpler repository code
- Business rules centralized in database schema
- Easier to test and debug

### 5. **Scalability**

- Database constraints scale better than application logic
- Reduced application memory usage
- Better for distributed systems

## Database Constraints vs Business Logic

### **Use Database Constraints For:**

- Uniqueness (unique indexes)
- Referential integrity (foreign keys)
- Data type validation (NOT NULL, CHECK constraints)
- Domain constraints (value ranges, formats)

### **Use Application Logic For:**

- Complex business rules
- Multi-step validation workflows
- User experience logic
- Audit and logging requirements

## Migration Strategy

### 1. **Database Migration**

```sql
-- Add partial unique index for email
CREATE UNIQUE INDEX users_email_unique_idx ON users(email) WHERE deleted_at IS NULL;

-- Add performance indexes
CREATE INDEX users_deleted_at_idx ON users(deleted_at);
CREATE INDEX users_created_at_idx ON users(created_at);
```

### 2. **Application Changes**

- Remove business logic from repository
- Update error handling to catch database constraint violations
- Move audit logging to service layer if needed

### 3. **Testing**

- Test database constraints work correctly
- Verify error handling for constraint violations
- Performance testing with new indexes

## Drizzle ORM Compatibility

### **Version 0.44.4 Changes**

- Third parameter of `pgTable` now expects an array instead of an object
- Old syntax: `(t) => ({ ... })` - **DEPRECATED**
- New syntax: `(t) => [ ... ]` - **RECOMMENDED**

### **Correct Syntax:**

```typescript
// ✅ MODERN - No deprecation warnings
export const users = pgTable(
  'users',
  {
    // column definitions
  },
  (t) => [
    // Array of indexes
    index('users_email_unique_idx')
      .on(t.email)
      .where(sql`${t.deletedAt} IS NULL`),
    index('users_deleted_at_idx').on(t.deletedAt),
    index('users_created_at_idx').on(t.createdAt),
  ]
);
```

**Benefits:**

- No deprecation warnings
- Future-proof code
- Better TypeScript support
- Cleaner, more readable syntax

## Future Improvements

### 1. **Abstract Base Repository**

- Create reusable base repository for common CRUD operations
- Implement generic search, pagination, and sorting
- Support for different database providers

### 2. **Service Layer**

- Move business logic to dedicated service classes
- Implement transaction management
- Handle complex validation workflows

### 3. **Event-Driven Architecture**

- Use database triggers for audit logging
- Implement domain events for business logic
- Support for eventual consistency

## Conclusion

This refactoring successfully removes business logic from the repository layer, making the code more maintainable and performant. By leveraging PostgreSQL's native constraints and indexes, we achieve better data integrity and performance while simplifying the application code.

The repository now follows the single responsibility principle, focusing solely on data access operations. Business logic can be implemented at the service layer or resolver level, providing better separation of concerns and easier testing.

The new index approach uses the modern Drizzle ORM syntax, ensuring compatibility with current and future versions while maintaining all the performance benefits of proper database indexing.
