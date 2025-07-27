'use client';

import { User } from '@/graphql/generated/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UserActionsProps {
  user: User;
  onEditClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
}

export function UserActions({ user, onEditClick, onDeleteClick }: UserActionsProps) {
  const t = useTranslations('users.actions');
  const a11y = useTranslations('common.accessibility');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">{a11y('openMenu')}</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEditClick(user)}>
          <Edit className="mr-2 h-4 w-4" />
          {t('edit')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDeleteClick(user)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {t('delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
