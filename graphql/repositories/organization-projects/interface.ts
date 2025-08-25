import { OrganizationProject, QueryOrganizationProjectsArgs } from '@/graphql/generated/types';

export interface IOrganizationProjectRepository {
  getOrganizationProjects(
    params: Omit<QueryOrganizationProjectsArgs, 'scope'>
  ): Promise<OrganizationProject[]>;
  addOrganizationProject(organizationId: string, projectId: string): Promise<OrganizationProject>;
  softDeleteOrganizationProject(
    organizationId: string,
    projectId: string
  ): Promise<OrganizationProject>;
  hardDeleteOrganizationProject(
    organizationId: string,
    projectId: string
  ): Promise<OrganizationProject>;
}
