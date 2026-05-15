/**
 * Shared CDM payloads and export inputs for project sync job tests.
 */
import { CdmFindBy, CdmModeStrategy, type SyncProjectInput } from '@grantjs/schema';

export const FIXTURE_PROJECT_ID = '00000000-0000-4000-8000-000000000011';
export const FIXTURE_ACCOUNT_ID = '00000000-0000-4000-8000-000000000020';
export const FIXTURE_JOB_ID = '40000000-0000-4000-8000-000000000077';

export const mergeMode: NonNullable<SyncProjectInput['mode']> = {
  strategy: CdmModeStrategy.Merge,
  onConflict: null,
  confirmDestructive: false,
};

export const replaceMode = (confirmDestructive = true): NonNullable<SyncProjectInput['mode']> => ({
  strategy: CdmModeStrategy.Replace,
  onConflict: null,
  confirmDestructive,
});

export function minimalCdm(overrides: Partial<SyncProjectInput> = {}): SyncProjectInput {
  return {
    version: 1,
    mode: mergeMode,
    roles: [],
    users: [],
    resources: [],
    permissions: [],
    groups: [],
    tags: [],
    ...overrides,
  };
}

/**
 * REST `startProjectSync` Zod schema accepts `id` as optional string only — not `null`.
 * GraphQL allows omitted/null `id`; use the raw `cdm` for GraphQL variables.
 */
export function cdmRestPayload(
  cdm: SyncProjectInput
): Omit<SyncProjectInput, 'id'> & { id?: string } {
  const { id, ...rest } = cdm;
  return id != null && id !== '' ? { ...rest, id } : rest;
}

/** Role templates require ≥1 permissionRef after expand (see RoleTemplateHandler.validateInput). */
function cdmRoleResourceBundle(roleKey: string, displayName: string) {
  const resourceKey = `${roleKey}-resource`;
  const permissionKey = `${roleKey}-read`;
  return {
    resources: [
      {
        key: resourceKey,
        slug: resourceKey,
        name: `${displayName} resource`,
        description: null,
        actions: ['read'],
        metadata: null,
      },
    ],
    permissions: [
      {
        key: permissionKey,
        resource: resourceKey,
        action: 'read',
        name: `${displayName}:read`,
        description: null,
        condition: null,
        metadata: null,
      },
    ],
    roles: [
      {
        key: roleKey,
        name: displayName,
        description: null,
        groups: [],
        permissions: [permissionKey],
        tags: [],
        primaryTag: null,
        metadata: null,
      },
    ],
  };
}

export function cdmWithRoleTemplate(
  roleKey = 'e2e-viewer',
  overrides: Partial<SyncProjectInput> = {}
): SyncProjectInput {
  return minimalCdm({
    ...cdmRoleResourceBundle(roleKey, 'E2E Viewer'),
    ...overrides,
  });
}

export function cdmWithCustomResourceAndPermission(): SyncProjectInput {
  return minimalCdm({
    resources: [
      {
        key: 'e2e-docs',
        slug: 'e2e-docs',
        name: 'E2E Docs',
        description: null,
        actions: ['read'],
        metadata: null,
      },
    ],
    permissions: [
      {
        key: 'e2e-docs-read',
        resource: 'e2e-docs',
        action: 'read',
        name: 'E2E Docs:read',
        description: null,
        condition: null,
        metadata: null,
      },
    ],
  });
}

export function replaceCdm(options?: {
  confirmDestructive?: boolean;
  roleKey?: string;
}): SyncProjectInput {
  const confirmDestructive = options?.confirmDestructive ?? true;
  const roleKey = options?.roleKey ?? 'replace-only-role';
  return {
    version: 1,
    id: 'replace-import-1',
    mode: replaceMode(confirmDestructive),
    users: [],
    groups: [],
    tags: [],
    ...cdmRoleResourceBundle(roleKey, 'Replace Only Role'),
  };
}

export function invalidCdmMissingVersion(): Record<string, unknown> {
  return {
    mode: mergeMode,
    roles: [],
    users: [],
    resources: [],
    permissions: [],
    groups: [],
    tags: [],
  };
}

export function invalidCdmUnsupportedVersion(): SyncProjectInput {
  return { ...minimalCdm(), version: 2 };
}

export function invalidCdmDuplicateRoleKeys(): SyncProjectInput {
  return minimalCdm({
    roles: [
      {
        key: 'dup',
        name: 'Role A',
        description: null,
        groups: [],
        permissions: [],
        tags: [],
        primaryTag: null,
        metadata: null,
      },
      {
        key: 'dup',
        name: 'Role B',
        description: null,
        groups: [],
        permissions: [],
        tags: [],
        primaryTag: null,
        metadata: null,
      },
    ],
  });
}

export function cdmWithUserById(userId: string): SyncProjectInput {
  return cdmWithRoleTemplate('linked-viewer', {
    users: [
      {
        key: { value: userId, findBy: CdmFindBy.Id },
        name: 'Linked User',
        roles: ['linked-viewer'],
        groups: [],
        permissions: [],
        tags: [],
        primaryTag: null,
        apiKeys: [],
        metadata: null,
      },
    ],
  });
}

export interface ExportInputOptions {
  version?: number;
  jobName?: string;
  sections?: string[];
  includeUserApiKeys?: boolean;
  mode?: SyncProjectInput['mode'];
}

export function exportInput(options: ExportInputOptions = {}): {
  version: number;
  jobName?: string;
  sections?: string[];
  includeUserApiKeys?: boolean;
  mode?: SyncProjectInput['mode'];
} {
  return {
    version: options.version ?? 1,
    ...(options.jobName !== undefined ? { jobName: options.jobName } : {}),
    ...(options.sections !== undefined ? { sections: options.sections } : {}),
    ...(options.includeUserApiKeys !== undefined
      ? { includeUserApiKeys: options.includeUserApiKeys }
      : {}),
    ...(options.mode !== undefined ? { mode: options.mode } : {}),
  };
}

export function accountProjectScope(accountId: string, projectId: string) {
  return {
    tenant: 'accountProject' as const,
    id: `${accountId}:${projectId}`,
  };
}

export function organizationProjectScope(organizationId: string, projectId: string) {
  return {
    tenant: 'organizationProject' as const,
    id: `${organizationId}:${projectId}`,
  };
}
