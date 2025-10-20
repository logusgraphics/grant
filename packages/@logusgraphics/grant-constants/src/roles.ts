/**
 * Standard organization role names
 */
export enum StandardRoleName {
  Owner = 'owner',
  Admin = 'admin',
  Dev = 'dev',
  Viewer = 'viewer',
}

/**
 * Standard organization roles with descriptions
 */
export const STANDARD_ROLES = [
  {
    name: StandardRoleName.Owner,
    description: 'Full control over the organization and all its resources',
  },
  {
    name: StandardRoleName.Admin,
    description: 'Administrative access to manage organization settings and members',
  },
  {
    name: StandardRoleName.Dev,
    description: 'Developer access to manage projects and resources',
  },
  {
    name: StandardRoleName.Viewer,
    description: 'Read-only access to organization resources',
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
