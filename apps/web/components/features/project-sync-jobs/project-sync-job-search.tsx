'use client';

import { useTranslations } from 'next-intl';

import { Search } from '@/components/common';
import { useProjectSyncJobsStore } from '@/stores/project-sync-jobs.store';

export function ProjectSyncJobSearch() {
  const t = useTranslations('projectSyncJobs');
  const search = useProjectSyncJobsStore((state) => state.search);
  const setSearch = useProjectSyncJobsStore((state) => state.setSearch);

  return (
    <Search search={search} onSearchChange={setSearch} placeholder={t('search.placeholder')} />
  );
}
