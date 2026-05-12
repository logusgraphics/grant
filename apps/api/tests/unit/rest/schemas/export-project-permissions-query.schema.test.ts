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
});
