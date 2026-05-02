'use client';

import { Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Drop zone layout aligned with {@link SettingImageUploadDialog} — dashed border,
 * upload icon, primary/idle copy, and outline “browse” control (clicks are handled
 * by the parent `getRootProps()` wrapper, same as profile image upload).
 */
export interface JsonFileDropzoneProps {
  getRootProps: (props?: object) => Record<string, unknown>;
  getInputProps: (props?: object) => Record<string, unknown>;
  isDragActive: boolean;
  activeLabel: string;
  idleLabel: string;
  hint: string;
  browseLabel: string;
  error?: string | null;
  className?: string;
}

export function JsonFileDropzone({
  getRootProps,
  getInputProps,
  isDragActive,
  activeLabel,
  idleLabel,
  hint,
  browseLabel,
  error,
  className,
}: JsonFileDropzoneProps) {
  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        'hover:border-primary hover:bg-primary/5',
        className
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-sm font-medium mb-2">{isDragActive ? activeLabel : idleLabel}</p>
      <p className="text-xs text-muted-foreground mb-4">{hint}</p>
      <Button type="button" variant="outline" size="sm">
        {browseLabel}
      </Button>
      {error && <p className="text-sm text-destructive mt-4">{error}</p>}
    </div>
  );
}
