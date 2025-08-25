import {
  QueryProjectPermissionsArgs,
  MutationAddProjectPermissionArgs,
  MutationRemoveProjectPermissionArgs,
  ProjectPermission,
} from '@/graphql/generated/types';

export interface IProjectPermissionService {
  getProjectPermissions(params: QueryProjectPermissionsArgs): Promise<ProjectPermission[]>;
  addProjectPermission(params: MutationAddProjectPermissionArgs): Promise<ProjectPermission>;
  removeProjectPermission(
    params: MutationRemoveProjectPermissionArgs & { hardDelete?: boolean }
  ): Promise<ProjectPermission>;
}
