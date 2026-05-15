'use client';

import { useTranslations } from 'next-intl';
import { ProjectSyncJobSortableField, SortOrder } from '@grantjs/schema';

import { Sorter, type SortInput } from '@/components/common';
import { useProjectSyncJobsStore } from '@/stores/project-sync-jobs.store';

export function ProjectSyncJobSorter() {
  const t = useTranslations('projectSyncJobs');
  const sort = useProjectSyncJobsStore((state) => state.sort);
  const setSort = useProjectSyncJobsStore((state) => state.setSort);

  const fields = [
    {
      value: ProjectSyncJobSortableField.EnqueuedAt,
      label: t('sort.enqueuedAt'),
    },
    {
      value: ProjectSyncJobSortableField.StartedAt,
      label: t('sort.startedAt'),
    },
    {
      value: ProjectSyncJobSortableField.CompletedAt,
      label: t('sort.completedAt'),
    },
    {
      value: ProjectSyncJobSortableField.Status,
      label: t('sort.status'),
    },
    {
      value: ProjectSyncJobSortableField.JobName,
      label: t('sort.jobName'),
    },
  ];

  const sortInput: SortInput<ProjectSyncJobSortableField> = {
    field: sort.field,
    order: sort.order,
  };

  const handleSortChange = (field: ProjectSyncJobSortableField, order: SortOrder) => {
    setSort(field, order);
  };

  return (
    <Sorter
      sort={sortInput}
      onSortChange={handleSortChange}
      fields={fields}
      defaultField={ProjectSyncJobSortableField.EnqueuedAt}
      translationNamespace="projectSyncJobs"
      showLabel={false}
    />
  );
}
