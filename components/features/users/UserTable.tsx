'use client';

import { User } from '@/graphql/generated/types';
import { EnhancedDataTable, type FieldConfig } from '@/components/common/DataTable';
import { type ColumnConfig } from '@/components/common/TableSkeleton';
import { UserActions } from './UserActions';
import { CreateUserDialog } from './CreateUserDialog';
import { Shield, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UserTableProps {
  limit: number;
  users: User[];
  loading: boolean;
  search: string;
  onEditClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
}

export function UserTable({
  limit,
  users,
  loading,
  search,
  onEditClick,
  onDeleteClick,
}: UserTableProps) {
  const t = useTranslations('users');

  const fields: FieldConfig<User>[] = [
    {
      type: 'id',
      key: 'id',
      header: t('table.id'),
      width: '120px',
    },
    {
      type: 'avatar',
      key: 'name',
      header: t('table.name'),
      width: '300px',
      avatar: {
        getInitial: (user: User) => user.name.charAt(0).toUpperCase(),
        defaultBackgroundClass: 'bg-primary/10',
        size: 'md',
      },
    },
    {
      type: 'email',
      key: 'email',
      header: t('table.email'),
      width: '250px',
    },
    {
      type: 'list',
      key: 'roles',
      header: t('table.roles'),
      width: '200px',
      list: {
        items: (user: User) => user.roles || [],
        labelField: 'name',
        icon: <Shield className="h-3 w-3" />,
        height: 60,
        maxItems: 3,
      },
    },
    {
      type: 'timestamp',
      key: 'createdAt',
      header: t('table.created'),
      width: '150px',
    },
    {
      type: 'timestamp',
      key: 'updatedAt',
      header: t('table.updated'),
      width: '150px',
    },
  ];

  const skeletonConfig: { columns: ColumnConfig[]; rowCount?: number } = {
    columns: [
      { key: 'id', type: 'text' },
      { key: 'name', type: 'avatar' },
      { key: 'email', type: 'text' },
      { key: 'roles', type: 'list' },
      { key: 'createdAt', type: 'text' },
      { key: 'updatedAt', type: 'text' },
    ],
    rowCount: limit,
  };

  return (
    <EnhancedDataTable
      data={users}
      fields={fields}
      loading={loading}
      emptyState={{
        icon: <UserPlus className="h-12 w-12" />,
        title: search ? t('noSearchResults.title') : t('noUsers.title'),
        description: search ? t('noSearchResults.description') : t('noUsers.description'),
        action: search ? undefined : <CreateUserDialog />,
      }}
      actionsColumn={{
        render: (user) => (
          <UserActions user={user} onEditClick={onEditClick} onDeleteClick={onDeleteClick} />
        ),
      }}
      skeletonConfig={skeletonConfig}
    />
  );
}
