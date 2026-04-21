# @grantjs/database

Database schemas, migrations, and utilities for the Grant.

## Overview

This package contains all database-related code for the Grant:

- **Drizzle ORM schemas** - Database table definitions and relationships
- **Migrations** - Database schema migration files
- **Connection utilities** - Database connection and configuration
- **Seed scripts** - Database seeding and reset utilities

## Structure

```
src/
├── schemas/           # Drizzle schema definitions
│   ├── accounts/      # Account-related tables
│   ├── users/         # User-related tables
│   ├── organizations/ # Organization-related tables
│   ├── projects/      # Project-related tables
│   ├── roles/         # Role-related tables
│   ├── permissions/   # Permission-related tables
│   ├── groups/        # Group-related tables
│   └── tags/          # Tag-related tables
├── migrations/        # Generated migration files
├── connection/        # Database connection utilities
├── seed/             # Database seeding scripts
└── index.ts          # Main exports
```

## Usage

### In Development

```bash
# Generate new migration
pnpm db:generate

# Run migrations (runs Drizzle migrations, then grants SECURITY_RLS_ROLE to the DB login user from DB_URL / POSTGRES_* — required for SET LOCAL ROLE / RLS)
pnpm db:migrate

# Grant RLS membership only (same env as migrate; normally unnecessary if you already ran db:migrate)
pnpm db:grant-rls-role

# If GRANT fails (app user cannot grant a role to itself), set DB_GRANT_ROLE_URL to a superuser URL for the grant step only.

# Seed database
pnpm db:seed

# Reset database
pnpm db:reset
```

If `drizzle-kit migrate` reports a **checksum mismatch** for `0042_rls_restricted_role` after upgrading (the migration file changed but the DB already applied an older revision), repair the recorded migration hash using Drizzle Kit’s documented workflow for your version, then continue. Role membership for RLS is applied by `db:grant-rls-role`, not by SQL in `0042`.

### In Code

```typescript
import { db } from '@grantjs/database';
import { users, organizations } from '@grantjs/database/schemas';

// Use database connection
const allUsers = await db.select().from(users);
```

## Dependencies

- `drizzle-orm` - Type-safe SQL ORM
- `postgres` - PostgreSQL driver
- `zod` - Schema validation

## Development

This package is part of the Grant monorepo. Database schemas are automatically generated and migrations are managed through Drizzle Kit.

## License

MIT
