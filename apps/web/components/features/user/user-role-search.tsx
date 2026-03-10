import { useTranslations } from 'next-intl';

import { Search } from '@/components/common';

interface UserRoleSearchProps {
  search: string;
  onSearchChange: (search: string) => void;
  show?: boolean;
  /** When true, render as icon+popover only (no full-width bar). */
  forceCompact?: boolean;
}

export function UserRoleSearch({
  search,
  onSearchChange,
  show = true,
  forceCompact = false,
}: UserRoleSearchProps) {
  const t = useTranslations('user.roles');

  if (!show) {
    return null;
  }

  return (
    <Search
      search={search}
      onSearchChange={onSearchChange}
      placeholder={t('search.placeholder')}
      forceCompact={forceCompact}
    />
  );
}
