import {
  MutationAddOrganizationProjectArgs,
  MutationRemoveOrganizationProjectArgs,
  OrganizationProject,
  QueryOrganizationProjectsArgs,
} from '@/graphql/generated/types';

export interface IOrganizationProjectService {
  getOrganizationProjects(
    params: Omit<QueryOrganizationProjectsArgs, 'scope'>
  ): Promise<OrganizationProject[]>;
  addOrganizationProject(params: MutationAddOrganizationProjectArgs): Promise<OrganizationProject>;
  removeOrganizationProject(
    params: MutationRemoveOrganizationProjectArgs
  ): Promise<OrganizationProject>;
}
