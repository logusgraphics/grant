import { projectTagProjectResolver } from './project';
import { projectTagTagResolver } from './tag';

export const ProjectTag = {
  project: projectTagProjectResolver,
  tag: projectTagTagResolver,
};
