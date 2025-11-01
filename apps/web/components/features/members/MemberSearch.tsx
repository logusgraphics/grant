import { useTranslations } from 'next-intl';

import { Search } from '@/components/common';
import { useMembersStore } from '@/stores/members.store';

export function MemberSearch() {
  const t = useTranslations('members');

  // Use selective subscription to prevent unnecessary re-renders
  const search = useMembersStore((state) => state.search);
  const setSearch = useMembersStore((state) => state.setSearch);

  return (
    <Search search={search} onSearchChange={setSearch} placeholder={t('search.placeholder')} />
  );
}
