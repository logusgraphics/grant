import { Job } from '@/lib/jobs/base/job';
import type { AppContext } from '@/types';

import DataRetentionCleanupJob from './data-retention-cleanup.job';
import DemoDbRefreshJob from './demo-db-refresh.job';
import SystemSigningKeyRotationJob from './system-signing-key-rotation.job';

export type Jobs = ReturnType<typeof createJobs>;

export function createJobs(appContext: AppContext): Job[] {
  return [
    new DataRetentionCleanupJob(appContext),
    new SystemSigningKeyRotationJob(appContext),
    new DemoDbRefreshJob(appContext),
  ];
}
