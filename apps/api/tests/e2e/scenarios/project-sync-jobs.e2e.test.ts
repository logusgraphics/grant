/**
 * E2E: Project CDM sync jobs (import/export)
 *
 * Covers REST + GraphQL happy paths, import modes, validation, RBAC, and
 * terminal cancel conflicts. Uses accountProject scope (MFA-friendly).
 *
 * Prerequisites: E2E stack with JOBS_ENABLED=true and JOB_PROVIDER=node-cron.
 */
import {
  CancelProjectSyncDocument,
  ProjectSyncJobDocument,
  ProjectSyncJobsDocument,
  ProjectSyncJobStatus,
  StartProjectExportDocument,
  StartProjectSyncDocument,
} from '@grantjs/schema';
import { print } from 'graphql';
import { afterAll, describe, expect, it } from 'vitest';

import {
  cdmRestPayload,
  cdmWithRoleTemplate,
  exportInput,
  invalidCdmDuplicateRoleKeys,
  invalidCdmUnsupportedVersion,
  minimalCdm,
  replaceCdm,
} from '../../helpers/cdm-sync-fixtures';
import { apiClient } from '../helpers/api-client';
import { closeDbHelper, getOrganizationRoleIdByName } from '../helpers/db-tokens';
import { graphqlRequest } from '../helpers/graphql';
import type { JobStatusRef } from '../helpers/sync-job';
import {
  cancelJob,
  downloadPayload,
  downloadSnapshot,
  listJobs,
  postExport,
  postImport,
  resolveJob,
  scopeForAccountProject,
  scopeForOrganizationProject,
} from '../helpers/sync-job';
import { TestUser } from '../helpers/test-user';

const ROLE_VIEWER = 'roles.names.organizationViewer';

interface CreateProjectResponseBody {
  data?: { id: string };
}

interface ProjectSyncJobsData {
  projectSyncJobs?: {
    jobs: Array<{ id: string; operation: string; status: string }>;
    totalCount: number;
  };
}

interface ProjectSyncJobData {
  projectSyncJob?: { id: string; status: string; operation: string };
}

interface StartProjectSyncData {
  startProjectSync?: { id: string; status: string; operation: string };
}

interface StartProjectExportData {
  startProjectExport?: { id: string; status: string; operation: string };
}

interface CancelProjectSyncData {
  cancelProjectSync?: { id: string; status: string };
}

afterAll(async () => {
  await closeDbHelper();
});

describe('Project sync jobs – accountProject happy path', () => {
  let owner: TestUser;
  let projectId: string;
  let scope: ReturnType<typeof scopeForAccountProject>;
  let exportJobId: string;
  let importJobId: string;
  const mergeRoleKey = `e2e-merge-${Date.now()}`;

  it('Setup: personal account and project', async () => {
    owner = await TestUser.create();
    const projectRes = await apiClient()
      .post('/api/projects')
      .set('Authorization', owner.authHeader)
      .send({
        name: 'E2E Sync Project',
        description: 'CDM sync E2E',
        scope: { id: owner.accountId, tenant: 'account' },
      });
    expect(projectRes.status).toBe(201);
    projectId = projectRes.body.data?.id as string;
    expect(projectId).toBeDefined();
    scope = scopeForAccountProject(owner.accountId, projectId);
  });

  it('POST export → COMPLETED with snapshot download', async () => {
    const { status, job } = await postExport(owner.authHeader, projectId, scope, exportInput());
    expect(status).toBe(202);
    const completed = await resolveJob(
      owner.authHeader,
      projectId,
      scope,
      job,
      ProjectSyncJobStatus.Completed
    );
    expect(completed.operation).toBe('EXPORT');
    exportJobId = completed.id;

    const snap = await downloadSnapshot(owner.authHeader, projectId, exportJobId, scope);
    expect(snap.status).toBe(200);
    expect(snap.snapshot.version).toBe(1);
    expect(snap.headers['content-disposition']).toMatch(/attachment/i);
  });

  it('POST merge import → COMPLETED with payload download', async () => {
    const cdm = cdmWithRoleTemplate(mergeRoleKey);
    const { status, job } = await postImport(owner.authHeader, projectId, scope, cdm);
    expect(status).toBe(202);
    const completed = await resolveJob(
      owner.authHeader,
      projectId,
      scope,
      job,
      ProjectSyncJobStatus.Completed
    );
    expect(completed.operation).toBe('IMPORT');
    expect(completed.result).toBeDefined();
    importJobId = completed.id;

    const payload = await downloadPayload(owner.authHeader, projectId, importJobId, scope);
    expect(payload.status).toBe(200);
    expect(payload.payload.roles?.some((r) => r.key === mergeRoleKey)).toBe(true);
  });

  it('GraphQL lists jobs and returns single job', async () => {
    const listRes = await graphqlRequest<ProjectSyncJobsData>({
      query: print(ProjectSyncJobsDocument),
      variables: { id: projectId, scope, page: 1, limit: 20 },
      accessToken: owner.accessToken,
    });
    expect(listRes.status).toBe(200);
    expect(listRes.body.errors).toBeUndefined();
    const jobs = listRes.body.data?.projectSyncJobs?.jobs ?? [];
    expect(jobs.length).toBeGreaterThanOrEqual(2);
    expect(jobs.some((j) => j.id === exportJobId)).toBe(true);
    expect(jobs.some((j) => j.id === importJobId)).toBe(true);

    const oneRes = await graphqlRequest<ProjectSyncJobData>({
      query: print(ProjectSyncJobDocument),
      variables: { id: projectId, scope, jobId: importJobId },
      accessToken: owner.accessToken,
    });
    expect(oneRes.body.data?.projectSyncJob?.id).toBe(importJobId);
    expect(oneRes.body.data?.projectSyncJob?.status).toBe(ProjectSyncJobStatus.Completed);
  });
});

describe('Project sync jobs – modes and validation', () => {
  let owner: TestUser;
  let projectId: string;
  let scope: ReturnType<typeof scopeForAccountProject>;

  it('Setup', async () => {
    owner = await TestUser.create();
    const projectRes = await apiClient()
      .post('/api/projects')
      .set('Authorization', owner.authHeader)
      .send({
        name: 'E2E Sync Modes',
        scope: { id: owner.accountId, tenant: 'account' },
      });
    expect(projectRes.status).toBe(201);
    projectId = projectRes.body.data?.id as string;
    scope = scopeForAccountProject(owner.accountId, projectId);
  });

  it('replace import with confirmDestructive completes and has snapshot', async () => {
    const roleKey = `replace-${Date.now()}`;
    const { status, job } = await postImport(
      owner.authHeader,
      projectId,
      scope,
      replaceCdm({ roleKey, confirmDestructive: true })
    );
    expect(status).toBe(202);
    const completed = await resolveJob(
      owner.authHeader,
      projectId,
      scope,
      job,
      ProjectSyncJobStatus.Completed
    );
    expect(completed.hasSnapshot).toBe(true);

    const snap = await downloadSnapshot(owner.authHeader, projectId, completed.id, scope);
    expect(snap.status).toBe(200);
    expect(snap.snapshot.version).toBe(1);
  });

  it('replace without confirmDestructive is rejected', async () => {
    const res = await postImport(
      owner.authHeader,
      projectId,
      scope,
      replaceCdm({ confirmDestructive: false })
    );
    expect(res.status).toBe(400);
  });

  it('export with sections tags and roles only includes those slices', async () => {
    const { status, job } = await postExport(
      owner.authHeader,
      projectId,
      scope,
      exportInput({ sections: ['tags', 'roles'] })
    );
    expect(status).toBe(202);
    const completed = await resolveJob(
      owner.authHeader,
      projectId,
      scope,
      job,
      ProjectSyncJobStatus.Completed
    );

    const snap = await downloadSnapshot(owner.authHeader, projectId, completed.id, scope);
    expect(Array.isArray(snap.snapshot.tags)).toBe(true);
    expect(Array.isArray(snap.snapshot.roles)).toBe(true);
    expect(snap.snapshot.resources ?? []).toHaveLength(0);
    expect(snap.snapshot.permissions ?? []).toHaveLength(0);
  });

  it('export permissions without resources returns 400', async () => {
    const res = await postExport(
      owner.authHeader,
      projectId,
      scope,
      exportInput({ sections: ['permissions'] })
    );
    expect(res.status).toBe(400);
  });

  it('import unsupported CDM version returns 400', async () => {
    const res = await postImport(
      owner.authHeader,
      projectId,
      scope,
      invalidCdmUnsupportedVersion()
    );
    expect(res.status).toBe(400);
  });

  it('import duplicate role keys returns 400', async () => {
    const res = await postImport(owner.authHeader, projectId, scope, invalidCdmDuplicateRoleKeys());
    expect(res.status).toBe(400);
  });

  it('cancel completed job returns conflict', async () => {
    const { job } = await postExport(owner.authHeader, projectId, scope, exportInput());
    const completed = await resolveJob(
      owner.authHeader,
      projectId,
      scope,
      job,
      ProjectSyncJobStatus.Completed
    );

    const cancelRes = await cancelJob(owner.authHeader, projectId, completed.id, scope);
    expect(cancelRes.status).toBe(409);
  });
});

describe('Project sync jobs – authorization', () => {
  let ownerA: TestUser;
  let ownerB: TestUser;
  let projectId: string;
  let scope: ReturnType<typeof scopeForAccountProject>;

  it('Setup: owner A project', async () => {
    ownerA = await TestUser.create();
    ownerB = await TestUser.create();
    const projectRes = await apiClient()
      .post('/api/projects')
      .set('Authorization', ownerA.authHeader)
      .send({
        name: 'E2E Sync RBAC',
        scope: { id: ownerA.accountId, tenant: 'account' },
      });
    expect(projectRes.status).toBe(201);
    projectId = projectRes.body.data?.id as string;
    scope = scopeForAccountProject(ownerA.accountId, projectId);
  });

  it('unauthenticated POST import returns 401', async () => {
    const res = await apiClient()
      .post(`/api/projects/${projectId}/sync/jobs`)
      .send({ scope, ...cdmRestPayload(minimalCdm()) });
    expect(res.status).toBe(401);
  });

  it('user B cannot import, export, list, or cancel on user A project', async () => {
    expect((await postImport(ownerB.authHeader, projectId, scope, minimalCdm())).status).toBe(403);
    expect((await postExport(ownerB.authHeader, projectId, scope, exportInput())).status).toBe(403);
    expect((await listJobs(ownerB.authHeader, projectId, scope)).status).toBe(403);

    const { job } = await postExport(ownerA.authHeader, projectId, scope, exportInput());
    const completed = await resolveJob(
      ownerA.authHeader,
      projectId,
      scope,
      job,
      ProjectSyncJobStatus.Completed
    );
    expect((await cancelJob(ownerB.authHeader, projectId, completed.id, scope)).status).toBe(403);
  });

  it('organization viewer cannot import in org project', async () => {
    const orgOwner = await TestUser.create({ withOrgAccount: true });
    const viewerEmail = `e2e-sync-viewer-${Date.now()}@test.grant.dev`;
    const org = await orgOwner.createOrganization('E2E Sync Viewer Org');
    const viewerRoleId = await getOrganizationRoleIdByName(org.id, ROLE_VIEWER);
    expect(viewerRoleId).toBeTruthy();
    await orgOwner.inviteMember(org.id, viewerEmail, viewerRoleId!);

    const viewer = await TestUser.create({ email: viewerEmail, withOrgAccount: true });
    await viewer.acceptInvitation(org.id);

    const projectRes = await orgOwner.tryCreateProject(org.id, 'Viewer Block Project');
    expect(projectRes.status).toBe(201);
    const orgProjectId = (projectRes.body as CreateProjectResponseBody).data!.id;
    const orgScope = scopeForOrganizationProject(org.id, orgProjectId);

    const res = await postImport(viewer.authHeader, orgProjectId, orgScope, minimalCdm());
    expect(res.status).toBe(403);
  });
});

describe('Project sync jobs – GraphQL parity', () => {
  it('GraphQL startProjectSync happy path and forbidden for user B', async () => {
    const ownerA = await TestUser.create();
    const ownerB = await TestUser.create();
    const projectRes = await apiClient()
      .post('/api/projects')
      .set('Authorization', ownerA.authHeader)
      .send({
        name: 'E2E GraphQL Sync',
        scope: { id: ownerA.accountId, tenant: 'account' },
      });
    expect(projectRes.status).toBe(201);
    const projectId = projectRes.body.data?.id as string;
    const scope = scopeForAccountProject(ownerA.accountId, projectId);
    const cdm = minimalCdm();

    const okRes = await graphqlRequest<StartProjectSyncData>({
      query: print(StartProjectSyncDocument),
      variables: { id: projectId, scope, input: cdm },
      accessToken: ownerA.accessToken,
    });
    expect(okRes.status).toBe(200);
    expect(okRes.body.errors).toBeUndefined();
    const syncJobId = okRes.body.data?.startProjectSync?.id;
    expect(syncJobId).toBeDefined();
    const syncJobRef: JobStatusRef | undefined = okRes.body.data?.startProjectSync
      ? {
          id: okRes.body.data.startProjectSync.id,
          status: okRes.body.data.startProjectSync.status as ProjectSyncJobStatus,
        }
      : undefined;
    const completedSync = await resolveJob(
      ownerA.authHeader,
      projectId,
      scope,
      syncJobRef,
      ProjectSyncJobStatus.Completed
    );
    expect(completedSync.status).toBe(ProjectSyncJobStatus.Completed);

    const forbiddenRes = await graphqlRequest({
      query: print(StartProjectSyncDocument),
      variables: { id: projectId, scope, input: cdm },
      accessToken: ownerB.accessToken,
    });
    expect(forbiddenRes.body.errors?.length).toBeGreaterThan(0);

    const exportRes = await graphqlRequest<StartProjectExportData>({
      query: print(StartProjectExportDocument),
      variables: { id: projectId, scope, input: exportInput() },
      accessToken: ownerA.accessToken,
    });
    const exportJobId = exportRes.body.data?.startProjectExport?.id;
    expect(exportJobId).toBeDefined();
    const exportJobRef: JobStatusRef | undefined = exportRes.body.data?.startProjectExport
      ? {
          id: exportRes.body.data.startProjectExport.id,
          status: exportRes.body.data.startProjectExport.status as ProjectSyncJobStatus,
        }
      : undefined;
    const completedExport = await resolveJob(
      ownerA.authHeader,
      projectId,
      scope,
      exportJobRef,
      ProjectSyncJobStatus.Completed
    );
    expect(completedExport.status).toBe(ProjectSyncJobStatus.Completed);

    const cancelRes = await graphqlRequest<CancelProjectSyncData>({
      query: print(CancelProjectSyncDocument),
      variables: { id: projectId, scope, jobId: exportJobId },
      accessToken: ownerA.accessToken,
    });
    expect(cancelRes.body.errors?.length).toBeGreaterThan(0);
  });
});
