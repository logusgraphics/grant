import { ResolverFn, Scope } from '@/graphql/generated/types';
import { Tenant } from '@/graphql/generated/types';
import { getScopedPermissionIds } from '@/graphql/lib/scopeFiltering';
import { Context } from '@/graphql/types';

export const createPermissionFieldResolver =
  <T extends { permissionId: string }>(
    scopeFactory: (parent: T) => Scope
  ): ResolverFn<any, T, Context, any> =>
  async (parent, _args, context) => {
    const scope = scopeFactory(parent);
    const scopedPermissionIds = await getScopedPermissionIds({ scope, context });

    if (!scopedPermissionIds.includes(parent.permissionId)) {
      throw new Error(
        `Permission with ID ${parent.permissionId} is not accessible in the current scope`
      );
    }

    const permissionsResult = await context.services.permissions.getPermissions({
      ids: [parent.permissionId],
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
