'use client';

import { useCallback, useRef, useEffect, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from 'next-intl';
import { getTagColorClasses } from '@/lib/tag-colors';

interface ColoredItem {
  id: string;
  [key: string]: any; // Allow any additional properties
}

interface ColoredListProps {
  items: ColoredItem[];
  labelField: string; // The field to use as the display label
  title?: string;
  icon?: ReactNode;
  height?: number; // Height in pixels
  colors?: string[];
  className?: string;
  useTagColors?: boolean; // Whether to use the new tag color system
}

export function ColoredList({
  items,
  labelField,
  title,
  icon,
  height = 80,
  colors = [
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  ],
  className,
  useTagColors = false,
}: ColoredListProps) {
  const t = useTranslations('roles');
  const phantomRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  const getItemColor = useCallback(
    (itemLabel: string, allItems: ColoredItem[]) => {
      if (useTagColors && 'color' in items[0]) {
        // Use the color field from the item if available
        const item = items.find((item) => item[labelField] === itemLabel);
        if (item && 'color' in item) {
          return getTagColorClasses(item.color as string);
        }
      }

      const firstWord = itemLabel.split(' ')[0].toLowerCase();

      // Create a unique set of item prefixes
      const uniquePrefixes = [
        ...new Set(allItems.map((item) => item[labelField].split(' ')[0].toLowerCase())),
      ];

      // Map prefix to color by index
      const prefixIndex = uniquePrefixes.indexOf(firstWord);
      const colorIndex = prefixIndex % colors.length;

      return colors[colorIndex];
    },
    [labelField, colors, useTagColors, items]
  );

  const renderItems = useCallback(
    () => (
      <div className="flex flex-wrap gap-2 pr-4">
        {items.map((item) => (
          <span
            key={item.id}
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
              getItemColor(item[labelField], items)
            )}
          >
            {item[labelField]}
          </span>
        ))}
      </div>
    ),
    [items, labelField, getItemColor]
  );

  // Measure the natural height of the content
  useEffect(() => {
    if (phantomRef.current) {
      const naturalHeight = phantomRef.current.clientHeight;
      setNeedsScroll(naturalHeight > height);
    }
  }, [items, height]);

  if (items.length === 0) {
    return (
      <div className={cn('space-y-2', className)}>
        {title && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {title}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 italic">
            {t('emptyElements', { title: title || 'items' })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {title && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {title}
        </div>
      )}

      {/* Phantom element to measure natural height */}
      <div
        ref={phantomRef}
        className="invisible absolute pointer-events-none"
        style={{ visibility: 'hidden', position: 'absolute' }}
      >
        {renderItems()}
      </div>

      {/* Actual content */}
      {needsScroll ? (
        <ScrollArea style={{ height: `${height}px` }}>{renderItems()}</ScrollArea>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.id}
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                getItemColor(item[labelField], items)
              )}
            >
              {item[labelField]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
