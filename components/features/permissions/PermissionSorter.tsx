'use client';

import { useTranslations } from 'next-intl';

import { Sorter, type SortInput, type SortOrder } from '@/components/common';
import {
  PermissionSortOrder,
  PermissionSortableField,
  PermissionSortInput,
} from '@/graphql/generated/types';
import { usePermissionsStore } from '@/stores/permissions.store';

export function PermissionSorter() {
  const t = useTranslations('permissions');

  // Use selective subscriptions to prevent unnecessary re-renders
  const sort = usePermissionsStore((state) => state.sort);
  const setSort = usePermissionsStore((state) => state.setSort);

  // Convert GraphQL types to generic Sorter types
  const convertSort = (
    gqlSort?: PermissionSortInput
  ): SortInput<PermissionSortableField> | undefined => {
    if (!gqlSort) return undefined;
    return {
      field: gqlSort.field,
      order: gqlSort.order === PermissionSortOrder.Asc ? 'ASC' : 'DESC',
    };
  };

  const handleSortChange = (field: PermissionSortableField, order: SortOrder) => {
    const gqlOrder = order === 'ASC' ? PermissionSortOrder.Asc : PermissionSortOrder.Desc;
    setSort(field, gqlOrder);
  };

  const fields = [
    {
      value: PermissionSortableField.Name,
      label: t('sort.name'),
    },
    {
      value: PermissionSortableField.Action,
      label: t('sort.action'),
    },
  ];

  return (
    <Sorter
      sort={convertSort(sort)}
      onSortChange={handleSortChange}
      fields={fields}
      defaultField={PermissionSortableField.Name}
      translationNamespace="permissions"
    />
  );
}
