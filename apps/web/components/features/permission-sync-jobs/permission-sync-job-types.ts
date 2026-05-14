import { ProjectSyncJob, ProjectSyncJobStatus } from '@grantjs/schema';

/** View mode for the sync-jobs viewer (table or cards). */
export enum PermissionSyncJobView {
  CARDS = 'cards',
  TABLE = 'table',
}

/** Status filter value shown in the toolbar. `null` means "all". */
export type PermissionSyncJobStatusFilterValue = ProjectSyncJobStatus | null;

/** Re-export for stable import paths within the feature module. */
export type { ProjectSyncJob };
