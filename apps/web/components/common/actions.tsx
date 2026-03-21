'use client';

import { type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { MoreVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';

import { BaseEntity } from './common-types';

export interface ActionItem<TEntity extends BaseEntity> {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: (entity: TEntity) => void;
  variant?: 'default' | 'destructive';
  className?: string;
}

export interface ActionsProps<TEntity extends BaseEntity> {
  entity: TEntity;
  actions: ActionItem<TEntity>[];
  triggerClassName?: string;
  contentClassName?: string;
  align?: 'start' | 'center' | 'end';
  onOpenChange?: (open: boolean) => void;
  isLoading?: boolean;
}

export function Actions<TEntity extends BaseEntity>({
  entity,
  actions,
  triggerClassName,
  contentClassName,
  align = 'end',
  onOpenChange,
  isLoading,
}: ActionsProps<TEntity>) {
  const a11y = useTranslations('common.accessibility');

  const TriggerIcon = isLoading ? Spinner : MoreVertical;

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild disabled={isLoading}>
        <Button variant="ghost" className={`h-8 w-8 p-0 ${triggerClassName || ''}`}>
          <span className="sr-only">{a11y('openMenu')}</span>
          <TriggerIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={contentClassName}>
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.key}
            onClick={() => action.onClick(entity)}
            className={action.className}
            variant={action.variant}
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
