import { ArrowLeftRight } from 'lucide-react';
import type { ComponentProps } from 'react';

/** Lucide icon for the Import/Export module (nav, empty states, strategy labels). */
export const ProjectSyncJobsModuleIcon = ArrowLeftRight;

export function ProjectSyncJobsModuleIconElement(props: ComponentProps<typeof ArrowLeftRight>) {
  return <ArrowLeftRight {...props} />;
}
