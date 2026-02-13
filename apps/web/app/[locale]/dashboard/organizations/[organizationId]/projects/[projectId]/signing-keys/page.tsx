'use client';

import { useTranslations } from 'next-intl';

import { SigningKeyToolbar, SigningKeyViewer } from '@/components/features/signing-keys';
import { DashboardLayout } from '@/components/layout';
import { ProjectSidebar } from '@/components/navigation';
import { usePageTitle } from '@/hooks';

export default function OrganizationProjectSigningKeysPage() {
  const t = useTranslations('signingKeys');
  usePageTitle('signingKeys');

  return (
    <DashboardLayout
      title={t('title')}
      sidebar={<ProjectSidebar />}
      actions={<SigningKeyToolbar />}
    >
      <SigningKeyViewer />
    </DashboardLayout>
  );
}
