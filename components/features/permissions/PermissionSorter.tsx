import { useTranslations } from 'next-intl';

import { Sorter, type SortInput, type SortOrder } from '@/components/common';
import {
  PermissionSortOrder,
  PermissionSortableField,
  PermissionSortInput,
} from '@/graphql/generated/types';

interface PermissionSorterProps {
  sort?: PermissionSortInput;
  onSortChange: (field: PermissionSortableField, order: PermissionSortOrder) => void;
}

export function PermissionSorter({ sort, onSortChange }: PermissionSorterProps) {
  const t = useTranslations('permissions');

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
    onSortChange(field, gqlOrder);
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
