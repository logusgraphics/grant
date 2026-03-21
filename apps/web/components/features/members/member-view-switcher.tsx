'use client';

import { useTranslations } from 'next-intl';
import { LayoutGrid, Table } from 'lucide-react';

import { type ViewOption, ViewSwitcher } from '@/components/common';
import { useMembersStore } from '@/stores/members.store';

import { MemberView } from './member-types';

export function MemberViewSwitcher() {
  const t = useTranslations('members');

  const view = useMembersStore((state) => state.view);
  const setView = useMembersStore((state) => state.setView);

  const memberViewOptions: ViewOption[] = [
    {
      value: MemberView.CARD,
      icon: LayoutGrid,
      label: t('view.card'),
    },
    {
      value: MemberView.TABLE,
      icon: Table,
      label: t('view.table'),
    },
  ];

  return (
    <ViewSwitcher
      currentView={view}
      onViewChange={(newView) => setView(newView as MemberView)}
      options={memberViewOptions}
    />
  );
}
