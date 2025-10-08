---
title: Configuration
description: Configuration guide for Grant Platform
---

# Configuration

This guide covers all configuration options available in Grant Platform, from basic setup to advanced customization.

## Environment Variables

### Core Configuration

#### Database Settings

```bash
# Primary database connection
DATABASE_URL="postgresql://username:password@host:port/database"

# Connection pool settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
```

#### API Configuration

```bash
# Server settings
API_PORT=4000
API_HOST=0.0.0.0
API_CORS_ORIGIN="http://localhost:3000"

# GraphQL settings
GRAPHQL_INTROSPECTION=true
GRAPHQL_PLAYGROUND=true
GRAPHQL_QUERY_DEPTH_LIMIT=10
GRAPHQL_QUERY_COMPLEXITY_LIMIT=1000
```

#### Web Application Settings

```bash
# Next.js configuration
NEXT_PUBLIC_API_URL="http://localhost:4000/graphql"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Grant Platform"

# Build settings
NEXT_PUBLIC_BUILD_ID="development"
NEXT_PUBLIC_VERSION="1.0.0"
```

### Authentication & Security

#### JWT Configuration

```bash
# JWT settings
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"
JWT_ALGORITHM="HS256"

# Session settings
SESSION_SECRET="your-session-secret"
SESSION_MAX_AGE=604800000  # 7 days in milliseconds
```

#### Security Headers

```bash
# Security settings
SECURITY_HEADERS=true
CSP_POLICY="default-src 'self'; script-src 'self' 'unsafe-inline'"
HSTS_MAX_AGE=31536000
X_FRAME_OPTIONS="DENY"
```

### External Services

#### Redis Configuration

```bash
# Redis settings (optional)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""
REDIS_DB=0
REDIS_KEY_PREFIX="grant:"
```

#### AWS Configuration

```bash
# AWS settings (optional)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
AWS_CLOUDFRONT_DISTRIBUTION_ID="your-distribution-id"
```

#### Email Configuration

```bash
# SMTP settings (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourdomain.com"
```

## Configuration Files

### Application Configuration

#### `config/app.ts`

```typescript
export const appConfig = {
  name: process.env.APP_NAME || 'Grant Platform',
  version: process.env.APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true',
  port: parseInt(process.env.API_PORT || '4000'),
  host: process.env.API_HOST || '0.0.0.0',
};
```

#### `config/database.ts`

```typescript
export const databaseConfig = {
  url: process.env.DATABASE_URL!,
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
  },
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};
```

#### `config/auth.ts`

```typescript
export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    algorithm: (process.env.JWT_ALGORITHM || 'HS256') as Algorithm,
  },
  session: {
    secret: process.env.SESSION_SECRET!,
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800000'),
  },
};
```

### GraphQL Configuration

#### `config/graphql.ts`

```typescript
export const graphqlConfig = {
  introspection: process.env.GRAPHQL_INTROSPECTION === 'true',
  playground: process.env.GRAPHQL_PLAYGROUND === 'true',
  queryDepthLimit: parseInt(process.env.GRAPHQL_QUERY_DEPTH_LIMIT || '10'),
  queryComplexityLimit: parseInt(process.env.GRAPHQL_QUERY_COMPLEXITY_LIMIT || '1000'),
  cors: {
    origin: process.env.API_CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
};
```

## Feature Flags

### Enable/Disable Features

```bash
# Feature flags
FEATURE_AUDIT_LOGGING=true
FEATURE_TAG_RELATIONSHIPS=true
FEATURE_MULTI_TENANCY=true
FEATURE_SSO_INTEGRATION=false
FEATURE_WEBHOOKS=false
FEATURE_ANALYTICS=true
```

### Feature Configuration

#### `config/features.ts`

```typescript
export const featureFlags = {
  auditLogging: process.env.FEATURE_AUDIT_LOGGING === 'true',
  tagRelationships: process.env.FEATURE_TAG_RELATIONSHIPS === 'true',
  multiTenancy: process.env.FEATURE_MULTI_TENANCY === 'true',
  ssoIntegration: process.env.FEATURE_SSO_INTEGRATION === 'true',
  webhooks: process.env.FEATURE_WEBHOOKS === 'true',
  analytics: process.env.FEATURE_ANALYTICS === 'true',
};
```

## Multi-Tenancy Configuration

### Tenant Settings

```bash
# Multi-tenancy settings
MULTI_TENANT_MODE=true
DEFAULT_TENANT_ID="default"
TENANT_ISOLATION_LEVEL="database"  # database, schema, or row
TENANT_CACHE_TTL=300  # 5 minutes
```

### Organization Settings

```bash
# Organization defaults
DEFAULT_ORG_NAME="Default Organization"
DEFAULT_ORG_SLUG="default"
AUTO_CREATE_ORG=true
ORG_NAME_REQUIRED=true
```

## Performance Configuration

### Caching Settings

```bash
# Cache configuration
CACHE_ENABLED=true
CACHE_TTL=300  # 5 minutes
CACHE_MAX_SIZE=1000
CACHE_CLEANUP_INTERVAL=600  # 10 minutes
```

### Rate Limiting

```bash
# Rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS=false
```

### Query Optimization

```bash
# Query settings
QUERY_TIMEOUT=30000  # 30 seconds
QUERY_CACHE_TTL=300  # 5 minutes
QUERY_MAX_DEPTH=10
QUERY_MAX_COMPLEXITY=1000
```

## Logging Configuration

### Log Levels

```bash
# Logging settings
LOG_LEVEL="info"  # error, warn, info, debug
LOG_FORMAT="json"  # json, pretty, simple
LOG_FILE_ENABLED=false
LOG_FILE_PATH="./logs/app.log"
LOG_ROTATION_ENABLED=true
LOG_MAX_SIZE="10m"
LOG_MAX_FILES=5
```

### Log Configuration

#### `config/logging.ts`

```typescript
export const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT || 'json',
  file: {
    enabled: process.env.LOG_FILE_ENABLED === 'true',
    path: process.env.LOG_FILE_PATH || './logs/app.log',
    rotation: {
      enabled: process.env.LOG_ROTATION_ENABLED === 'true',
      maxSize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
    },
  },
};
```

## Monitoring Configuration

### Health Checks

```bash
# Health check settings
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_INTERVAL=30000  # 30 seconds
HEALTH_CHECK_TIMEOUT=5000   # 5 seconds
HEALTH_CHECK_RETRIES=3
```

### Metrics

```bash
# Metrics settings
METRICS_ENABLED=true
METRICS_PORT=9090
METRICS_PATH="/metrics"
METRICS_COLLECT_DEFAULT=true
```

## Development Configuration

### Development Settings

```bash
# Development settings
NODE_ENV="development"
DEBUG="grant:*"
HOT_RELOAD=true
SOURCE_MAPS=true
DEVTOOLS_ENABLED=true
```

### Testing Configuration

```bash
# Testing settings
TEST_DATABASE_URL="postgresql://test:test@localhost:5432/grant_platform_test"
TEST_TIMEOUT=30000
TEST_PARALLEL=true
TEST_COVERAGE_THRESHOLD=80
```

## Production Configuration

### Production Settings

```bash
# Production settings
NODE_ENV="production"
DEBUG=""
HOT_RELOAD=false
SOURCE_MAPS=false
DEVTOOLS_ENABLED=false
```

### Security Hardening

```bash
# Security settings
SECURITY_HEADERS=true
CORS_ORIGIN="https://yourdomain.com"
TRUST_PROXY=true
HELMET_ENABLED=true
RATE_LIMITING_ENABLED=true
```

## Configuration Validation

### Environment Validation

```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  API_PORT: z.string().transform(Number),
  NODE_ENV: z.enum(['development', 'staging', 'production']),
});

export const env = envSchema.parse(process.env);
```

### Configuration Validation

```typescript
export function validateConfig() {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'API_PORT'];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

## Configuration Management

### Environment-Specific Configs

#### Development

```bash
# .env.development
NODE_ENV=development
DEBUG=grant:*
LOG_LEVEL=debug
GRAPHQL_PLAYGROUND=true
```

#### Staging

```bash
# .env.staging
NODE_ENV=staging
LOG_LEVEL=info
GRAPHQL_PLAYGROUND=false
CACHE_ENABLED=true
```

#### Production

```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=warn
GRAPHQL_PLAYGROUND=false
CACHE_ENABLED=true
RATE_LIMIT_ENABLED=true
```

### Configuration Loading

```typescript
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

// Load environment-specific config
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
expand(config({ path: envFile }));

// Load default config
expand(config({ path: '.env' }));
```

## Best Practices

### 1. Environment Variables

- Use descriptive names with clear prefixes
- Group related variables together
- Document all configuration options
- Use validation schemas for critical variables

### 2. Security

- Never commit secrets to version control
- Use different secrets for different environments
- Rotate secrets regularly
- Use environment-specific configurations

### 3. Performance

- Enable caching in production
- Configure appropriate timeouts
- Use connection pooling for databases
- Monitor and tune performance settings

### 4. Monitoring

- Enable health checks
- Configure proper logging levels
- Set up metrics collection
- Monitor configuration changes

---

**Next:** Learn about [Development Guide](/development/guide) to understand development practices.
