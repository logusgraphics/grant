'use client';

import { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface ViewOption {
  value: string;
  icon: LucideIcon;
  label: string;
}

interface ViewSwitcherProps {
  currentView: string;
  onViewChange: (view: string) => void;
  options: ViewOption[];
}

export function ViewSwitcher({ currentView, onViewChange, options }: ViewSwitcherProps) {
  const currentOption = options.find((option) => option.value === currentView) || options[0];
  const CurrentIcon = currentOption.icon;

  const tooltipText = currentOption.label;

  const buttonContent = (
    <Button
      variant="outline"
      size="default"
      className="w-full sm:w-auto max-[1600px]:aspect-square max-[1600px]:p-2"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <CurrentIcon className="size-4" />
          <span className="max-[1600px]:hidden">{currentOption.label}</span>
        </div>
      </div>
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>{buttonContent}</DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">{tooltipText}</TooltipContent>
          <DropdownMenuContent align="end">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem key={option.value} onClick={() => onViewChange(option.value)}>
                  <Icon className="mr-2 size-4" />
                  {option.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  );
}
