import { faker } from '@faker-js/faker';

import {
  createFakerDataStore,
  EntityConfig,
  generateAuditTimestamps,
} from '@/lib/providers/faker/genericDataStore';

// Type for ProjectRole data without the resolved fields
export interface ProjectRoleData {
  id: string;
  projectId: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
}

// Input type for creating project-role relationships
export interface CreateProjectRoleInput {
  projectId: string;
  roleId: string;
}

// Generate empty initial data for project-role relationships
const generateInitialProjectRoles = (): ProjectRoleData[] => {
  // Return empty array - project-role relationships should be created through application logic
  return [];
};

// ProjectRole-specific configuration
const projectRoleConfig: EntityConfig<ProjectRoleData, CreateProjectRoleInput, never> = {
  entityName: 'ProjectRole',
  dataFileName: 'project-roles.json',

  // Generate UUID for project-role IDs
  generateId: () => faker.string.uuid(),

  // Generate project-role entity from input
  generateEntity: (input: CreateProjectRoleInput, id: string): ProjectRoleData => {
    const auditTimestamps = generateAuditTimestamps();
    return {
      id,
      projectId: input.projectId,
      roleId: input.roleId,
      ...auditTimestamps,
    };
  },

  // Update project-role entity (not used for this pivot)
  updateEntity: () => {
    throw new Error('ProjectRole entities should be updated through specific methods');
  },

  // Sortable fields
  sortableFields: ['projectId', 'roleId', 'createdAt', 'updatedAt'],

  // Validation rules
  validationRules: [
    { field: 'id', unique: true },
    { field: 'projectId', unique: false, required: true },
    { field: 'roleId', unique: false, required: true },
  ],

  // Initial data
  initialData: generateInitialProjectRoles,
};

// Create the project-roles data store instance
export const projectRolesDataStore = createFakerDataStore(projectRoleConfig);

// Helper functions for project-role operations
export const getProjectRolesByProjectId = (projectId: string): ProjectRoleData[] => {
  const projectRoles = projectRolesDataStore
    .getEntities()
    .filter((pr) => pr.projectId === projectId);
  return projectRoles;
};

export const getProjectRolesByRoleId = (roleId: string): ProjectRoleData[] => {
  return projectRolesDataStore.getEntities().filter((pr) => pr.roleId === roleId);
};

export const addProjectRole = (projectId: string, roleId: string): ProjectRoleData => {
  // Check if relationship already exists
  const existingRelationship = projectRolesDataStore
    .getEntities()
    .find((pr) => pr.projectId === projectId && pr.roleId === roleId);

  if (existingRelationship) {
    return existingRelationship;
  }

  return projectRolesDataStore.createEntity({ projectId, roleId });
};

export const deleteProjectRole = (id: string): ProjectRoleData | null => {
  return projectRolesDataStore.deleteEntity(id);
};

export const deleteProjectRoleByProjectAndRole = (
  projectId: string,
  roleId: string
): ProjectRoleData | null => {
  const projectRole = projectRolesDataStore
    .getEntities()
    .find((pr) => pr.projectId === projectId && pr.roleId === roleId);

  if (!projectRole) {
    return null;
  }

  return projectRolesDataStore.deleteEntity(projectRole.id);
};

export const deleteProjectRolesByProjectId = (projectId: string): ProjectRoleData[] => {
  const projectRoles = projectRolesDataStore
    .getEntities()
    .filter((pr) => pr.projectId === projectId);
  projectRoles.forEach((pr) => projectRolesDataStore.deleteEntity(pr.id));
  return projectRoles;
};

export const deleteProjectRolesByRoleId = (roleId: string): ProjectRoleData[] => {
  const projectRoles = projectRolesDataStore.getEntities().filter((pr) => pr.roleId === roleId);
  projectRoles.forEach((pr) => projectRolesDataStore.deleteEntity(pr.id));
  return projectRoles;
};
