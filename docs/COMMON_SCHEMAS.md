# Common Schemas Documentation

This document describes the common Zod schemas available for use across all services to ensure consistency and reduce duplication.

## Overview

The common schemas are located in `graphql/services/common/schemas.ts` and provide standardized validation patterns for common data types and structures used throughout the application.

## Basic Schemas

### Core Validation Schemas

| Schema              | Type         | Description            | Validation Rules                 |
| ------------------- | ------------ | ---------------------- | -------------------------------- |
| `idSchema`          | `z.string()` | ID validation          | Min length 1, required           |
| `emailSchema`       | `z.string()` | Email validation       | Valid email format, required     |
| `nameSchema`        | `z.string()` | Name validation        | Min length 1, max 255 chars      |
| `descriptionSchema` | `z.string()` | Description validation | Max 1000 chars, optional         |
| `actionSchema`      | `z.string()` | Action validation      | Min length 1, max 255 chars      |
| `slugSchema`        | `z.string()` | Slug validation        | Lowercase, numbers, hyphens only |
| `colorSchema`       | `z.string()` | Color validation       | Hex format (#RRGGBB)             |

### Pagination & Search Schemas

| Schema         | Type         | Description       | Validation Rules         |
| -------------- | ------------ | ----------------- | ------------------------ |
| `limitSchema`  | `z.number()` | Limit validation  | Integer, -1 to 100       |
| `pageSchema`   | `z.number()` | Page validation   | Integer, min 1, optional |
| `searchSchema` | `z.string()` | Search validation | Min 2 chars, optional    |

### Sort Schemas

| Schema            | Type         | Description        | Validation Rules |
| ----------------- | ------------ | ------------------ | ---------------- |
| `sortOrderSchema` | `z.enum()`   | Sort order         | 'ASC' or 'DESC'  |
| `sortSchema`      | `z.object()` | Sort configuration | Field + order    |

### Timestamp Schemas

| Schema            | Type       | Description        | Validation Rules   |
| ----------------- | ---------- | ------------------ | ------------------ |
| `createdAtSchema` | `z.date()` | Creation timestamp | Required date      |
| `updatedAtSchema` | `z.date()` | Update timestamp   | Required date      |
| `deletedAtSchema` | `z.date()` | Deletion timestamp | Nullable, optional |

## Composite Schemas

### Entity Schemas

| Schema              | Type         | Description            | Includes                            |
| ------------------- | ------------ | ---------------------- | ----------------------------------- |
| `baseEntitySchema`  | `z.object()` | Base entity structure  | id, createdAt, updatedAt, deletedAt |
| `namedEntitySchema` | `z.object()` | Named entity structure | baseEntity + name, description      |

### Pagination Schemas

| Schema                       | Type         | Description            | Includes                         |
| ---------------------------- | ------------ | ---------------------- | -------------------------------- |
| `paginationSchema`           | `z.object()` | Basic pagination       | limit, page                      |
| `searchFilterSchema`         | `z.object()` | Search with pagination | search, limit, page              |
| `paginatedResponseSchema<T>` | Generic      | Paginated response     | items[], totalCount, hasNextPage |

### CRUD Schemas

| Schema                 | Type         | Description          | Includes                                    |
| ---------------------- | ------------ | -------------------- | ------------------------------------------- |
| `crudParamsSchema`     | `z.object()` | CRUD parameters      | ids[], limit, page, search, requestedFields |
| `sortableParamsSchema` | `z.object()` | Sortable CRUD params | crudParams + sort                           |

### Input Schemas

| Schema              | Type         | Description            | Includes           |
| ------------------- | ------------ | ---------------------- | ------------------ |
| `createInputSchema` | `z.object()` | Create operation input | input: record      |
| `updateInputSchema` | `z.object()` | Update operation input | id + input: record |
| `deleteInputSchema` | `z.object()` | Delete operation input | id                 |

### Relationship Schemas

| Schema                          | Type         | Description         | Includes            |
| ------------------------------- | ------------ | ------------------- | ------------------- |
| `addRelationshipInputSchema`    | `z.object()` | Add relationship    | input: { id1, id2 } |
| `removeRelationshipInputSchema` | `z.object()` | Remove relationship | input: { id1, id2 } |

## Enhanced Schemas with Refinements

### Non-Empty String Schemas

| Schema                 | Type         | Description      | Includes                       |
| ---------------------- | ------------ | ---------------- | ------------------------------ |
| `nonEmptyNameSchema`   | `z.string()` | Non-empty name   | nameSchema + trim validation   |
| `nonEmptyEmailSchema`  | `z.string()` | Non-empty email  | emailSchema + trim validation  |
| `nonEmptyActionSchema` | `z.string()` | Non-empty action | actionSchema + trim validation |

### Utility Functions

| Function                   | Type                         | Description                              |
| -------------------------- | ---------------------------- | ---------------------------------------- |
| `nonEmptyStringRefinement` | `(value: string) => boolean` | Checks if string is non-empty after trim |
| `nonEmptyStringMessage`    | `string`                     | Standard error message for empty strings |

## Usage Examples

### Basic Entity Schema

```typescript
import { baseEntitySchema, nameSchema, descriptionSchema } from '../common/schemas';

export const userSchema = baseEntitySchema.extend({
  name: nameSchema,
  email: emailSchema,
  description: descriptionSchema,
});
```

### Paginated Response

```typescript
import { paginatedResponseSchema } from '../common/schemas';

export const userPageSchema = paginatedResponseSchema(userSchema).transform((data) => ({
  users: data.items,
  totalCount: data.totalCount,
  hasNextPage: data.hasNextPage,
}));
```

### CRUD Parameters

```typescript
import { sortableParamsSchema } from '../common/schemas';

export const getUsersParamsSchema = sortableParamsSchema.extend({
  tagIds: z.array(idSchema).optional(),
  sort: userSortInputSchema.optional(),
});
```

### Relationship Operations

```typescript
import { addRelationshipInputSchema, removeRelationshipInputSchema } from '../common/schemas';

export const addUserRoleParamsSchema = addRelationshipInputSchema;
export const removeUserRoleParamsSchema = removeRelationshipInputSchema;
```

## Best Practices

### 1. Always Use Common Schemas

✅ **Good:**

```typescript
import { idSchema, nameSchema } from '../common/schemas';

export const createUserSchema = z.object({
  id: idSchema,
  name: nameSchema,
});
```

❌ **Bad:**

```typescript
export const createUserSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
});
```

### 2. Extend Base Schemas

✅ **Good:**

```typescript
export const userSchema = baseEntitySchema.extend({
  name: nameSchema,
  email: emailSchema,
});
```

❌ **Bad:**

```typescript
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});
```

### 3. Use Composite Schemas

✅ **Good:**

```typescript
export const getUsersParamsSchema = sortableParamsSchema.extend({
  tagIds: z.array(idSchema).optional(),
});
```

❌ **Bad:**

```typescript
export const getUsersParamsSchema = z.object({
  ids: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
  search: z.string().optional(),
  sort: z
    .object({
      field: z.string(),
      order: z.enum(['ASC', 'DESC']),
    })
    .optional(),
});
```

## Validation

Run the schema validation script to ensure all services are using common schemas consistently:

```bash
npm run validate-schemas
# or
npx tsx scripts/validate-schemas.ts
```

## Adding New Common Schemas

When adding new common schemas:

1. **Follow naming convention**: Use descriptive names ending with `Schema`
2. **Add validation**: Include appropriate validation rules and error messages
3. **Document**: Add to this documentation
4. **Test**: Ensure it works across multiple services
5. **Update validation script**: Add to the `COMMON_SCHEMAS` array

## Migration Guide

To migrate existing services to use common schemas:

1. **Identify duplicates**: Look for repeated validation patterns
2. **Import common schemas**: Add imports from `../common/schemas`
3. **Replace definitions**: Use common schemas instead of local definitions
4. **Test**: Ensure validation still works correctly
5. **Validate**: Run the validation script to confirm compliance
