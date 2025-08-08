import { faker } from '@faker-js/faker';

import {
  createFakerDataStore,
  EntityConfig,
  generateAuditTimestamps,
} from '@/lib/providers/faker/genericDataStore';

// Type for ProjectPermission data without the resolved fields
export interface ProjectPermissionData {
  id: string;
  projectId: string;
  permissionId: string;
  createdAt: string;
  updatedAt: string;
}

// Input type for creating project-permission relationships
export interface CreateProjectPermissionInput {
  projectId: string;
  permissionId: string;
}

// Generate empty initial data for project-permission relationships
const generateInitialProjectPermissions = (): ProjectPermissionData[] => {
  // Return empty array - project-permission relationships should be created through application logic
  return [];
};

// ProjectPermission-specific configuration
const projectPermissionConfig: EntityConfig<
  ProjectPermissionData,
  CreateProjectPermissionInput,
  never
> = {
  entityName: 'ProjectPermission',
  dataFileName: 'project-permissions.json',

  // Generate UUID for project-permission IDs
  generateId: () => faker.string.uuid(),

  // Generate project-permission entity from input
  generateEntity: (input: CreateProjectPermissionInput, id: string): ProjectPermissionData => {
    const auditTimestamps = generateAuditTimestamps();
    return {
      id,
      projectId: input.projectId,
      permissionId: input.permissionId,
      ...auditTimestamps,
    };
  },

  // Update project-permission entity (not used for this pivot)
  updateEntity: () => {
    throw new Error('ProjectPermission entities should be updated through specific methods');
  },

  // Sortable fields
  sortableFields: ['projectId', 'permissionId', 'createdAt', 'updatedAt'],

  // Validation rules
  validationRules: [
    { field: 'id', unique: true },
    { field: 'projectId', unique: false, required: true },
    { field: 'permissionId', unique: false, required: true },
  ],

  // Initial data
  initialData: generateInitialProjectPermissions,
};

// Create the project-permissions data store instance
export const projectPermissionsDataStore = createFakerDataStore(projectPermissionConfig);

// Helper functions for project-permission operations
export const getProjectPermissionsByProjectId = (projectId: string): ProjectPermissionData[] => {
  const projectPermissions = projectPermissionsDataStore
    .getEntities()
    .filter((pp) => pp.projectId === projectId);
  return projectPermissions;
};

export const getProjectPermissionsByPermissionId = (
  permissionId: string
): ProjectPermissionData[] => {
  return projectPermissionsDataStore.getEntities().filter((pp) => pp.permissionId === permissionId);
};

export const addProjectPermission = (
  projectId: string,
  permissionId: string
): ProjectPermissionData => {
  // Check if relationship already exists
  const existingRelationship = projectPermissionsDataStore
    .getEntities()
    .find((pp) => pp.projectId === projectId && pp.permissionId === permissionId);

  if (existingRelationship) {
    return existingRelationship;
  }

  return projectPermissionsDataStore.createEntity({ projectId, permissionId });
};

export const deleteProjectPermission = (id: string): ProjectPermissionData | null => {
  return projectPermissionsDataStore.deleteEntity(id);
};

export const deleteProjectPermissionByProjectAndPermission = (
  projectId: string,
  permissionId: string
): ProjectPermissionData | null => {
  const projectPermission = projectPermissionsDataStore
    .getEntities()
    .find((pp) => pp.projectId === projectId && pp.permissionId === permissionId);

  if (!projectPermission) {
    return null;
  }

  return projectPermissionsDataStore.deleteEntity(projectPermission.id);
};

export const deleteProjectPermissionsByProjectId = (projectId: string): ProjectPermissionData[] => {
  const projectPermissions = projectPermissionsDataStore
    .getEntities()
    .filter((pp) => pp.projectId === projectId);
  projectPermissions.forEach((pp) => projectPermissionsDataStore.deleteEntity(pp.id));
  return projectPermissions;
};

export const deleteProjectPermissionsByPermissionId = (
  permissionId: string
): ProjectPermissionData[] => {
  const projectPermissions = projectPermissionsDataStore
    .getEntities()
    .filter((pp) => pp.permissionId === permissionId);
  projectPermissions.forEach((pp) => projectPermissionsDataStore.deleteEntity(pp.id));
  return projectPermissions;
};
