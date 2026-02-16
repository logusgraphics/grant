---
title: Field Selection
description: Query optimization through selective field and relation loading
---

# Field Selection

Grant optimizes database queries by only fetching the fields and relations that clients actually request — reducing I/O, memory, and network bandwidth.

## GraphQL

GraphQL resolvers extract requested fields from the `info` parameter and pass them to the data layer:

```typescript
const getUsersResolver: QueryResolvers['users'] = async (_parent, args, context, info) => {
  const requestedFields = info ? getDirectFieldSelection(info, 'User') : undefined;
  return context.providers.users.getUsers({ ...args, requestedFields });
};
```

The repository builds an optimized SQL query selecting only the requested columns. If no field selection is provided, it falls back to selecting all fields.

## REST API — Relations Parameter

REST endpoints use the `relations` query parameter to load related entities on-demand:

```bash
# No relations (default) — base fields only
GET /api/accounts/acc_123

# Single relation
GET /api/accounts/acc_123?relations=projects

# Multiple relations
GET /api/accounts/acc_123?relations=projects,owner
```

Without `relations`, only scalar fields are returned. Each relation adds a `LEFT JOIN` to the query, so request only what you need.

## Available Relations

| Entity            | Relations                                            |
| ----------------- | ---------------------------------------------------- |
| **Accounts**      | `projects`, `owner`                                  |
| **Users**         | `roles`, `tags`, `accounts`, `authenticationMethods` |
| **Organizations** | `users`, `projects`, `roles`, `groups`               |
| **Projects**      | `accounts`, `users`, `roles`, `groups`               |
| **Roles**         | `users`, `groups`, `tags`                            |
| **Groups**        | `users`, `permissions`, `tags`                       |

## Performance Impact

| Scenario      | Query type             | Speed    |
| ------------- | ---------------------- | -------- |
| No relations  | Single table query     | Fastest  |
| 1-2 relations | LEFT JOIN per relation | Fast     |
| 3+ relations  | Multiple LEFT JOINs    | Moderate |

## GraphQL vs REST Comparison

| Aspect              | GraphQL                      | REST                    |
| ------------------- | ---------------------------- | ----------------------- |
| **Field selection** | Automatic from query syntax  | `?relations=` parameter |
| **Base fields**     | Must be explicitly requested | Always returned         |
| **Nested data**     | Deeply nested queries        | Flat relation list      |
| **Type safety**     | Schema-driven                | Zod validation          |

## Adding Relations to New Endpoints

1. Most list/get schemas already extend `listQuerySchema` which includes `relationsQuerySchema`
2. Parse in the route handler:

```typescript
import { parseRelations } from '@/lib/field-selection.lib';

const requestedFields = parseRelations<Entity>(relations);
const result = await handlers.entity.getEntities({ ...params, requestedFields });
```

3. Document available relations in the OpenAPI description

---

**Related:**

- [REST API](/api-reference/rest-api) — `relations` parameter in Swagger
- [Contributing Guide](/contributing/guide) — Adding new endpoints with field selection
