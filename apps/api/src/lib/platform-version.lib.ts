import { createRequire } from 'node:module';

import { ConfigurationError } from '@/lib/errors';

const require = createRequire(import.meta.url);

const SEMVER_PATTERN = /^\d+\.\d+\.\d+(-[\w.-]+)?(\+[\w.-]+)?$/;

let cachedVersion: string | undefined;

/**
 * Platform semver from apps/api/package.json (Changesets + Docker image tags).
 */
export function readPlatformVersion(): string {
  if (cachedVersion !== undefined) {
    return cachedVersion;
  }

  const pkg = require('../../package.json') as { version?: string };
  const version = pkg.version?.trim();

  if (!version || !SEMVER_PATTERN.test(version)) {
    throw new ConfigurationError(
      `Invalid platform version in apps/api/package.json: ${JSON.stringify(pkg.version)}`
    );
  }

  cachedVersion = version;
  return cachedVersion;
}
