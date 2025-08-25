import { ResolverFn, Scope } from '@/graphql/generated/types';
import { Tenant } from '@/graphql/generated/types';
import { getScopedGroupIds } from '@/graphql/lib/scopeFiltering';
import { Context } from '@/graphql/types';

export const createGroupFieldResolver =
  <T extends { groupId: string }>(
    scopeFactory: (parent: T) => Scope
  ): ResolverFn<any, T, Context, any> =>
  async (parent, _args, context) => {
    const scope = scopeFactory(parent);
    const scopedGroupIds = await getScopedGroupIds({ scope, context });

    if (!scopedGroupIds.includes(parent.groupId)) {
      throw new Error(`Group with ID ${parent.groupId} is not accessible in the current scope`);
    }

    const groupsResult = await context.services.groups.getGroups({
      ids: [parent.groupId],
      limit: -1,
    });

    const group = groupsResult.groups[0];

    if (!group) {
      throw new Error(`Group with ID ${parent.groupId} not found`);
    }

    return group;
  };

export const createOrganizationGroupFieldResolver = <
  T extends { groupId: string; organizationId: string },
>() =>
  createGroupFieldResolver<T>((parent) => ({
    tenant: Tenant.Organization,
    id: parent.organizationId,
  }));

export const createProjectGroupFieldResolver = <
  T extends { groupId: string; projectId: string },
>() =>
  createGroupFieldResolver<T>((parent) => ({
    tenant: Tenant.Project,
    id: parent.projectId,
  }));
