import { useTranslations } from 'next-intl';

import { Sorter, type SortInput, type SortOrder } from '@/components/common';
import { UserSortOrder, UserSortableField, UserSortInput } from '@/graphql/generated/types';
import { useUsersStore } from '@/stores/users.store';

export function UserSorter() {
  const t = useTranslations('users');

  // Use selective subscriptions to prevent unnecessary re-renders
  const sort = useUsersStore((state) => state.sort);
  const setSort = useUsersStore((state) => state.setSort);

  // Convert GraphQL types to generic Sorter types
  const convertSort = (gqlSort?: UserSortInput): SortInput<UserSortableField> | undefined => {
    if (!gqlSort) return undefined;
    return {
      field: gqlSort.field,
      order: gqlSort.order === UserSortOrder.Asc ? 'ASC' : 'DESC',
    };
  };

  const handleSortChange = (field: UserSortableField, order: SortOrder) => {
    const gqlOrder = order === 'ASC' ? UserSortOrder.Asc : UserSortOrder.Desc;
    setSort(field, gqlOrder);
  };

  const fields = [
    {
      value: UserSortableField.Name,
      label: t('sort.name'),
    },
    {
      value: UserSortableField.Email,
      label: t('sort.email'),
    },
  ];

  return (
    <Sorter
      sort={convertSort(sort)}
      onSortChange={handleSortChange}
      fields={fields}
      defaultField={UserSortableField.Name}
      translationNamespace="users"
    />
  );
}
