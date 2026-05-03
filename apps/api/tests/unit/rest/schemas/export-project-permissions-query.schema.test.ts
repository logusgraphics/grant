import { describe, expect, it } from 'vitest';

import { exportProjectPermissionsQuerySchema } from '@/rest/schemas/projects.schemas';

describe('exportProjectPermissionsQuerySchema sections', () => {
  it('parses a comma-free section name as a string', async () => {
    const q = await exportProjectPermissionsQuerySchema.parseAsync({
      scopeId: 'a:b',
      tenant: 'accountProject',
      sections: 'roleTemplates',
    });
    expect(q.sections).toEqual(['roleTemplates']);
  });

  it('collapses mistaken per-character repeated keys into one section token', async () => {
    const chars = [...'roleTemplates'];
    const q = await exportProjectPermissionsQuerySchema.parseAsync({
      scopeId: 'a:b',
      tenant: 'accountProject',
      sections: chars,
    });
    expect(q.sections).toEqual(['roleTemplates']);
  });
});
