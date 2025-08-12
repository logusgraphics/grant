import { projectUserProjectResolver } from './project';
import { projectUserUserResolver } from './user';
export const ProjectUser = {
  project: projectUserProjectResolver,
  user: projectUserUserResolver,
};
