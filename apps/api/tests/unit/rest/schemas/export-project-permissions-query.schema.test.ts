import { describe, expect, it } from 'vitest';

import { exportProjectPermissionsQuerySchema } from '@/rest/schemas/projects.schemas';

describe('exportProjectPermissionsQuerySchema sections', () => {
  it('parses a comma-free section name as a string', async () => {
    const q = await exportProjectPermissionsQuerySchema.parseAsync({
      scopeId: 'a:b',
      tenant: 'accountProject',
      sections: 'roles',
    });
    expect(q.sections).toEqual(['roles']);
  });

  it('collapses mistaken per-character repeated keys into one section token', async () => {
    const chars = [...'roles'];
    const q = await exportProjectPermissionsQuerySchema.parseAsync({
      scopeId: 'a:b',
      tenant: 'accountProject',
      sections: chars,
    });
    expect(q.sections).toEqual(['roles']);
  });

  it('parses includeUserApiKeys from string and boolean', async () => {
    const off = await exportProjectPermissionsQuerySchema.parseAsync({
      scopeId: 'a:b',
      tenant: 'accountProject',
      includeUserApiKeys: 'false',
    });
    expect(off.includeUserApiKeys).toBe(false);

    const on = await exportProjectPermissionsQuerySchema.parseAsync({
      scopeId: 'a:b',
      tenant: 'accountProject',
      includeUserApiKeys: 'true',
    });
    expect(on.includeUserApiKeys).toBe(true);

    const bool = await exportProjectPermissionsQuerySchema.parseAsync({
      scopeId: 'a:b',
      tenant: 'accountProject',
      includeUserApiKeys: false,
    });
    expect(bool.includeUserApiKeys).toBe(false);
  });

  it('omits includeUserApiKeys when not provided', async () => {
    const q = await exportProjectPermissionsQuerySchema.parseAsync({
      scopeId: 'a:b',
      tenant: 'accountProject',
    });
    expect(q.includeUserApiKeys).toBeUndefined();
  });
});
