import { describe, expect, it } from 'vitest';

import {
  buildCdmImportMetadata,
  CDM_IMPORT_METADATA_KEY,
  CDM_SOURCE_METADATA_KEY,
  extractProjectUserMetadataForCdmExport,
  mergeCdmImporterMetadata,
} from '@/constants/cdm-import.constants';
import { ValidationError } from '@/lib/errors';

describe('cdmImport metadata', () => {
  it('builds role payload with externalKey', () => {
    expect(buildCdmImportMetadata('proj-1', 'role', 'admin')).toEqual({
      [CDM_IMPORT_METADATA_KEY]: {
        projectId: 'proj-1',
        kind: 'role',
        externalKey: 'admin',
      },
    });
  });

  it('builds group payload without externalKey', () => {
    expect(buildCdmImportMetadata('proj-1', 'group')).toEqual({
      [CDM_IMPORT_METADATA_KEY]: {
        projectId: 'proj-1',
        kind: 'group',
      },
    });
  });
});

describe('mergeCdmImporterMetadata', () => {
  it('merges importer fields under cdmSource without touching cdmImport', () => {
    const base = buildCdmImportMetadata('p1', 'role', 'admin');
    const merged = mergeCdmImporterMetadata(base, { legacyId: '99' });
    expect(merged[CDM_IMPORT_METADATA_KEY]).toEqual({
      projectId: 'p1',
      kind: 'role',
      externalKey: 'admin',
    });
    expect(merged[CDM_SOURCE_METADATA_KEY]).toEqual({ legacyId: '99' });
  });

  it('shallow-merges into existing cdmSource', () => {
    const base = {
      ...buildCdmImportMetadata('p1', 'group', 'g1'),
      [CDM_SOURCE_METADATA_KEY]: { a: 1 },
    };
    const merged = mergeCdmImporterMetadata(base, { b: 2 });
    expect(merged[CDM_SOURCE_METADATA_KEY]).toEqual({ a: 1, b: 2 });
  });

  it('rejects reserved cdmImport in importer payload', () => {
    expect(() =>
      mergeCdmImporterMetadata(buildCdmImportMetadata('p1', 'role'), {
        [CDM_IMPORT_METADATA_KEY]: { x: 1 },
      })
    ).toThrow(ValidationError);
  });

  it('rejects non-object importer payload', () => {
    expect(() => mergeCdmImporterMetadata({}, [])).toThrow(ValidationError);
  });
});

describe('extractProjectUserMetadataForCdmExport', () => {
  it('returns null when metadata is empty', () => {
    expect(extractProjectUserMetadataForCdmExport({})).toBeNull();
  });

  it('exports flat keys from cdmSource (minus nested cdmImport)', () => {
    const md = mergeCdmImporterMetadata(buildCdmImportMetadata('p1', 'role'), {
      legacyId: '99',
    });
    expect(extractProjectUserMetadataForCdmExport(md)).toEqual({ legacyId: '99' });
  });

  it('includes top-level metadata keys outside cdmSource (e.g. API updates)', () => {
    const md = {
      ...buildCdmImportMetadata('p1', 'role'),
      customFromApi: 'visible',
    };
    expect(extractProjectUserMetadataForCdmExport(md)).toEqual({ customFromApi: 'visible' });
  });

  it('merges cdmSource keys with top-level; top-level wins on collision', () => {
    const md = {
      ...buildCdmImportMetadata('p1', 'role'),
      [CDM_SOURCE_METADATA_KEY]: { sameKey: 'fromSource', onlySource: 1 },
      sameKey: 'fromTop',
      onlyTop: 2,
    };
    expect(extractProjectUserMetadataForCdmExport(md)).toEqual({
      sameKey: 'fromTop',
      onlySource: 1,
      onlyTop: 2,
    });
  });
});
