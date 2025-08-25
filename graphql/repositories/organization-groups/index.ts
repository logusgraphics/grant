export { OrganizationGroupRepository } from './repository';
export type { IOrganizationGroupRepository } from './interface';
export * from './schema';

import { OrganizationGroupRepository } from './repository';
export const organizationGroupRepository = new OrganizationGroupRepository();
