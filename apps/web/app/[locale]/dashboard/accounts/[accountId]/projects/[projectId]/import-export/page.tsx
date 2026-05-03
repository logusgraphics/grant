'use client';

import { useTranslations } from 'next-intl';

import {
  PermissionSyncJobCancelDialog,
  PermissionSyncJobExportDialog,
  PermissionSyncJobPagination,
  PermissionSyncJobStartDialog,
  PermissionSyncJobToolbar,
  PermissionSyncJobViewDialog,
  PermissionSyncJobViewer,
} from '@/components/features/permission-sync-jobs';
import { DashboardLayout } from '@/components/layout';
import { PersonalProjectSidebar } from '@/components/navigation';
import { usePageTitle } from '@/hooks';

export default function PersonalProjectPermissionSyncJobsPage() {
  const t = useTranslations('permissionSyncJobs');
  usePageTitle('permissionSyncJobs');

  return (
    <DashboardLayout
      title={t('title')}
      sidebar={<PersonalProjectSidebar />}
      actions={<PermissionSyncJobToolbar />}
      footer={<PermissionSyncJobPagination />}
    >
      <>
        <PermissionSyncJobViewer />
        <PermissionSyncJobStartDialog />
        <PermissionSyncJobExportDialog />
        <PermissionSyncJobViewDialog />
        <PermissionSyncJobCancelDialog />
      </>
    </DashboardLayout>
  );
}
