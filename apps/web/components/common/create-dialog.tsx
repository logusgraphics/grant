'use client';

import { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FormDialog, FormDialogProps } from '@/components/common/form-dialog';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface CreateDialogProps<TFormValues extends Record<string, any>> extends Omit<
  FormDialogProps<TFormValues>,
  'trigger' | 'onSubmit'
> {
  triggerText: string;
  icon: LucideIcon;
  onCreate: (values: TFormValues) => Promise<void>;
  /** When true, no trigger is rendered; dialog is opened only via open/onOpenChange (e.g. from a switcher). */
  hideTrigger?: boolean;
  /** When true, trigger button always shows the label (e.g. for empty-state actions). When false, label follows default breakpoint. */
  triggerAlwaysShowLabel?: boolean;
}

export function CreateDialog<TFormValues extends Record<string, any>>({
  open,
  onOpenChange,
  title,
  description,
  triggerText,
  confirmText,
  cancelText = 'cancel',
  icon: Icon,
  schema,
  defaultValues,
  fields,
  relationships,
  onCreate,
  translationNamespace,
  submittingText,
  hideTrigger = false,
  triggerAlwaysShowLabel = false,
}: CreateDialogProps<TFormValues>) {
  const t = useTranslations(translationNamespace);

  const trigger = hideTrigger ? null : (
    <Tooltip>
      <TooltipTrigger asChild>
        <DialogTrigger asChild>
          <Button
            className={cn(
              'w-full sm:w-auto',
              !triggerAlwaysShowLabel && [
                'min-[640px]:max-[1199px]:size-9 min-[640px]:max-[1199px]:min-w-9 min-[640px]:max-[1199px]:max-w-9 min-[640px]:max-[1199px]:p-2',
                'min-[1200px]:size-auto min-[1200px]:min-w-0 min-[1200px]:max-w-none',
              ]
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span
              className={
                triggerAlwaysShowLabel
                  ? 'inline'
                  : 'inline min-[640px]:max-[1199px]:hidden min-[1200px]:inline'
              }
            >
              {t(triggerText)}
            </span>
          </Button>
        </DialogTrigger>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{t(triggerText)}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText={cancelText}
      submittingText={submittingText || 'actions.creating'}
      schema={schema}
      defaultValues={defaultValues}
      fields={fields}
      relationships={relationships}
      translationNamespace={translationNamespace}
      onSubmit={onCreate}
      trigger={trigger}
    />
  );
}
