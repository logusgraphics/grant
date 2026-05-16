import { describe, expect, it } from 'vitest';

import { buildExternalKey, stableHash } from '@/lib/cdm/identity.lib';

describe('stableHash', () => {
  it('returns a 16-char hex string', () => {
    const h = stableHash('a', 'b', 'c');
    expect(h).toMatch(/^[a-f0-9]{16}$/);
  });

  it('is deterministic across calls', () => {
    expect(stableHash('a', 'b')).toBe(stableHash('a', 'b'));
  });

  it('is order-sensitive', () => {
    expect(stableHash('a', 'b')).not.toBe(stableHash('b', 'a'));
  });

  it('uses a non-printable separator so concatenated inputs do not collide', () => {
    expect(stableHash('ab', 'c')).not.toBe(stableHash('a', 'bc'));
  });

  it('treats null/undefined inputs as empty strings', () => {
    expect(stableHash('a', null as unknown as string)).toBe(stableHash('a', ''));
    expect(stableHash('a', undefined as unknown as string)).toBe(stableHash('a', ''));
  });
});

describe('buildExternalKey', () => {
  it('formats keys as cdm-{kind}-{16hex}', () => {
    expect(buildExternalKey('tag', 'id', 'name')).toMatch(/^cdm-tag-[a-f0-9]{16}$/);
    expect(buildExternalKey('role', 'id')).toMatch(/^cdm-role-[a-f0-9]{16}$/);
    expect(buildExternalKey('resource', 'id')).toMatch(/^cdm-resource-[a-f0-9]{16}$/);
    expect(buildExternalKey('permission', 'id')).toMatch(/^cdm-permission-[a-f0-9]{16}$/);
    expect(buildExternalKey('apikey', 'id')).toMatch(/^cdm-apikey-[a-f0-9]{16}$/);
  });

  it('is deterministic for the same inputs', () => {
    expect(buildExternalKey('tag', 'a', 'b')).toBe(buildExternalKey('tag', 'a', 'b'));
  });

  it('produces distinct keys across kinds even for identical inputs', () => {
    expect(buildExternalKey('tag', 'a', 'b')).not.toBe(buildExternalKey('role', 'a', 'b'));
  });

  it('does not look like a UUID', () => {
    const key = buildExternalKey('tag', '60000000-0000-4000-8000-0000000000aa', 'Alpha', '#fff');
    expect(key).not.toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});
