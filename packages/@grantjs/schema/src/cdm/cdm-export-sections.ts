export const CDM_EXPORT_SECTIONS = [
  'resources',
  'permissions',
  'groups',
  'tags',
  'roles',
  'users',
] as const;

export type CdmExportSection = (typeof CDM_EXPORT_SECTIONS)[number];

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
