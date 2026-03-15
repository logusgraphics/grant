# Observability (Prometheus, Grafana, Tracing)

- **Prometheus** scrapes the Grant API `/metrics` endpoint. The API runs on the host; Prometheus runs in Docker and reaches it via `host.docker.internal:4000`.
- **Grafana** uses Prometheus as a data source for dashboards.
- **Tracing (Jaeger):** The API exports OpenTelemetry traces to Jaeger when `TRACING_ENABLED=true`.
- **Telemetry (log shipping):** Optional `ITelemetryAdapter` (e.g. CloudWatch); see docs Observability overview.
- **Analytics:** Optional `IAnalyticsAdapter` (e.g. Umami); see docs Analytics. First dashboard: [Umami dashboards](/advanced-topics/umami-dashboards).

## Prerequisites

- API running on the host with `METRICS_ENABLED=true` (e.g. `API_PORT=4000`).
- Docker Compose (postgres, redis, etc. can be running).

## Start

```bash
docker compose up -d prometheus grafana
```

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (default login `admin` / password from `GRAFANA_ADMIN_PASSWORD` or `admin`)

## Grafana: add Prometheus data source

1. Open Grafana → Configuration → Data sources → Add data source.
2. Choose **Prometheus**.
3. URL: `http://prometheus:9090` (same Docker network).
4. Save & Test.

## Grafana: first dashboard

Step-by-step walkthrough: [Grafana dashboards](/advanced-topics/grafana-dashboards). Quick PromQL for two panels:

- **Request rate:** `rate(http_requests_total[5m])`
- **P95 duration by route:** `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))`

## Tracing (Jaeger)

1. Start Jaeger (e.g. `docker compose up -d jaeger` if the Jaeger service is in `docker-compose.yml`, or run Jaeger all-in-one: `docker run -d --name jaeger -p 16686:16686 -p 14268:14268 jaegertracing/all-in-one`).
2. Set env and restart the API: `TRACING_ENABLED=true`, `TRACING_BACKEND=jaeger`, `JAEGER_ENDPOINT=http://localhost:14268/api/traces` (use `http://jaeger:14268/api/traces` if the API runs inside the same Docker network as Jaeger).
3. Send some HTTP or GraphQL requests to the API.
4. Open Jaeger UI (http://localhost:16686), select service `grant-api`, and click Find Traces. Spans include `http.request_id` (and optionally `http.user_id`) for correlation with logs.
