'use client';

import { useTranslations } from 'next-intl';

import {
  ProjectSyncJobCancelDialog,
  ProjectSyncJobExportDialog,
  ProjectSyncJobPagination,
  ProjectSyncJobStartDialog,
  ProjectSyncJobToolbar,
  ProjectSyncJobViewDialog,
  ProjectSyncJobViewer,
} from '@/components/features/project-sync-jobs';
import { DashboardLayout } from '@/components/layout';
import { ProjectSidebar } from '@/components/navigation';
import { usePageTitle } from '@/hooks';

export default function OrganizationProjectImportExportPage() {
  const t = useTranslations('projectSyncJobs');
  usePageTitle('projectSyncJobs');

  return (
    <DashboardLayout
      title={t('title')}
      sidebar={<ProjectSidebar />}
      actions={<ProjectSyncJobToolbar />}
      footer={<ProjectSyncJobPagination />}
    >
      <>
        <ProjectSyncJobViewer />
        <ProjectSyncJobStartDialog />
        <ProjectSyncJobExportDialog />
        <ProjectSyncJobViewDialog />
        <ProjectSyncJobCancelDialog />
      </>
    </DashboardLayout>
  );
}
