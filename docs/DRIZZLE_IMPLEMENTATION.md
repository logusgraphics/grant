# Drizzle ORM Implementation for Users Module

## Overview

This document describes the Drizzle ORM implementation of the users module, which provides a database-backed alternative to the file-based "faker" provider using PostgreSQL as the underlying database.

## Architecture

### Database Schema

The Drizzle ORM implementation uses two main tables with PostgreSQL as the underlying database:

#### `users` Table

- `id`: UUID primary key (auto-generated)
- `name`: VARCHAR(255) - user's full name
- `email`: VARCHAR(255) - unique email address
- `deleted_at`: TIMESTAMP - soft delete timestamp
- `created_at`: TIMESTAMP - creation timestamp
- `updated_at`: TIMESTAMP - last update timestamp

#### `user_audit_logs` Table

- `id`: UUID primary key (auto-generated)
- `user_id`: UUID foreign key to users table
- `action`: VARCHAR(50) - action performed (CREATE, UPDATE, DELETE, SOFT_DELETE)
- `old_values`: VARCHAR(1000) - previous values before change
- `new_values`: VARCHAR(1000) - new values after change
- `metadata`: VARCHAR(1000) - additional context
- `created_at`: TIMESTAMP - when the audit log was created

### Key Features

1. **Soft Deletes**: Users are marked as deleted rather than physically removed
2. **Email Uniqueness**: Partial unique index ensures email uniqueness only for active users
3. **Audit Trail**: All operations are logged for compliance and debugging
4. **Same Interface**: Implements the exact same `UserDataProvider` interface as the faker provider
5. **Drizzle ORM Integration**: Leverages Drizzle's type-safe query builder and migration system

## Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- PostgreSQL 16+

### Installation

1. **Start the database**:

   ```bash
   npm run docker:up
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Generate database schema**:

   ```bash
   npm run db:generate
   ```

4. **Apply migrations**:

   ```bash
   npm run db:migrate
   ```

5. **Seed with sample data**:

   ```bash
   # Option 1: Generate fake data using drizzle-seed
   npm run db:seed

   # Option 2: Import data from existing JSON files
   npm run db:seed:json

   # Option 3: Reset database and start fresh
   npm run db:reset
   ```

### Environment Configuration

Create a `.env` file based on `env.example`:

```env
DATABASE_URL=postgresql://identity_user:identity_password@localhost:5432/identity_central
DATA_PROVIDER=postgres
```

## Usage

### Provider Selection

The system supports switching between providers:

```typescript
import { switchUserProvider, getUserProvider } from '@/graphql/providers/users/factory';

// Switch to PostgreSQL
switchUserProvider('postgres');

// Get current provider
const provider = getUserProvider();
```

### Direct Repository Usage

```typescript
import { PostgresUserRepository } from '@/graphql/providers/users/postgres';

const repository = new PostgresUserRepository();

// Create user
const user = await repository.createUser({
  input: { name: 'John Doe', email: 'john@example.com' },
});

// Get users with filtering
const users = await repository.getUsers({
  scope: { id: 'org1', tenant: 'ORGANIZATION' },
  search: 'John',
  sort: { field: 'NAME', order: 'ASC' },
  page: 1,
  limit: 10,
});
```

## Testing

### Run Basic Tests

```bash
npx tsx scripts/simple-test.ts
```

### Database Queries

Connect to the database directly:

```bash
# Connect to PostgreSQL
docker exec -it identity-central-postgres psql -U identity_user -d identity_central

# View users
SELECT id, name, email, created_at FROM users WHERE deleted_at IS NULL;

# View audit logs
SELECT user_id, action, created_at FROM user_audit_logs ORDER BY created_at DESC;
```

## Database Seeding

### Overview

The system provides three seeding options to populate the database with sample data:

1. **Generated Data**: Uses `drizzle-seed` to create realistic fake data
2. **JSON Import**: Migrates existing JSON data to PostgreSQL
3. **Database Reset**: Clears all data for a fresh start

### Seeding Commands

```bash
# Generate fake data using drizzle-seed
npm run db:seed

# Import data from existing JSON files
npm run db:seed:json

# Reset database (clear all data)
npm run db:reset
```

### Generated Data Seeding

The `npm run db:seed` command creates:

- **50 users** with realistic names and emails
- **10 roles** (Admin, User, Manager, Editor, Viewer, Developer, Designer, Analyst, Support, Guest)
- **100 user-role relationships** (currently placeholder)

### JSON Data Import

The `npm run db:seed:json` command imports existing data from:

- `data/users.json` - User records
- `data/roles.json` - Role definitions
- `data/user-roles.json` - User-role assignments

This is useful for migrating from the faker provider to PostgreSQL.

### Database Reset

The `npm run db:reset` command:

- Clears all data from all tables
- Maintains table structure and relationships
- Useful for testing or starting fresh

### Seeding Architecture

The seeding system is built on `drizzle-seed` and provides:

- **Deterministic data generation** using seedable pseudorandom number generators
- **Realistic fake data** for names, emails, dates, and descriptions
- **Batch processing** for efficient database population
- **Error handling** with clear feedback and rollback capabilities

### Current Limitations

- **Foreign key relationships**: User-role relationships need manual handling due to dependency order
- **Schema coverage**: Only core entities (users, roles, user-roles) are currently supported
- **Data validation**: Generated data follows schema constraints but may need business logic validation

### Future Enhancements

- **Relationship seeding**: Implement proper foreign key handling with `with` option
- **Extended schemas**: Add support for organizations, projects, groups, permissions, and tags
- **Custom generators**: Create domain-specific data generators for business logic
- **Seed profiles**: Support different data sets for development, testing, and staging

### Seeding Workflow

The complete database setup workflow:

```bash
# 1. Start database
npm run docker:up

# 2. Generate schema migrations
npm run db:generate

# 3. Apply migrations
npm run db:migrate

# 4. Seed with data
npm run db:seed          # or npm run db:seed:json
```

## Migration from Faker Provider

### Data Migration

The existing JSON data can be migrated to the Drizzle ORM implementation:

1. **Backup current data**:

   ```bash
   cp data/users.json data/users.json.backup
   ```

2. **Use the seeder** (when implemented):
   ```typescript
   import { seedUsersFromJson } from '@/graphql/providers/users/postgres/seeder';
   await seedUsersFromJson('data/users.json');
   ```

### Provider Switching

1. **Update environment**:

   ```env
   DATA_PROVIDER=postgres
   ```

2. **Restart the application**

3. **Verify functionality**:
   - Check GraphQL queries still work
   - Verify data persistence
   - Test CRUD operations

## Performance Considerations

### Database Indexes

- Primary key on `id`
- Partial unique index on `email` (active users only)
- Foreign key index on `user_id` in audit logs

### Connection Pooling

- Default pool size: 10 connections
- Idle timeout: 20 seconds
- Connection timeout: 10 seconds

### Query Optimization

- Soft delete filtering is applied automatically
- Pagination is handled at the database level
- Search uses ILIKE for case-insensitive matching
- Drizzle ORM provides type-safe query building and optimization

## Future Enhancements

### Multi-Tenancy

The current implementation is prepared for future multi-tenant features:

1. **Organization-scoped uniqueness**: Add `organization_id` field
2. **Row-level security**: Implement PostgreSQL RLS policies
3. **Schema per organization**: Separate schemas for each tenant

### Authentication & Authorization

1. **JWT token storage**: Add `sessions` table
2. **API key management**: Store and validate API keys
3. **Permission caching**: Redis-based permission caching

### Advanced Features

1. **Full-text search**: PostgreSQL full-text search capabilities
2. **Audit log archiving**: Move old audit logs to archive tables
3. **Data encryption**: Encrypt sensitive fields at rest

## Troubleshooting

### Common Issues

1. **Connection refused**: Ensure Docker containers are running
2. **Schema generation errors**: Check Drizzle configuration
3. **Type mismatches**: Verify GraphQL schema matches database schema

### Debug Commands

```bash
# Check container status
npm run docker:logs

# View database logs
docker logs identity-central-postgres

# Test database connection
docker exec -it identity-central-postgres psql -U identity_user -d identity_central -c "SELECT version();"
```

## Contributing

When adding new features to the Drizzle ORM implementation:

1. **Update schema**: Modify `schema.ts` and regenerate migrations
2. **Update repository**: Add new methods to `PostgresUserRepository`
3. **Update provider**: Implement new methods in `userPostgresProvider`
4. **Add tests**: Create test cases for new functionality
5. **Update documentation**: Document new features and usage

## License

This implementation follows the same license as the main project.
