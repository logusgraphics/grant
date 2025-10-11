---
title: Field Selection
description: GraphQL field selection optimization for improved database performance
---

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

    // Only select requested fields
    requestedFields.forEach(field => {
      switch (field) {
        case 'name':
          selectObj.name = users.name;
          break;
        case 'email':
          selectObj.email = users.email;
          break;
        case 'createdAt':
          selectObj.createdAt = users.createdAt;
          break;
        // Add more fields as needed
      }
    });

    const result = await this.db
      .select(selectObj)
      .from(users)
      .where(/* your conditions */);

    return result;
  }

  // Fallback to selecting all fields if no field selection provided
  return this.db.select().from(users).where(/* your conditions */);
}
```

## Implementation Details

### Field Selection Utility

The `getDirectFieldSelection` utility extracts field information from GraphQL's `GraphQLResolveInfo`:

```typescript
export function getDirectFieldSelection(
  info: GraphQLResolveInfo,
  typeName: string
): string[] | undefined {
  const fieldNode = info.fieldNodes[0];
  if (!fieldNode || !fieldNode.selectionSet) {
    return undefined;
  }

  const selections = fieldNode.selectionSet.selections;
  const fields: string[] = [];

  selections.forEach((selection) => {
    if (selection.kind === 'Field') {
      fields.push(selection.name.value);
    }
  });

  return fields.length > 0 ? fields : undefined;
}
```

### Repository Integration

Each repository method accepts an optional `requestedFields` parameter:

```typescript
interface QueryUsersArgs {
  limit?: number;
  offset?: number;
  requestedFields?: string[];
}

class UserRepository {
  async getUsers(args: QueryUsersArgs): Promise<User[]> {
    const { requestedFields, ...queryArgs } = args;

    if (requestedFields) {
      return this.queryWithFieldSelection(queryArgs, requestedFields);
    }

    return this.queryAll(queryArgs);
  }
}
```

## Performance Benefits

### Database Performance

- **Reduced I/O**: Only read necessary columns from disk
- **Lower Memory Usage**: Smaller result sets in memory
- **Faster Queries**: Less data to process and transfer

### Network Performance

- **Smaller Payloads**: Less data sent over the network
- **Faster Response Times**: Reduced serialization overhead
- **Bandwidth Savings**: Especially important for mobile clients

### Example Performance Impact

```graphql
# Without field selection - fetches all fields
query GetUsers {
  users {
    id
    name
    email
    createdAt
    updatedAt
    # ... potentially many more fields
  }
}

# With field selection - only fetches requested fields
query GetUserNames {
  users {
    id
    name
  }
}
```

The second query will be significantly faster and use less bandwidth.

## Best Practices

### 1. Always Include ID

Always include the `id` field in your field selection, as it's typically required for relationships and updates:

```typescript
const selectObj: any = { id: users.id }; // Always include ID
```

### 2. Handle Nested Fields

For nested relationships, you may need to handle field selection recursively:

```typescript
if (requestedFields.includes('organization')) {
  selectObj.organization = {
    id: organizations.id,
    name: organizations.name,
    // Only select organization fields if they're requested
  };
}
```

### 3. Fallback Strategy

Always provide a fallback for when field selection is not available:

```typescript
if (requestedFields && requestedFields.length > 0) {
  return this.queryWithFieldSelection(args, requestedFields);
}

// Fallback to selecting all fields
return this.queryAll(args);
```

### 4. Testing Field Selection

Test your field selection implementation:

```typescript
describe('Field Selection', () => {
  it('should only select requested fields', async () => {
    const result = await userRepository.getUsers({
      requestedFields: ['id', 'name'],
    });

    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).not.toHaveProperty('email');
  });
});
```

## Advanced Techniques

### 1. Computed Fields

Handle computed fields that don't exist in the database:

```typescript
if (requestedFields.includes('fullName')) {
  // Compute fullName from firstName and lastName
  selectObj.firstName = users.firstName;
  selectObj.lastName = users.lastName;
}
```

### 2. Conditional Field Selection

Select different fields based on user permissions:

```typescript
const allowedFields = requestedFields.filter((field) => userCanAccessField(field, currentUser));

if (allowedFields.length > 0) {
  return this.queryWithFieldSelection(args, allowedFields);
}
```

### 3. Field Selection Caching

Cache field selection results for frequently accessed queries:

```typescript
const cacheKey = `fields:${JSON.stringify(requestedFields)}`;
const cachedResult = this.cache.get(cacheKey);

if (cachedResult) {
  return cachedResult;
}

const result = await this.queryWithFieldSelection(args, requestedFields);
this.cache.set(cacheKey, result, { ttl: 300 }); // 5 minute cache
```

## Monitoring and Debugging

### 1. Query Logging

Log field selection information for debugging:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Field selection:', requestedFields);
  console.log('Generated SQL:', sql);
}
```

### 2. Performance Metrics

Track performance improvements:

```typescript
const startTime = Date.now();
const result = await this.queryWithFieldSelection(args, requestedFields);
const duration = Date.now() - startTime;

this.metrics.record('query.duration', duration, {
  fields: requestedFields?.length || 'all',
});
```

### 3. Field Selection Analytics

Analyze which fields are most commonly requested:

```typescript
requestedFields?.forEach((field) => {
  this.analytics.track('field.requested', {
    field,
    query: info.operation.name?.value || 'anonymous',
  });
});
```

## REST API Field Selection

While GraphQL has built-in field selection through its query syntax, the REST API implements field selection through query parameters for relationship loading.

### Why Field Selection in REST?

In traditional REST APIs, all relationships are either always included or never included. Our REST API allows clients to explicitly request relationships using the `relations` query parameter, providing:

1. **Performance**: Only load expensive relationships when needed
2. **Flexibility**: Clients control their data requirements
3. **Consistency**: Mirrors GraphQL behavior for familiar developer experience

### Usage

Clients can request specific relationships using the `relations` query parameter:

```bash
# Single relation
GET /api/accounts?relations=projects

# Multiple relations (comma-separated)
GET /api/accounts?relations=projects,owner

# Multiple relations (array format)
GET /api/accounts?relations=projects&relations=owner
```

### Implementation Flow

1. **Schema Validation** - Zod validates and transforms the `relations` parameter:

   ```typescript
   export const relationsQuerySchema = z.object({
     relations: z
       .union([z.string(), z.array(z.string())])
       .transform((val) => {
         if (typeof val === 'string') {
           return val.split(',').map((v) => v.trim());
         }
         return val;
       })
       .optional(),
   });
   ```

2. **Parsing** - The `parseRelations` utility converts to typed field arrays:

   ```typescript
   import { parseRelations } from '@/lib/field-selection.lib';

   const requestedFields = parseRelations<Account>(relations);
   // 'projects,owner' → ['projects', 'owner']
   ```

3. **Repository Query** - Only requested relations are loaded via database joins:

   ```typescript
   protected query(params: { requestedFields?: Array<keyof TEntity> }) {
     const withRelations = this.withRelations(requestedFields);
     // Conditionally loads relations based on requestedFields
   }
   ```

### Examples

#### Without Relations (Default)

Request:

```bash
GET /api/accounts/acc_123
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "acc_123",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "type": "organization",
    "ownerId": "usr_456"
  }
}
```

#### With Relations

Request:

```bash
GET /api/accounts/acc_123?relations=projects,owner
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "acc_123",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "type": "organization",
    "ownerId": "usr_456",
    "projects": [
      {
        "id": "prj_789",
        "name": "Project Alpha"
      }
    ],
    "owner": {
      "id": "usr_456",
      "name": "John Doe"
    }
  }
}
```

### Available Relations by Entity

#### Accounts

- `projects` - Projects associated with the account
- `owner` - User who owns the account

#### Users

- `roles` - Roles assigned to the user
- `tags` - Tags associated with the user
- `accounts` - Accounts owned by the user
- `authenticationMethods` - Authentication methods for the user

#### Organizations

- `users` - Users in the organization
- `projects` - Projects owned by the organization
- `roles` - Roles defined in the organization
- `groups` - Groups in the organization

#### Projects

- `accounts` - Accounts associated with the project
- `users` - Users with access to the project
- `roles` - Roles defined in the project
- `groups` - Groups in the project

#### Roles

- `users` - Users with this role
- `groups` - Groups with this role
- `tags` - Tags associated with this role

#### Groups

- `users` - Users in this group
- `permissions` - Permissions granted to this group
- `tags` - Tags associated with this group

### Performance Considerations

| Scenario               | Query Type             | Performance Impact |
| ---------------------- | ---------------------- | ------------------ |
| No relations           | Single table query     | Fastest            |
| 1-2 relations          | LEFT JOIN per relation | Fast               |
| 3+ relations           | Multiple LEFT JOINs    | Moderate           |
| Deeply nested (future) | Recursive joins        | Slowest            |

**Best Practice**: Only request relations you actually need.

### Comparison: GraphQL vs REST

| Aspect           | GraphQL               | REST (with field selection) |
| ---------------- | --------------------- | --------------------------- |
| Field selection  | Automatic via query   | Explicit via `?relations=`  |
| Base fields      | Must be requested     | Always returned             |
| Nested relations | Deeply nested queries | Flat list of relations      |
| Type safety      | Schema-driven         | Zod validation              |
| Documentation    | Introspection         | OpenAPI/Swagger             |

### Adding Field Selection to New REST Endpoints

1. **Import utilities**:

   ```typescript
   import { parseRelations } from '@/lib/field-selection.lib';
   import { relationsQuerySchema } from '@/rest/schemas/common.schemas';
   ```

2. **Add to query schema** (most schemas extend `listQuerySchema` which already includes `relationsQuerySchema`)

3. **Parse in controller**:

   ```typescript
   const { relations } = req.query;
   const requestedFields = parseRelations<Entity>(relations);

   const result = await this.handlers.entity.getEntities({
     // ... other params
     requestedFields,
   });
   ```

4. **Document in OpenAPI**:

   ```typescript
   registry.registerPath({
     // ...
     description: `
       ### Relations
       You can load related data by specifying the \`relations\` query parameter:
       - \`fieldA\`: Description of fieldA
       - \`fieldB\`: Description of fieldB
       
       Example: \`?relations=fieldA,fieldB\`
     `,
   });
   ```

### Future Enhancements

1. **Nested Relations**: Support for `?relations=projects.users`
2. **Field Exclusion**: Support for `?exclude=sensitiveField`
3. **Sparse Fieldsets**: Support for `?fields=id,name` (JSON:API style)
4. **DataLoader**: Batch and cache database queries for N+1 prevention

---

**Next:** Learn about [Audit Logging](/advanced-topics/audit-logging) for comprehensive audit trail management.
