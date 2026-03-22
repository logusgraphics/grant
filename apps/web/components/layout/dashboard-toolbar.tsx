'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { Breadcrumb } from '@/components/common';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface DashboardToolbarProps {
  actions?: ReactNode;
}

export function DashboardToolbar({ actions }: DashboardToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4 transition-all duration-200 ease-in-out',
        isExpanded ? 'gap-4' : 'gap-0'
      )}
    >
      <div className="flex items-center justify-between sm:justify-start gap-4 min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <SidebarTrigger className="flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <Breadcrumb />
          </div>
        </div>
        {actions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="sm:hidden"
          >
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        )}
      </div>
      {actions && (
        <div className="flex items-center w-full sm:w-auto flex-shrink-0">
          <div
            className={cn(
              'flex flex-col sm:flex-row sm:items-center overflow-hidden transition-all duration-200 ease-in-out w-full',
              'sm:max-h-none sm:gap-2 max-[1600px]:sm:gap-1.5',
              isExpanded ? 'max-h-[500px] gap-4' : 'max-h-0 sm:max-h-none'
            )}
          >
            {actions}
          </div>
        </div>
      )}
    </div>
  );
}
