import { projectGroupsResolver } from './groups';
import { projectPermissionsResolver } from './permissions';
import { projectRolesResolver } from './roles';
import { projectUsersResolver } from './users';

export const Project = {
  roles: projectRolesResolver,
  groups: projectGroupsResolver,
  permissions: projectPermissionsResolver,
  users: projectUsersResolver,
};
