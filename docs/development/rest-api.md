# REST API Development

This guide covers how to add new REST API endpoints with full Swagger/OpenAPI documentation.

## Architecture Overview

The REST API is built with:

- **Express.js** - Web framework
- **Zod v4** - Schema validation
- **@asteasolutions/zod-to-openapi** - OpenAPI spec generation
- **swagger-ui-express** - Interactive API documentation

### Directory Structure

```
apps/api/src/rest/
├── controllers/          # Request handlers (business logic orchestration)
│   ├── base.controller.ts
│   ├── auth.controller.ts
│   ├── accounts.controller.ts
│   └── users.controller.ts
├── routes/              # Route definitions
│   ├── index.ts
│   ├── auth.routes.ts
│   ├── accounts.routes.ts
│   └── users.routes.ts
├── schemas/             # Zod validation schemas
│   ├── common.schemas.ts
│   ├── auth.schemas.ts
│   ├── accounts.schemas.ts
│   ├── users.schemas.ts
│   └── index.ts
├── openapi/             # OpenAPI/Swagger documentation (modular)
│   ├── config.openapi.ts # Main configuration
│   ├── index.ts         # Exports
│   ├── auth.openapi.ts  # Authentication endpoints
│   ├── accounts.openapi.ts  # Accounts endpoints
│   └── users.openapi.ts # User endpoints
├── types/               # TypeScript type definitions
│   └── requests.ts
└── index.ts
```

## Adding a New Endpoint

### Step 1: Define Zod Schemas

Create a schema file in `src/rest/schemas/`:

```typescript
// src/rest/schemas/products.schemas.ts
import { z } from '@/lib/zod-openapi.lib'; // ⚠️ MUST import from here
import { createSuccessResponseSchema } from './common.schemas';

/**
 * Product entity schema
 */
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Create product request schema
 * POST /api/products
 */
export const createProductRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
});

/**
 * Create product response schema
 */
export const createProductResponseSchema = createSuccessResponseSchema(
  productSchema,
  'Successfully created product'
);

/**
 * Get products query schema
 * GET /api/products
 */
export const getProductsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
});

/**
 * Get product params schema
 * GET /api/products/:id
 */
export const getProductParamsSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
});
```

::: warning Important
Always import `z` from `@/lib/zod-openapi.lib` to ensure OpenAPI extensions are available. Importing directly from `'zod'` will cause runtime errors.
:::

Export from the index:

```typescript
// src/rest/schemas/index.ts
export * from './common.schemas';
export * from './auth.schemas';
export * from './users.schemas';
export * from './products.schemas'; // Add this
```

### Step 2: Create Controller

Create a controller in `src/rest/controllers/`:

```typescript
// src/rest/controllers/product.controller.ts
import { Response } from 'express';

import { BaseController } from './base.controller';
import {
  createProductRequestSchema,
  getProductsQuerySchema,
  getProductParamsSchema,
} from '@/rest/schemas';
import { TypedRequest } from '@/rest/types';

/**
 * Product controller
 * Handles product-related operations
 */
export class ProductController extends BaseController {
  /**
   * Get all products
   * GET /api/products
   */
  async getProducts(req: TypedRequest<{ query: typeof getProductsQuerySchema }>, res: Response) {
    try {
      const { page = '1', limit = '10', search } = req.query;

      // Call your handler/service
      const products = await this.handlers.products.list({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
      });

      this.success(res, products);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  async getProduct(req: TypedRequest<{ params: typeof getProductParamsSchema }>, res: Response) {
    try {
      const { id } = req.params;
      const product = await this.handlers.products.getById(id);

      if (!product) {
        return this.notFound(res, 'Product not found');
      }

      this.success(res, product);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Create new product
   * POST /api/products
   */
  async createProduct(
    req: TypedRequest<{
      body: typeof createProductRequestSchema;
      user: AuthenticatedUser; // Requires authentication
    }>,
    res: Response
  ) {
    try {
      const product = await this.handlers.products.create(req.body);
      this.success(res, product, 201);
    } catch (error) {
      this.handleError(res, error, 400);
    }
  }
}
```

### Step 3: Create Routes

Create route definitions in `src/rest/routes/`:

```typescript
// src/rest/routes/products.routes.ts
import { Router } from 'express';

import { validateBody, validateQuery, validateParams } from '@/middleware/validation.middleware';
import { ProductController } from '@/rest/controllers/product.controller';
import {
  createProductRequestSchema,
  getProductsQuerySchema,
  getProductParamsSchema,
} from '@/rest/schemas';
import { RequestContext } from '@/types';

export function createProductRoutes(context: RequestContext) {
  const router = Router();
  const productController = new ProductController(context);

  // GET /products - Get all products (with query validation)
  router.get('/', validateQuery(getProductsQuerySchema), (req, res) =>
    productController.getProducts(
      req as TypedRequest<{ query: typeof getProductsQuerySchema }>,
      res
    )
  );

  // GET /products/:id - Get product by ID (with params validation)
  router.get('/:id', validateParams(getProductParamsSchema), (req, res) =>
    productController.getProduct(
      req as TypedRequest<{ params: typeof getProductParamsSchema }>,
      res
    )
  );

  // POST /products - Create product (with body validation)
  router.post('/', validateBody(createProductRequestSchema), (req, res) =>
    productController.createProduct(
      req as TypedRequest<{
        body: typeof createProductRequestSchema;
        user: AuthenticatedUser; // Requires authentication
      }>,
      res
    )
  );

  return router;
}
```

::: tip Type Assertions
We use type assertions (`as TypedRequest<...>`) to bridge Express's built-in types with our validated request types. This gives us:

- **Runtime safety**: Validation middleware ensures data is correct
- **Compile-time safety**: TypeScript knows the exact structure
- **Self-documentation**: The type assertion shows what the request contains

Express wasn't designed with TypeScript in mind, so this assertion is a necessary bridge between middleware-validated data and TypeScript's type system.
:::

Register routes in the main router:

```typescript
// src/rest/routes/index.ts
import { Router } from 'express';

import { RequestContext } from '@/types';

import { createAuthRoutes } from './auth.routes';
import { createUserRoutes } from './users.routes';
import { createProductRoutes } from './products.routes'; // Add this

export function createRestRouter(context: RequestContext): Router {
  const router = Router();

  router.use('/auth', createAuthRoutes(context));
  router.use('/users', createUserRoutes(context));
  router.use('/products', createProductRoutes(context)); // Add this

  return router;
}
```

### Step 4: Register OpenAPI Documentation

OpenAPI documentation is organized into modular files under `src/rest/openapi/`. Create a new file for your module:

```typescript
// src/rest/openapi/products.openapi.ts
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
  productSchema,
  createProductRequestSchema,
  createProductResponseSchema,
  getProductsQuerySchema,
  errorResponseSchema,
  validationErrorResponseSchema,
  authenticationErrorResponseSchema,
} from '@/rest/schemas';

export function registerProductEndpoints(registry: OpenAPIRegistry) {
  // Register schemas as reusable components
  registry.register('Product', productSchema);
  registry.register('CreateProductRequest', createProductRequestSchema);

  // GET /api/products
  registry.registerPath({
    method: 'get',
    path: '/api/products',
    tags: ['Products'],
    summary: 'Get all products',
    description: 'Retrieve a paginated list of products with optional search',
    request: {
      query: getProductsQuerySchema,
    },
    responses: {
      200: {
        description: 'Successfully retrieved products',
        content: {
          'application/json': {
            schema: z.object({
              success: z.literal(true),
              data: z.array(productSchema),
            }),
            example: {
              success: true,
              data: [
                {
                  id: 'prod_123',
                  name: 'Example Product',
                  description: 'This is an example',
                  price: 29.99,
                  createdAt: '2025-10-11T00:00:00Z',
                  updatedAt: '2025-10-11T00:00:00Z',
                },
              ],
            },
          },
        },
      },
      400: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: validationErrorResponseSchema,
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  // POST /api/products
  registry.registerPath({
    method: 'post',
    path: '/api/products',
    tags: ['Products'],
    summary: 'Create a new product',
    description: 'Create a new product with the provided information',
    request: {
      body: {
        content: {
          'application/json': {
            schema: createProductRequestSchema,
            example: {
              name: 'New Product',
              description: 'Product description',
              price: 49.99,
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Successfully created',
        content: {
          'application/json': {
            schema: createProductResponseSchema,
          },
        },
      },
      400: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: validationErrorResponseSchema,
          },
        },
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: authenticationErrorResponseSchema,
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });
}
```

Then register your module in `src/rest/openapi/config.openapi.ts`:

```typescript
import { registerProductEndpoints } from './products.openapi';

function registerAllEndpoints() {
  registerAuthEndpoints(registry);
  registerAccountsOpenApi(registry);
  registerUserEndpoints(registry);
  registerProductEndpoints(registry); // Add this
}
```

And export it from `src/rest/openapi/index.ts`:

```typescript
export { registerProductEndpoints } from './products.openapi';
```

### Step 5: Test Your Endpoint

1. Start the development server:

   ```bash
   cd apps/api
   npm run dev
   ```

2. Open Swagger UI:

   ```
   http://localhost:4000/api-docs
   ```

3. Find your new endpoint under the "Products" tag

4. Click "Try it out" and test it!

## Best Practices

### Schema Organization

1. **One file per resource** - `products.schemas.ts`, `users.schemas.ts`, etc.
2. **Use descriptive names** - `createProductRequestSchema`, `productSchema`
3. **Add JSDoc comments** - Describe what each schema represents
4. **Export everything** - Make schemas reusable

### Zod Schema Tips

#### Use `z.unknown()` instead of `z.any()`

```typescript
// ❌ Bad - causes OpenAPI errors
providerData: z.record(z.any());

// ✅ Good - works with OpenAPI
providerData: z.record(z.string(), z.unknown());
```

#### Use `z.record()` with two arguments (Zod v4)

```typescript
// ❌ Bad - Zod v4 requires 2 arguments
z.record(z.unknown());

// ✅ Good
z.record(z.string(), z.unknown());
```

#### Provide validation messages

```typescript
z.string().min(1, 'Name is required').max(255, 'Name too long');
```

#### Use `.optional()` for optional fields

```typescript
z.object({
  name: z.string(), // Required
  description: z.string().optional(), // Optional
});
```

### Controller Patterns

#### Always extend `BaseController`

```typescript
export class ProductController extends BaseController {
  // Inherit success(), handleError(), notFound() methods
}
```

#### Use typed requests

```typescript
async createProduct(
  req: TypedRequest<{ body: typeof createProductRequestSchema }>,
  res: Response
) {
  // req.body is now fully typed!
}
```

#### Handle errors consistently

```typescript
try {
  const result = await this.handlers.products.create(data);
  this.success(res, result, 201);
} catch (error) {
  this.handleError(res, error, 400);
}
```

### Route Patterns

#### Apply validation middleware

```typescript
router.post(
  '/',
  validateBody(createSchema), // Validates request body
  (req, res) => controller.create(req as any, res)
);
```

#### Use appropriate validators

- `validateBody()` - for POST/PUT request bodies
- `validateQuery()` - for GET query parameters
- `validateParams()` - for URL path parameters
- `validate()` - for custom validation (body + params + query)

### OpenAPI Documentation

#### Provide comprehensive examples

```typescript
example: {
  id: 'prod_123',
  name: 'Example Product',
  price: 29.99,
}
```

#### Document all response codes

Include all possible HTTP status codes:

- 200/201 - Success
- 400 - Validation error
- 401 - Authentication required
- 403 - Forbidden
- 404 - Not found
- 500 - Server error

#### Use tags for organization

Group related endpoints:

```typescript
tags: ['Products']; // Shows under "Products" in Swagger UI
```

## Common Issues

### "Cannot read properties of undefined (reading 'parent')"

**Cause**: Not importing `z` from `zod-openapi.lib.ts`

**Solution**:

```typescript
// ❌ Bad
import { z } from 'zod';

// ✅ Good
import { z } from '@/lib/zod-openapi.lib';
```

### "Expected 2-3 arguments, but got 1"

**Cause**: Using Zod v3 syntax with Zod v4

**Solution**: Update `z.record()` calls:

```typescript
// ❌ Bad (Zod v3)
z.record(z.unknown());

// ✅ Good (Zod v4)
z.record(z.string(), z.unknown());
```

### Type errors with Express `Request`

**Cause**: Express request types don't include our custom properties

**Solution**: Use `TypedRequest` and type assertions:

```typescript
import { TypedRequest } from '@/rest/types';

router.post('/', (req, res) => controller.create(req as any, res));
```

### `.issues` vs `.errors` in ZodError

**Cause**: Zod v4 changed `.errors` to `.issues`

**Solution**: Update error handling:

```typescript
// ❌ Bad (Zod v3)
error.errors.map(...)

// ✅ Good (Zod v4)
error.issues.map(...)
```

## Testing

### Unit Testing Controllers

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ProductController } from './product.controller';

describe('ProductController', () => {
  let controller: ProductController;
  let mockContext: RequestContext;

  beforeEach(() => {
    mockContext = createMockContext();
    controller = new ProductController(mockContext);
  });

  it('should create a product', async () => {
    const req = createMockRequest({
      body: {
        name: 'Test Product',
        price: 29.99,
      },
    });
    const res = createMockResponse();

    await controller.createProduct(req as any, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        name: 'Test Product',
      }),
    });
  });
});
```

### Integration Testing

```typescript
import request from 'supertest';
import { app } from '../server';

describe('POST /api/products', () => {
  it('should create a product', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Test Product',
        price: 29.99,
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Test Product');
  });

  it('should return validation error for invalid data', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: '', // Invalid: empty name
        price: -10, // Invalid: negative price
      })
      .expect(400);

    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.details).toHaveLength(2);
  });
});
```

## See Also

- [REST API Reference](/api-reference/rest-api) - User-facing API documentation
- [GraphQL Development](/development/graphql) - GraphQL API development guide
- [Testing Guide](/development/testing) - Testing strategies
- [Architecture Overview](/architecture/overview) - System architecture
