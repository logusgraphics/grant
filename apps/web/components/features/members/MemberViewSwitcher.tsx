'use client';

import { LayoutGrid, Table } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ViewSwitcher, type ViewOption } from '@/components/common';
import { useMembersStore } from '@/stores/members.store';

export enum MemberView {
  CARD = 'card',
  TABLE = 'table',
}

export function MemberViewSwitcher() {
  const t = useTranslations('members');

  // Use selective subscriptions to prevent unnecessary re-renders
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
