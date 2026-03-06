'use client';

import { useTranslations } from 'next-intl';

import { Search } from '@/components/common';
import { useProjectAppsStore } from '@/stores/project-apps.store';

export function ProjectAppSearch() {
  const t = useTranslations('projectApps');

  const search = useProjectAppsStore((state) => state.search);
  const setSearch = useProjectAppsStore((state) => state.setSearch);

  return (
    <Search search={search} onSearchChange={setSearch} placeholder={t('search.placeholder')} />
  );
}
