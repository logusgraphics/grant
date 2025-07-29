import { useTranslations } from 'next-intl';

import { Search } from '@/components/common';

interface PermissionSearchProps {
  search: string;
  onSearchChange: (search: string) => void;
}

export function PermissionSearch({ search, onSearchChange }: PermissionSearchProps) {
  const t = useTranslations('permissions');

  return (
    <Search search={search} onSearchChange={onSearchChange} placeholder={t('search.placeholder')} />
  );
}
