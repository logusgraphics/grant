import { CdmModeStrategy, ProjectSyncJob, ProjectSyncJobOperation } from '@grantjs/schema';

import { getInitials } from '@/lib/utils';

export type ProjectSyncJobOperationLabelKey = 'operation.import' | 'operation.export';

export function getJobAvatarInitial(job: Pick<ProjectSyncJob, 'jobName'>): string {
  return getInitials(job.jobName, 2, '?');
}

export function getOperationLabelKey(
  operation: ProjectSyncJobOperation
): ProjectSyncJobOperationLabelKey {
  if (operation === ProjectSyncJobOperation.Import) {
    return 'operation.import';
  }
  return 'operation.export';
}

export function formatModeStrategy(job: ProjectSyncJob, tStart: (key: string) => string): string {
  if (!job.modeStrategy) {
    return '—';
  }
  return job.modeStrategy === CdmModeStrategy.Merge
    ? tStart('summary.strategy.merge')
    : tStart('summary.strategy.replace');
}
