import {
  QueryProjectPermissionsArgs,
  MutationAddProjectPermissionArgs,
  MutationRemoveProjectPermissionArgs,
  ProjectPermission,
} from '@/graphql/generated/types';

export interface IProjectPermissionRepository {
  getProjectPermissions(params: QueryProjectPermissionsArgs): Promise<ProjectPermission[]>;
  addProjectPermission(params: MutationAddProjectPermissionArgs): Promise<ProjectPermission>;
  softDeleteProjectPermission(
    params: MutationRemoveProjectPermissionArgs
  ): Promise<ProjectPermission>;
  hardDeleteProjectPermission(
    params: MutationRemoveProjectPermissionArgs
  ): Promise<ProjectPermission>;
}
