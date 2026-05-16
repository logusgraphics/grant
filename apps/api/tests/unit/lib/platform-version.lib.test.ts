import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { readPlatformVersion } from '@/lib/platform-version.lib';

describe('readPlatformVersion', () => {
  it('matches apps/api/package.json version', () => {
    const pkgPath = resolve(import.meta.dirname, '../../../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string };
    expect(readPlatformVersion()).toBe(pkg.version);
  });
});
