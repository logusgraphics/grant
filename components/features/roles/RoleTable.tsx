'use client';

import { Role } from '@/graphql/generated/types';
import { DataTable, type TableColumn } from '@/components/common/DataTable';
import { type ColumnConfig } from '@/components/common/TableSkeleton';
import { RoleActions } from './RoleActions';
import { CreateRoleDialog } from './CreateRoleDialog';
import { ColoredList } from '@/components/ui/colored-list';
import { Shield, Group } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface RoleTableProps {
  limit: number;
  roles: Role[];
  loading: boolean;
  search: string;
  onEditClick: (role: Role) => void;
  onDeleteClick: (role: Role) => void;
}

export function RoleTable({
  limit,
  roles,
  loading,
  search,
  onEditClick,
  onDeleteClick,
}: RoleTableProps) {
  const t = useTranslations('roles');

  const columns: TableColumn<Role>[] = [
    {
      key: 'name',
      header: t('table.label'),
      render: (role) => <span className="font-medium">{role.name}</span>,
    },
    {
      key: 'description',
      header: t('table.description'),
      render: (role) => role.description || t('noDescription'),
    },
    {
      key: 'groups',
      header: t('groups'),
      render: (role) => (
        <ColoredList
          items={role.groups}
          labelField="name"
          title=""
          icon={<Group className="h-3 w-3" />}
          height={60}
        />
      ),
    },
  ];

  const skeletonConfig: { columns: ColumnConfig[]; rowCount?: number } = {
    columns: [
      { key: 'name', type: 'text' },
      { key: 'description', type: 'text' },
      { key: 'groups', type: 'list' },
    ],
    rowCount: limit,
  };

  return (
    <DataTable
      data={roles}
      columns={columns}
      loading={loading}
      emptyState={{
        icon: <Shield className="h-12 w-12" />,
        title: search ? t('noSearchResults.title') : t('noRoles.title'),
        description: search ? t('noSearchResults.description') : t('noRoles.description'),
        action: search ? undefined : <CreateRoleDialog />,
      }}
      actionsColumn={{
        render: (role) => (
          <RoleActions role={role} onEditClick={onEditClick} onDeleteClick={onDeleteClick} />
        ),
      }}
      skeletonConfig={skeletonConfig}
    />
  );
}
