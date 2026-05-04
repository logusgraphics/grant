import type { CdmApplyContext, CdmExportContext, CdmTeardownContext } from '@grantjs/core';
import { Scope, SyncProjectPermissionsResult, Tenant } from '@grantjs/schema';
import { describe, expect, it, vi } from 'vitest';

import { CDM_IMPORT_METADATA_KEY, CDM_SOURCE_METADATA_KEY } from '@/constants/cdm-import.constants';
import { TagHandler } from '@/services/cdm/tag.handler';

const projectId = '10000000-0000-4000-8000-000000000011';
const accountId = '20000000-0000-4000-8000-000000000020';
const scope: Scope = { tenant: Tenant.AccountProject, id: `${accountId}:${projectId}` };

function baseResult(): SyncProjectPermissionsResult {
  return {
    projectId,
    importId: null,
    rolesCreated: 0,
    groupsCreated: 0,
    roleGroupsLinked: 0,
    groupPermissionsLinked: 0,
    projectRolesLinked: 0,
    projectGroupsLinked: 0,
    projectPermissionsLinked: 0,
    projectResourcesLinked: 0,
    projectUsersEnsured: 0,
    userRolesAssigned: 0,
    projectUserApiKeysCreated: 0,
    tagsCreated: 0,
    projectTagsLinked: 0,
    roleTagsLinked: 0,
    groupTagsLinked: 0,
    userTagsLinked: 0,
    warnings: [],
  };
}

function buildHandler(deps?: {
  syncRepo?: {
    listCdmTagIdsForProject: ReturnType<typeof vi.fn>;
    bulkSoftDeleteCdmTags: ReturnType<typeof vi.fn>;
  };
  exportRepo?: { getProjectTagDefinitions: ReturnType<typeof vi.fn> };
  tags?: { createTag: ReturnType<typeof vi.fn> };
  projectTags?: { addProjectTag: ReturnType<typeof vi.fn> };
}) {
  const syncRepo = deps?.syncRepo ?? {
    listCdmTagIdsForProject: vi.fn().mockResolvedValue([]),
    bulkSoftDeleteCdmTags: vi.fn().mockResolvedValue(undefined),
  };
  const exportRepo = deps?.exportRepo ?? {
    getProjectTagDefinitions: vi.fn().mockResolvedValue([]),
  };
  const tags = deps?.tags ?? {
    createTag: vi.fn(),
  };
  const projectTags = deps?.projectTags ?? {
    addProjectTag: vi.fn(),
  };
  return {
    handler: new TagHandler(
      syncRepo as never,
      exportRepo as never,
      tags as never,
      projectTags as never
    ),
    syncRepo,
    exportRepo,
    tags,
    projectTags,
  };
}

describe('TagHandler', () => {
  it('exposes handlerKind / inputKey / order=5', () => {
    const { handler } = buildHandler();
    expect(handler.handlerKind).toBe('tag');
    expect(handler.inputKey).toBe('tags');
    expect(handler.order).toBe(5);
  });

  it('validateInput rejects duplicate externalKey', () => {
    const { handler } = buildHandler();
    expect(() =>
      handler.validateInput([
        { externalKey: 't1', name: 'Alpha', color: '#fff' },
        { externalKey: 't1', name: 'Beta', color: '#000' },
      ])
    ).toThrow(/Duplicate tags externalKey/);
  });

  it('validateInput rejects missing externalKey', () => {
    const { handler } = buildHandler();
    expect(() =>
      handler.validateInput([{ externalKey: '', name: 'Alpha', color: '#fff' }])
    ).toThrow(/externalKey is required/);
  });

  it('validateInput rejects empty name and color', () => {
    const { handler } = buildHandler();
    expect(() =>
      handler.validateInput([{ externalKey: 't1', name: '   ', color: '#fff' }])
    ).toThrow(/name is required/);
    expect(() => handler.validateInput([{ externalKey: 't1', name: 'Alpha', color: '' }])).toThrow(
      /color is required/
    );
  });

  it('collectPermissionRefs returns empty (tags have no permission deps)', () => {
    const { handler } = buildHandler();
    expect(
      handler.collectPermissionRefs([{ externalKey: 't1', name: 'Alpha', color: '#fff' }])
    ).toEqual([]);
  });

  it('teardown is a no-op when no CDM tags exist', async () => {
    const { handler, syncRepo } = buildHandler();
    const ctx: CdmTeardownContext = { projectId, scope, tx: { __tx: true } };
    await handler.teardown(ctx);
    expect(syncRepo.listCdmTagIdsForProject).toHaveBeenCalledWith(projectId, ctx.tx);
    expect(syncRepo.bulkSoftDeleteCdmTags).not.toHaveBeenCalled();
  });

  it('teardown bulk-soft-deletes CDM tags + pivots when present', async () => {
    const tagIds = ['40000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002'];
    const listCdmTagIdsForProject = vi.fn().mockResolvedValue(tagIds);
    const bulkSoftDeleteCdmTags = vi.fn().mockResolvedValue(undefined);
    const { handler } = buildHandler({
      syncRepo: { listCdmTagIdsForProject, bulkSoftDeleteCdmTags },
    });

    const ctx: CdmTeardownContext = { projectId, scope, tx: { __tx: true } };
    await handler.teardown(ctx);

    expect(bulkSoftDeleteCdmTags).toHaveBeenCalledWith(tagIds, projectId, ctx.tx);
  });

  it('apply creates tag + project_tag, embeds CDM metadata, publishes produced.tagIds, and increments counters', async () => {
    const created1 = { id: '50000000-0000-4000-8000-000000000077', name: 'Alpha', color: '#fff' };
    const created2 = { id: '50000000-0000-4000-8000-000000000088', name: 'Beta', color: '#000' };
    const createTag = vi.fn().mockResolvedValueOnce(created1).mockResolvedValueOnce(created2);
    const addProjectTag = vi.fn().mockResolvedValue(undefined);
    const { handler, projectTags } = buildHandler({
      tags: { createTag },
      projectTags: { addProjectTag },
    });

    const result = baseResult();
    const produced = { roleTemplateIds: new Map(), tagIds: new Map<string, string>() };
    const ctx: CdmApplyContext = {
      projectId,
      scope,
      tx: { __tx: true },
      lookupResolvedRef: () => ({}),
      result,
      produced,
      assignmentUserIds: new Set<string>(),
    };

    await handler.apply(ctx, [
      {
        externalKey: 'k1',
        name: 'Alpha',
        color: '#fff',
        isPrimary: true,
        metadata: { legacy: 'L1' },
      },
      {
        externalKey: 'k2',
        name: 'Beta',
        color: '#000',
        isPrimary: false,
      },
    ]);

    expect(createTag).toHaveBeenCalledTimes(2);
    expect(createTag).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        name: 'Alpha',
        color: '#fff',
        metadata: expect.objectContaining({
          [CDM_IMPORT_METADATA_KEY]: expect.objectContaining({
            projectId,
            kind: 'tag',
            externalKey: 'k1',
          }),
          [CDM_SOURCE_METADATA_KEY]: { legacy: 'L1' },
        }),
      }),
      ctx.tx
    );

    expect(projectTags.addProjectTag).toHaveBeenNthCalledWith(
      1,
      { projectId, tagId: created1.id, isPrimary: true },
      ctx.tx
    );
    expect(projectTags.addProjectTag).toHaveBeenNthCalledWith(
      2,
      { projectId, tagId: created2.id, isPrimary: false },
      ctx.tx
    );

    expect(produced.tagIds.get('k1')).toBe(created1.id);
    expect(produced.tagIds.get('k2')).toBe(created2.id);
    expect(result.tagsCreated).toBe(2);
    expect(result.projectTagsLinked).toBe(2);
  });

  it('export maps project tag rows to TagCdmInput[] with externalKey=tagId and stripped cdmImport metadata', async () => {
    const tagId = '60000000-0000-4000-8000-0000000000aa';
    const getProjectTagDefinitions = vi.fn().mockResolvedValue([
      {
        tagId,
        name: 'Alpha',
        color: '#fff',
        isPrimary: true,
        metadata: {
          [CDM_IMPORT_METADATA_KEY]: { projectId, kind: 'tag', externalKey: 'k1' },
          [CDM_SOURCE_METADATA_KEY]: { legacy: 'L1' },
        },
      },
      {
        tagId: '60000000-0000-4000-8000-0000000000bb',
        name: 'Beta',
        color: '#000',
        isPrimary: false,
        metadata: {},
      },
    ]);
    const { handler } = buildHandler({
      exportRepo: { getProjectTagDefinitions },
    });

    const ctx: CdmExportContext = { projectId, scope };
    const out = await handler.export(ctx);

    expect(getProjectTagDefinitions).toHaveBeenCalledWith(projectId, undefined);
    expect(out).toEqual([
      {
        externalKey: tagId,
        name: 'Alpha',
        color: '#fff',
        isPrimary: true,
        metadata: { legacy: 'L1' },
      },
      {
        externalKey: '60000000-0000-4000-8000-0000000000bb',
        name: 'Beta',
        color: '#000',
        isPrimary: false,
        metadata: null,
      },
    ]);
  });
});
