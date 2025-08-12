import { projectRoleProjectResolver } from './project';
import { projectRoleRoleResolver } from './role';
export const ProjectRole = {
  project: projectRoleProjectResolver,
  role: projectRoleRoleResolver,
};
