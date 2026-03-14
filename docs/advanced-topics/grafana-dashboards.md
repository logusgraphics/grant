---
title: Grafana Dashboards
description: Step-by-step walkthrough to create your first Grant metrics dashboard
---

# Grafana Dashboards

Reproducible steps to build a first dashboard from the Grant API Prometheus metrics. High signal: exact PromQL and panel type.

## Prerequisites

- API running with `METRICS_ENABLED=true` (and `API_PORT=4000` or match `observability/prometheus.yml`).
- Prometheus and Grafana up: `docker compose up -d prometheus grafana`.
- See [observability/README.md](observability/README.md) in the repo for the full runbook.

## 1. Add Prometheus data source

1. Open Grafana (e.g. http://localhost:3001). Log in (default `admin` / `admin` or value of `GRAFANA_ADMIN_PASSWORD`).
2. Go to **Configuration** → **Data sources** → **Add data source**.
3. Choose **Prometheus**.
4. **URL:** `http://prometheus:9090` (Grafana and Prometheus on same Docker network). If Grafana runs on the host, use `http://localhost:9090`.
5. **Save & Test**.

## 2. Create a dashboard

1. **Dashboards** → **New** → **New dashboard**.
2. **Add visualization** (or **Add** → **Visualization**).

## 3. Panel 1 — Request rate

1. Data source: **Prometheus**.
2. **Query:** (PromQL)

   ```promql
   rate(http_requests_total[5m])
   ```

3. **Visualization:** Time series.
4. **Panel title:** Request rate.
5. **Unit:** optional `reqps` (requests per second) or leave default. **Apply** or **Save**.

## 4. Panel 2 — P95 latency by route

1. **Add** → **Visualization** (new panel).
2. **Query:**

   ```promql
   histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))
   ```

3. **Visualization:** Time series.
4. **Panel title:** P95 latency by route.
5. **Unit:** `s` (seconds). Legend: `{{route}}`. **Apply** or **Save**.

## 5. Save dashboard

**Save** dashboard; give it a name (e.g. "Grant API"). You can add more panels (e.g. error rate, request count by status) using the same data source and `http_requests_total` / `http_request_duration_seconds_*` metrics.

---

**Related:**

- [Observability overview](/advanced-topics/observability-overview) — Ports and adapters, config
- Runbook: `observability/README.md` in the repo
