'use client';

import { ProjectImportExportPage } from '@/components/features/project-sync-jobs/project-import-export-page';
import { PersonalProjectSidebar } from '@/components/navigation';

export default function PersonalProjectImportExportPage() {
  return <ProjectImportExportPage sidebar={<PersonalProjectSidebar />} />;
}
