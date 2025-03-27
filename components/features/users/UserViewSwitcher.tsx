'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutGrid, Table } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type UserView = 'card' | 'table';

interface UserViewSwitcherProps {
  currentView: UserView;
  onViewChange: (view: UserView) => void;
}

export function UserViewSwitcher({ currentView, onViewChange }: UserViewSwitcherProps) {
  const t = useTranslations('users');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default" className="w-full sm:w-auto">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {currentView === 'card' ? (
                <>
                  <LayoutGrid className="size-4" />
                  {t('view.card')}
                </>
              ) : (
                <>
                  <Table className="size-4" />
                  {t('view.table')}
                </>
              )}
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewChange('card')}>
          <LayoutGrid className="mr-2 size-4" />
          {t('view.card')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewChange('table')}>
          <Table className="mr-2 size-4" />
          {t('view.table')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
