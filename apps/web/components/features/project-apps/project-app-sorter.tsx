'use client';

import { SortOrder, ProjectAppSortableField, ProjectAppSortInput } from '@grantjs/schema';
import { useTranslations } from 'next-intl';

import { Sorter, type SortInput } from '@/components/common';
import { useProjectAppsStore } from '@/stores/project-apps.store';

export function ProjectAppSorter() {
  const t = useTranslations('projectApps');

  const sort = useProjectAppsStore((state) => state.sort);
  const setSort = useProjectAppsStore((state) => state.setSort);

  const convertSort = (
    gqlSort?: ProjectAppSortInput
  ): SortInput<ProjectAppSortableField> | undefined => {
    if (!gqlSort) return undefined;
    return {
      field: gqlSort.field,
      order: gqlSort.order,
    };
  };

  const handleSortChange = (field: ProjectAppSortableField, order: SortOrder) => {
    setSort(field, order);
  };

  const fields = [
    { value: ProjectAppSortableField.Name, label: t('sort.name') },
    { value: ProjectAppSortableField.CreatedAt, label: t('sort.createdAt') },
  ];

  return (
    <Sorter
      sort={convertSort(sort)}
      onSortChange={handleSortChange}
      fields={fields}
      defaultField={ProjectAppSortableField.Name}
      translationNamespace="projectApps"
    />
  );
}
