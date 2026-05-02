'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGrant, type UseGrantResult } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';
import { ProjectPermissionsSyncJob, ProjectPermissionsSyncJobStatus } from '@grantjs/schema';
import { Ban, Download, Eye } from 'lucide-react';

import { type ActionItem, Actions } from '@/components/common';
import { useRequiresEmailVerificationForMutation } from '@/hooks/auth';
import { useScopeFromParams } from '@/hooks/common';
import { useProjectPermissionsSyncJobPayload } from '@/hooks/projects';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

interface PermissionSyncJobActionsProps {
  job: ProjectPermissionsSyncJob;
}

const ACTIVE_STATUSES: ReadonlyArray<ProjectPermissionsSyncJobStatus> = [
  ProjectPermissionsSyncJobStatus.Pending,
  ProjectPermissionsSyncJobStatus.Running,
];

export function PermissionSyncJobActions({ job }: PermissionSyncJobActionsProps) {
  const t = useTranslations('permissionSyncJobs.actions');
  const scope = useScopeFromParams();

  const setJobToView = usePermissionSyncJobsStore((state) => state.setJobToView);
  const setJobToCancel = usePermissionSyncJobsStore((state) => state.setJobToCancel);

  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open && !hasBeenOpened) setHasBeenOpened(true);
    },
    [hasBeenOpened]
  );

  const { isGranted: canUpdate, isLoading: isUpdateLoading } = useGrant(
    ResourceSlug.Project,
    ResourceAction.Update,
    { scope: scope!, enabled: hasBeenOpened, returnLoading: true }
  ) as UseGrantResult;

  const requiresEmailVerification = useRequiresEmailVerificationForMutation(scope);

  const { download, loading: downloading } = useProjectPermissionsSyncJobPayload({
    id: job.projectId,
    scope: scope ?? null,
    jobId: hasBeenOpened ? job.id : null,
  });

  if (!scope) return null;

  const isActive = ACTIVE_STATUSES.includes(job.status);
  const canCancel = isActive && canUpdate && !requiresEmailVerification;

  const actions: ActionItem<ProjectPermissionsSyncJob>[] = [
    {
      key: 'view',
      label: t('view'),
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: () => setJobToView(job),
    },
    {
      key: 'download',
      label: t('downloadPayload'),
      icon: <Download className="mr-2 h-4 w-4" />,
      onClick: () => {
        void download();
      },
    },
  ];

  if (canCancel) {
    actions.push({
      key: 'cancel',
      label: t('cancel'),
      icon: <Ban className="mr-2 h-4 w-4" />,
      onClick: () => setJobToCancel(job),
      variant: 'destructive',
    });
  }

  const isLoading = (hasBeenOpened && isUpdateLoading) || downloading;

  return (
    <Actions entity={job} actions={actions} onOpenChange={handleOpenChange} isLoading={isLoading} />
  );
}
