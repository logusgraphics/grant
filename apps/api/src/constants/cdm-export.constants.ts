import type { CdmExportSection } from '@grantjs/core';
import { CDM_EXPORT_SECTIONS } from '@grantjs/core';

import { ValidationError } from '@/lib/errors';

const ALLOWED = new Set<string>(CDM_EXPORT_SECTIONS);

/**
 * Validates and dedupes CDM export section query values.
 *
 * Pairing rules:
 * - `permissions` requires `resources` so permission resource references resolve.
 *
 * Accepts a token array or one comma-separated string. Query validation may
 * still surface `sections` as a string — do not use `for…of` on a string here
 * (that iterates code units and turns `roleTemplates` into invalid one-letter "sections").
 */
export function assertValidCdmExportSections(raw: readonly string[] | string): CdmExportSection[] {
  const tokens =
    typeof raw === 'string'
      ? raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : raw;

  const seen = new Set<string>();
  const out: CdmExportSection[] = [];
  for (const s of tokens) {
    const trimmed = s.trim();
    if (trimmed === '') continue;
    if (!ALLOWED.has(trimmed)) {
      throw new ValidationError(`Invalid CDM export section: ${trimmed}`);
    }
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed as CdmExportSection);
  }

  if (out.includes('permissions') && !out.includes('resources')) {
    throw new ValidationError(
      'CDM export section permissions requires resources in the same export request'
    );
  }

  return out;
}
