'use client';

import { useTranslations } from 'next-intl';
import { DashboardPageTitle } from '@/components/DashboardPageTitle';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AccountPage() {
  const t = useTranslations('account');
  usePageTitle('account');

  return (
    <div className="space-y-8">
      <DashboardPageTitle title={t('title')} />
      <p className="text-muted-foreground">{t('description')}</p>
    </div>
  );
}
