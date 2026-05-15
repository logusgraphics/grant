/**
 * Deep-merge locale JSON roots (shared + web). Arrays are replaced by the override when present.
 * Plain objects merge recursively so nested keys (e.g. projectSyncJobs.startDialog.summary) are
 * not dropped when one side only updates part of the tree.
 */
function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function mergeLocaleMessages(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const keys = new Set([...Object.keys(base), ...Object.keys(override)]);
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const b = base[key];
    const o = override[key];
    if (o !== undefined && Array.isArray(o)) {
      result[key] = o;
    } else if (b !== undefined && Array.isArray(b)) {
      result[key] = o !== undefined ? o : b;
    } else if (isPlainRecord(b) && isPlainRecord(o)) {
      result[key] = mergeLocaleMessages(b, o);
    } else {
      result[key] = o !== undefined ? o : b;
    }
  }
  return result;
}
