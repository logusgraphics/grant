import { useTranslations } from 'next-intl';

import { Sorter, type SortInput, type SortOrder } from '@/components/common';
import {
  OrganizationSortOrder,
  OrganizationSortableField,
  OrganizationSortInput,
} from '@/graphql/generated/types';
import { useOrganizationsStore } from '@/stores/organizations.store';

export function OrganizationSorter() {
  const t = useTranslations('organizations');

  // Use selective subscriptions to prevent unnecessary re-renders
  const sort = useOrganizationsStore((state) => state.sort);
  const setSort = useOrganizationsStore((state) => state.setSort);

  // Convert GraphQL types to generic Sorter types
  const convertSort = (
    gqlSort?: OrganizationSortInput
  ): SortInput<OrganizationSortableField> | undefined => {
    if (!gqlSort) return undefined;
    return {
      field: gqlSort.field,
      order: gqlSort.order === OrganizationSortOrder.Asc ? 'ASC' : 'DESC',
    };
  };

  const handleSortChange = (field: OrganizationSortableField, order: SortOrder) => {
    const gqlOrder = order === 'ASC' ? OrganizationSortOrder.Asc : OrganizationSortOrder.Desc;
    setSort(field, gqlOrder);
  };

  const fields = [
    {
      value: OrganizationSortableField.Name,
      label: t('sort.name'),
    },
    {
      value: OrganizationSortableField.CreatedAt,
      label: t('sort.createdAt'),
    },
    {
      value: OrganizationSortableField.UpdatedAt,
      label: t('sort.updatedAt'),
    },
  ];

  return (
    <Sorter
      sort={convertSort(sort)}
      onSortChange={handleSortChange}
      fields={fields}
      defaultField={OrganizationSortableField.Name}
      translationNamespace="organizations"
    />
  );
}
