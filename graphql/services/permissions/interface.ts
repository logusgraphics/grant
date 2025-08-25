import {
  QueryPermissionsArgs,
  MutationCreatePermissionArgs,
  MutationUpdatePermissionArgs,
  MutationDeletePermissionArgs,
  Permission,
  PermissionPage,
} from '@/graphql/generated/types';

export interface IPermissionService {
  getPermissions(
    params: Omit<QueryPermissionsArgs, 'scope'> & { requestedFields?: string[] }
  ): Promise<PermissionPage>;
  createPermission(params: MutationCreatePermissionArgs): Promise<Permission>;
  updatePermission(params: MutationUpdatePermissionArgs): Promise<Permission>;
  deletePermission(
    params: MutationDeletePermissionArgs & { hardDelete?: boolean }
  ): Promise<Permission>;
}
