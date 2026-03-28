---
title: Server SDK (@grantjs/server)
description: Protecting routes and checking permissions with the Grant server SDK
---

# Server SDK (@grantjs/server)

`@grantjs/server` is the server-side SDK for Grant. It calls the Grant API over REST (no GraphQL client) and provides **Express**, **Fastify**, **NestJS**, and **Next.js** integrations so you can protect routes and run permission checks with minimal code.

## Features

- **REST-based** – Uses native `fetch`; no GraphQL client.
- **Token handling** – Reads token from `Authorization: Bearer <token>` or cookies. Uses API-key exchanged tokens (scope in JWT claims); no session refresh.
- **Framework integrations** – Express and Fastify use `grant()`; Next.js uses `withGrant()`; NestJS uses `@Grant()` and `GrantGuard`.
- **JWT-based scope** – Scope is taken from token claims (e.g. API-key / client-secret exchange). Session-style scope from request (headers/query/body) is not used.
- **Resource resolvers** – Optional async resolver for condition evaluation (e.g. load resource by ID from your DB).
- **TypeScript** – Full type safety; types from `@grantjs/schema`.

## Installation

```bash
pnpm add @grantjs/server
# or
npm install @grantjs/server
```

## Examples

The package includes minimal runnable apps for each framework under **`packages/@grantjs/server/examples/`**. Each example protects the same CRUD surface (documents: GET, POST, PUT, PATCH, DELETE). From the monorepo root:

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

See the [package examples README](https://github.com/grant-js/grant/tree/main/packages/%40grantjs/server/examples) for prerequisites, routes, and curl commands.

## GrantClient

Create a client with your Grant API URL and optional token extraction:

```typescript
import { GrantClient } from '@grantjs/server';

const grantClient = new GrantClient({
  apiUrl: 'https://api.grant.com',
});

// With custom token extraction
const grantClient = new GrantClient({
  apiUrl: 'https://api.grant.com',
  getToken: (request) => {
    const req = request as { headers?: { authorization?: string } };
    const auth = req.headers?.authorization;
    return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  },
});

// With cookie-based auth
const grantClient = new GrantClient({
  apiUrl: 'https://api.grant.com',
  cookieName: 'grant-access-token',
});
```

See the [package README](https://github.com/grant-js/grant/tree/main/packages/%40grantjs/server) for full configuration (custom fetch, credentials).

## Express

Use `grant()` from `@grantjs/server/express` to protect routes:

```typescript
import express from 'express';
import { GrantClient } from '@grantjs/server';
import { grant } from '@grantjs/server/express';

const app = express();
const grantClient = new GrantClient({ apiUrl: 'https://api.grant.com' });

app.get(
  '/organizations',
  grant(grantClient, { resource: 'Organization', action: 'Query' }),
  (req, res) => res.json({ organizations: [] })
);

// With resource resolver for condition evaluation
app.patch(
  '/projects/:id',
  grant(grantClient, {
    resource: 'Project',
    action: 'Update',
    resourceResolver: async ({ resourceSlug, request }) => {
      const projectId = (request as any).params.id;
      const project = await getProjectById(projectId);
      return project ? { id: project.id, ownerId: project.ownerId } : null;
    },
  }),
  (req, res) => res.json({ success: true })
);
```

- Returns **401** if no token is found, **404** if the resource resolver returns null, **403** if the user lacks permission.
- On success, the authorization result is attached to `req.authorization`.

## Fastify

Register the plugin, then use `grant()` as a `preHandler`:

```typescript
import Fastify from 'fastify';
import { grantPlugin, grant } from '@grantjs/server/fastify';

const fastify = Fastify();

await fastify.register(grantPlugin, {
  apiUrl: 'https://api.grant.com',
  cookieName: 'grant-access-token',
});

fastify.get(
  '/organizations',
  {
    preHandler: grant(fastify.grant, { resource: 'Organization', action: 'Query' }),
  },
  async (request, reply) => ({ organizations: [] })
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
  async (request, reply) => ({ success: true })
);
```

Behavior matches Express: 401 / 404 / 403 on failure; `request.authorization` set on success.

## Next.js (App Router)

Use `withGrant()` from `@grantjs/server/next` to wrap API route handlers:

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

Compatible with Next.js 13–16. On success, your handler receives `(request, { authorization })`.

## NestJS

Use `GrantModule`, the `@Grant()` decorator, and `GrantGuard`:

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

- Import **GrantModule.forRoot()** in `AppModule`.
- In your feature module, register **GrantGuard** as a provider (e.g. `providers: [GrantGuard]`) so Nest injects `GrantClient` and `Reflector`.
- For dynamic resource resolution, use the guard with explicit options and a `resourceResolver` (see package README).

## Token extraction

The client resolves the token in this order:

1. **Custom `getToken`** (if provided)
2. **Authorization header**: `Authorization: Bearer <token>`
3. **Cookies**: Cookie named by `cookieName` (default: `grant-access-token`)

Send the token on each request (e.g. from an API key exchange or session). Scope is read from the JWT claims on the API side; you do not pass scope in headers or body.

## Resource resolvers

Resource resolvers are optional and used for **condition evaluation** (e.g. ownership). They receive `resourceSlug` and `request` and return resource data or `null`. If they return `null`, the integration returns **404 Not Found**.

```typescript
resourceResolver: async ({ resourceSlug, request }) => {
  const id = (request as any).params.id;
  const resource = await getResourceById(id);
  return resource ? { id: resource.id, ownerId: resource.ownerId } : null;
};
```

Scope for the authorization check comes from the token, not from the request.

## Error handling

Integrations return standard HTTP status codes and JSON bodies:

- **401 Unauthorized** – No token or invalid token
- **403 Forbidden** – Token valid but permission denied (optional `reason` in body)
- **404 Not Found** – Resource resolver returned null

The package also exports error classes (`AuthenticationError`, `AuthorizationError`, `BadRequestError`, `NotFoundError`) for use when calling `grantClient.isAuthorized()` directly.

## Debug logging

Set **`DEBUG_GRANT=1`** in your environment (e.g. in `.env`) to enable request/outcome logs for all integrations. Logs include resource, action, and authorized/denied with reason.

## API and further reference

- **Authorization API:** Permission checks are performed via the Grant REST API (e.g. `POST /api/auth/is-authorized`). See [REST API](/api-reference/rest-api).
- **API keys:** For server-to-server or CLI, use [project-level or user-scoped API keys](/core-concepts/api-keys) and pass the exchanged JWT (e.g. in the `Authorization` header).
- **Package README:** [@grantjs/server](https://github.com/grant-js/grant/tree/main/packages/%40grantjs/server) – Full `GrantClient` config, TypeScript types, and comparison with `@grantjs/client`.
