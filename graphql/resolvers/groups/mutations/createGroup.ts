import { MutationResolvers } from '@/graphql/generated/types';

export const createGroupResolver: MutationResolvers['createGroup'] = async (
  _parent,
  { input },
  context
) => {
  const createdGroup = await context.controllers.groups.createGroup({ input });
  return createdGroup;
};
