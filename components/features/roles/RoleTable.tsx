'use client';

import { Role } from '@/graphql/generated/types';
import { EnhancedDataTable, type FieldConfig } from '@/components/common/DataTable';
import { type ColumnConfig } from '@/components/common/TableSkeleton';
import { RoleActions } from './RoleActions';
import { CreateRoleDialog } from './CreateRoleDialog';
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

  const fields: FieldConfig<Role>[] = [
    {
      type: 'id',
      key: 'id',
      header: t('table.id'),
      width: '120px',
    },
    {
      type: 'avatar',
      key: 'name',
      header: t('table.label'),
      width: '300px',
      avatar: {
        getInitial: (role: Role) => role.name.charAt(0).toUpperCase(),
        defaultBackgroundClass: 'bg-primary/10',
        size: 'md',
      },
    },
    {
      type: 'description',
      key: 'description',
      header: t('table.description'),
      width: '250px',
    },
    {
      type: 'list',
      key: 'groups',
      header: t('groups'),
      width: '200px',
      list: {
        items: (role: Role) => role.groups || [],
        labelField: 'name',
        icon: <Group className="h-3 w-3" />,
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
      { key: 'description', type: 'text' },
      { key: 'groups', type: 'list' },
      { key: 'createdAt', type: 'text' },
      { key: 'updatedAt', type: 'text' },
    ],
    rowCount: limit,
  };

  return (
    <EnhancedDataTable
      data={roles}
      fields={fields}
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
