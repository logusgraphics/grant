'use client';

import { Limit } from '@/components/common';
import { useProjectAppsStore } from '@/stores/project-apps.store';

export function ProjectAppLimit() {
  const limit = useProjectAppsStore((state) => state.limit);
  const setLimit = useProjectAppsStore((state) => state.setLimit);

  return (
    <Limit
      limit={limit}
      onLimitChange={setLimit}
      namespace="projectApps"
      translationKey="limit"
      options={[10, 20, 50, 100]}
    />
  );
}
