import {
  QueryOrganizationTagsArgs,
  MutationAddOrganizationTagArgs,
  MutationRemoveOrganizationTagArgs,
  OrganizationTag,
} from '@/graphql/generated/types';

export interface IOrganizationTagRepository {
  getOrganizationTags(params: QueryOrganizationTagsArgs): Promise<OrganizationTag[]>;
  addOrganizationTag(params: MutationAddOrganizationTagArgs): Promise<OrganizationTag>;
  softDeleteOrganizationTag(params: MutationRemoveOrganizationTagArgs): Promise<OrganizationTag>;
  hardDeleteOrganizationTag(params: MutationRemoveOrganizationTagArgs): Promise<OrganizationTag>;
}
