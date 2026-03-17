/**
 * E2E: Organization role assignment – multi-org scenario (bug regression).
 *
 * Covers the scenario that led to the organization_users.role_id fix:
 *   - A user is Admin in Org A and Viewer in Org B (different roles per org).
 *   - Role resolution must be per-organization (organization_users.role_id), not
 *     the old intersection of user_roles + org_roles (which could not distinguish orgs).
 *   - Updating the user's role in Org B must not affect their role in Org A.
 *
 * We use Admin (not Owner) in Org A because RBAC forbids inviting with a role
 * equal or higher than your own; the org creator is Owner so cannot assign Owner.
 *
 * Prerequisites: E2E stack running, DB migrated and seeded.
 */
import { CreateProjectAppDocument, GetProjectAppsDocument } from '@grantjs/schema';
import { print } from 'graphql';
import { afterAll, describe, expect, it } from 'vitest';

import { apiClient } from '../helpers/api-client';
import { closeDbHelper, getOrganizationRoleIdByName } from '../helpers/db-tokens';
import { graphqlRequest } from '../helpers/graphql';
import { TestUser } from '../helpers/test-user';

interface ProjectAppCreateData {
  createProjectApp?: { id: string; clientId: string; name: string; redirectUris: string[] };
}

interface ProjectAppPageData {
  projectApps?: {
    projectApps: Array<{ id: string }>;
    totalCount: number;
  };
}

/** Role names as stored in DB (i18n keys from seed). */
const ROLE_VIEWER = 'roles.names.organizationViewer';
const ROLE_ADMIN = 'roles.names.organizationAdmin';

afterAll(async () => {
  await closeDbHelper();
});

describe('Organization roles: multi-org (regression for organization_users.role_id)', () => {
  let ownerA: TestUser;
  let ownerB: TestUser;
  let sharedUser: TestUser;
  let orgA: { id: string; name: string; slug: string };
  let orgB: { id: string; name: string; slug: string };
  let projectAId: string;
  let projectBId: string;
  let sharedUserId: string;

  it('Setup: two orgs and a shared user (Admin in A, Viewer in B)', async () => {
    ownerA = await TestUser.create({ withOrgAccount: true });
    ownerB = await TestUser.create({ withOrgAccount: true });

    orgA = await ownerA.createOrganization('Multi-Role Org A');
    orgB = await ownerB.createOrganization('Multi-Role Org B');

    const adminRoleIdA = await getOrganizationRoleIdByName(orgA.id, ROLE_ADMIN);
    const viewerRoleIdB = await getOrganizationRoleIdByName(orgB.id, ROLE_VIEWER);
    expect(adminRoleIdA).toBeTruthy();
    expect(viewerRoleIdB).toBeTruthy();

    const sharedEmail = `e2e-multi-role-${Date.now()}@test.grant.dev`;

    await ownerA.inviteMember(orgA.id, sharedEmail, adminRoleIdA!);
    await ownerB.inviteMember(orgB.id, sharedEmail, viewerRoleIdB!);

    sharedUser = await TestUser.create({ email: sharedEmail, withOrgAccount: true });
    await sharedUser.acceptInvitation(orgA.id);
    await sharedUser.acceptInvitation(orgB.id);

    const profile = await sharedUser.getProfile();
    expect(profile.status).toBe(200);
    const accounts = (profile.body.data as { accounts?: Array<{ owner?: { id: string } }> })
      ?.accounts;
    sharedUserId = accounts?.[0]?.owner?.id ?? '';
    expect(sharedUserId).toBeTruthy();

    const projectARes = await sharedUser.tryCreateProject(orgA.id, 'Project in A');
    expect([200, 201]).toContain(projectARes.status);
    projectAId = (projectARes.body as { data?: { id: string } })?.data?.id ?? '';
    expect(projectAId).toBeTruthy();

    const projectBRes = await ownerB.tryCreateProject(orgB.id, 'Project in B');
    expect([200, 201]).toContain(projectBRes.status);
    projectBId = (projectBRes.body as { data?: { id: string } })?.data?.id ?? '';
    expect(projectBId).toBeTruthy();
  });

  it('Shared user (Admin in A) can create project app in Org A', async () => {
    const scopeId = `${orgA.id}:${projectAId}`;
    const res = await graphqlRequest<ProjectAppCreateData>({
      query: print(CreateProjectAppDocument),
      variables: {
        input: {
          scope: { tenant: 'organizationProject', id: scopeId },
          name: 'App in Org A',
          redirectUris: ['https://example.com/cb'],
          scopes: [],
          allowSignUp: false,
        },
      },
      accessToken: sharedUser.accessToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data?.createProjectApp).toBeDefined();
  });

  it('Shared user (Viewer in B) cannot create project app in Org B', async () => {
    const scopeId = `${orgB.id}:${projectBId}`;
    const res = await graphqlRequest<ProjectAppCreateData>({
      query: print(CreateProjectAppDocument),
      variables: {
        input: {
          scope: { tenant: 'organizationProject', id: scopeId },
          name: 'App in Org B',
          redirectUris: ['https://example.com/cb'],
          scopes: [],
          allowSignUp: false,
        },
      },
      accessToken: sharedUser.accessToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(
      res.body.errors?.some((e) => e.message === 'Forbidden' || e.extensions?.code === 'FORBIDDEN')
    ).toBe(true);
  });

  it('Owner B promotes shared user to Admin in Org B', async () => {
    const adminRoleIdB = await getOrganizationRoleIdByName(orgB.id, ROLE_ADMIN);
    expect(adminRoleIdB).toBeTruthy();

    const res = await apiClient()
      .patch(`/api/organization-members/${sharedUserId}`)
      .set('Authorization', ownerB.authHeader)
      .send({
        scope: { id: orgB.id, tenant: 'organization' },
        roleId: adminRoleIdB,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const roleId = res.body.data?.roleId ?? res.body.data?.role?.id;
    expect(roleId).toBe(adminRoleIdB);
  });

  it('Shared user (now Admin in B) can create project app in Org B', async () => {
    const scopeId = `${orgB.id}:${projectBId}`;
    const res = await graphqlRequest<ProjectAppCreateData>({
      query: print(CreateProjectAppDocument),
      variables: {
        input: {
          scope: { tenant: 'organizationProject', id: scopeId },
          name: 'App in Org B After Promote',
          redirectUris: ['https://example.com/cb'],
          scopes: [],
          allowSignUp: false,
        },
      },
      accessToken: sharedUser.accessToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data?.createProjectApp).toBeDefined();
  });

  it('Shared user still has Admin capabilities in Org A after promotion in B', async () => {
    const scopeId = `${orgA.id}:${projectAId}`;
    const res = await graphqlRequest<ProjectAppPageData>({
      query: print(GetProjectAppsDocument),
      variables: {
        scope: { tenant: 'organizationProject', id: scopeId },
        page: 1,
        limit: 10,
      },
      accessToken: sharedUser.accessToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data?.projectApps).toBeDefined();
  });

  it('Owner B demotes shared user back to Viewer in Org B', async () => {
    const viewerRoleIdB = await getOrganizationRoleIdByName(orgB.id, ROLE_VIEWER);
    expect(viewerRoleIdB).toBeTruthy();

    const res = await apiClient()
      .patch(`/api/organization-members/${sharedUserId}`)
      .set('Authorization', ownerB.authHeader)
      .send({
        scope: { id: orgB.id, tenant: 'organization' },
        roleId: viewerRoleIdB,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('Shared user still has Admin capabilities in Org A after demotion in B', async () => {
    const scopeId = `${orgA.id}:${projectAId}`;
    const res = await graphqlRequest<ProjectAppPageData>({
      query: print(GetProjectAppsDocument),
      variables: {
        scope: { tenant: 'organizationProject', id: scopeId },
        page: 1,
        limit: 10,
      },
      accessToken: sharedUser.accessToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data?.projectApps).toBeDefined();
  });
});
