/**
 * Slices of a CDM export clients may request via REST `sections=…`.
 * These are canonical document sections (not internal handler slice names).
 */
export const CDM_EXPORT_SECTIONS = [
  'resources',
  'permissions',
  'groups',
  'tags',
  'roles',
  'users',
] as const;

export type CdmExportSection = (typeof CDM_EXPORT_SECTIONS)[number];

/**
 * Keys on the expanded CDM sync payload produced by `expandCdmSyncInput` (apps/api)
 * that each `ICdmEntityHandler` reads.
 */
export const CDM_HANDLER_INPUT_KEYS = [
  'resources',
  'permissions',
  'tags',
  'roleTemplates',
  'provisionedUsers',
  'userAssignments',
  'projectUserApiKeys',
] as const;

export type CdmHandlerInputKey = (typeof CDM_HANDLER_INPUT_KEYS)[number];
