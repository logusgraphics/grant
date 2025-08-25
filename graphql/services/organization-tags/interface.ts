import {
  QueryOrganizationTagsArgs,
  MutationAddOrganizationTagArgs,
  MutationRemoveOrganizationTagArgs,
  OrganizationTag,
} from '@/graphql/generated/types';

export interface IOrganizationTagService {
  getOrganizationTags(params: QueryOrganizationTagsArgs): Promise<OrganizationTag[]>;
  addOrganizationTag(params: MutationAddOrganizationTagArgs): Promise<OrganizationTag>;
  removeOrganizationTag(params: MutationRemoveOrganizationTagArgs): Promise<OrganizationTag>;
}
