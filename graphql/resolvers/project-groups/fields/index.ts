import { projectGroupGroupResolver } from './group';
import { projectGroupProjectResolver } from './project';
export const ProjectGroup = {
  project: projectGroupProjectResolver,
  group: projectGroupGroupResolver,
};
