'use client';

import { useTranslations } from 'next-intl';
import { ProjectPermissionsSyncJobSortableField, SortOrder } from '@grantjs/schema';

import { Sorter, type SortInput } from '@/components/common';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

export function PermissionSyncJobSorter() {
  const t = useTranslations('permissionSyncJobs');
  const sort = usePermissionSyncJobsStore((state) => state.sort);
  const setSort = usePermissionSyncJobsStore((state) => state.setSort);

  const fields = [
    {
      value: ProjectPermissionsSyncJobSortableField.EnqueuedAt,
      label: t('sort.enqueuedAt'),
    },
    {
      value: ProjectPermissionsSyncJobSortableField.StartedAt,
      label: t('sort.startedAt'),
    },
    {
      value: ProjectPermissionsSyncJobSortableField.CompletedAt,
      label: t('sort.completedAt'),
    },
    {
      value: ProjectPermissionsSyncJobSortableField.Status,
      label: t('sort.status'),
    },
    {
      value: ProjectPermissionsSyncJobSortableField.ImportId,
      label: t('sort.importId'),
    },
  ];

  const sortInput: SortInput<ProjectPermissionsSyncJobSortableField> = {
    field: sort.field,
    order: sort.order,
  };

  const handleSortChange = (field: ProjectPermissionsSyncJobSortableField, order: SortOrder) => {
    setSort(field, order);
  };

  return (
    <Sorter
      sort={sortInput}
      onSortChange={handleSortChange}
      fields={fields}
      defaultField={ProjectPermissionsSyncJobSortableField.EnqueuedAt}
      translationNamespace="permissionSyncJobs"
      showLabel={false}
    />
  );
}
