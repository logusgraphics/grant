# @grantjs/server

Server SDK for Grant authorization platform. Provides middleware and guards for **Express**, **Fastify**, **NestJS**, and **Next.js** applications.

**Documentation:** [Server SDK](https://github.com/grant-js/grant/blob/main/docs/integration/server-sdk.md) in the official docs.

## Features

- **REST-based API** – Uses native `fetch`, no GraphQL client required
- **Framework integrations** – Express (`grant()`), Fastify (`grant()`), NestJS (`@Grant` + `GrantGuard`), Next.js (`withGrant()`)
- **Token extraction** – Supports Authorization header and cookies
- **Resource resolvers** – Optional resource resolution for condition evaluation
- **JWT-based scope** – Scope is taken from token claims (API-key / client-secret flows); session-style scope from request is not used
- **TypeScript** – Full type safety with types from `@grantjs/schema`
- **Generic** – Works with any permission model (uses plain strings for resource/action)

## Installation

```bash
npm install @grantjs/server
# or
pnpm add @grantjs/server
# or
yarn add @grantjs/server
```

## Examples

Minimal runnable apps for each framework live in **`examples/`** and share the same CRUD surface (documents: GET, POST, PUT, PATCH, DELETE). From the repo root:

```bash
pnpm install
pnpm --filter @grantjs/server build
cd packages/@grantjs/server/examples/express   # or fastify, nextjs, nestjs
cp .env.example .env   # set GRANT_API_URL and optionally GRANT_TOKEN
pnpm start
```

| Example   | Framework | Usage                                                            |
| --------- | --------- | ---------------------------------------------------------------- |
| `express` | Express   | `grant(client, { resource, action })` middleware                 |
| `fastify` | Fastify   | `grant(client, { resource, action })` preHandler                 |
| `nextjs`  | Next.js   | `withGrant(client, { resource, action }, handler)` on API routes |
| `nestjs`  | NestJS    | `@Grant(resource, action)` + `GrantGuard`, `GrantModule`         |

See **[examples/README.md](./examples/README.md)** for prerequisites, routes, and curl commands.

## Quick Start

### 1. Create the Client

```typescript
import { GrantClient } from '@grantjs/server';

// Basic configuration (uses Authorization header or cookies)
const grantClient = new GrantClient({
  apiUrl: 'https://api.grant.com',
});

// With cookie-based auth
const grantClient = new GrantClient({
  apiUrl: 'https://api.grant.com',
  cookieName: 'grant-access-token', // Default: 'grant-access-token'
});

// With custom token extraction
const grantClient = new GrantClient({
  apiUrl: 'https://api.grant.com',
  getToken: (request) => {
    // Custom logic to extract token from request
    const req = request as { headers?: { 'x-api-key'?: string } };
    return req.headers?.['x-api-key'] || null;
  },
});
```

### 2. Express Middleware

```typescript
import express from 'express';
import { grant } from '@grantjs/server/express';

const app = express();
const grantClient = new GrantClient({ apiUrl: 'https://api.grant.com' });

// Basic usage
app.get(
  '/organizations',
  grant(grantClient, {
    resource: 'Organization',
    action: 'Query',
  }),
  async (req, res) => {
    // User is authorized, proceed with handler
    res.json({ organizations: [] });
  }
);

// With resource resolver for condition evaluation
app.patch(
  '/projects/:id',
  grant(grantClient, {
    resource: 'Project',
    action: 'Update',
    resourceResolver: async ({ resourceSlug, request }) => {
      // Resolve the project resource for condition evaluation
      const projectId = (request as any).params.id;
      const project = await getProjectById(projectId);
      return project ? { id: project.id, ownerId: project.ownerId } : null;
    },
  }),
  async (req, res) => {
    // User is authorized, proceed with handler
    res.json({ success: true });
  }
);
```

### 3. Fastify Plugin

```typescript
import Fastify from 'fastify';
import { grantPlugin, grant } from '@grantjs/server/fastify';
import { GrantClient } from '@grantjs/server';

const fastify = Fastify();

// Register the plugin (decorates fastify.grant)
await fastify.register(grantPlugin, {
  apiUrl: 'https://api.grant.com',
  cookieName: 'grant-access-token',
});

// Use preHandler hook
fastify.get(
  '/organizations',
  {
    preHandler: grant(fastify.grant, {
      resource: 'Organization',
      action: 'Query',
    }),
  },
  async (request, reply) => {
    return { organizations: [] };
  }
);

// With resource resolver
fastify.patch(
  '/projects/:id',
  {
    preHandler: grant(fastify.grant, {
      resource: 'Project',
      action: 'Update',
      resourceResolver: async ({ resourceSlug, request }) => {
        const projectId = (request.params as { id: string }).id;
        const project = await getProjectById(projectId);
        return project ? { id: project.id, ownerId: project.ownerId } : null;
      },
    }),
  },
  async (request, reply) => {
    return { success: true };
  }
);
```

### 4. Next.js (App Router)

```typescript
// app/api/documents/route.ts
import { NextResponse } from 'next/server';
import { withGrant } from '@grantjs/server/next';
import { GrantClient } from '@grantjs/server';

const grantClient = new GrantClient({ apiUrl: process.env.GRANT_API_URL! });

export const GET = withGrant(grantClient, { resource: 'Document', action: 'Query' }, async () =>
  NextResponse.json({ data: [] })
);

export const POST = withGrant(
  grantClient,
  { resource: 'Document', action: 'Create' },
  async (request) => {
    const body = await request.json();
    return NextResponse.json({ data: { title: body?.title ?? 'Untitled' } }, { status: 201 });
  }
);
```

### 5. NestJS

```typescript
// app.module.ts
import { GrantModule } from '@grantjs/server/nest';

@Module({
  imports: [
    GrantModule.forRoot({
      apiUrl: process.env.GRANT_API_URL!,
      getToken: (req: any) => req.headers?.authorization?.replace?.('Bearer ', '') ?? null,
    }),
  ],
})
export class AppModule {}

// documents.controller.ts
import { Grant, GrantGuard } from '@grantjs/server/nest';

@Controller('documents')
export class DocumentsController {
  @Get()
  @Grant('Document', 'Query')
  @UseGuards(GrantGuard)
  list() {
    return { data: [] };
  }

  @Post()
  @Grant('Document', 'Create')
  @UseGuards(GrantGuard)
  create(@Body() body: { title?: string }) {
    return { data: { title: body?.title ?? 'Untitled' } };
  }
}
```

Register `GrantGuard` as a provider in your feature module (e.g. `providers: [GrantGuard]`) so Nest injects `GrantClient`. See `examples/nestjs` for a full app.

## API Reference

### GrantClient

```typescript
const grantClient = new GrantClient(config: GrantServerConfig);
```

#### Configuration

```typescript
interface GrantServerConfig {
  // Required
  apiUrl: string;

  // Optional
  cookieName?: string; // Default: 'grant-access-token'
  getToken?: (request: unknown) => string | null | Promise<string | null>;
  fetch?: typeof fetch;
  credentials?: RequestCredentials;
}
```

#### Methods

```typescript
// Permission checks
grantClient.isGranted(resource, action, options?, request?): Promise<boolean>
grantClient.isAuthorized(resource, action, options?, request?): Promise<AuthorizationResult>

// Token extraction
grantClient.getTokenFromRequest(request): Promise<string | null>
```

### Express Middleware

#### `grant(client, options)`

Creates Express middleware that checks authorization before proceeding.

**Options:**

```typescript
interface GrantOptions {
  resource: string; // Resource slug (e.g., "Organization", "Project", "Document")
  action: string; // Action name (e.g., "Query", "Create", "Update", "Delete")
  resourceResolver?: ResourceResolver; // Resource resolution for conditions
}
```

**Behavior:**

- Returns `401 Unauthorized` if no token is found
- Returns `404 Not Found` if resource resolver returns null
- Returns `403 Forbidden` if user lacks permission
- Calls `next()` if authorized
- Attaches `authorization` result to `req.authorization` for downstream use
- Scope for authorization is taken from the JWT (e.g. API-key / client-secret tokens); it is not extracted from the request

### Fastify Plugin

#### `grantPlugin(fastify, options)`

Registers a Fastify plugin that decorates the instance with `fastify.grant` (GrantClient).

**Options:**

Same as `GrantServerConfig` - see [GrantClient Configuration](#grantclient) above.

**Usage:**

```typescript
await fastify.register(grantPlugin, {
  apiUrl: 'https://api.grant.com',
  cookieName: 'grant-access-token',
});

// Now fastify.grant is available
const canEdit = await fastify.grant.isGranted('Document', 'Update', undefined, request);
```

#### `grant(client, options)`

Creates a Fastify `preHandler` hook that checks authorization before proceeding.

**Options:**

Same as Express `GrantOptions` - see above.

**Behavior:**

- Returns `401 Unauthorized` if no token is found
- Returns `404 Not Found` if resource resolver returns null
- Returns `403 Forbidden` if user lacks permission
- Attaches `authorization` result to `request.authorization` for downstream use
- Scope for authorization is taken from the JWT; it is not extracted from the request

### Next.js (App Router)

#### `withGrant(client, options, handler)`

Wraps an App Router route handler with Grant authorization. Use for `GET`, `POST`, `PUT`, `PATCH`, `DELETE` in `app/api/.../route.ts`.

**Options:** Same as Express `GrantOptions` (resource, action, optional resourceResolver).

**Behavior:** Returns `401` / `404` / `403` responses on failure; calls your handler with `(request, { authorization })` on success. Compatible with Next.js 13–16.

### NestJS

#### `GrantModule.forRoot(config)`

Global module that provides `GrantClient` for injection. Import in `AppModule`.

#### `@Grant(resource, action)` / `Grant(resource, action)`

Decorator that sets resource/action metadata for `GrantGuard`. Use with `@UseGuards(GrantGuard)` on controller methods.

#### `GrantGuard`

Guard that reads options from `@Grant()` metadata (or explicit constructor options with optional `resourceResolver`). Register as a provider (e.g. `providers: [GrantGuard]`) so Nest injects `GrantClient` and `Reflector`. Exports `GRANT_CLIENT` and `GRANT_OPTIONS_KEY` for advanced use.

## Token Extraction

The client supports multiple token extraction methods (in order of precedence):

1. **Custom `getToken` function** (if provided)
2. **Authorization header**: `Authorization: Bearer <token>`
3. **Cookies**: Cookie named by `cookieName` config (default: `grant-access-token`)

## Resource Resolvers

Resource resolvers are optional functions that resolve resource data for condition evaluation. Scope is not passed from the middleware (it is taken from the JWT on the API side).

```typescript
const resourceResolver: ResourceResolver = async ({ resourceSlug, request }) => {
  // Fetch resource from database
  const resource = await getResource(resourceSlug, request);

  // Return resource data for condition evaluation
  // e.g., { id: '...', ownerId: '...', status: 'active' }
  return resource ? { id: resource.id, ownerId: resource.ownerId } : null;
};
```

If the resolver returns `null`, the middleware returns `404 Not Found`.

## Development / Debug

Set **`DEBUG_GRANT=1`** in your environment (e.g. in `.env`) to enable request/outcome logs for all integrations (Express, Fastify, Next, Nest). Logs include resource, action, and authorized/denied with reason.

## Error Handling

The package exports error classes for graceful error handling:

```typescript
import {
  AuthenticationError, // 401
  AuthorizationError, // 403
  BadRequestError, // 400
  NotFoundError, // 404
} from '@grantjs/server';

try {
  await grantClient.isAuthorized('resource', 'action', undefined, request);
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Handle 401
  } else if (error instanceof AuthorizationError) {
    // Handle 403
  }
}
```

## TypeScript

Full type definitions are included:

```typescript
import type {
  GrantServerConfig,
  AuthorizationResult,
  PermissionCheckOptions,
  Scope,
  ResourceResolver,
} from '@grantjs/server';

import { Tenant } from '@grantjs/schema';
```

## Comparison with @grantjs/client

The server package (`@grantjs/server`) is designed for **server-side** Node.js applications, while the client package (`@grantjs/client`) is for **browser** applications.

**Key Differences:**

| Feature               | @grantjs/server                                                    | @grantjs/client             |
| --------------------- | ------------------------------------------------------------------ | --------------------------- |
| **Target**            | Node.js servers                                                    | Browser apps                |
| **Caching**           | No (handled by API)                                                | Yes (5min TTL)              |
| **Token Source**      | Request object                                                     | Callback functions          |
| **Framework Support** | Express, Fastify, NestJS, Next.js                                  | React, Vue, Svelte, Angular |
| **API**               | `grant()` (Express/Fastify), `withGrant()` (Next), `@Grant` (Nest) | `useGrant()` hook           |
| **Error Handling**    | HTTP status codes                                                  | Boolean returns             |
| **Resource/Action**   | Plain strings (generic)                                            | Plain strings (generic)     |

**When to Use:**

- **@grantjs/server**: Protecting API routes, GraphQL resolvers, server-side middleware
- **@grantjs/client**: Conditional UI rendering, client-side permission checks

## License

MIT
