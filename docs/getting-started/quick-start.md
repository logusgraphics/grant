# Quick Start

Get Grant running locally in under 10 minutes: clone, start infrastructure, run the app.

## Prerequisites

- **Node.js** 20+ and **pnpm** (`npm install -g pnpm` if you don't have it)
- **Docker** and **Docker Compose**

## 1. Clone the repository

```bash
git clone https://github.com/logusgraphics/grant.git
cd grant
```

## 2. Start infrastructure

Grant needs PostgreSQL and Redis. Docker Compose handles both:

```bash
docker compose up -d
```

Verify everything is healthy:

```bash
docker compose ps
```

You should see `grant-postgres` and `grant-redis` running with status `healthy`.

## 3. Install dependencies

```bash
pnpm install
```

## 4. Configure environment

Copy the example environment files:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

The defaults work out of the box for local development. The key variables:

| File            | Variable              | Default                                                          | Purpose                            |
| --------------- | --------------------- | ---------------------------------------------------------------- | ---------------------------------- |
| `.env`          | `POSTGRES_PASSWORD`   | `grant_password`                                                 | Docker Compose PostgreSQL password |
| `apps/api/.env` | `DB_URL`              | `postgresql://grant_user:grant_password@localhost:5432/grant_db` | API database connection            |
| `apps/api/.env` | `APP_URL`             | `http://localhost:4000`                                          | API base URL (JWT issuer)          |
| `apps/web/.env` | `NEXT_PUBLIC_API_URL` | `http://localhost:4000`                                          | Frontend API URL                   |

::: tip
For production, update passwords, enable rate limiting, and configure a real email provider. See the [Configuration Guide](/getting-started/configuration) for all options.
:::

## 5. Run database migrations and seed

```bash
# Create database tables
pnpm --filter @grantjs/database db:migrate

# Seed roles, permissions, groups, system user, and signing keys
pnpm --filter @grantjs/database db:seed
```

Expected output:

```
🌱 Starting database seeding...
   ✓ Permissions, roles, and groups
   ✓ System user + system signing key
📝 Seeding permissions...
✅ Seeding completed successfully!
```

## 6. Start development servers

```bash
pnpm dev
```

This starts both services:

| Service | URL                                            | Description        |
| ------- | ---------------------------------------------- | ------------------ |
| **API** | [http://localhost:4000](http://localhost:4000) | GraphQL + REST API |
| **Web** | [http://localhost:3000](http://localhost:3000) | Next.js frontend   |

## 7. Create your first account

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click **Sign Up** to create your account
3. Fill in your name, email, and password
4. You'll be taken to the dashboard where you can create your first organization and project

::: info
In development mode, the email provider is set to `console` -- verification emails are printed to the API terminal output instead of being sent.
:::

## What's running

```
┌─────────────────────────────────────────────────┐
│  Browser → localhost:3000 (Next.js)             │
│     ↓                                           │
│  API → localhost:4000 (Apollo Server + REST)    │
│     ↓                                           │
│  PostgreSQL → localhost:5432 (Docker)           │
│  Redis → localhost:6379 (Docker)                │
└─────────────────────────────────────────────────┘
```

## Stopping everything

```bash
# Stop the dev servers (Ctrl+C in the terminal running pnpm dev)

# Stop infrastructure
docker compose down

# To also remove data volumes
docker compose down -v
```

## Next Steps

- **[Architecture Overview](/architecture/overview)** -- Understand the system design
- **[RBAC System](/architecture/rbac)** -- Learn the permission model
- **[Server SDK](/integration/server-sdk)** -- Protect your own routes with `@grantjs/server`
- **[Client SDK](/integration/client-sdk)** -- Permission-based UI with `@grantjs/client`
- **[Self-Hosting Guide](/deployment/self-hosting)** -- Deploy to production

## Troubleshooting

### Docker containers won't start

- Make sure ports 5432 (PostgreSQL) and 6379 (Redis) are not already in use
- Run `docker compose logs postgres` or `docker compose logs redis` to check for errors

### Database migration fails

- Verify PostgreSQL is running: `docker compose ps`
- Check the `DB_URL` in `apps/api/.env` matches the credentials in `.env`

### `pnpm dev` fails to start

- Ensure all dependencies are installed: `pnpm install`
- Check Node.js version: `node --version` (requires 20+)
- Verify environment files exist: `ls apps/api/.env apps/web/.env`
