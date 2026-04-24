import { ValidationError } from '@/lib/errors';

/** Metadata key for roles/groups created by project CDM permission sync. */
export const CDM_IMPORT_METADATA_KEY = 'cdmImport' as const;

/** Importer-owned payload merged under this key (never overwrites `cdmImport`). */
export const CDM_SOURCE_METADATA_KEY = 'cdmSource' as const;

export type CdmImportMetadata = {
  projectId: string;
  kind: 'role' | 'group' | 'directRole';
  externalKey?: string;
};

export function buildCdmImportMetadata(
  projectId: string,
  kind: CdmImportMetadata['kind'],
  externalKey?: string
): Record<string, unknown> {
  const payload: CdmImportMetadata = externalKey
    ? { projectId, kind, externalKey }
    : { projectId, kind };
  return { [CDM_IMPORT_METADATA_KEY]: payload };
}

/**
 * Merges importer JSON into Grant entity metadata under {@link CDM_SOURCE_METADATA_KEY}.
 * Shallow-merges into any existing `cdmSource` object. Preserves `cdmImport` from `base`.
 */
export function mergeCdmImporterMetadata(
  base: Record<string, unknown>,
  importerRaw: unknown
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  if (importerRaw == null) {
    return out;
  }
  if (typeof importerRaw !== 'object' || Array.isArray(importerRaw)) {
    throw new ValidationError('CDM metadata must be a JSON object');
  }
  const importer = importerRaw as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(importer, CDM_IMPORT_METADATA_KEY)) {
    throw new ValidationError(
      `CDM metadata must not include reserved top-level key "${CDM_IMPORT_METADATA_KEY}"`
    );
  }
  const prev = out[CDM_SOURCE_METADATA_KEY];
  const prevObj =
    prev != null && typeof prev === 'object' && !Array.isArray(prev)
      ? { ...(prev as Record<string, unknown>) }
      : {};
  out[CDM_SOURCE_METADATA_KEY] = { ...prevObj, ...importer };
  return out;
}
