---
title: Structured Logging
description: Structured logging with Pino in Grant. Details are consolidated in Observability overview.
---

# Structured Logging

Grant uses [Pino](https://getpino.io/) for structured JSON logging. Full config, request logging, levels, and practices: [Observability overview — Logging](/advanced-topics/observability-overview#logging).

## Config

| Variable           | Default (prod / dev) | Description                                        |
| ------------------ | -------------------- | -------------------------------------------------- |
| `LOG_LEVEL`        | `info` / `debug`     | `trace`, `debug`, `info`, `warn`, `error`, `fatal` |
| `LOG_PRETTY_PRINT` | `false` / `true`     | Human-readable output in dev                       |

Defined in `LOGGING_CONFIG` in [apps/api/src/config/env.config.ts](apps/api/src/config/env.config.ts); applied at logger bootstrap. See `apps/api/.env.example` for all logging-related variables.

## Usage

Use `createLogger` (or alias `createModuleLogger`) for module-scoped logs; use **structured form** (object with `msg`):

```typescript
import { createLogger } from '@/lib/logger';

const logger = createLogger('MyService');
logger.info({ msg: 'Operation completed', count: 42 });
```

### Request-scoped logger

In request-scoped code (REST route handlers, GraphQL resolvers) use **`context.requestLogger`** so every log line includes `requestId`. The context is built after request-logging middleware runs. When you only have `req`, use `getRequestLogger(req)` from `@/middleware/request-logging.middleware`. Handlers that log accept an optional last parameter `requestLogger?: ILogger`; pass `context.requestLogger` from routes and resolvers so handler-originated logs (e.g. on send failure) include the same `requestId`. See [Observability overview — Logging](/advanced-topics/observability-overview#logging).

---

**Related:**

- [Observability overview](/advanced-topics/observability-overview) — Logging, metrics, telemetry
- [Configuration](/getting-started/configuration) — Environment variable reference
