import { getEnv, resolveDatabaseUrl } from '@grantjs/env';

import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schemas/**/*.ts',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: resolveDatabaseUrl(getEnv()),
  },
  entities: {
    roles: true,
  },
  verbose: true,
  strict: true,
} satisfies Config;
