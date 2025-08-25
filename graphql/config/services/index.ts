import {
  roleRepository,
  userRepository,
  userRoleRepository,
  userTagRepository,
  tagRepository,
  groupRepository,
  permissionRepository,
  projectRepository,
  organizationRepository,
  groupPermissionRepository,
  organizationUserRepository,
  organizationProjectRepository,
  roleGroupRepository,
  organizationPermissionRepository,
  organizationGroupRepository,
  groupTagRepository,
  projectRoleRepository,
  projectPermissionRepository,
  projectTagRepository,
  projectGroupRepository,
  projectUserRepository,
  organizationRoleRepository,
  organizationTagRepository,
  roleTagRepository,
  permissionTagRepository,
} from '@/graphql/repositories';
import { createGroupPermissionService } from '@/graphql/services/group-permissions';
import { createGroupTagService } from '@/graphql/services/group-tags';
import { createGroupService } from '@/graphql/services/groups';
import { createOrganizationGroupService } from '@/graphql/services/organization-groups';
import { createOrganizationPermissionService } from '@/graphql/services/organization-permissions';
import { createOrganizationProjectService } from '@/graphql/services/organization-projects';
import { createOrganizationRoleService } from '@/graphql/services/organization-roles';
import { createOrganizationTagService } from '@/graphql/services/organization-tags';
import { createOrganizationUserService } from '@/graphql/services/organization-users';
import { createOrganizationService } from '@/graphql/services/organizations';
import { createPermissionTagService } from '@/graphql/services/permission-tags';
import { createPermissionService } from '@/graphql/services/permissions';
import { createProjectGroupService } from '@/graphql/services/project-groups';
import { createProjectPermissionService } from '@/graphql/services/project-permissions';
import { createProjectRoleService } from '@/graphql/services/project-roles';
import { createProjectTagService } from '@/graphql/services/project-tags';
import { createProjectUserService } from '@/graphql/services/project-users';
import { createProjectService } from '@/graphql/services/projects';
import { createRoleGroupService } from '@/graphql/services/role-groups';
import { createRoleTagService } from '@/graphql/services/role-tags';
import { createRoleService } from '@/graphql/services/roles';
import { createTagService } from '@/graphql/services/tags';
import { createUserRoleService } from '@/graphql/services/user-roles';
import { createUserTagService } from '@/graphql/services/user-tags';
import { createUserService } from '@/graphql/services/users';

import { CreateModuleServicesParams, ModuleServices } from './interface';

export const createServices = ({ user }: CreateModuleServicesParams): ModuleServices => ({
  users: createUserService(userRepository, user),
  roles: createRoleService(roleRepository, user),
  groups: createGroupService(groupRepository, user),
  permissions: createPermissionService(permissionRepository, user),
  projects: createProjectService(projectRepository, user),
  organizations: createOrganizationService(organizationRepository, user),
  tags: createTagService(tagRepository, user),
  userRoles: createUserRoleService(userRoleRepository, userRepository, roleRepository, user),
  userTags: createUserTagService(userTagRepository, userRepository, tagRepository, user),
  groupPermissions: createGroupPermissionService(
    groupPermissionRepository,
    groupRepository,
    permissionRepository,
    user
  ),
  organizationUsers: createOrganizationUserService(
    organizationUserRepository,
    organizationRepository,
    userRepository,
    user
  ),
  organizationProjects: createOrganizationProjectService(
    organizationProjectRepository,
    organizationRepository,
    projectRepository,
    user
  ),
  roleGroups: createRoleGroupService(roleGroupRepository, roleRepository, groupRepository, user),
  organizationPermissions: createOrganizationPermissionService(
    organizationPermissionRepository,
    organizationRepository,
    permissionRepository,
    user
  ),
  organizationGroups: createOrganizationGroupService(
    organizationGroupRepository,
    organizationRepository,
    groupRepository,
    user
  ),
  groupTags: createGroupTagService(groupTagRepository, groupRepository, tagRepository, user),
  projectRoles: createProjectRoleService(
    projectRoleRepository,
    projectRepository,
    roleRepository,
    user
  ),
  projectPermissions: createProjectPermissionService(
    projectPermissionRepository,
    projectRepository,
    permissionRepository,
    user
  ),
  projectTags: createProjectTagService(
    projectTagRepository,
    projectRepository,
    tagRepository,
    user
  ),
  projectGroups: createProjectGroupService(
    projectGroupRepository,
    projectRepository,
    groupRepository,
    user
  ),
  projectUsers: createProjectUserService(
    projectUserRepository,
    projectRepository,
    userRepository,
    user
  ),
  organizationRoles: createOrganizationRoleService(
    organizationRoleRepository,
    organizationRepository,
    roleRepository,
    user
  ),
  organizationTags: createOrganizationTagService(
    organizationTagRepository,
    organizationRepository,
    tagRepository,
    user
  ),
  roleTags: createRoleTagService(roleTagRepository, roleRepository, tagRepository, user),
  permissionTags: createPermissionTagService(
    permissionTagRepository,
    permissionRepository,
    tagRepository,
    user
  ),
});
