import { ReactNode } from 'react';

export interface ToolbarProps {
  items: ReactNode[];
  /** When true, keep toolbar items in a single horizontal row at all breakpoints (no vertical stack on mobile). */
  alwaysRow?: boolean;
}

export function Toolbar({ items, alwaysRow = false }: ToolbarProps) {
  // Filter out falsy items (null, undefined, false) before rendering
  const filteredItems = items.filter(Boolean);

  return (
    <div
      className={
        alwaysRow
          ? 'flex flex-row items-center gap-2 flex-wrap'
          : 'flex flex-col sm:flex-row sm:items-center gap-2'
      }
    >
      {filteredItems.map((item, index) => (
        <div
          key={index}
          className={
            alwaysRow
              ? 'flex items-center flex-shrink-0'
              : 'flex min-h-10 items-center sm:min-h-0 w-full sm:w-auto flex-shrink-0'
          }
        >
          {item}
        </div>
      ))}
    </div>
  );
}
