'use client';

import { useTranslations } from 'next-intl';

import { SigningKeyToolbar, SigningKeyViewer } from '@/components/features/signing-keys';
import { DashboardLayout } from '@/components/layout';
import { PersonalProjectSidebar } from '@/components/navigation';
import { usePageTitle } from '@/hooks';

export default function PersonalProjectSigningKeysPage() {
  const t = useTranslations('signingKeys');
  usePageTitle('signingKeys');

  return (
    <DashboardLayout
      title={t('title')}
      sidebar={<PersonalProjectSidebar />}
      actions={<SigningKeyToolbar />}
    >
      <SigningKeyViewer />
    </DashboardLayout>
  );
}
