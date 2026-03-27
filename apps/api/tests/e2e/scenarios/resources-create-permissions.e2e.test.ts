/**
 * E2E: Create resource with createPermissions — REST and GraphQL return embedded permissions.
 *
 * Prerequisites: E2E stack (docker-compose.e2e.yml), DB migrated and seeded.
 */
import { CreateResourceDocument } from '@grantjs/schema';
import { print } from 'graphql';
import { afterAll, describe, expect, it } from 'vitest';

import { apiClient } from '../helpers/api-client';
import { closeDbHelper } from '../helpers/db-tokens';
import { graphqlRequest } from '../helpers/graphql';
import { TestUser } from '../helpers/test-user';

interface CreateResourceGqlData {
  createResource?: {
    id: string;
    name: string;
    slug: string;
    actions: string[];
    permissions?: Array<{ id: string; name: string; action: string; resourceId: string | null }>;
  };
}

interface CreateProjectResponseBody {
  data?: { id: string };
}

afterAll(async () => {
  await closeDbHelper();
});

describe('Resource create with createPermissions (REST + GraphQL)', () => {
  let owner: TestUser;
  let org: { id: string; name: string; slug: string };
  let projectId: string;

  const scopeId = (): string => `${org.id}:${projectId}`;

  it('Setup: create user, org, and project', async () => {
    owner = await TestUser.create({ withOrgAccount: true });
    org = await owner.createOrganization('E2E Resources Perm Org');
    const projectRes = await owner.tryCreateProject(org.id, 'E2E Resources Perm Project');
    expect(projectRes.status).toBe(201);
    const body = projectRes.body as CreateProjectResponseBody;
    expect(body.data?.id).toBeDefined();
    projectId = body.data!.id;
  });

  it('REST POST /api/resources embeds permissions when createPermissions is true', async () => {
    const slug = `e2e-res-rest-${Date.now()}`;
    const res = await apiClient()
      .post('/api/resources')
      .set('Authorization', owner.authHeader)
      .send({
        name: 'E2E REST Resource',
        slug,
        description: 'e2e',
        actions: ['read', 'manage'],
        createPermissions: true,
        scope: { tenant: 'organizationProject', id: scopeId() },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const data = res.body.data as {
      id: string;
      permissions?: Array<{ action: string; resourceId: string | null }>;
    };
    expect(data.permissions).toBeDefined();
    expect(data.permissions).toHaveLength(2);
    const actions = data.permissions!.map((p) => p.action).sort();
    expect(actions).toEqual(['manage', 'read']);
    expect(data.permissions!.every((p) => p.resourceId === data.id)).toBe(true);
  });

  it('GraphQL createResource returns permissions when createPermissions is true', async () => {
    const slug = `e2e-res-gql-${Date.now()}`;
    const res = await graphqlRequest<CreateResourceGqlData>({
      query: print(CreateResourceDocument),
      variables: {
        input: {
          name: 'E2E GraphQL Resource',
          slug,
          actions: ['read'],
          createPermissions: true,
          scope: { tenant: 'organizationProject', id: scopeId() },
        },
      },
      accessToken: owner.accessToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    const cr = res.body.data?.createResource;
    expect(cr).toBeDefined();
    expect(cr!.permissions).toHaveLength(1);
    expect(cr!.permissions![0].action).toBe('read');
    expect(cr!.permissions![0].resourceId).toBe(cr!.id);
  });
});
