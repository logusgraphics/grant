---
title: Testing
description: Testing setup and best practices for Grant
---

# Testing Setup

This project uses **Vitest** as the testing framework, which is the modern standard for testing in the Vite/Next.js ecosystem.

## 🚀 Quick Start

### Run Tests

```bash
# Run tests in watch mode (development)
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 📁 Test Structure

```
apps/
├── api/
│   └── tests/                    # API-specific tests
│       ├── unit/
│       │   ├── graphql/         # GraphQL-related unit tests
│       │   │   ├── field-selection.test.ts
│       │   │   └── scalars.test.ts
│       │   ├── middleware/
│       │   │   └── rate-limit.middleware.test.ts
│       │   ├── services/
│       │   │   └── audit-service.tenant-scope.test.ts
│       │   └── jobs/
│       │       └── tenant-job.test.ts           # Tenant job context validation
│       ├── integration/
│       │   └── rate-limit.integration.test.ts   # HTTP-level rate limit tests + benchmarks
│       └── e2e/                                 # End-to-end security and compliance tests
│           ├── scenarios/
│           │   ├── multi-tenant.e2e.test.ts     # Cross-tenant isolation
│           │   ├── negative-rbac.e2e.test.ts    # Authorization boundaries
│           │   ├── negative-auth.e2e.test.ts    # Authentication rejection
│           │   └── user-onboarding.e2e.test.ts  # User onboarding flow
│           └── compliance/
│               ├── soc2-access-control.e2e.test.ts  # SOC 2 CC6.x
│               ├── soc2-audit.e2e.test.ts           # SOC 2 CC7.x
│               ├── hipaa-phi.e2e.test.ts            # HIPAA technical safeguards
│               └── gdpr.e2e.test.ts                 # GDPR articles
└── web/
    └── tests/                    # Web app-specific tests (future)
        └── unit/                # Unit tests
            └── components/      # Component tests
```

## 🧪 Test Categories

### Unit Tests (`apps/api/tests/unit/`)

- **Field Selection Tests**: Test the GraphQL field selection optimization utilities
- **Scalar Tests**: Test custom GraphQL scalar implementations (e.g., Date scalar)
- **Rate limiting** (`tests/unit/middleware/rate-limit.middleware.test.ts`): Middleware logic—disabled/skip paths, global limit (429 + Retry-After), stricter auth-endpoint limit, shared auth bucket across login/refresh/cli-callback/token. Uses the shared cache (same as app: memory or Redis); tests pass an `InMemoryCacheAdapter` and call `store.clear()` in `beforeEach` for a clean state.

### Integration Tests (`apps/api/tests/integration/`)

- **Rate limiting** (`rate-limit.integration.test.ts`): HTTP-level tests using [supertest](https://github.com/ladjs/supertest) against a minimal Express app with the real rate-limit middleware. Asserts: `/health` never returns 429; global limit returns 429 + `Retry-After`; auth endpoint limit returns 429; response body matches `rate_limit_exceeded`. Includes optional **benchmark** reporting (duration, req/s) for requests under limit and at limit; set `BENCHMARK_REPORT=0` to suppress. See [Rate limit integration tests and benchmarks](#rate-limit-integration-tests-and-benchmarks) below.
- **API / database** (future): Full-stack GraphQL/REST and DB tests.

**Industry practice for rate limit testing:** Test at the HTTP layer (supertest or similar), use test-specific low limits and a fresh store per test to avoid cross-test pollution, assert 429 and `Retry-After`, avoid strict timing assertions in CI.

## ⚙️ Configuration

### API Tests (`apps/api/vitest.config.ts`)

- **Environment**: `node` for API testing
- **Path Resolution**: Uses `vite-tsconfig-paths` for `@/` imports
- **Coverage**: V8 coverage provider with HTML, JSON, and text reports
- **No Setup Files**: API tests don't need Next.js mocks

### Web Tests (`apps/web/vitest.config.ts`) - Future

- **Environment**: `jsdom` for DOM testing
- **Setup Files**: Will include component testing setup
- **Coverage**: V8 coverage provider

## 📝 Writing Tests

### Test File Naming

- Use `.test.ts` or `.spec.ts` extension
- Place in appropriate subdirectory under `apps/{api|web}/tests/`

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  describe('Method Name', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = someFunction(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Mocking

- Use `vi.mock()` for module mocking
- Use `vi.fn()` for function mocking
- Use `vi.spyOn()` for method spying

## Rate limit integration tests and benchmarks

Rate limit behavior is tested at two levels:

1. **Unit tests** (`tests/unit/middleware/rate-limit.middleware.test.ts`): Middleware logic in isolation (mocked config and store); fast, no HTTP.
2. **Integration tests** (`tests/integration/rate-limit.integration.test.ts`): Real HTTP via [supertest](https://github.com/ladjs/supertest) against a minimal Express app with the real middleware; asserts 429, `Retry-After`, and response body.

The integration suite includes optional **benchmark** reporting: timing and req/s for requests under limit and at limit. Output is printed when running tests unless `BENCHMARK_REPORT=0`. Assertions on timing are loose (e.g. “under 10s”) so CI does not flake; the goal is visibility, not strict performance gates.

To run only rate limit integration tests:

```bash
cd apps/api && pnpm test tests/integration/rate-limit.integration.test.ts
```

To suppress benchmark console output in CI:

```bash
BENCHMARK_REPORT=0 pnpm test
```

## Benchmarking and load testing (industry standards)

| Approach                  | Use case                                                                         | Tools / practice                                                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **In-test timing**        | Lightweight req/s and duration inside Vitest (e.g. rate limit integration tests) | `performance.now()`, loose assertions, optional `console.log`                                                                                      |
| **HTTP benchmarking**     | Sustained load, latency percentiles, connection concurrency                      | [autocannon](https://github.com/mcollina/autocannon) (Node, fast, CLI), [wrk](https://github.com/wg/wrk) / [wrk2](https://github.com/giltene/wrk2) |
| **Scenario load testing** | Complex flows, CI/CD, custom metrics                                             | [k6](https://k6.io/) (JavaScript, cloud options)                                                                                                   |

**Node.js API benchmarking (typical):**

- **autocannon**: `npx autocannon -c 10 -d 5 http://localhost:4000/health` for quick checks; no code change, run against a running server.
- **Rate limiting**: When load testing rate-limited endpoints, expect 429s after the limit; use autocannon’s `-m` / `-p` to tune method and body; measure latency of non-429 responses.

**Best practices:**

- Keep in-test “benchmarks” loose (no strict ms thresholds in CI) to avoid flakiness.
- Use autocannon/k6 against a running instance for real load; separate from unit/integration tests.
- For rate limits, verify behavior (429 + Retry-After) in integration tests; use load tools to observe throughput and latency under limit.

## Security and isolation testing

The platform includes dedicated test suites that verify multi-tenant isolation, authorization boundaries, and compliance controls. These tests follow the patterns described in [Multi-Tenancy: The Architecture Powering Billions of Users in the Cloud](https://logus.graphics/blog/multi-tenancy-architecture-powering-billions-users-cloud/) (sections on "Testing Multi-Tenant Systems" and "Isolation Testing") and the [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/).

### Strategy

Every security-relevant test creates **real tenant contexts** (users, organizations, projects, tokens) via the E2E helpers and issues actual HTTP requests against the running API. The approach is:

1. **Positive path:** Verify that an authorized user in Tenant A can perform operations within their own scope.
2. **Negative path (isolation):** Verify that the same operation by Tenant B (or an unauthenticated caller) against Tenant A's resources returns 403 or 404—never 2xx.
3. **Compliance mapping:** Each test file documents which compliance control it covers (SOC 2 CC, ISO 27001, HIPAA, GDPR articles).

### Test suites

#### Multi-tenant isolation (`tests/e2e/scenarios/multi-tenant.e2e.test.ts`)

End-to-end cross-tenant access tests. Sets up two independent organizations (Tenant A, Tenant B) and verifies:

- Tenant A cannot create projects in Tenant B's org (and vice versa).
- Tenant A cannot list, read, update, or delete Tenant B's resources by ID.
- List endpoints scoped to a tenant never return the other tenant's data.
- Invitation and member management is tenant-scoped.

Maps to SOC 2 CC6.1 (tenant separation), ISO 27001 A.8.3, HIPAA 164.312(a)(1).

#### Negative RBAC (`tests/e2e/scenarios/negative-rbac.e2e.test.ts`)

Authorization boundary tests that go beyond tenant isolation:

- Cross-tenant resource access (user A vs. user B's org).
- Invitation restrictions (cannot invite to another user's org).
- Project creation requires org membership.
- Role and permission boundary enforcement.

Maps to SOC 2 CC6.1–CC6.2, ISO 27001 A.5.15 / A.8.3.

#### Negative authentication (`tests/e2e/scenarios/negative-auth.e2e.test.ts`)

Validates rejection of invalid authentication:

- Unauthenticated access to protected endpoints (401).
- Expired, malformed, and tampered tokens.
- Revoked session tokens.

Maps to SOC 2 CC6.1, CC6.8.

#### SOC 2 access control (`tests/e2e/compliance/soc2-access-control.e2e.test.ts`)

Trust Service Criteria validation:

- CC6.1: All protected endpoints require authentication.
- CC6.2: Access provisioning (org membership) and removal.
- CC6.3: Roles and permissions are queryable for audit.
- CC6.6: JWT RS256 signing and JWKS key publication.

#### SOC 2 audit (`tests/e2e/compliance/soc2-audit.e2e.test.ts`)

Audit trail validation:

- CC7.2: CRUD operations produce audit log entries with who, what, when, and tenant scope.
- CC7.3: Audit logs cannot be modified via the API (immutability).

#### HIPAA (`tests/e2e/compliance/hipaa-phi.e2e.test.ts`)

HIPAA Security Rule technical safeguards:

- 164.312(a): Access control, unique user identification, session expiration.
- 164.312(b): Audit controls.
- 164.312(c): Integrity controls (audit immutability).
- 164.312(d): Entity authentication.
- 164.312(e): Transmission security.

#### GDPR (`tests/e2e/compliance/gdpr.e2e.test.ts`)

General Data Protection Regulation technical requirements:

- Art. 15: Right of access (data export).
- Art. 17: Right to erasure (account deletion).
- Art. 20: Data portability.
- Art. 25: Data protection by design (no sensitive fields in responses).
- Art. 32: Security of processing.

### Rate limit testing

Rate limit behavior is tested at the unit and integration level (see [Rate limit integration tests and benchmarks](#rate-limit-integration-tests-and-benchmarks) above). These tests verify:

- Global rate limit returns 429 with `Retry-After` header.
- Auth endpoints (login, refresh, CLI callback, token exchange) enforce stricter limits.
- Per-tenant rate limits isolate tenant quotas when enabled.
- `/health` is never rate-limited.

### Tenant-scoped audit testing

Unit tests (`tests/unit/services/audit-service.tenant-scope.test.ts`) verify that:

- Audit log entries include `scopeTenant` and `scopeId` when scope is present.
- Scope is extracted from authenticated context only, not from user input.
- Entries omit scope fields when no scope is present (system context).

The SOC 2 audit E2E suite (`tests/e2e/compliance/soc2-audit.e2e.test.ts`) verifies end-to-end that audit entries are created for CRUD operations and contain the expected fields.

### Running security tests

```bash
# All E2E tests (requires running API and database)
cd apps/api && pnpm test tests/e2e/

# Isolation scenarios only
cd apps/api && pnpm test tests/e2e/scenarios/multi-tenant.e2e.test.ts

# Compliance suites only
cd apps/api && pnpm test tests/e2e/compliance/
```

## 🔧 What Was Removed

### Old Testing Setup

- ❌ **`tsx` dependency**: TypeScript execution runtime (not needed for testing)
- ❌ **`scripts/` directory**: Non-standard manual testing files
- ❌ **Manual curl commands**: Replaced with proper unit tests

### Why These Changes?

- **`tsx`**: Was only used for running manual test scripts
- **Manual scripts**: Not maintainable, no CI/CD integration, hard to debug
- **Non-standard approach**: Made the codebase harder to understand and maintain

## 🎯 Benefits of New Setup

1. **Standard Testing**: Uses industry-standard Vitest framework
2. **CI/CD Ready**: Tests can run in automated pipelines
3. **Maintainable**: Clear test structure and organization
4. **Fast**: Vitest is significantly faster than Jest
5. **Type Safe**: Full TypeScript support with proper type checking
6. **Coverage**: Built-in coverage reporting
7. **UI Testing**: Optional UI for test debugging and exploration

## 🚀 Next Steps

1. **Add More Unit Tests**: Cover all utility functions and components
2. **Integration Tests**: Test GraphQL resolvers and database operations
3. **E2E Tests**: Consider adding Playwright for end-to-end testing
4. **Test Coverage**: Aim for >80% coverage across the codebase

## Testing Best Practices

### Unit Testing

1. **Test Behavior, Not Implementation**:
   - Focus on what the function does, not how it does it
   - Test inputs and expected outputs
   - Avoid testing internal implementation details

2. **Use Descriptive Test Names**:

   ```typescript
   // Good
   it('should return user data when valid ID is provided', () => {
     // test implementation
   });

   // Bad
   it('should work', () => {
     // test implementation
   });
   ```

3. **Follow AAA Pattern**:

   ```typescript
   it('should calculate total price correctly', () => {
     // Arrange
     const items = [{ price: 10 }, { price: 20 }];
     const taxRate = 0.1;

     // Act
     const total = calculateTotal(items, taxRate);

     // Assert
     expect(total).toBe(33);
   });
   ```

### Integration Testing

1. **Test API Endpoints**:

   ```typescript
   describe('User API', () => {
     it('should create a new user', async () => {
       const userData = { name: 'John', email: 'john@example.com' };

       const response = await request(app)
         .post('/graphql')
         .send({
           query: `
             mutation CreateUser($input: CreateUserInput!) {
               createUser(input: $input) {
                 id
                 name
                 email
               }
             }
           `,
           variables: { input: userData },
         });

       expect(response.status).toBe(200);
       expect(response.body.data.createUser).toMatchObject(userData);
     });
   });
   ```

2. **Test Database Operations**:

   ```typescript
   describe('User Repository', () => {
     it('should save user to database', async () => {
       const userData = { name: 'John', email: 'john@example.com' };

       const user = await userRepository.create(userData);

       expect(user.id).toBeDefined();
       expect(user.name).toBe(userData.name);
       expect(user.email).toBe(userData.email);
     });
   });
   ```

### Component Testing

1. **Test User Interactions**:

   ```typescript
   import { render, screen, fireEvent } from '@testing-library/react';
   import { UserForm } from './UserForm';

   describe('UserForm', () => {
     it('should submit form with valid data', () => {
       const onSubmit = vi.fn();

       render(<UserForm onSubmit={onSubmit} />);

       fireEvent.change(screen.getByLabelText('Name'), {
         target: { value: 'John Doe' }
       });
       fireEvent.change(screen.getByLabelText('Email'), {
         target: { value: 'john@example.com' }
       });
       fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

       expect(onSubmit).toHaveBeenCalledWith({
         name: 'John Doe',
         email: 'john@example.com'
       });
     });
   });
   ```

2. **Test Error States**:

   ```typescript
   it('should display error message for invalid email', () => {
     render(<UserForm />);

     fireEvent.change(screen.getByLabelText('Email'), {
       target: { value: 'invalid-email' }
     });
     fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

     expect(screen.getByText('Invalid email format')).toBeInTheDocument();
   });
   ```

## Coverage Goals

- **Unit Tests**: >90% coverage for utility functions and business logic
- **Integration Tests**: >80% coverage for API endpoints and database operations
- **Component Tests**: >70% coverage for UI components
- **Overall**: >80% coverage across the entire codebase

---

**Next:** Learn about [Contributing](/development/contributing) to understand how to contribute to the project.
