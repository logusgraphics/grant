import { MutationResolvers } from '@/graphql/generated/types';
export const addProjectGroupResolver: MutationResolvers['addProjectGroup'] = async (
  _parent,
  { input },
  context
) => {
  const projectGroup = await context.providers.projectGroups.addProjectGroup({
    input,
  });
  return projectGroup;
};
