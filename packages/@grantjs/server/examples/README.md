# @grantjs/server examples

Minimal standalone servers showing how to use the Grant middleware with different frameworks. Each example protects **GET**, **POST**, **PUT**, **PATCH**, and **DELETE** routes using `@grantjs/server`.

## Prerequisites

- **Grant API**: A running Grant API (or mock) to authorize requests. Set `GRANT_API_URL` in `.env`.
- **Token**: Use a JWT obtained via API-key (client + secret) exchange. Scope is read from the token claims; no scope headers are required.
- Send the token on each request: `Authorization: Bearer <token>`.

## Running an example

Use **pnpm** (npm does not support `workspace:*` in this repo). From the **monorepo root**:

```bash
# Install all dependencies (including example deps) and build the server package
pnpm install
pnpm --filter @grantjs/server build

# Run an example (must run from root so examples get their node_modules)
cd packages/@grantjs/server/examples/express   # or fastify, nextjs, nestjs
cp .env.example .env
# Edit .env: set GRANT_API_URL (required) and optionally GRANT_TOKEN for local testing. Set DEBUG_GRANT=1 for request/outcome logs.
pnpm start          # express / fastify / nestjs
# pnpm dev          # nextjs (or pnpm start after pnpm build)
# pnpm start:dev    # nestjs (watch mode)
```

If you see `tsx: not found`, run `pnpm install` from the **repository root** (not from the example folder) so the examples are installed as workspace packages.

Then try the routes (see **Try it** below) with `Authorization: Bearer <token>` or a token set in `.env` as `GRANT_TOKEN`.

## Examples

| Folder    | Framework | Description                                                                                 |
| --------- | --------- | ------------------------------------------------------------------------------------------- |
| `express` | Express   | Minimal Express app with grant middleware on all HTTP methods                               |
| `fastify` | Fastify   | Minimal Fastify app with grant preHandler on all HTTP methods                               |
| `nextjs`  | Next.js   | App Router API routes with `withGrant` (Next 14–16; GET/POST/PUT/PATCH/DELETE on documents) |
| `nestjs`  | NestJS    | Guard + `@Grant` and `GrantModule` (GET/POST/PUT/PATCH/DELETE on documents)                 |

## Routes (express / fastify / nestjs)

| Method | Path           | Action | Resource |
| ------ | -------------- | ------ | -------- |
| GET    | /documents     | Query  | Document |
| POST   | /documents     | Create | Document |
| PUT    | /documents/:id | Update | Document |
| PATCH  | /documents/:id | Update | Document |
| DELETE | /documents/:id | Delete | Document |

PUT and PATCH use an optional `resourceResolver` to resolve the document by `:id` for condition evaluation.

**Next.js** uses the same actions on `/api/documents` and `/api/documents/[id]`. Run with `pnpm dev` (dev) or `pnpm start` (prod). The example uses `dotenv-cli` so `PORT` in `.env` is applied (e.g. `PORT=5000`). You can also run `pnpm start -- -p 5000`.

**NestJS** uses the same routes (`/documents`, `/documents/:id`) with `GrantGuard` and `@Grant('Document', 'Query')` (or explicit guard with `resourceResolver` for PUT/PATCH/DELETE). Run with `pnpm start` or `pnpm start:dev`; `PORT` in `.env` is applied via dotenv-cli.

## Try it

**Express / Fastify** (e.g. `http://localhost:3000`):

```bash
# List documents (requires Document:Query)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/documents

# Create (requires Document:Create)
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"My doc"}' http://localhost:3000/documents

# Update (requires Document:Update)
curl -X PATCH -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Updated"}' http://localhost:3000/documents/doc-1

# Delete (requires Document:Delete)
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/documents/doc-1
```

**Next.js** (same curls with `/api/documents` and `/api/documents/doc-1`):

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/documents
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"My doc"}' http://localhost:3000/api/documents
curl -X PATCH -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Updated"}' http://localhost:3000/api/documents/doc-1
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/documents/doc-1
```

Without a token you get `401 Unauthorized`. With an invalid or insufficient permission you get `403 Forbidden`.
