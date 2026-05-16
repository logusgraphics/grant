'use client';

import {
  ProjectSyncJobActionTrigger,
  type ProjectSyncJobActionTriggerProps,
} from './project-sync-job-action-trigger';

export type ProjectSyncJobStartTriggerProps = Omit<ProjectSyncJobActionTriggerProps, 'variant'>;

export function ProjectSyncJobStartTrigger(props: ProjectSyncJobStartTriggerProps) {
  return <ProjectSyncJobActionTrigger variant="import" {...props} />;
}
