---
title: Metrics & Monitoring
description: Prometheus metrics and monitoring in Grant. Details are consolidated in Observability overview.
---

# Metrics & Monitoring

The API exposes HTTP request metrics for [Prometheus](https://prometheus.io/) when enabled. Full config, runbook, and PromQL: [Observability overview — Metrics](/advanced-topics/observability-overview#metrics).

## Config

| Variable                   | Default    | Description             |
| -------------------------- | ---------- | ----------------------- |
| `METRICS_ENABLED`          | `false`    | Expose GET /metrics     |
| `METRICS_ENDPOINT`         | `/metrics` | Path for the endpoint   |
| `METRICS_COLLECT_DEFAULTS` | `true`     | CPU, memory, event loop |

Defined in [apps/api/src/config/env.config.ts](apps/api/src/config/env.config.ts); implementation in [apps/api/src/lib/metrics/](apps/api/src/lib/metrics/).

## Running the stack

See `observability/README.md` in the repo:

1. Start the API with `METRICS_ENABLED=true` (and `APP_PORT=4000` or match `observability/prometheus.yml`).
2. Run `docker compose up -d prometheus grafana`.
3. In Grafana (e.g. http://localhost:3001), add a Prometheus data source with URL `http://prometheus:9090`.

## Example PromQL

Request rate:

```promql
rate(http_requests_total[5m])
```

95th percentile duration by route:

```promql
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))
```

Full metrics section: [Observability overview — Metrics](/advanced-topics/observability-overview#metrics).

---

**Related:**

- [Observability overview](/advanced-topics/observability-overview) — Logging, metrics, telemetry
- [Configuration](/getting-started/configuration) — Environment variable reference
