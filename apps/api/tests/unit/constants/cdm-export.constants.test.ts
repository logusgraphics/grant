import { describe, expect, it } from 'vitest';

import {
  assertValidCdmExportSections,
  coerceIncludeUserApiKeysQueryParam,
} from '@/constants/cdm-export.constants';

describe('assertValidCdmExportSections', () => {
  it('accepts a single comma-separated string (REST query shape)', () => {
    expect(assertValidCdmExportSections('roles')).toEqual(['roles']);
    expect(assertValidCdmExportSections('roles,users')).toEqual(['roles', 'users']);
  });

  it('dedupes and preserves order of first occurrence', () => {
    expect(assertValidCdmExportSections(['roles', 'roles', 'users'])).toEqual(['roles', 'users']);
  });

  it('accepts tags as a section', () => {
    expect(assertValidCdmExportSections(['tags', 'roles'])).toEqual(['tags', 'roles']);
  });

  it('rejects unknown section', () => {
    expect(() => assertValidCdmExportSections(['roles', 'definitelyNotASection'])).toThrow(
      /Invalid CDM export section/
    );
  });

  it('accepts resources and permissions sections', () => {
    expect(assertValidCdmExportSections(['resources', 'permissions'])).toEqual([
      'resources',
      'permissions',
    ]);
  });

  it('rejects permissions without resources', () => {
    expect(() => assertValidCdmExportSections(['roles', 'permissions'])).toThrow(
      /permissions requires resources/
    );
  });
});

describe('coerceIncludeUserApiKeysQueryParam', () => {
  it('defaults to true when omitted', () => {
    expect(coerceIncludeUserApiKeysQueryParam(undefined)).toBe(true);
    expect(coerceIncludeUserApiKeysQueryParam(null)).toBe(true);
  });

  it('coerces string and boolean forms', () => {
    expect(coerceIncludeUserApiKeysQueryParam('false')).toBe(false);
    expect(coerceIncludeUserApiKeysQueryParam('true')).toBe(true);
    expect(coerceIncludeUserApiKeysQueryParam(false)).toBe(false);
    expect(coerceIncludeUserApiKeysQueryParam(true)).toBe(true);
  });
});
