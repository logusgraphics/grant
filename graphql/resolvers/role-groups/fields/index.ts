import { roleGroupGroupResolver } from './group';
import { roleGroupRoleResolver } from './role';

export const RoleGroup = {
  group: roleGroupGroupResolver,
  role: roleGroupRoleResolver,
};
