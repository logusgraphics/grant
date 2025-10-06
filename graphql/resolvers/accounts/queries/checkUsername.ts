import { QueryResolvers } from '@/graphql/generated/types';

export const checkUsernameResolver: QueryResolvers['checkUsername'] = async (_, args, context) => {
  const { username } = args;

  return context.controllers.accounts.checkUsername(username);
};
