/**
 * Slices of {@link SyncProjectPermissionsInput} that the CDM export pipeline can
 * include or omit. IDs match {@link ICdmEntityHandler.inputKey} for v1 handlers.
 */
export const CDM_EXPORT_SECTIONS = [
  'tags',
  'roleTemplates',
  'userAssignments',
  'projectUserApiKeys',
] as const;

export type CdmExportSection = (typeof CDM_EXPORT_SECTIONS)[number];
