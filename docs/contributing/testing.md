---
title: Testing
description: Test setup, structure, and patterns for Grant contributors
---

# Testing

Grant uses **Vitest** for all testing across the monorepo.

## Quick Start

```bash
pnpm test              # Watch mode
pnpm test:run          # Single run
pnpm test:coverage     # With coverage report
```

## Test Structure

```
apps/api/tests/
├── unit/
│   ├── graphql/                # Field selection, custom scalars
│   ├── middleware/             # Rate limiting middleware logic
│   ├── services/              # Audit service tenant scoping
│   └── jobs/                  # Tenant job context validation
├── integration/
│   └── rate-limit.integration.test.ts   # HTTP-level rate limit tests
└── e2e/
    ├── scenarios/
    │   ├── multi-tenant.e2e.test.ts     # Cross-tenant isolation
    │   ├── negative-rbac.e2e.test.ts    # Authorization boundaries
    │   ├── negative-auth.e2e.test.ts    # Authentication rejection
    │   └── user-onboarding.e2e.test.ts  # User onboarding flow
    └── compliance/
        ├── soc2-access-control.e2e.test.ts
        ├── soc2-audit.e2e.test.ts
        ├── hipaa-phi.e2e.test.ts
        └── gdpr.e2e.test.ts
```

## Configuration

| App     | Environment | Config                                                                    |
| ------- | ----------- | ------------------------------------------------------------------------- |
| **API** | `node`      | `apps/api/vitest.config.ts` — uses `vite-tsconfig-paths` for `@/` imports |
| **Web** | `jsdom`     | `apps/web/vitest.config.ts` — component testing with DOM                  |

## Security and Compliance Tests

E2E tests create real tenant contexts (users, organizations, projects, tokens) and issue actual HTTP requests. Each test follows a positive/negative pattern:

1. **Positive** — verify authorized users can perform operations within their scope
2. **Negative** — verify unauthorized users (other tenants, unauthenticated) get 403/404

### Test Suites

| Suite                       | File                              | Compliance                                        |
| --------------------------- | --------------------------------- | ------------------------------------------------- |
| **Multi-tenant isolation**  | `multi-tenant.e2e.test.ts`        | SOC 2 CC6.1, ISO 27001 A.8.3, HIPAA 164.312(a)(1) |
| **Negative RBAC**           | `negative-rbac.e2e.test.ts`       | SOC 2 CC6.1–CC6.2, ISO 27001 A.5.15               |
| **Negative authentication** | `negative-auth.e2e.test.ts`       | SOC 2 CC6.1, CC6.8                                |
| **SOC 2 access control**    | `soc2-access-control.e2e.test.ts` | CC6.1–CC6.3, CC6.6                                |
| **SOC 2 audit**             | `soc2-audit.e2e.test.ts`          | CC7.2–CC7.3                                       |
| **HIPAA**                   | `hipaa-phi.e2e.test.ts`           | 164.312(a–e)                                      |
| **GDPR**                    | `gdpr.e2e.test.ts`                | Articles 15, 17, 20, 25, 32                       |

### Running Security Tests

```bash
cd apps/api

# All E2E tests (requires running API and database)
pnpm test tests/e2e/

# Isolation scenarios only
pnpm test tests/e2e/scenarios/multi-tenant.e2e.test.ts

# Compliance suites only
pnpm test tests/e2e/compliance/
```

## Rate Limit Testing

Rate limiting is tested at two levels:

- **Unit** (`tests/unit/middleware/`) — middleware logic in isolation with mocked config and store
- **Integration** (`tests/integration/`) — HTTP-level via supertest against a minimal Express app

The integration suite includes optional benchmark reporting (duration, req/s). Suppress with `BENCHMARK_REPORT=0`.

## Coverage Goals

| Category                         | Target |
| -------------------------------- | ------ |
| Unit (utilities, business logic) | > 90%  |
| Integration (API endpoints)      | > 80%  |
| Component (UI)                   | > 70%  |
| Overall                          | > 80%  |

---

**Related:**

- [Development Guide](/contributing/guide) — Project structure and workflow
- [Security Audit](/contributing/security-audit) — Dependency vulnerability scanning
