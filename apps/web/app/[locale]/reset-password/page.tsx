'use client';

import { useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';

import { PasswordStrengthIndicator } from '@/components/common/PasswordStrengthIndicator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuthMutations, usePageTitle } from '@/hooks';
import { Link } from '@/i18n/navigation';
import { passwordPolicySchema } from '@/lib/validation/password-policy';

type ResetPasswordStatus = 'form' | 'submitting' | 'success' | 'error' | 'invalid-token';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const { resetPassword } = useAuthMutations();
  usePageTitle('auth.resetPassword');

  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<ResetPasswordStatus>(token ? 'form' : 'invalid-token');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const formSchema = z
    .object({
      password: passwordPolicySchema,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordMatch'),
      path: ['confirmPassword'],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) {
      setStatus('invalid-token');
      return;
    }

    setStatus('submitting');

    try {
      await resetPassword(token, values.password);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const passwordValue = useWatch({
    control: form.control,
    name: 'password',
    defaultValue: '',
  });

  if (status === 'invalid-token') {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <Alert variant="destructive">
          <AlertTitle>{t('resetPassword.invalidToken.title')}</AlertTitle>
          <AlertDescription>{t('resetPassword.invalidToken.description')}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Link href="/forgot-password">
            <Button>{t('resetPassword.requestNewLink')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <Alert>
          <AlertTitle>{t('resetPassword.success.title')}</AlertTitle>
          <AlertDescription>{t('resetPassword.success.description')}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Link href="/auth/login">
            <Button>{t('resetPassword.continueToLogin')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <Alert variant="destructive">
          <AlertTitle>{t('resetPassword.error.title')}</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Link href="/forgot-password">
            <Button>{t('resetPassword.tryAgain')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">{t('resetPassword.title')}</h2>
        <p className="text-muted-foreground mt-2">{t('resetPassword.description')}</p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.password.label')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('form.password.placeholder')}
                  disabled={status === 'submitting'}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <PasswordStrengthIndicator password={passwordValue} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.confirmPassword.label')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('form.confirmPassword.placeholder')}
                  disabled={status === 'submitting'}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={status === 'submitting'}>
          {status === 'submitting' ? t('resetPassword.submitting') : t('resetPassword.submit')}
        </Button>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('resetPassword.rememberPassword')}{' '}
          <Link href="/auth/login" className="text-primary hover:text-primary/80">
            {t('resetPassword.backToLogin')}
          </Link>
        </p>
      </form>
    </Form>
  );
}
