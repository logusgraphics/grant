import { ArrowRightLeft } from 'lucide-react';
import type { ComponentProps } from 'react';

/** Lucide icon for the Import/Export module (nav, empty states, strategy labels). */
export const ProjectSyncJobsModuleIcon = ArrowRightLeft;

export function ProjectSyncJobsModuleIconElement(props: ComponentProps<typeof ArrowRightLeft>) {
  return <ArrowRightLeft {...props} />;
}
