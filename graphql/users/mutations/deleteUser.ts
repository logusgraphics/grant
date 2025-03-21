import { MutationResolvers } from '@/graphql/generated/types';

export const deleteUser: MutationResolvers['deleteUser'] = async (_, args, context) => {
  return context.providers.users.deleteUser(args);
};
