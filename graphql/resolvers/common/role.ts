import { ResolverFn, Scope } from '@/graphql/generated/types';
import { Tenant } from '@/graphql/generated/types';
import { getScopedRoleIds } from '@/graphql/lib/scopeFiltering';
import { Context } from '@/graphql/types';

export const createRoleFieldResolver =
  <T extends { roleId: string }>(
    scopeFactory: (parent: T) => Scope
  ): ResolverFn<any, T, Context, any> =>
  async (parent, _args, context) => {
    const scope = scopeFactory(parent);
    const scopedRoleIds = await getScopedRoleIds({ scope, context });

    if (!scopedRoleIds.includes(parent.roleId)) {
      throw new Error(`Role with ID ${parent.roleId} is not accessible in the current scope`);
    }

    const rolesResult = await context.services.roles.getRoles({
      ids: [parent.roleId],
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
