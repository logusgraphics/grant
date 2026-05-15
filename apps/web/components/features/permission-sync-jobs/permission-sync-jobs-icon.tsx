import { ArrowLeftRight } from 'lucide-react';
import type { ComponentProps } from 'react';

/** Lucide icon for the Import/Export module (nav, empty states, strategy labels). */
export const PermissionSyncJobsModuleIcon = ArrowLeftRight;

export function PermissionSyncJobsModuleIconElement(props: ComponentProps<typeof ArrowLeftRight>) {
  return <ArrowLeftRight {...props} />;
}
