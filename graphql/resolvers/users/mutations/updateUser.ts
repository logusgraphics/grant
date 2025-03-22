import { MutationResolvers } from '@/graphql/generated/types';

export const updateUser: MutationResolvers['updateUser'] = async (_, args, context) => {
  return context.providers.users.updateUser(args);
};
