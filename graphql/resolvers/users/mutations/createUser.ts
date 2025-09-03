import { MutationResolvers } from '@/graphql/generated/types';
export const createUserResolver: MutationResolvers['createUser'] = async (
  _parent,
  { input },
  context
) => {
  const createdUser = await context.controllers.users.createUser({ input });
  return createdUser;
};
