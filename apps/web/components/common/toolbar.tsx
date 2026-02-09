import { ReactNode } from 'react';

export interface ToolbarProps {
  items: ReactNode[];
}

export function Toolbar({ items }: ToolbarProps) {
  // Filter out falsy items (null, undefined, false) before rendering
  const filteredItems = items.filter(Boolean);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 max-[1600px]:gap-1.5">
      {filteredItems.map((item, index) => (
        <div key={index} className="w-full sm:w-auto">
          {item}
        </div>
      ))}
    </div>
  );
}
