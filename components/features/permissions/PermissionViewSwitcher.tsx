'use client';

import { LayoutGrid, Table } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ViewSwitcher, type ViewOption } from '@/components/common';

export enum PermissionView {
  CARD = 'card',
  TABLE = 'table',
}

interface PermissionViewSwitcherProps {
  currentView: PermissionView;
  onViewChange: (view: PermissionView) => void;
}

export function PermissionViewSwitcher({ currentView, onViewChange }: PermissionViewSwitcherProps) {
  const t = useTranslations('permissions');

  const permissionViewOptions: ViewOption[] = [
    {
      value: PermissionView.CARD,
      icon: LayoutGrid,
      label: t('view.card'),
    },
    {
      value: PermissionView.TABLE,
      icon: Table,
      label: t('view.table'),
    },
  ];

  return (
    <ViewSwitcher
      currentView={currentView}
      onViewChange={(view) => onViewChange(view as PermissionView)}
      options={permissionViewOptions}
    />
  );
}
