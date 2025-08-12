import { MutationResolvers } from '@/graphql/generated/types';
export const createUserResolver: MutationResolvers['createUser'] = async (
  _parent,
  { input },
  context
) => {
  const createdUser = await context.providers.users.createUser({ input });
  return createdUser;
};
