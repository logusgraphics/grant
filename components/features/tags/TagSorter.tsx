'use client';

import { useTranslations } from 'next-intl';

import { Sorter, type SortInput, type SortOrder } from '@/components/common';
import { TagSortField, SortDirection } from '@/graphql/generated/types';
import { useTagsStore } from '@/stores/tags.store';

export function TagSorter() {
  const t = useTranslations('tags');

  // Use selective subscriptions to prevent unnecessary re-renders
  const sort = useTagsStore((state) => state.sort);
  const setSort = useTagsStore((state) => state.setSort);

  // Convert GraphQL types to generic Sorter types
  const convertSort = (gqlSort?: {
    field: TagSortField;
    direction: SortDirection;
  }): SortInput<TagSortField> | undefined => {
    if (!gqlSort) return undefined;
    return {
      field: gqlSort.field,
      order: gqlSort.direction === SortDirection.Asc ? 'ASC' : 'DESC',
    };
  };

  const handleSortChange = (field: TagSortField, order: SortOrder) => {
    const gqlOrder = order === 'ASC' ? SortDirection.Asc : SortDirection.Desc;
    setSort(field, gqlOrder);
  };

  const fields = [
    {
      value: TagSortField.Name,
      label: t('sort.name'),
    },
    {
      value: TagSortField.Color,
      label: t('sort.color'),
    },
    {
      value: TagSortField.CreatedAt,
      label: t('sort.createdAt'),
    },
    {
      value: TagSortField.UpdatedAt,
      label: t('sort.updatedAt'),
    },
  ];

  return (
    <Sorter
      sort={convertSort(sort)}
      onSortChange={handleSortChange}
      fields={fields}
      defaultField={TagSortField.Name}
      translationNamespace="tags"
    />
  );
}
