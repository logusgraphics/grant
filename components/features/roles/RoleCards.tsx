'use client';

import { Shield, Group } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CreateRoleDialog } from './CreateRoleDialog';
import { RoleCardSkeleton } from './RoleCardSkeleton';
import { Role } from '@/graphql/generated/types';
import { RoleActions } from './RoleActions';
import { CardGrid } from '@/components/common';

interface RoleCardsProps {
  limit: number;
  roles: Role[];
  loading: boolean;
  search: string;
  onEditClick: (role: Role) => void;
  onDeleteClick: (role: Role) => void;
}

export function RoleCards({
  limit,
  roles,
  loading,
  search,
  onEditClick,
  onDeleteClick,
}: RoleCardsProps) {
  const t = useTranslations('roles');

  return (
    <CardGrid<Role>
      entities={roles}
      loading={loading}
      translationNamespace="roles"
      avatar={{
        getInitial: (role: Role) => role.name.charAt(0).toUpperCase(),
        defaultBackgroundClass: 'bg-primary/10',
      }}
      list={{
        items: (role: Role) => role.groups || [],
        labelField: 'name',
        title: 'groups',
        icon: Group,
        height: 80,
      }}
      actions={{
        component: (role: Role) => (
          <RoleActions role={role} onEditClick={onEditClick} onDeleteClick={onDeleteClick} />
        ),
      }}
      emptyState={{
        icon: Shield,
        titleKey: search ? 'noSearchResults.title' : 'noRoles.title',
        descriptionKey: search ? 'noSearchResults.description' : 'noRoles.description',
        action: search ? undefined : <CreateRoleDialog />,
      }}
      skeleton={{
        component: <RoleCardSkeleton />,
        count: limit,
      }}
      getDescription={(role: Role) => role.description || t('noDescription')}
    />
  );
}
