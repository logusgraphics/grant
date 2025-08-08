import { faker } from '@faker-js/faker';

import {
  createFakerDataStore,
  EntityConfig,
  generateAuditTimestamps,
} from '@/lib/providers/faker/genericDataStore';

// Type for ProjectUser data without the resolved fields
export interface ProjectUserData {
  id: string;
  projectId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Input type for creating project-user relationships
export interface CreateProjectUserInput {
  projectId: string;
  userId: string;
}

// Generate empty initial data for project-user relationships
const generateInitialProjectUsers = (): ProjectUserData[] => {
  // Return empty array - project-user relationships should be created through application logic
  return [];
};

// ProjectUser-specific configuration
const projectUserConfig: EntityConfig<ProjectUserData, CreateProjectUserInput, never> = {
  entityName: 'ProjectUser',
  dataFileName: 'project-users.json',

  // Generate UUID for project-user IDs
  generateId: () => faker.string.uuid(),

  // Generate project-user entity from input
  generateEntity: (input: CreateProjectUserInput, id: string): ProjectUserData => {
    const auditTimestamps = generateAuditTimestamps();
    return {
      id,
      projectId: input.projectId,
      userId: input.userId,
      ...auditTimestamps,
    };
  },

  // Update project-user entity (not used for this pivot)
  updateEntity: () => {
    throw new Error('ProjectUser entities should be updated through specific methods');
  },

  // Sortable fields
  sortableFields: ['projectId', 'userId', 'createdAt', 'updatedAt'],

  // Validation rules
  validationRules: [
    { field: 'id', unique: true },
    { field: 'projectId', unique: false, required: true },
    { field: 'userId', unique: false, required: true },
  ],

  // Initial data
  initialData: generateInitialProjectUsers,
};

// Create the project-users data store instance
export const projectUsersDataStore = createFakerDataStore(projectUserConfig);

// Helper functions for project-user operations
export const getProjectUsersByProjectId = (projectId: string): ProjectUserData[] => {
  const projectUsers = projectUsersDataStore
    .getEntities()
    .filter((pu) => pu.projectId === projectId);
  return projectUsers;
};

export const getProjectUsersByUserId = (userId: string): ProjectUserData[] => {
  return projectUsersDataStore.getEntities().filter((pu) => pu.userId === userId);
};

export const addProjectUser = (projectId: string, userId: string): ProjectUserData => {
  // Check if relationship already exists
  const existingRelationship = projectUsersDataStore
    .getEntities()
    .find((pu) => pu.projectId === projectId && pu.userId === userId);

  if (existingRelationship) {
    return existingRelationship;
  }

  return projectUsersDataStore.createEntity({ projectId, userId });
};

export const deleteProjectUser = (id: string): ProjectUserData | null => {
  return projectUsersDataStore.deleteEntity(id);
};

export const deleteProjectUserByProjectAndUser = (
  projectId: string,
  userId: string
): ProjectUserData | null => {
  const projectUser = projectUsersDataStore
    .getEntities()
    .find((pu) => pu.projectId === projectId && pu.userId === userId);

  if (!projectUser) {
    return null;
  }

  return projectUsersDataStore.deleteEntity(projectUser.id);
};

export const deleteProjectUsersByProjectId = (projectId: string): ProjectUserData[] => {
  const projectUsers = projectUsersDataStore
    .getEntities()
    .filter((pu) => pu.projectId === projectId);
  projectUsers.forEach((pu) => projectUsersDataStore.deleteEntity(pu.id));
  return projectUsers;
};

export const deleteProjectUsersByUserId = (userId: string): ProjectUserData[] => {
  const projectUsers = projectUsersDataStore.getEntities().filter((pu) => pu.userId === userId);
  projectUsers.forEach((pu) => projectUsersDataStore.deleteEntity(pu.id));
  return projectUsers;
};
