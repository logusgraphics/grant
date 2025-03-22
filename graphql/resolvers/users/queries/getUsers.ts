import { QueryResolvers } from '@/graphql/generated/types';

export const getUsers: QueryResolvers['users'] = async (_, args, context) => {
  return context.providers.users.getUsers(args);
};
