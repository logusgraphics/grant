import { ResolverFn } from '@/graphql/generated/types';
import { Tenant } from '@/graphql/generated/types';
import { Context } from '@/graphql/types';
export const createRoleFieldResolver =
  <T extends { roleId: string }>(
    scopeFactory: (parent: T) => { tenant: Tenant; id: string }
  ): ResolverFn<any, T, Context, any> =>
  async (parent, _args, context) => {
    const rolesResult = await context.providers.roles.getRoles({
      ids: [parent.roleId],
      scope: scopeFactory(parent),
      limit: -1,
    });
    const role = rolesResult.roles[0];
    if (!role) {
      throw new Error(`Role with ID ${parent.roleId} not found`);
    }
    return role;
  };
export const createOrganizationRoleFieldResolver = <
  T extends { roleId: string; organizationId: string },
>() =>
  createRoleFieldResolver<T>((parent) => ({
    tenant: Tenant.Organization,
    id: parent.organizationId,
  }));
export const createProjectRoleFieldResolver = <T extends { roleId: string; projectId: string }>() =>
  createRoleFieldResolver<T>((parent) => ({
    tenant: Tenant.Project,
    id: parent.projectId,
  }));
