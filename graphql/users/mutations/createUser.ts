import { MutationResolvers } from '@/graphql/generated/types';

export const createUser: MutationResolvers['createUser'] = async (_, args, context) => {
  return context.providers.users.createUser(args);
};
