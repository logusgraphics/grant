import { faker } from '@faker-js/faker';
import { createFakerDataStore, EntityConfig } from '@/lib/providers/faker/genericDataStore';
import { getGroups } from '@/graphql/providers/groups/faker/dataStore';
import { getPermissions } from '@/graphql/providers/permissions/faker/dataStore';

// Type for GroupPermission data without the resolved fields
export interface GroupPermissionData {
  id: string;
  groupId: string;
  permissionId: string;
}

// Generate fake group-permission relationships
const generateFakeGroupPermissions = (count: number = 100): GroupPermissionData[] => {
  const groups = getGroups();
  const permissions = getPermissions();

  const groupPermissions: GroupPermissionData[] = [];

  // Create some random group-permission relationships
  for (let i = 0; i < count; i++) {
    const randomGroup = groups[Math.floor(Math.random() * groups.length)];
    const randomPermission = permissions[Math.floor(Math.random() * permissions.length)];

    // Avoid duplicates
    const exists = groupPermissions.some(
      (gp) => gp.groupId === randomGroup.id && gp.permissionId === randomPermission.id
    );
    if (!exists) {
      groupPermissions.push({
        id: faker.string.uuid(),
        groupId: randomGroup.id,
        permissionId: randomPermission.id,
      });
    }
  }

  return groupPermissions;
};

// GroupPermission-specific configuration
const groupPermissionConfig: EntityConfig<GroupPermissionData, never, never> = {
  entityName: 'GroupPermission',
  dataFileName: 'group-permissions.json',

  // Generate UUID for group-permission IDs
  generateId: () => faker.string.uuid(),

  // Generate group-permission entity from input (not used for this pivot)
  generateEntity: () => {
    throw new Error('GroupPermission entities should be created through specific methods');
  },

  // Update group-permission entity (not used for this pivot)
  updateEntity: () => {
    throw new Error('GroupPermission entities should be updated through specific methods');
  },

  // Sortable fields
  sortableFields: ['groupId', 'permissionId'],

  // Validation rules
  validationRules: [
    { field: 'id', unique: true },
    { field: 'groupId', unique: false, required: true },
    { field: 'permissionId', unique: false, required: true },
  ],

  // Initial data
  initialData: generateFakeGroupPermissions,
};

// Create the group-permissions data store instance
export const groupPermissionsDataStore = createFakerDataStore(groupPermissionConfig);

// Helper functions for group-permission operations
export const getGroupPermissionsByGroupId = (groupId: string): GroupPermissionData[] => {
  const groupPermissions = groupPermissionsDataStore
    .getEntities()
    .filter((gp) => gp.groupId === groupId);
  return groupPermissions;
};

export const getGroupPermissionsByPermissionId = (permissionId: string): GroupPermissionData[] => {
  return groupPermissionsDataStore.getEntities().filter((gp) => gp.permissionId === permissionId);
};

export const addGroupPermission = (groupId: string, permissionId: string): GroupPermissionData => {
  // Get current entities and check if permission already exists
  const entities = groupPermissionsDataStore.getEntities();
  const existingPermission = entities.find(
    (gp) => gp.groupId === groupId && gp.permissionId === permissionId
  );

  if (existingPermission) {
    return existingPermission;
  }

  const groupPermission: GroupPermissionData = {
    id: faker.string.uuid(),
    groupId,
    permissionId,
  };

  entities.push(groupPermission);

  // Save back to the data store
  const fs = require('fs');
  const path = require('path');
  const dataFilePath = path.join(process.cwd(), 'data', 'group-permissions.json');
  fs.writeFileSync(dataFilePath, JSON.stringify(entities, null, 2));

  return groupPermission;
};

export const deleteGroupPermission = (id: string): GroupPermissionData | null => {
  return groupPermissionsDataStore.deleteEntity(id);
};

// New function to delete by groupId and permissionId
export const deleteGroupPermissionByGroupAndPermission = (
  groupId: string,
  permissionId: string
): GroupPermissionData | null => {
  const entities = groupPermissionsDataStore.getEntities();
  const groupPermissionIndex = entities.findIndex(
    (gp) => gp.groupId === groupId && gp.permissionId === permissionId
  );

  if (groupPermissionIndex === -1) {
    return null;
  }

  const groupPermission = entities[groupPermissionIndex];
  entities.splice(groupPermissionIndex, 1);

  // Save back to the data store
  const fs = require('fs');
  const path = require('path');
  const dataFilePath = path.join(process.cwd(), 'data', 'group-permissions.json');
  fs.writeFileSync(dataFilePath, JSON.stringify(entities, null, 2));

  return groupPermission;
};

export const deleteGroupPermissionsByGroupId = (groupId: string): GroupPermissionData[] => {
  const groupPermissions = getGroupPermissionsByGroupId(groupId);
  return groupPermissions
    .map((gp) => groupPermissionsDataStore.deleteEntity(gp.id))
    .filter(Boolean) as GroupPermissionData[];
};

export const deleteGroupPermissionsByPermissionId = (
  permissionId: string
): GroupPermissionData[] => {
  const groupPermissions = getGroupPermissionsByPermissionId(permissionId);
  return groupPermissions
    .map((gp) => groupPermissionsDataStore.deleteEntity(gp.id))
    .filter(Boolean) as GroupPermissionData[];
};
