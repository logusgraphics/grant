'use client';

import { Group } from '@/graphql/generated/types';
import { Shield } from 'lucide-react';
import { CreateGroupDialog } from './CreateGroupDialog';
import { GroupActions } from './GroupActions';
import { GroupCardSkeleton } from './GroupCardSkeleton';
import { CardGrid } from '@/components/common';

interface GroupCardsProps {
  limit: number;
  groups: Group[];
  loading: boolean;
  search: string;
  onEditClick: (group: Group) => void;
  onDeleteClick: (group: Group) => void;
}

export function GroupCards({
  limit,
  groups,
  loading,
  search,
  onEditClick,
  onDeleteClick,
}: GroupCardsProps) {
  return (
    <CardGrid<Group>
      entities={groups}
      loading={loading}
      translationNamespace="groups"
      avatar={{
        getInitial: (group: Group) => group.name.charAt(0).toUpperCase(),
        defaultBackgroundClass: 'bg-primary/10',
      }}
      list={{
        items: (group: Group) => group.permissions || [],
        labelField: 'name',
        title: 'permissions',
        icon: Shield,
        height: 80,
      }}
      actions={{
        component: (group: Group) => (
          <GroupActions group={group} onEditClick={onEditClick} onDeleteClick={onDeleteClick} />
        ),
      }}
      emptyState={{
        icon: Shield,
        titleKey: search ? 'noSearchResults.title' : 'noGroups.title',
        descriptionKey: search ? 'noSearchResults.description' : 'noGroups.description',
        action: search ? undefined : <CreateGroupDialog />,
      }}
      skeleton={{
        component: <GroupCardSkeleton />,
        count: limit,
      }}
    />
  );
}
