import { userRoleUserResolver } from './user';
import { userRoleRoleResolver } from './role';

export const UserRole = {
  user: userRoleUserResolver,
  role: userRoleRoleResolver,
};
