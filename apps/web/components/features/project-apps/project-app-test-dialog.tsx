'use client';

import { useEffect, useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FlaskConical } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { CheckboxList } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useScopeFromParams } from '@/hooks/common';
import { useProjectAppFormData } from '@/hooks/project-apps';
import { useProjectAppsStore } from '@/stores/project-apps.store';

const testAppSchema = z.object({
  redirectUri: z.string().min(1, 'errors.validation.required'),
  scopes: z.array(z.string()).optional(),
});

type TestAppFormValues = z.infer<typeof testAppSchema>;

function generateState(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function ProjectAppTestDialog() {
  const t = useTranslations('projectApps.testDialog');
  const locale = useLocale();
  const scope = useScopeFromParams();
  const projectId = useMemo(() => (scope?.id ? scope.id.split(':')[1] : undefined), [scope]);
  const { scopeSlugs, loading: formDataLoading } = useProjectAppFormData(scope, projectId);
  const projectAppToTest = useProjectAppsStore((state) => state.projectAppToTest);
  const setProjectAppToTest = useProjectAppsStore((state) => state.setProjectAppToTest);

  const redirectUris = projectAppToTest?.redirectUris ?? [];
  const hasRedirectUris = redirectUris.length > 0;

  const form = useForm<TestAppFormValues>({
    resolver: zodResolver(testAppSchema),
    defaultValues: {
      redirectUri: '',
      scopes: [],
    },
  });

  const scopeSlugItems = useMemo(
    () =>
      scopeSlugs.map((s) => ({
        id: s.slug,
        name: s.name,
        description: s.description ?? undefined,
      })),
    [scopeSlugs]
  );

  const redirectUriOptions = useMemo(
    () => redirectUris.map((uri) => ({ value: uri, label: uri })),
    [redirectUris]
  );

  const open = !!projectAppToTest;

  useEffect(() => {
    if (projectAppToTest && hasRedirectUris) {
      const first = redirectUris[0];
      form.reset({ redirectUri: first ?? '', scopes: [] });
    }
  }, [projectAppToTest?.id, hasRedirectUris, redirectUris, form]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setProjectAppToTest(null);
      form.reset({ redirectUri: '', scopes: [] });
    }
  };

  const handleSubmit = (values: TestAppFormValues) => {
    if (!projectAppToTest?.clientId) return;
    const state = generateState();
    const scopeParam = values.scopes?.length ? values.scopes.join(' ') : '';
    const params = new URLSearchParams({
      client_id: projectAppToTest.clientId,
      redirect_uri: values.redirectUri,
      state,
    });
    if (scopeParam) params.set('scope', scopeParam);
    const path = `/${locale}/auth/project?${params.toString()}`;
    window.open(path, '_blank', 'noopener,noreferrer');
  };

  if (!projectAppToTest) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        {!hasRedirectUris ? (
          <>
            <p className="text-sm text-muted-foreground">{t('noRedirectUris')}</p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                {t('cancel')}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="redirectUri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('redirectUri')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} required>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('redirectUriPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {redirectUriOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <CheckboxList
                control={form.control}
                name="scopes"
                label={t('scopes')}
                items={scopeSlugItems}
                loading={formDataLoading}
                loadingText={t('scopesLoading')}
                emptyText={t('noScopesAvailable')}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit">
                  <FlaskConical className="mr-2 h-4 w-4" />
                  {t('confirm')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
