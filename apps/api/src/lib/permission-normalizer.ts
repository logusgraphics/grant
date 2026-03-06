import { slugifySafe } from '@/lib/slugify.lib';

/**
 * Normalizes a permission resource or action for consistent comparison and storage.
 * Slugifies input (lowercase, hyphens for spaces, strip special chars) so values
 * like "Document", "Create", "Some Action" match DB slugs "document", "create", "some-action".
 * Falls back to trim + lowercase if slugify yields empty (e.g. input is only symbols).
 */
export function normalizePermissionSlug(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const slugified = slugifySafe(trimmed);
  return slugified.length > 0 ? slugified : trimmed.toLowerCase();
}
