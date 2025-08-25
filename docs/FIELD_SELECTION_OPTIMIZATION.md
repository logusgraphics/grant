# Field Selection Optimization

This document explains how the GraphQL server optimizes database queries by only selecting the fields that are actually requested in the GraphQL query.

## Overview

Field selection optimization is a powerful technique that can significantly improve database performance by:

1. **Reducing data transfer** - Only fetch columns that are needed
2. **Improving query performance** - Smaller result sets and less memory usage
3. **Optimizing network bandwidth** - Less data sent over the wire

## How It Works

### 1. Field Selection Extraction

When a GraphQL query is executed, the resolver extracts information about which fields are requested:

```typescript
export const getUsersResolver: QueryResolvers['users'] = async (
  _parent,
  args,
  context,
  info // GraphQL field selection information
) => {
  // Extract which fields the client actually wants
  const requestedFields = info ? getDirectFieldSelection(info, 'User') : undefined;

  // Pass this information to the data provider
  const usersResult = await context.providers.users.getUsers({
    ...args,
    requestedFields, // Only fetch these specific fields
  });

  return usersResult;
};
```

### 2. Database Query Optimization

The database repository uses the field selection to build an optimized SQL query:

```typescript
async query(params: QueryUsersArgs & { requestedFields?: string[] }): Promise<UserPage> {
  const { requestedFields } = params;

  if (requestedFields && requestedFields.length > 0) {
    // Build a dynamic select based on requested fields
    const selectObj: any = { id: users.id }; // Always need ID

    if (requestedFields.includes('name')) selectObj.name = users.name;
    if (requestedFields.includes('email')) selectObj.email = users.email;
    if (requestedFields.includes('createdAt')) selectObj.createdAt = users.createdAt;
    if (requestedFields.includes('updatedAt')) selectObj.updatedAt = users.updatedAt;

    // Only select the columns that are actually needed
    const baseQuery = db.select(selectObj).from(users);
  } else {
    // Fallback to selecting all columns if no specific fields requested
    const baseQuery = db.select().from(users);
  }
}
```

### 3. Output Formatting

The repository also optimizes the output by only including requested fields:

```typescript
private toOutput(dbUser: any, requestedFields?: string[]): User {
  if (!requestedFields || requestedFields.length === 0) {
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      createdAt: dbUser.createdAt.toISOString(),
      updatedAt: dbUser.updatedAt.toISOString(),
    };
  }

  // Build output object with only requested fields
  const output: Partial<User> = {};

  if (requestedFields.includes('id') && dbUser.id) output.id = dbUser.id;
  if (requestedFields.includes('name') && dbUser.name) output.name = dbUser.name;
  if (requestedFields.includes('email') && dbUser.email) output.email = dbUser.email;
  if (requestedFields.includes('createdAt') && dbUser.createdAt) output.createdAt = dbUser.createdAt.toISOString();
  if (requestedFields.includes('updatedAt') && dbUser.updatedAt) output.updatedAt = dbUser.updatedAt.toISOString();

  return output as User;
}
```

## Example Queries

### Query 1: Minimal Fields

```graphql
query GetUserIds {
  users(scope: { tenant: ORGANIZATION, id: "123" }) {
    users {
      id
    }
    totalCount
    hasNextPage
  }
}
```

**Result**: Only `id` column is fetched from database, significantly reducing data transfer.

### Query 2: Full Fields

```graphql
query GetFullUsers {
  users(scope: { tenant: ORGANIZATION, id: "123" }) {
    users {
      id
      name
      email
      createdAt
      updatedAt
    }
    totalCount
    hasNextPage
  }
}
```

**Result**: All columns are fetched as before (no optimization needed).

### Query 3: Partial Fields

```graphql
query GetUserNames {
  users(scope: { tenant: ORGANIZATION, id: "123" }) {
    users {
      id
      name
      email
    }
    totalCount
    hasNextPage
  }
}
```

**Result**: Only `id`, `name`, and `email` columns are fetched, skipping `createdAt` and `updatedAt`.

## Performance Benefits

### Before Optimization

- **Always fetched**: All columns regardless of what's needed
- **Data transfer**: Full user records even for simple queries
- **Memory usage**: Unnecessary data stored in memory
- **Network bandwidth**: Wasted on unused fields

### After Optimization

- **Selective fetching**: Only requested columns are fetched
- **Data transfer**: Minimal data based on actual needs
- **Memory usage**: Reduced memory footprint
- **Network bandwidth**: Efficient use of available bandwidth

## Implementation Details

### Required Fields

Some fields are always included even if not explicitly requested:

- **ID fields**: Required for relationships and pagination
- **Search fields**: Required when search functionality is used
- **Sort fields**: Required when sorting is applied

### Fallback Behavior

If no field selection information is available (e.g., in faker provider), the system falls back to fetching all fields to maintain compatibility.

### Type Safety

The optimization maintains full TypeScript type safety while providing runtime flexibility for database queries.

## Future Enhancements

1. **Nested field optimization**: Optimize nested object field selection
2. **Relationship optimization**: Only fetch related data when requested
3. **Caching strategies**: Cache field selection patterns for common queries
4. **Metrics collection**: Track optimization effectiveness and query patterns
