---
title: Development Guide
description: Project structure and development workflow for Grant contributors
---

# Development Guide

This guide is for contributors working on the Grant platform itself. If you are integrating Grant into your application, see the [Integration Guide](/integration/guide).

## Project Structure

```
├── apps/
│   ├── api/                # Apollo Server + Express REST API
│   │   ├── src/
│   │   │   ├── config/     # Environment configuration
│   │   │   ├── graphql/    # Resolvers (queries, mutations, field resolvers)
│   │   │   ├── handlers/   # Orchestration layer (caching, transactions)
│   │   │   ├── services/   # Business logic and validation
│   │   │   ├── repositories/ # Database access (Drizzle ORM)
│   │   │   ├── rest/       # REST routes, schemas, OpenAPI
│   │   │   ├── middleware/  # Express middleware
│   │   │   └── lib/        # Shared utilities (logger, errors, auth)
│   │   └── tests/          # Unit, integration, and E2E tests
│   └── web/                # Next.js 15 dashboard (App Router)
├── packages/@grantjs/
│   ├── schema/             # GraphQL schema + codegen types
│   ├── core/               # Domain ports, interfaces, exceptions
│   ├── constants/          # Resource definitions, permissions, groups
│   ├── database/           # Drizzle schemas, migrations, seeds
│   ├── logger/             # Pino adapter
│   ├── errors/             # HTTP error adapter
│   ├── cache/              # Redis / in-memory adapter
│   ├── storage/            # S3 / local adapter
│   ├── email/              # SMTP / SES adapter
│   ├── jobs/               # node-cron / BullMQ adapter
│   ├── server/             # Server SDK (Express, Fastify, NestJS, Next.js)
│   ├── client/             # Browser SDK (React hooks, GrantGate)
│   └── cli/                # Grant CLI
└── docs/                   # VitePress documentation site
```

## Layer Boundaries

```
Transport (GraphQL resolvers, REST routes)
  → Handlers (orchestration, caching, transactions)
    → Services (business logic, validation, audit logging)
      → Repositories (Drizzle ORM, field selection)
        → Database (PostgreSQL + RLS)
```

**Hard rules:**

- Handlers never import repositories — they go through services
- Repositories never import services or handlers
- REST/GraphQL resolvers never import repositories — they call handlers only
- Import logger from `@/lib/logger`, errors from `@/lib/errors`, shared types from `@/types`

## Development Workflow

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Install dependencies
pnpm install

# 3. Run database migrations and seed
pnpm --filter @grantjs/database db:migrate
pnpm --filter @grantjs/database db:seed

# 4. Generate schema types (after GraphQL changes)
pnpm --filter @grantjs/schema generate

# 5. Start dev servers
pnpm --filter api dev      # API on :4000
pnpm --filter web dev      # Web on :3000
```

## Adding a GraphQL Feature

1. **Schema** — Define types, inputs, queries, and mutations in `packages/@grantjs/schema/src/schema/{feature}/`
2. **Operations** — Add operation documents in `packages/@grantjs/schema/src/operations/{feature}/`
3. **Generate** — Run `pnpm --filter @grantjs/schema generate` to produce TypeScript types
4. **Repository** — Add database access methods in `apps/api/src/repositories/`
5. **Service** — Add business logic with Zod validation in `apps/api/src/services/`
6. **Handler** — Add orchestration (caching, transactions) in `apps/api/src/handlers/`
7. **Resolver** — Register query/mutation resolvers in `apps/api/src/graphql/resolvers/`

## Adding a REST Endpoint

See [Adding REST Endpoints](/contributing/rest-api) for the full step-by-step guide covering Zod schemas, routes, RBAC guards, and OpenAPI registration.

## Code Style

- TypeScript strict mode everywhere
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`
- Use `@/` and `@grantjs/*` aliases — no deep relative paths
- Use `import type` for type-only imports
- Use domain-specific errors (`NotFoundError`, `ValidationError`) — never raw `throw new Error(...)`
- Use the structured logger — never `console.log` in runtime code

## Contributing

1. Fork the repository
2. Create a feature branch from `main`
3. Follow the layer boundaries and code style
4. Ensure `pnpm build` and `pnpm test` pass
5. Open a pull request

---

**Related:**

- [Architecture Overview](/architecture/overview) — System design and package graph
- [Adding REST Endpoints](/contributing/rest-api) — REST development guide
- [Testing](/contributing/testing) — Test setup and patterns
