import { useTranslations } from 'next-intl';
import { RoleSortableField, RoleSortInput, SortOrder } from '@grantjs/schema';

import { Sorter, type SortInput } from '@/components/common';

interface UserRoleSorterProps {
  sort?: RoleSortInput;
  onSortChange: (field: RoleSortableField, order: SortOrder) => void;
  iconOnly?: boolean;
  labelMinWidthPx?: 1200 | 1600;
}

export function UserRoleSorter({
  sort,
  onSortChange,
  iconOnly,
  labelMinWidthPx,
}: UserRoleSorterProps) {
  const t = useTranslations('user.roles');

  const convertSort = (gqlSort?: RoleSortInput): SortInput<RoleSortableField> | undefined => {
    if (!gqlSort) return undefined;
    return {
      field: gqlSort.field,
      order: gqlSort.order,
    };
  };

  const fields = [
    {
      value: RoleSortableField.Name,
      label: t('sort.name'),
    },
  ];

  return (
    <Sorter
      sort={convertSort(sort)}
      onSortChange={onSortChange}
      fields={fields}
      defaultField={RoleSortableField.Name}
      translationNamespace="user.roles"
      iconOnly={iconOnly}
      labelMinWidthPx={labelMinWidthPx}
    />
  );
}
