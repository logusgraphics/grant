import { ResolverFn } from '@/graphql/generated/types';
import { Tenant } from '@/graphql/generated/types';
import { Context } from '@/graphql/types';
export const createPermissionFieldResolver =
  <T extends { permissionId: string }>(
    scopeFactory: (parent: T) => { tenant: Tenant; id: string }
  ): ResolverFn<any, T, Context, any> =>
  async (parent, _args, context) => {
    const permissionsResult = await context.providers.permissions.getPermissions({
      ids: [parent.permissionId],
      scope: scopeFactory(parent),
      limit: -1,
    });
    const permission = permissionsResult.permissions[0];
    if (!permission) {
      throw new Error(`Permission with ID ${parent.permissionId} not found`);
    }
    return permission;
  };
export const createOrganizationPermissionFieldResolver = <
  T extends { permissionId: string; organizationId: string },
>() =>
  createPermissionFieldResolver<T>((parent) => ({
    tenant: Tenant.Organization,
    id: parent.organizationId,
  }));
export const createProjectPermissionFieldResolver = <
  T extends { permissionId: string; projectId: string },
>() =>
  createPermissionFieldResolver<T>((parent) => ({
    tenant: Tenant.Project,
    id: parent.projectId,
  }));
