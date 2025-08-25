import { jwtProvider } from '@/graphql/providers/auth/jwt';
import { groupPermissionFakerProvider } from '@/graphql/providers/group-permissions/faker';
import { groupTagFakerProvider } from '@/graphql/providers/group-tags/faker';
import { groupFakerProvider } from '@/graphql/providers/groups/faker';
import { organizationGroupFakerProvider } from '@/graphql/providers/organization-groups/faker';
import { organizationPermissionFakerProvider } from '@/graphql/providers/organization-permissions/faker';
import { organizationProjectFakerProvider } from '@/graphql/providers/organization-projects/faker';
import { organizationRoleFakerProvider } from '@/graphql/providers/organization-roles/faker';
import { organizationTagFakerProvider } from '@/graphql/providers/organization-tags/faker';
import { organizationUserFakerProvider } from '@/graphql/providers/organization-users/faker';
import { organizationFakerProvider } from '@/graphql/providers/organizations/faker';
import { permissionTagFakerProvider } from '@/graphql/providers/permission-tags/faker';
import { permissionFakerProvider } from '@/graphql/providers/permissions/faker';
import { projectGroupFakerProvider } from '@/graphql/providers/project-groups/faker';
import { projectPermissionFakerProvider } from '@/graphql/providers/project-permissions/faker';
import { projectRoleFakerProvider } from '@/graphql/providers/project-roles/faker';
import { projectTagFakerProvider } from '@/graphql/providers/project-tags/faker';
import { projectUserFakerProvider } from '@/graphql/providers/project-users/faker';
import { projectFakerProvider } from '@/graphql/providers/projects/faker';
import { roleGroupFakerProvider } from '@/graphql/providers/role-groups/faker';
import { roleTagFakerProvider } from '@/graphql/providers/role-tags/faker';
import { roleFakerProvider } from '@/graphql/providers/roles/faker';
import { userRoleFakerProvider } from '@/graphql/providers/user-roles/faker';
import { userFakerProvider } from '@/graphql/providers/users/faker';

import { ModuleProviders } from './interface';

export const providers: ModuleProviders = {
  auth: jwtProvider,
  users: userFakerProvider,
  roles: roleFakerProvider,
  groups: groupFakerProvider,
  organizations: organizationFakerProvider,
  organizationProjects: organizationProjectFakerProvider,
  organizationRoles: organizationRoleFakerProvider,
  organizationGroups: organizationGroupFakerProvider,
  organizationPermissions: organizationPermissionFakerProvider,
  organizationUsers: organizationUserFakerProvider,
  organizationTags: organizationTagFakerProvider,
  projects: projectFakerProvider,
  projectRoles: projectRoleFakerProvider,
  projectGroups: projectGroupFakerProvider,
  projectPermissions: projectPermissionFakerProvider,
  projectUsers: projectUserFakerProvider,
  projectTags: projectTagFakerProvider,
  permissions: permissionFakerProvider,
  userRoles: userRoleFakerProvider,
  roleGroups: roleGroupFakerProvider,
  groupPermissions: groupPermissionFakerProvider,
  roleTags: roleTagFakerProvider,
  groupTags: groupTagFakerProvider,
  permissionTags: permissionTagFakerProvider,
};
