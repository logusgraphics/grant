import {
  QueryPermissionsArgs,
  MutationCreatePermissionArgs,
  MutationUpdatePermissionArgs,
  MutationDeletePermissionArgs,
  Permission,
  PermissionPage,
} from '@/graphql/generated/types';

export interface IPermissionRepository {
  getPermissions(
    params: Omit<QueryPermissionsArgs, 'scope'> & { requestedFields?: string[] }
  ): Promise<PermissionPage>;
  createPermission(params: MutationCreatePermissionArgs): Promise<Permission>;
  updatePermission(params: MutationUpdatePermissionArgs): Promise<Permission>;
  softDeletePermission(params: MutationDeletePermissionArgs): Promise<Permission>;
  hardDeletePermission(params: MutationDeletePermissionArgs): Promise<Permission>;
}
