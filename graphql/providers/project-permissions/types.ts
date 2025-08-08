import {
  MutationAddProjectPermissionArgs,
  MutationRemoveProjectPermissionArgs,
  ProjectPermission,
} from '@/graphql/generated/types';

export type GetProjectPermissionsParams = { projectId: string };
export type GetProjectPermissionsResult = ProjectPermission[];

export type AddProjectPermissionParams = MutationAddProjectPermissionArgs;
export type AddProjectPermissionResult = ProjectPermission;

export type RemoveProjectPermissionParams = MutationRemoveProjectPermissionArgs;
export type RemoveProjectPermissionResult = boolean;

export interface ProjectPermissionDataProvider {
  getProjectPermissions(params: GetProjectPermissionsParams): Promise<GetProjectPermissionsResult>;
  addProjectPermission(params: AddProjectPermissionParams): Promise<AddProjectPermissionResult>;
  removeProjectPermission(
    params: RemoveProjectPermissionParams
  ): Promise<RemoveProjectPermissionResult>;
}
