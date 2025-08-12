import { ResolverFn } from '@/graphql/generated/types';
import { Tenant } from '@/graphql/generated/types';
import { Context } from '@/graphql/types';
export const createGroupFieldResolver =
  <T extends { groupId: string }>(
    scopeFactory: (parent: T) => { tenant: Tenant; id: string }
  ): ResolverFn<any, T, Context, any> =>
  async (parent, _args, context) => {
    const groupsResult = await context.providers.groups.getGroups({
      ids: [parent.groupId],
      scope: scopeFactory(parent),
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
