'use client';

import { LayoutGrid, Table } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ViewSwitcher, type ViewOption } from '@/components/common';
import { useSigningKeysStore, type SigningKeyView } from '@/stores/signing-keys.store';

export function SigningKeyViewSwitcher() {
  const t = useTranslations('signingKeys');

  const view = useSigningKeysStore((state) => state.view);
  const setView = useSigningKeysStore((state) => state.setView);

  const options: ViewOption[] = [
    { value: 'card', icon: LayoutGrid, label: t('view.card') },
    { value: 'table', icon: Table, label: t('view.table') },
  ];

  return (
    <ViewSwitcher
      currentView={view}
      onViewChange={(newView) => setView(newView as SigningKeyView)}
      options={options}
    />
  );
}
