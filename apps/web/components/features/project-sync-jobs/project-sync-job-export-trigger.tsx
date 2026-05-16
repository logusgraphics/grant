'use client';

import {
  ProjectSyncJobActionTrigger,
  type ProjectSyncJobActionTriggerProps,
} from './project-sync-job-action-trigger';

export type ProjectSyncJobExportTriggerProps = Omit<ProjectSyncJobActionTriggerProps, 'variant'>;

export function ProjectSyncJobExportTrigger(props: ProjectSyncJobExportTriggerProps) {
  return <ProjectSyncJobActionTrigger variant="export" {...props} />;
}
