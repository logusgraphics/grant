import { projectPermissionPermissionResolver } from './permission';
import { projectPermissionProjectResolver } from './project';
export const ProjectPermission = {
  project: projectPermissionProjectResolver,
  permission: projectPermissionPermissionResolver,
};
