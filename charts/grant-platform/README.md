# grant-platform Helm chart

Deploys the Grant Platform behind a **single canonical public URL** (`global.appUrl` → `APP_URL` and related env vars aligned with [`@grantjs/env`](../../packages/@grantjs/env/src/schema.ts)).

## Prerequisites

- Kubernetes 1.25+
- **Ingress controller** — [ingress-nginx](https://kubernetes.github.io/ingress-nginx/) is the reference implementation (path routing, WebSockets for `/graphql`, separate docs Ingress with regex rewrite).
- **PostgreSQL** and **Redis** — not bundled; install separately (e.g. Bitnami charts, cloud RDS/ElastiCache, or in-cluster operators) and set connection values below.

## Install

```bash
helm upgrade --install grant ./charts/grant-platform \
  --namespace grant \
  --create-namespace \
  --set global.appUrl=https://grant.example.com \
  --set externalDatabase.url=postgresql://user:pass@postgres:5432/grant_db \
  --set externalDatabase.host=postgres \
  --set redis.host=redis \
  --set redis.password=your-redis-password
```

See `values.yaml` for image tags, replica counts, ingress annotations, migration Job, and optional `ServiceMonitor`.

### TLS (cert-manager)

Add annotations via `ingress.extraAnnotations`, for example:

```yaml
ingress:
  extraAnnotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
```

Set `ingress.tls` with the secret name cert-manager creates.

## Key values → environment variables

| Value                                        | Env / effect                                                                      |
| -------------------------------------------- | --------------------------------------------------------------------------------- |
| `global.appUrl`                              | `APP_URL`, `SECURITY_FRONTEND_URL`, `OPENAPI_PRODUCTION_URL`, OAuth callback URLs |
| `include grant.docsUrl` template             | `DOCS_URL` (`{APP_URL}/docs`)                                                     |
| `externalDatabase.url`                       | `DB_URL` (in generated Secret or your `api.existingSecretEnv`)                    |
| `redis.host`, `redis.port`, `redis.password` | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`                                      |
| `config.*`                                   | `NODE_ENV`, `CACHE_STRATEGY`, `EMAIL_PROVIDER`, `METRICS_ENABLED`, etc.           |

For the full env surface, see [`packages/@grantjs/env/src/schema.ts`](../../packages/@grantjs/env/src/schema.ts) and [`docs/deployment/environment.md`](../../docs/deployment/environment.md).

## Production secrets

- Prefer **`api.existingSecretEnv`**: a Secret in the release namespace whose keys are **canonical env names** (`DB_URL`, `REDIS_PASSWORD`, `AUTH_MFA_SECRET_ENCRYPTION_KEY`, …). The chart stops generating `*-runtime` Secret when this is set.
- **`AUTH_MFA_SECRET_ENCRYPTION_KEY`** must be **stable across all API replicas** (never per-pod random values).

## Database bootstrap

- **`apps/api/src/bootstrap-job.ts`** runs in a **post-install / post-upgrade** Job (same image as the API). It calls the same `bootstrapDatabase()` path as server startup, which uses a **PostgreSQL advisory lock** so concurrent API replicas remain safe.
- You may disable the Job with `migrationJob.enabled: false` if you rely only on API startup bootstrap.

## Storage

- **`STORAGE_PROVIDER=local`** with multiple API replicas requires **ReadWriteMany** storage or **S3**; default `readOnlyRootFilesystem` is compatible with a writable volume mount for `api.persistence`.

## Ingress paths

Main Ingress routes (see [`deploy/gateway.conf.template`](../../deploy/gateway.conf.template)): API under `/graphql`, `/api`, `/api-docs`, `/.well-known`, `/org`, `/acc`, `/health`, `/storage`; example app under `/example`; web catch-all `/`. Docs use a **second** Ingress with `nginx.ingress.kubernetes.io/rewrite-target` for `/docs(/|$)(.*)`.

## Chart versioning

- **`version`** in `Chart.yaml` — chart release (SemVer).
- **`appVersion`** — tracks application / image line; image tags are set in `values.yaml` (`*.image.tag`).
