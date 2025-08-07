import {
  MutationAddOrganizationProjectArgs,
  MutationRemoveOrganizationProjectArgs,
  OrganizationProject,
} from '@/graphql/generated/types';

export type GetOrganizationProjectsParams = { organizationId: string };
export type GetOrganizationProjectsResult = OrganizationProject[];

export type AddOrganizationProjectParams = MutationAddOrganizationProjectArgs;
export type AddOrganizationProjectResult = OrganizationProject;

export type RemoveOrganizationProjectParams = MutationRemoveOrganizationProjectArgs;
export type RemoveOrganizationProjectResult = OrganizationProject;

export interface OrganizationProjectDataProvider {
  getOrganizationProjects(
    params: GetOrganizationProjectsParams
  ): Promise<GetOrganizationProjectsResult>;
  addOrganizationProject(
    params: AddOrganizationProjectParams
  ): Promise<AddOrganizationProjectResult>;
  removeOrganizationProject(
    params: RemoveOrganizationProjectParams
  ): Promise<RemoveOrganizationProjectResult>;
}
