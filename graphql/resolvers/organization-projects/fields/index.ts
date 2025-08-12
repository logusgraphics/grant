import { organizationProjectOrganizationResolver } from './organization';
import { organizationProjectProjectResolver } from './project';
export const OrganizationProject = {
  organization: organizationProjectOrganizationResolver,
  project: organizationProjectProjectResolver,
};
