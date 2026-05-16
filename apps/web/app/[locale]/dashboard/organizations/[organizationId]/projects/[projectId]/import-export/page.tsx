'use client';

import { ProjectImportExportPage } from '@/components/features/project-sync-jobs/project-import-export-page';
import { ProjectSidebar } from '@/components/navigation';

export default function OrganizationProjectImportExportPage() {
  return <ProjectImportExportPage sidebar={<ProjectSidebar />} />;
}
