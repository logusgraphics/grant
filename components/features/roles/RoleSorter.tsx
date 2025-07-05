import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoleSortOrder, RoleSortableField, RoleSortInput } from '@/graphql/generated/types';
import { useTranslations } from 'next-intl';
import { ArrowDown, ArrowUp, ChevronDown } from 'lucide-react';

interface RoleSorterProps {
  sort?: RoleSortInput;
  onSortChange: (field: RoleSortableField, order: RoleSortOrder) => void;
}

export function RoleSorter({ sort, onSortChange }: RoleSorterProps) {
  const t = useTranslations('roles');

  const getSortLabel = (field: RoleSortableField) => {
    switch (field) {
      case RoleSortableField.Name:
        return t('sort.name');
      default:
        return field;
    }
  };

  // If no sort is provided, use name ASC as default
  const currentSort = sort || { field: RoleSortableField.Name, order: RoleSortOrder.Asc };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default" className="w-full sm:w-auto">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {t('sort.label')}:{' '}
              <>
                {getSortLabel(currentSort.field)}
                {currentSort.order === RoleSortOrder.Asc ? (
                  <ArrowUp className="size-4" />
                ) : (
                  <ArrowDown className="size-4" />
                )}
              </>
            </div>
            <ChevronDown className="size-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="px-3 py-1.5 text-sm font-medium">
          {t('sort.label')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.values(RoleSortableField).map((field) => (
          <DropdownMenuItem
            key={field}
            className="flex items-center justify-between px-3 py-1.5 text-sm"
            onClick={() => {
              const newOrder =
                currentSort.field === field && currentSort.order === RoleSortOrder.Asc
                  ? RoleSortOrder.Desc
                  : RoleSortOrder.Asc;
              onSortChange(field, newOrder);
            }}
          >
            <span>{getSortLabel(field)}</span>
            {currentSort.field === field &&
              (currentSort.order === RoleSortOrder.Asc ? (
                <ArrowUp className="size-4" />
              ) : (
                <ArrowDown className="size-4" />
              ))}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
