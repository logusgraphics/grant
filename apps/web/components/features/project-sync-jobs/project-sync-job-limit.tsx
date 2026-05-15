'use client';

import { Limit } from '@/components/common';
import { useProjectSyncJobsStore } from '@/stores/project-sync-jobs.store';

export function ProjectSyncJobLimit() {
  const limit = useProjectSyncJobsStore((state) => state.limit);
  const setLimit = useProjectSyncJobsStore((state) => state.setLimit);

  return (
    <Limit
      limit={limit}
      onLimitChange={setLimit}
      namespace="projectSyncJobs"
      translationKey="limit.label"
    />
  );
}
