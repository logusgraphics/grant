import { buildExternalKey } from './identity.lib';

export type CdmTagPivotRow = {
  ownerId: string;
  tagId: string;
  tagName: string;
  tagColor: string;
  isPrimary: boolean;
};

/**
 * Build sorted opaque tag keys per owner id (`resource_tags` / `permission_tags`)
 * and a primary key when `is_primary` is set (deterministic tie-break).
 */
export function mapOwnerIdToExportedTagFields(
  rows: readonly CdmTagPivotRow[]
): Map<string, { tagKeys: string[]; primaryTagKey: string | null }> {
  const accByOwner = new Map<string, { keys: Set<string>; primaries: Set<string> }>();
  for (const row of rows) {
    const opaque = buildExternalKey('tag', row.tagId, row.tagName, row.tagColor);
    let acc = accByOwner.get(row.ownerId);
    if (!acc) {
      acc = { keys: new Set<string>(), primaries: new Set<string>() };
      accByOwner.set(row.ownerId, acc);
    }
    acc.keys.add(opaque);
    if (row.isPrimary) {
      acc.primaries.add(opaque);
    }
  }
  const out = new Map<string, { tagKeys: string[]; primaryTagKey: string | null }>();
  for (const [ownerId, acc] of accByOwner) {
    const tagKeys = [...acc.keys].sort();
    let primaryTagKey: string | null = null;
    if (acc.primaries.size === 1) {
      primaryTagKey = [...acc.primaries][0]!;
    } else if (acc.primaries.size > 1) {
      primaryTagKey = [...acc.primaries].sort()[0]!;
    }
    out.set(ownerId, { tagKeys, primaryTagKey });
  }
  return out;
}
