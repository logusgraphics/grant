export enum StandardRoleName {
  Owner = 'roles.names.owner',
  Admin = 'roles.names.admin',
  Dev = 'roles.names.dev',
  Viewer = 'roles.names.viewer',
}

export const STANDARD_ROLES = [
  {
    name: StandardRoleName.Owner,
    description: 'roles.descriptions.owner',
  },
  {
    name: StandardRoleName.Admin,
    description: 'roles.descriptions.admin',
  },
  {
    name: StandardRoleName.Dev,
    description: 'roles.descriptions.dev',
  },
  {
    name: StandardRoleName.Viewer,
    description: 'roles.descriptions.viewer',
  },
] as const;

/**
 * Type guard to check if a string is a valid standard role name
 */
export function isStandardRoleName(name: string): name is StandardRoleName {
  return Object.values(StandardRoleName).includes(name as StandardRoleName);
}

/**
 * Get all standard role names as an array
 */
export function getStandardRoleNames(): StandardRoleName[] {
  return Object.values(StandardRoleName);
}
