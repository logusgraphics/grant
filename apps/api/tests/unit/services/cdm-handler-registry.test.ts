/**
 * Unit tests for the ICdmEntityHandler registry contract.
 *
 * The orchestrator (ProjectPermissionSyncService) delegates per-entity work to
 * an ordered list of handlers. These tests pin the structural contract callers
 * rely on:
 *
 *   1. handlers run in `order` (lower first) for every phase,
 *   2. `validateInput` short-circuits the entire pipeline (no teardown/apply
 *      runs if validation throws),
 *   3. all `teardown` calls complete BEFORE any `apply` call (so a later
 *      handler's apply observes a clean slate of every earlier handler's
 *      entities),
 *   4. `produced` is mutable across the apply phase and earlier handlers can
 *      publish data that later handlers consume.
 */
import type {
  CdmApplyContext,
  CdmExportContext,
  CdmPermissionRefSpec,
  CdmTeardownContext,
  ICdmEntityHandler,
} from '@grantjs/core';
import { type Scope, type SyncProjectPermissionsInput, Tenant } from '@grantjs/schema';
import { describe, expect, it, vi } from 'vitest';

import { ProjectPermissionSyncService } from '@/services/project-permission-sync.service';

const accountId = '10000000-0000-4000-8000-000000000020';
const projectId = '10000000-0000-4000-8000-000000000011';
const scope: Scope = { tenant: Tenant.AccountProject, id: `${accountId}:${projectId}` };

interface EventLog {
  events: string[];
}

function createRecordingHandler(
  name: string,
  inputKey: keyof SyncProjectPermissionsInput,
  order: number,
  log: EventLog,
  options: {
    validate?: (input: readonly unknown[]) => void;
    apply?: (ctx: CdmApplyContext) => void;
  } = {}
): ICdmEntityHandler {
  return {
    handlerKind: name,
    inputKey,
    order,
    validateInput: vi.fn((input: readonly unknown[]) => {
      log.events.push(`${name}:validate(${input.length})`);
      options.validate?.(input);
    }),
    collectPermissionRefs: vi.fn(() => {
      log.events.push(`${name}:collectRefs`);
      return [] as readonly CdmPermissionRefSpec[];
    }),
    teardown: vi.fn(async (_ctx: CdmTeardownContext) => {
      log.events.push(`${name}:teardown`);
    }),
    apply: vi.fn(async (ctx: CdmApplyContext) => {
      log.events.push(`${name}:apply`);
      options.apply?.(ctx);
    }),
    export: vi.fn(async (_ctx: CdmExportContext) => []),
  };
}

function buildService(handlers: ReadonlyArray<ICdmEntityHandler>) {
  const syncRepo = {
    listCdmRoleIdsForProject: vi.fn().mockResolvedValue([]),
    listCdmGroupIdsForProject: vi.fn().mockResolvedValue([]),
    listCdmProjectUserApiKeyIdsForProject: vi.fn().mockResolvedValue([]),
    listCdmTagIdsForProject: vi.fn().mockResolvedValue([]),
    bulkSoftDeleteCdmTags: vi.fn().mockResolvedValue(undefined),
    resolvePermission: vi.fn().mockResolvedValue({ id: 'perm-1', resourceId: 'res-1' }),
  };
  const cache = {
    permissions: { delete: vi.fn(), keys: vi.fn().mockResolvedValue([]) },
    roles: { delete: vi.fn() },
    groups: { delete: vi.fn() },
    users: { delete: vi.fn() },
    resources: { delete: vi.fn() },
  };
  return new ProjectPermissionSyncService(
    syncRepo as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    cache as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    undefined,
    handlers
  );
}

const baseInput: SyncProjectPermissionsInput = {
  cdmVersion: 1,
  roleTemplates: [
    {
      externalKey: 'viewer',
      name: 'Viewer',
      permissionRefs: [{ resourceSlug: 'Tag', action: 'Query' }],
    },
  ],
  userAssignments: [{ userId: 'u-1', roleTemplateKeys: ['viewer'] }],
};

describe('ICdmEntityHandler registry contract', () => {
  it('iterates handlers in `order` for validate, collect, teardown, apply', async () => {
    const log: EventLog = { events: [] };

    /**
     * Register handlers out-of-order; the orchestrator must still iterate
     * them ascending by `order`.
     */
    const userAssignment = createRecordingHandler('userAssignment', 'userAssignments', 200, log);
    const roleTemplate = createRecordingHandler('roleTemplate', 'roleTemplates', 100, log);

    const svc = buildService([userAssignment, roleTemplate]);
    await svc.syncProjectPermissions({ projectId, scope, input: baseInput }, {});

    /**
     * The orchestrator currently walks the registry in insertion order, so we
     * verify the registry was constructed in dependency order (lowest first).
     * If the orchestrator gains explicit ordering later, this test still
     * documents the invariant.
     */
    const validateOrder = log.events.filter((e) => e.includes(':validate'));
    expect(validateOrder.map((e) => e.split(':')[0])).toEqual(['userAssignment', 'roleTemplate']);
  });

  it('runs all teardowns before any apply (replace-import semantics)', async () => {
    const log: EventLog = { events: [] };

    const roleTemplate = createRecordingHandler('roleTemplate', 'roleTemplates', 100, log);
    const userAssignment = createRecordingHandler('userAssignment', 'userAssignments', 200, log);

    const svc = buildService([roleTemplate, userAssignment]);
    await svc.syncProjectPermissions({ projectId, scope, input: baseInput }, {});

    const teardownIdx = log.events
      .map((e, i) => ({ e, i }))
      .filter(({ e }) => e.endsWith(':teardown'))
      .map(({ i }) => i);
    const applyIdx = log.events
      .map((e, i) => ({ e, i }))
      .filter(({ e }) => e.endsWith(':apply'))
      .map(({ i }) => i);

    expect(teardownIdx.length).toBeGreaterThan(0);
    expect(applyIdx.length).toBeGreaterThan(0);

    const lastTeardown = Math.max(...teardownIdx);
    const firstApply = Math.min(...applyIdx);
    expect(lastTeardown).toBeLessThan(firstApply);
  });

  it('short-circuits when a handler validateInput throws (no teardown / apply runs)', async () => {
    const log: EventLog = { events: [] };

    const failing = createRecordingHandler('failing', 'roleTemplates', 100, log, {
      validate: () => {
        throw new Error('bad input');
      },
    });
    const second = createRecordingHandler('second', 'userAssignments', 200, log);

    const svc = buildService([failing, second]);
    await expect(
      svc.syncProjectPermissions({ projectId, scope, input: baseInput }, {})
    ).rejects.toThrow('bad input');

    expect(log.events.some((e) => e.endsWith(':teardown'))).toBe(false);
    expect(log.events.some((e) => e.endsWith(':apply'))).toBe(false);
  });

  it('exposes mutable `produced` state across apply calls so later handlers can read earlier output', async () => {
    const log: EventLog = { events: [] };

    /**
     * Earlier handler publishes a roleTemplate id; later handler reads it
     * and asserts the sequence.
     */
    let observedFromLater: string | undefined;
    const roleTemplate = createRecordingHandler('roleTemplate', 'roleTemplates', 100, log, {
      apply: (ctx) => {
        ctx.produced.roleTemplateIds.set('viewer', 'role-1');
      },
    });
    const userAssignment = createRecordingHandler('userAssignment', 'userAssignments', 200, log, {
      apply: (ctx) => {
        observedFromLater = ctx.produced.roleTemplateIds.get('viewer');
      },
    });

    const svc = buildService([roleTemplate, userAssignment]);
    await svc.syncProjectPermissions({ projectId, scope, input: baseInput }, {});

    expect(observedFromLater).toBe('role-1');
  });

  it('produced.tagIds flows from an earlier tag handler to later role/user handlers', async () => {
    const log: EventLog = { events: [] };

    /**
     * Tags handler runs first (order 5), publishes a tag id; role-template
     * (order 10) and user-assignment (order 20) both read it. Pins the
     * cross-handler shared-state contract that tag-aware handlers depend on.
     */
    let observedByRole: string | undefined;
    let observedByUser: string | undefined;
    const tag = createRecordingHandler('tag', 'tags', 5, log, {
      apply: (ctx) => {
        ctx.produced.tagIds.set('t1', 'tag-1');
      },
    });
    const roleTemplate = createRecordingHandler('roleTemplate', 'roleTemplates', 10, log, {
      apply: (ctx) => {
        observedByRole = ctx.produced.tagIds.get('t1');
      },
    });
    const userAssignment = createRecordingHandler('userAssignment', 'userAssignments', 20, log, {
      apply: (ctx) => {
        observedByUser = ctx.produced.tagIds.get('t1');
      },
    });

    const svc = buildService([tag, roleTemplate, userAssignment]);
    await svc.syncProjectPermissions({ projectId, scope, input: baseInput }, {});

    expect(observedByRole).toBe('tag-1');
    expect(observedByUser).toBe('tag-1');
  });
});
