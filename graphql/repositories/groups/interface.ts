import {
  QueryGroupsArgs,
  MutationCreateGroupArgs,
  MutationUpdateGroupArgs,
  MutationDeleteGroupArgs,
  Group,
  GroupPage,
} from '@/graphql/generated/types';

export interface IGroupRepository {
  getGroups(
    params: Omit<QueryGroupsArgs, 'scope'> & { requestedFields?: string[] }
  ): Promise<GroupPage>;
  createGroup(params: MutationCreateGroupArgs): Promise<Group>;
  updateGroup(params: MutationUpdateGroupArgs): Promise<Group>;
  softDeleteGroup(params: MutationDeleteGroupArgs): Promise<Group>;
  hardDeleteGroup(params: MutationDeleteGroupArgs): Promise<Group>;
}
