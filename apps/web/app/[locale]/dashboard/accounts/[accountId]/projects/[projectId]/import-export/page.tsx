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
import { PersonalProjectSidebar } from '@/components/navigation';
import { usePageTitle } from '@/hooks';

export default function PersonalProjectImportExportPage() {
  const t = useTranslations('projectSyncJobs');
  usePageTitle('projectSyncJobs');

  return (
    <DashboardLayout
      title={t('title')}
      sidebar={<PersonalProjectSidebar />}
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
