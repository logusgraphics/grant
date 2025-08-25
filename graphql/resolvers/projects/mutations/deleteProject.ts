import { MutationResolvers } from '@/graphql/generated/types';
export const deleteProjectResolver: MutationResolvers['deleteProject'] = async (
  _parent,
  { id },
  context
) => {
  const deleted = await context.services.projects.deleteProject({ id });
  return deleted;
};
