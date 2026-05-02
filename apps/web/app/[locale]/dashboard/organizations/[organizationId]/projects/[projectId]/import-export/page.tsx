'use client';

import { useTranslations } from 'next-intl';

import {
  PermissionSyncJobCancelDialog,
  PermissionSyncJobPagination,
  PermissionSyncJobStartDialog,
  PermissionSyncJobToolbar,
  PermissionSyncJobViewDialog,
  PermissionSyncJobViewer,
} from '@/components/features/permission-sync-jobs';
import { DashboardLayout } from '@/components/layout';
import { ProjectSidebar } from '@/components/navigation';
import { usePageTitle } from '@/hooks';

export default function ProjectPermissionSyncJobsPage() {
  const t = useTranslations('permissionSyncJobs');
  usePageTitle('permissionSyncJobs');

  return (
    <DashboardLayout
      title={t('title')}
      sidebar={<ProjectSidebar />}
      actions={<PermissionSyncJobToolbar />}
      footer={<PermissionSyncJobPagination />}
    >
      <>
        <PermissionSyncJobViewer />
        <PermissionSyncJobStartDialog />
        <PermissionSyncJobViewDialog />
        <PermissionSyncJobCancelDialog />
      </>
    </DashboardLayout>
  );
}
