'use client';

import { User } from '@/graphql/generated/types';
import { DataTable, type TableColumn } from '@/components/common/DataTable';
import { type ColumnConfig } from '@/components/common/TableSkeleton';
import { UserActions } from './UserActions';
import { CreateUserDialog } from './CreateUserDialog';
import { ColoredList } from '@/components/ui/colored-list';
import { UserPlus, Shield } from 'lucide-react';
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

  const columns: TableColumn<User>[] = [
    {
      key: 'name',
      header: t('table.name'),
      render: (user) => <span className="font-medium">{user.name}</span>,
    },
    {
      key: 'email',
      header: t('table.email'),
      render: (user) => user.email,
    },
    {
      key: 'roles',
      header: t('table.roles'),
      render: (user) => (
        <ColoredList
          items={user.roles}
          labelField="name"
          title=""
          icon={<Shield className="h-3 w-3" />}
          height={60}
        />
      ),
    },
  ];

  const skeletonConfig: { columns: ColumnConfig[]; rowCount?: number } = {
    columns: [
      { key: 'name', type: 'text' },
      { key: 'email', type: 'text' },
      { key: 'roles', type: 'list' },
    ],
    rowCount: limit,
  };

  return (
    <DataTable
      data={users}
      columns={columns}
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
