'use client';

import { useTranslations } from 'next-intl';

import { DashboardPageLayout } from '@/components/common/dashboard/DashboardPageLayout';
import { DeleteOrganizationDialog } from '@/components/features/organizations/DeleteOrganizationDialog';
import { EditOrganizationDialog } from '@/components/features/organizations/EditOrganizationDialog';
import { OrganizationPagination } from '@/components/features/organizations/OrganizationPagination';
import { OrganizationToolbar } from '@/components/features/organizations/OrganizationToolbar';
import { OrganizationViewer } from '@/components/features/organizations/OrganizationViewer';
import { usePageTitle } from '@/hooks';

export default function DashboardPage() {
  const t = useTranslations('organizations');
  usePageTitle('organizations');

  return (
    <DashboardPageLayout
      title={t('title')}
      actions={<OrganizationToolbar />}
      footer={<OrganizationPagination />}
    >
      <>
        <OrganizationViewer />
        <DeleteOrganizationDialog />
        <EditOrganizationDialog />
      </>
    </DashboardPageLayout>
  );
}
