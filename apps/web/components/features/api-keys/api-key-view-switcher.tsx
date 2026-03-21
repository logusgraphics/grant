'use client';

import { useTranslations } from 'next-intl';
import { LayoutGrid, Table } from 'lucide-react';

import { type ViewOption, ViewSwitcher } from '@/components/common';
import { type ApiKeyView, useApiKeysStore } from '@/stores/api-keys.store';

export function ApiKeyViewSwitcher() {
  const t = useTranslations('user.apiKeys');

  const view = useApiKeysStore((state) => state.view);
  const setView = useApiKeysStore((state) => state.setView);

  const options: ViewOption[] = [
    { value: 'card', icon: LayoutGrid, label: t('view.card') },
    { value: 'table', icon: Table, label: t('view.table') },
  ];

  return (
    <ViewSwitcher
      currentView={view}
      onViewChange={(newView) => setView(newView as ApiKeyView)}
      options={options}
    />
  );
}
