'use client';

import { TagSelector } from '@/components/common';
import { useProjectAppsStore } from '@/stores/project-apps.store';

export function ProjectAppTagSelector() {
  const selectedTagIds = useProjectAppsStore((state) => state.selectedTagIds);
  const setSelectedTagIds = useProjectAppsStore((state) => state.setSelectedTagIds);

  return <TagSelector selectedTagIds={selectedTagIds} onTagIdsChange={setSelectedTagIds} />;
}
