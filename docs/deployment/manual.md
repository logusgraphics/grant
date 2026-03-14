---
title: Manual deployment (deprecated)
description: Legacy notes for non-Docker deployments
---

# Manual deployment (deprecated)

The **recommended** way to run the Grant Platform is with Docker (see [Docker deployment](/deployment/docker)). The manual, from-source path is no longer maintained and may fall out of sync with the rest of the docs.

If you still prefer to run everything directly on a VM with Node + nginx:

- Use this as a rough checklist only
- Cross-check configuration with the latest [Configuration](/getting-started/configuration) page and `.env.example` files

## High-level steps (non-Docker)

1. **Provision PostgreSQL and Redis**
   - Create a `grant_db` database and `grant_user` with a strong password
   - Configure Redis with authentication if exposed beyond localhost
2. **Clone and configure**
   - Clone the repo and run `pnpm install`
   - Copy `apps/api/.env.example` → `apps/api/.env` and set at least:
     - `DB_URL`
     - `SECURITY_FRONTEND_URL`
     - `CACHE_STRATEGY` / `REDIS_*` if using Redis
   - Set `APP_URL` in root `.env`; web and API read config at runtime from `GET /api/config`
3. **Build, migrate, seed**
   - `pnpm run build` in `apps/api` and `apps/web`
   - `pnpm run db:migrate` and `pnpm run db:seed` in `apps/api`
4. **Run API and web under a process manager**
   - Use systemd, PM2, or your preferred supervisor
   - Ensure `NODE_ENV=production` and env files are loaded correctly
5. **Put nginx (or another reverse proxy) in front**
   - Terminate TLS (Let’s Encrypt / Certbot, cloud LB, etc.)
   - Route `/api`, `/graphql`, `/health`, `/api-docs`, `/storage` to the API port
   - Route `/` to the web port

For new deployments, prefer the Docker path and use this page only as a reference when migrating existing non-Docker setups.
