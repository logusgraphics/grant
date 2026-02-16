---
title: Umami Dashboards
description: Step-by-step walkthrough to connect Grant to Umami and build your first analytics dashboard
---

# Umami Dashboards

Reproducible steps to send events from the Grant API to Umami and view them in a dashboard. Same idea as [Grafana dashboards](/advanced-topics/grafana-dashboards) for performance metrics.

## Prerequisites

- API that can be configured with `ANALYTICS_ENABLED=true`, `ANALYTICS_PROVIDER=umami`, and Umami URL + Website ID.
- Umami running (Docker via Grant's compose, or [Umami Cloud](https://umami.is/)).

## 1. Run Umami (if self-hosted)

From the repo root:

```bash
docker compose up -d umami
```

Umami will be at http://localhost:3002 (or the port configured in `docker-compose.yml`). It uses its own database; first start may take a moment. Alternatively, use [Umami's official Docker setup](https://umami.is/docs/running-with-docker) or Umami Cloud.

## 2. Get Website ID and API URL

1. Open Umami (e.g. http://localhost:3002). Log in (default `admin` / `umami`; change on first login).
2. Go to **Websites** (or **Settings** → **Websites**). Add a website if needed (e.g. name "Grant API", domain `grant-api` or your hostname).
3. Copy the **Website ID** (UUID) and note the **API URL**: your Umami base URL (e.g. `http://localhost:3002` or `https://cloud.umami.is`).

## 3. Configure the API

Set environment variables and restart the API:

| Variable                     | Example                 | Description                         |
| ---------------------------- | ----------------------- | ----------------------------------- |
| `ANALYTICS_ENABLED`          | `true`                  | Enable analytics                    |
| `ANALYTICS_PROVIDER`         | `umami`                 | Use Umami adapter                   |
| `ANALYTICS_UMAMI_API_URL`    | `http://localhost:3002` | Umami base URL (or Umami Cloud URL) |
| `ANALYTICS_UMAMI_WEBSITE_ID` | `<uuid-from-step-2>`    | Website ID from Umami               |
| `ANALYTICS_UMAMI_HOSTNAME`   | `grant-api`             | Hostname sent with each event       |

If the API runs in Docker on the same network as Umami, use the service name for the URL (e.g. `http://umami:3000`). If the API runs on the host, use `http://localhost:3002`.

## 4. Send events from Grant

Handlers call `getAnalyticsAdapter().trackEvent({ name, category, ... })`; events are sent to Umami. Example:

```typescript
import { getAnalyticsAdapter } from '@/lib/analytics';

const adapter = getAnalyticsAdapter();
adapter
  .trackEvent({
    name: 'organization.created',
    category: 'organization',
    organizationId: organization.id,
    properties: { name: organization.name },
  })
  .catch((err) => logger.error({ msg: 'Analytics track failed', err }));
```

Trigger some actions in your app (e.g. create an organization, log in); events will appear in Umami after a short delay.

## 5. Create a dashboard in Umami

1. In Umami, open **Websites** and select the Grant API website.
2. Use the default dashboard (page views, events, referrers) or create a custom dashboard.
3. Add charts or tables; filter by event name (e.g. `organization.created`) to see server-side events sent by the Grant adapter.

## 6. Save and iterate

Save the dashboard. You can add more events in your handlers (see [Analytics](/advanced-topics/analytics) for event naming and best practices) and build additional views in Umami.

---

**Related:**

- [Analytics](/advanced-topics/analytics) — Integrations, config, usage
- [Observability overview](/advanced-topics/observability-overview) — Logging, metrics, telemetry, tracing
- Runbook: `observability/README.md` in the repo
