'use client';

import { useTranslations } from 'next-intl';

import { Search } from '@/components/common';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

export function PermissionSyncJobSearch() {
  const t = useTranslations('permissionSyncJobs');
  const search = usePermissionSyncJobsStore((state) => state.search);
  const setSearch = usePermissionSyncJobsStore((state) => state.setSearch);

  return (
    <Search search={search} onSearchChange={setSearch} placeholder={t('search.placeholder')} />
  );
}
