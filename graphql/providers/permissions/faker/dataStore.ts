import {
  Permission,
  CreatePermissionInput,
  UpdatePermissionInput,
  PermissionSortInput,
  PermissionPage,
} from '@/graphql/generated/types';
import { createFakerDataStore, EntityConfig } from '@/lib/providers/faker';
import { slugifySafe } from '@/shared/lib/slugify';

// Generate initial permissions (hardcoded)
const generateInitialPermissions = (): Permission[] => [
  {
    id: 'get-policies',
    name: 'Get Policies',
    description: 'Permission to get policies',
    action: 'policies:read',
  },
  {
    id: 'create-policy',
    name: 'Create Policy',
    description: 'Permission to create policies',
    action: 'policies:create',
  },
  {
    id: 'update-policy',
    name: 'Update Policy',
    description: 'Permission to update policies',
    action: 'policies:update',
  },
  {
    id: 'delete-policy',
    name: 'Delete Policy',
    description: 'Permission to delete policies',
    action: 'policies:delete',
  },
];

// Permissions-specific configuration
const permissionsConfig: EntityConfig<Permission, CreatePermissionInput, UpdatePermissionInput> = {
  entityName: 'Permission',
  dataFileName: 'permissions.json',

  // Generate slugified ID from name
  generateId: (input: CreatePermissionInput) => slugifySafe(input.name),

  // Generate permission entity from input
  generateEntity: (input: CreatePermissionInput, id: string): Permission => ({
    id,
    name: input.name,
    description: input.description || '',
    action: input.action,
  }),

  // Update permission entity
  updateEntity: (entity: Permission, input: UpdatePermissionInput): Permission => ({
    ...entity,
    name: input.name || entity.name,
    description: input.description || entity.description,
    action: input.action || entity.action,
  }),

  // Sortable fields
  sortableFields: ['name'],

  // Validation rules
  validationRules: [
    { field: 'id', unique: true },
    { field: 'name', unique: false, required: true },
    { field: 'action', unique: true, required: true },
  ],

  // Initial data
  initialData: generateInitialPermissions,
};

// Create the permissions data store instance
export const permissionsDataStore = createFakerDataStore(permissionsConfig);

// Export the main functions with the same interface as the original
export const initializeDataStore = () => permissionsDataStore.getEntities();
export const savePermissions = (permissions: Permission[]) => {
  // This is handled internally by the data store
  // We keep this for backward compatibility but it's a no-op
};
export const sortPermissions = (
  permissions: Permission[],
  sortConfig?: PermissionSortInput
): Permission[] => {
  if (!sortConfig) return permissions;

  return permissionsDataStore.getEntities({
    field: sortConfig.field,
    order: sortConfig.order,
  });
};
export const getPermissions = (sortConfig?: PermissionSortInput, ids?: string[]): Permission[] => {
  let allPermissions = permissionsDataStore.getEntities(
    sortConfig
      ? {
          field: sortConfig.field,
          order: sortConfig.order,
        }
      : undefined
  );

  // If ids are provided, filter by those IDs
  if (ids && ids.length > 0) {
    allPermissions = allPermissions.filter((permission) => ids.includes(permission.id));
  }

  return allPermissions;
};
export const isPermissionUnique = (permissionId: string): boolean => {
  return !permissionsDataStore.entityExists(permissionId);
};
export const createPermission = (input: CreatePermissionInput): Permission => {
  return permissionsDataStore.createEntity(input);
};
export const updatePermission = (
  permissionId: string,
  input: UpdatePermissionInput
): Permission | null => {
  return permissionsDataStore.updateEntity(permissionId, input);
};
export const deletePermission = (permissionId: string): Permission | null => {
  return permissionsDataStore.deleteEntity(permissionId);
};
