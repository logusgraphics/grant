/**
 * E2E: Project apps (OAuth apps per project)
 *
 * Covers:
 *   - GraphQL: createProjectApp, projectApps query, updateProjectApp, deleteProjectApp
 *   - REST: GET/POST/PATCH/DELETE /api/project-apps
 *   - organizationProject and accountProject scope
 *   - Negative: unauthenticated, forbidden (wrong scope), invalid input
 *
 * Prerequisites: E2E stack running (docker-compose.e2e.yml), DB migrated and seeded.
 */
import {
  CreateProjectAppDocument,
  DeleteProjectAppDocument,
  GetProjectAppsDocument,
  Tenant,
  UpdateProjectAppDocument,
} from '@grantjs/schema';
import { print } from 'graphql';
import { afterAll, describe, expect, it } from 'vitest';

import { apiClient } from '../helpers/api-client';
import { closeDbHelper } from '../helpers/db-tokens';
import { graphqlRequest } from '../helpers/graphql';
import { TestUser } from '../helpers/test-user';

/** REST create-project response shape */
interface CreateProjectResponseBody {
  data?: { id: string };
}

/** GraphQL response data shapes for project-app operations */
interface ProjectAppCreateData {
  createProjectApp?: {
    id: string;
    clientId: string;
    clientSecret?: string;
    name: string;
    redirectUris: string[];
    createdAt: string;
  };
}

interface ProjectAppPageData {
  projectApps?: {
    projectApps: Array<{ id: string; clientId?: string; name?: string; redirectUris?: string[] }>;
    totalCount: number;
    hasNextPage: boolean;
  };
}

interface ProjectAppUpdateData {
  updateProjectApp?: {
    id: string;
    clientId: string;
    name: string;
    redirectUris: string[];
    scopes: string[] | null;
    updatedAt: string;
  };
}

interface ProjectAppDeleteData {
  deleteProjectApp?: { id: string; clientId: string; name?: string; deletedAt: string | null };
}

afterAll(async () => {
  await closeDbHelper();
});

describe('Project apps flow', () => {
  let owner: TestUser;
  let org: { id: string; name: string; slug: string };
  let projectId: string;
  let projectAppId: string;
  let projectAppClientId: string;
  const scopeId = (): string => `${org.id}:${projectId}`;

  it('Setup: create user, org, and project', async () => {
    owner = await TestUser.create({ withOrgAccount: true });
    org = await owner.createOrganization('E2E Project Apps Org');
    const projectRes = await owner.tryCreateProject(org.id, 'E2E Project Apps Project');
    expect(projectRes.status).toBe(201);
    const body = projectRes.body as CreateProjectResponseBody;
    expect(body.data?.id).toBeDefined();
    projectId = body.data!.id;
  });

  it('createProjectApp → returns app with clientId and redirectUris', async () => {
    const res = await graphqlRequest<ProjectAppCreateData>({
      query: print(CreateProjectAppDocument),
      variables: {
        input: {
          scope: { tenant: 'organizationProject', id: scopeId() },
          name: 'E2E Test App',
          redirectUris: ['https://example.com/callback', 'https://example.com/callback2'],
          scopes: [],
          allowSignUp: false,
        },
      },
      accessToken: owner.accessToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data?.createProjectApp).toBeDefined();

    const app = res.body.data!.createProjectApp!;
    expect(app.id).toBeDefined();
    expect(app.clientId).toBeDefined();
    expect(app.redirectUris).toEqual([
      'https://example.com/callback',
      'https://example.com/callback2',
    ]);
    expect(app.name).toBe('E2E Test App');
    expect(app.createdAt).toBeDefined();

    projectAppId = app.id;
    projectAppClientId = app.clientId;
  });

  it('projectApps query → returns the created app', async () => {
    const res = await graphqlRequest<ProjectAppPageData>({
      query: print(GetProjectAppsDocument),
      variables: {
        scope: { tenant: 'organizationProject', id: scopeId() },
        page: 1,
        limit: 10,
      },
      accessToken: owner.accessToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data?.projectApps).toBeDefined();

    const page = res.body.data!.projectApps!;
    expect(page.totalCount).toBe(1);
    expect(page.projectApps).toHaveLength(1);
    expect(page.projectApps[0].id).toBe(projectAppId);
    expect(page.projectApps[0].clientId).toBe(projectAppClientId);
    expect(page.projectApps[0].name).toBe('E2E Test App');
  });

  it('updateProjectApp → updates name and redirectUris', async () => {
    // Ensure we have projectAppId (fallback from list if create response shape omitted it)
    if (!projectAppId) {
      const listRes = await graphqlRequest<ProjectAppPageData>({
        query: print(GetProjectAppsDocument),
        variables: {
          scope: { tenant: 'organizationProject', id: scopeId() },
          page: 1,
          limit: 10,
        },
        accessToken: owner.accessToken,
      });
      const page = listRes.body.data?.projectApps;
      if (page?.projectApps?.length) projectAppId = page.projectApps[0].id;
    }
    expect(projectAppId).toBeDefined();

    const res = await graphqlRequest<ProjectAppUpdateData>({
      query: print(UpdateProjectAppDocument),
      variables: {
        id: projectAppId,
        input: {
          scope: { tenant: 'organizationProject', id: scopeId() },
          name: 'E2E Test App Updated',
          redirectUris: ['https://example.com/callback-v2'],
          allowSignUp: false,
        },
      },
      accessToken: owner.accessToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data?.updateProjectApp).toBeDefined();

    const app = res.body.data!.updateProjectApp!;
    expect(app.id).toBe(projectAppId);
    expect(app.name).toBe('E2E Test App Updated');
    expect(app.redirectUris).toEqual(['https://example.com/callback-v2']);
    expect(app.updatedAt).toBeDefined();
  });

  it('projectApps query after update → returns updated app', async () => {
    const res = await graphqlRequest<ProjectAppPageData>({
      query: print(GetProjectAppsDocument),
      variables: {
        scope: { tenant: 'organizationProject', id: scopeId() },
        page: 1,
        limit: 10,
      },
      accessToken: owner.accessToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeTruthy();
    const page = res.body.data!.projectApps!;
    expect(page.totalCount).toBe(1);
    expect(page.projectApps[0].name).toBe('E2E Test App Updated');
    expect(page.projectApps[0].redirectUris).toEqual(['https://example.com/callback-v2']);
  });

  it('deleteProjectApp → returns deleted app', async () => {
    expect(projectAppId).toBeDefined();

    const res = await graphqlRequest<ProjectAppDeleteData>({
      query: print(DeleteProjectAppDocument),
      variables: {
        id: projectAppId,
        scope: { tenant: 'organizationProject', id: scopeId() },
      },
      accessToken: owner.accessToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data?.deleteProjectApp).toBeDefined();
    expect(res.body.data?.deleteProjectApp?.id).toBe(projectAppId);
    expect(res.body.data?.deleteProjectApp?.deletedAt).toBeTruthy();
  });

  it('projectApps query after delete → returns empty list', async () => {
    const res = await graphqlRequest<ProjectAppPageData>({
      query: print(GetProjectAppsDocument),
      variables: {
        scope: { tenant: 'organizationProject', id: scopeId() },
        page: 1,
        limit: 10,
      },
      accessToken: owner.accessToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeTruthy();
    const page = res.body.data!.projectApps!;
    expect(page.totalCount).toBe(0);
    expect(page.projectApps).toHaveLength(0);
    expect(page.hasNextPage).toBe(false);
  });
});

describe('Project apps – REST', () => {
  let owner: TestUser;
  let org: { id: string };
  let projectId: string;
  let projectAppId: string;
  const scopeId = (): string => `${org.id}:${projectId}`;

  it('Setup: create user, org, and project', async () => {
    owner = await TestUser.create({ withOrgAccount: true });
    org = await owner.createOrganization('E2E REST Project Apps Org');
    const projectRes = await owner.tryCreateProject(org.id, 'E2E REST Project Apps Project');
    expect(projectRes.status).toBe(201);
    const body = projectRes.body as CreateProjectResponseBody;
    expect(body.data?.id).toBeDefined();
    projectId = body.data!.id;
  });

  /** REST project-apps: match working API shape (query + headers as in Swagger/curl). */
  const restHeaders = () => ({
    Accept: 'application/json',
    Authorization: owner.authHeader,
  });
  const listQuery = () => ({
    page: 1,
    limit: 10,
    sortField: 'name',
    sortOrder: 'ASC' as const,
    scopeId: scopeId(),
    tenant: Tenant.OrganizationProject,
  });
  const scopeBody = () => ({ id: scopeId(), tenant: Tenant.OrganizationProject });

  it('GET /api/project-apps → list (empty then one)', async () => {
    const listEmpty = await apiClient()
      .get('/api/project-apps')
      .query(listQuery())
      .set(restHeaders());
    expect(listEmpty.status).toBe(200);
    expect(listEmpty.body.success).toBe(true);
    expect(listEmpty.body.data.projectApps).toHaveLength(0);
    expect(listEmpty.body.data.totalCount).toBe(0);
    expect(listEmpty.body.data.hasNextPage).toBe(false);

    const createRes = await apiClient()
      .post('/api/project-apps')
      .set(restHeaders())
      .send({
        scope: scopeBody(),
        name: 'REST Test App',
        redirectUris: ['https://example.com/rest-cb'],
        allowSignUp: false,
      });
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.id).toBeDefined();
    expect(createRes.body.data.clientId).toBeDefined();
    projectAppId = createRes.body.data.id;

    const listOne = await apiClient()
      .get('/api/project-apps')
      .query(listQuery())
      .set(restHeaders());
    expect(listOne.status).toBe(200);
    expect(listOne.body.success).toBe(true);
    expect(listOne.body.data.projectApps).toHaveLength(1);
    expect(listOne.body.data.totalCount).toBe(1);
    expect(listOne.body.data.hasNextPage).toBe(false);
    const app = listOne.body.data.projectApps[0];
    expect(app.id).toBeDefined();
    expect(app.projectId).toBeDefined();
    expect(app.clientId).toBeDefined();
    expect(app.name).toBe('REST Test App');
    expect(app.redirectUris).toEqual(['https://example.com/rest-cb']);
    expect(app.createdAt).toBeDefined();
    expect(app.updatedAt).toBeDefined();
  });

  it('PATCH /api/project-apps/:id → update', async () => {
    expect(projectAppId).toBeDefined();
    const res = await apiClient()
      .patch(`/api/project-apps/${projectAppId}`)
      .set(restHeaders())
      .send({
        scope: scopeBody(),
        name: 'REST Test App Updated',
        redirectUris: ['https://example.com/rest-cb-v2'],
        allowSignUp: false,
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(projectAppId);
    expect(res.body.data.name).toBe('REST Test App Updated');
    expect(res.body.data.redirectUris).toEqual(['https://example.com/rest-cb-v2']);
    expect(res.body.data.updatedAt).toBeDefined();
  });

  it('DELETE /api/project-apps/:id → delete', async () => {
    expect(projectAppId).toBeDefined();
    const res = await apiClient()
      .delete(`/api/project-apps/${projectAppId}`)
      .query({ scopeId: scopeId(), tenant: Tenant.OrganizationProject })
      .set(restHeaders());
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBe(projectAppId);

    const listAfter = await apiClient()
      .get('/api/project-apps')
      .query(listQuery())
      .set(restHeaders());
    expect(listAfter.status).toBe(200);
    expect(listAfter.body.success).toBe(true);
    expect(listAfter.body.data.projectApps).toHaveLength(0);
    expect(listAfter.body.data.totalCount).toBe(0);
  });
});

describe('Project apps – accountProject scope', () => {
  it('create and list project app under personal account (accountProject)', async () => {
    const user = await TestUser.create(); // personal account only
    const projectRes = await apiClient()
      .post('/api/projects')
      .set('Authorization', user.authHeader)
      .send({
        name: 'E2E Account Project',
        description: 'Project under personal account',
        scope: { id: user.accountId, tenant: 'account' },
      });
    expect(projectRes.status).toBe(201);
    const projectId = projectRes.body.data?.id as string;
    expect(projectId).toBeDefined();
    const scopeId = `${user.accountId}:${projectId}`;

    const createRes = await apiClient()
      .post('/api/project-apps')
      .set('Authorization', user.authHeader)
      .send({
        scope: { id: scopeId, tenant: Tenant.AccountProject },
        name: 'Account Project App',
        redirectUris: ['https://example.com/account-cb'],
        allowSignUp: false,
      });
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.id).toBeDefined();

    const listRes = await apiClient()
      .get('/api/project-apps')
      .query({
        page: 1,
        limit: 10,
        sortField: 'name',
        sortOrder: 'ASC',
        scopeId,
        tenant: Tenant.AccountProject,
      })
      .set({ Accept: 'application/json', Authorization: user.authHeader });
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.projectApps).toHaveLength(1);
    expect(listRes.body.data.projectApps[0].name).toBe('Account Project App');
  });
});

describe('Project apps – forbidden', () => {
  it('user B cannot list project apps in user A org project scope', async () => {
    const userA = await TestUser.create({ withOrgAccount: true });
    const userB = await TestUser.create({ withOrgAccount: true });
    const orgA = await userA.createOrganization('Org A');
    const projectRes = await userA.tryCreateProject(orgA.id, 'Project A');
    expect(projectRes.status).toBe(201);
    const body = projectRes.body as CreateProjectResponseBody;
    const projectId = body.data!.id;
    const scopeId = `${orgA.id}:${projectId}`;

    const res = await apiClient()
      .get('/api/project-apps')
      .query({ scopeId, tenant: Tenant.OrganizationProject, page: 1, limit: 10 })
      .set('Authorization', userB.authHeader);
    expect(res.status).toBe(403);
  });

  it('user B cannot create project app in user A org project scope', async () => {
    const userA = await TestUser.create({ withOrgAccount: true });
    const userB = await TestUser.create({ withOrgAccount: true });
    const orgA = await userA.createOrganization('Org A');
    const projectRes = await userA.tryCreateProject(orgA.id, 'Project A');
    expect(projectRes.status).toBe(201);
    const body = projectRes.body as CreateProjectResponseBody;
    const projectId = body.data!.id;
    const scopeId = `${orgA.id}:${projectId}`;

    const res = await apiClient()
      .post('/api/project-apps')
      .set('Authorization', userB.authHeader)
      .send({
        scope: { id: scopeId, tenant: Tenant.OrganizationProject },
        name: 'Forbidden App',
        redirectUris: ['https://example.com/cb'],
        allowSignUp: false,
      });
    expect(res.status).toBe(403);
  });

  it('user B cannot createProjectApp via GraphQL in user A org project scope', async () => {
    const userA = await TestUser.create({ withOrgAccount: true });
    const userB = await TestUser.create({ withOrgAccount: true });
    const orgA = await userA.createOrganization('Org A');
    const projectRes = await userA.tryCreateProject(orgA.id, 'Project A');
    expect(projectRes.status).toBe(201);
    const body = projectRes.body as CreateProjectResponseBody;
    const projectId = body.data!.id;
    const scopeId = `${orgA.id}:${projectId}`;

    const res = await graphqlRequest<ProjectAppCreateData>({
      query: print(CreateProjectAppDocument),
      variables: {
        input: {
          scope: { id: scopeId, tenant: Tenant.OrganizationProject },
          name: 'Forbidden GQL App',
          redirectUris: ['https://example.com/cb'],
          allowSignUp: false,
        },
      },
      accessToken: userB.accessToken,
    });
    expect(res.status).toBe(200);
    expect(res.body.data?.createProjectApp).toBeUndefined();
    expect(res.body.errors).toBeDefined();
    expect(
      res.body.errors?.some(
        (e: { extensions?: { code?: string } }) => e.extensions?.code === 'FORBIDDEN'
      )
    ).toBe(true);
  });
});

describe('Project apps – invalid input', () => {
  let owner: TestUser;
  let scopeId: string;

  it('Setup: create user, org, and project', async () => {
    owner = await TestUser.create({ withOrgAccount: true });
    const org = await owner.createOrganization('E2E Invalid Input Org');
    const projectRes = await owner.tryCreateProject(org.id, 'Project');
    expect(projectRes.status).toBe(201);
    const body = projectRes.body as CreateProjectResponseBody;
    scopeId = `${org.id}:${body.data!.id}`;
  });

  it('POST with empty redirectUris → 400', async () => {
    const res = await apiClient()
      .post('/api/project-apps')
      .set('Authorization', owner.authHeader)
      .send({
        scope: { id: scopeId, tenant: Tenant.OrganizationProject },
        name: 'No URIs',
        redirectUris: [],
        allowSignUp: false,
      });
    expect(res.status).toBe(400);
  });

  it('POST with wrong scope tenant (organization not organizationProject) → 400', async () => {
    const res = await apiClient()
      .post('/api/project-apps')
      .set('Authorization', owner.authHeader)
      .send({
        scope: { id: scopeId, tenant: Tenant.Organization },
        name: 'Wrong Tenant',
        redirectUris: ['https://example.com/cb'],
        allowSignUp: false,
      });
    expect(res.status).toBe(400);
  });

  it('GET with missing scopeId → 400', async () => {
    const res = await apiClient()
      .get('/api/project-apps')
      .query({ tenant: Tenant.OrganizationProject, page: 1, limit: 10 })
      .set('Authorization', owner.authHeader);
    expect(res.status).toBe(400);
  });

  it('GET with missing tenant → 400', async () => {
    const res = await apiClient()
      .get('/api/project-apps')
      .query({
        scopeId: '00000000-0000-0000-0000-000000000000:00000000-0000-0000-0000-000000000001',
        page: 1,
        limit: 10,
      })
      .set('Authorization', owner.authHeader);
    expect(res.status).toBe(400);
  });
});

describe('Project apps – negative', () => {
  it('createProjectApp without auth → errors (unauthorized)', async () => {
    const res = await graphqlRequest<ProjectAppCreateData>({
      query: print(CreateProjectAppDocument),
      variables: {
        input: {
          scope: {
            tenant: Tenant.OrganizationProject,
            id: '00000000-0000-0000-0000-000000000000:00000000-0000-0000-0000-000000000001',
          },
          name: 'No Auth App',
          redirectUris: ['https://example.com/cb'],
          allowSignUp: false,
        },
      },
      // no accessToken
    });

    expect(res.status).toBe(200);
    expect(res.body.data?.createProjectApp).toBeUndefined();
    expect(res.body.errors).toBeDefined();
    expect(Array.isArray(res.body.errors) && res.body.errors.length).toBeGreaterThan(0);
  });
});
