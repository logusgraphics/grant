'use client';

import { UserPlus, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CreateUserDialog } from './CreateUserDialog';
import { UserCardSkeleton } from './UserCardSkeleton';
import { User } from '@/graphql/generated/types';
import { UserActions } from './UserActions';
import { CardGrid } from '@/components/common';

interface UserCardsProps {
  limit: number;
  users: User[];
  loading: boolean;
  search: string;
  onEditClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
}

export function UserCards({
  limit,
  users,
  loading,
  search,
  onEditClick,
  onDeleteClick,
}: UserCardsProps) {
  const t = useTranslations('users');

  return (
    <CardGrid<User>
      entities={users}
      loading={loading}
      translationNamespace="users"
      avatar={{
        getInitial: (user: User) => user.name.charAt(0).toUpperCase(),
        getBackgroundClass: (user: User) => {
          return user.roles.some((role) => role.id === 'admin')
            ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
            : 'bg-gradient-to-br from-blue-500 to-indigo-600';
        },
      }}
      list={{
        items: (user: User) => user.roles || [],
        labelField: 'name',
        title: 'form.roles',
        icon: Shield,
        height: 80,
      }}
      actions={{
        component: (user: User) => (
          <UserActions user={user} onEditClick={onEditClick} onDeleteClick={onDeleteClick} />
        ),
      }}
      emptyState={{
        icon: UserPlus,
        titleKey: search ? 'noSearchResults.title' : 'noUsers.title',
        descriptionKey: search ? 'noSearchResults.description' : 'noUsers.description',
        action: search ? undefined : <CreateUserDialog />,
      }}
      skeleton={{
        component: <UserCardSkeleton />,
        count: limit,
      }}
      getDescription={(user: User) => user.email}
    />
  );
}
