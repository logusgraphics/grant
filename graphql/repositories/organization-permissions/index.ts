export { OrganizationPermissionRepository } from './repository';
export type { IOrganizationPermissionRepository } from './interface';
export * from './schema';

import { OrganizationPermissionRepository } from './repository';
export const organizationPermissionRepository = new OrganizationPermissionRepository();
