import { MutationResolvers } from '@/graphql/generated/types';
export const addProjectGroupResolver: MutationResolvers['addProjectGroup'] = async (
  _parent,
  { input },
  context
) => {
  const projectGroup = await context.services.projectGroups.addProjectGroup({
    input,
  });
  return projectGroup;
};
