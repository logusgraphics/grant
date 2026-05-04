import { describe, expect, it } from 'vitest';

import { assertValidCdmExportSections } from '@/constants/cdm-export.constants';

describe('assertValidCdmExportSections', () => {
  it('accepts a single comma-separated string (REST query shape)', () => {
    expect(assertValidCdmExportSections('roleTemplates')).toEqual(['roleTemplates']);
    expect(assertValidCdmExportSections('roleTemplates,userAssignments')).toEqual([
      'roleTemplates',
      'userAssignments',
    ]);
  });

  it('dedupes and preserves order of first occurrence', () => {
    expect(
      assertValidCdmExportSections(['roleTemplates', 'roleTemplates', 'userAssignments'])
    ).toEqual(['roleTemplates', 'userAssignments']);
  });

  it('allows projectUserApiKeys when userAssignments is present', () => {
    expect(
      assertValidCdmExportSections(['userAssignments', 'projectUserApiKeys', 'roleTemplates'])
    ).toEqual(['userAssignments', 'projectUserApiKeys', 'roleTemplates']);
  });

  it('accepts tags as a section', () => {
    expect(assertValidCdmExportSections(['tags', 'roleTemplates'])).toEqual([
      'tags',
      'roleTemplates',
    ]);
  });

  it('rejects unknown section', () => {
    expect(() => assertValidCdmExportSections(['roleTemplates', 'definitelyNotASection'])).toThrow(
      /Invalid CDM export section/
    );
  });

  it('rejects projectUserApiKeys without userAssignments', () => {
    expect(() => assertValidCdmExportSections(['roleTemplates', 'projectUserApiKeys'])).toThrow(
      /projectUserApiKeys requires userAssignments/
    );
  });
});
