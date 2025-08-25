import {
  QueryGroupsArgs,
  MutationCreateGroupArgs,
  MutationUpdateGroupArgs,
  MutationDeleteGroupArgs,
  Group,
  GroupPage,
} from '@/graphql/generated/types';

export interface IGroupService {
  getGroups(
    params: Omit<QueryGroupsArgs, 'scope'> & { requestedFields?: string[] }
  ): Promise<GroupPage>;
  createGroup(params: MutationCreateGroupArgs): Promise<Group>;
  updateGroup(params: MutationUpdateGroupArgs): Promise<Group>;
  deleteGroup(params: MutationDeleteGroupArgs & { hardDelete?: boolean }): Promise<Group>;
}
