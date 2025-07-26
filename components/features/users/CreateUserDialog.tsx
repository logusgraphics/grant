'use client';

import { useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CreateUserFormValues, createUserSchema, CreateUserDialogProps } from './types';
import { evictUsersCache } from './cache';
import { CREATE_USER, ADD_USER_ROLE } from './mutations';
import { useRoles } from '@/hooks/useRoles';
import { CheckboxList } from '@/components/ui/checkbox-list';

export function CreateUserDialog({ open, onOpenChange, currentPage }: CreateUserDialogProps) {
  const t = useTranslations('users');
  const { roles, loading: rolesLoading } = useRoles();

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      roleIds: [],
    },
    mode: 'onSubmit',
  });

  const [createUser] = useMutation(CREATE_USER, {
    update(cache) {
      evictUsersCache(cache);
    },
  });

  const [addUserRole] = useMutation(ADD_USER_ROLE, {
    update(cache) {
      evictUsersCache(cache);
    },
  });

  const onSubmit = async (values: CreateUserFormValues) => {
    try {
      // Create user first
      const result = await createUser({
        variables: {
          input: {
            name: values.name,
            email: values.email,
          },
        },
        refetchQueries: ['GetUsers'],
      });

      const userId = result.data?.createUser?.id;

      // Add roles if user was created and roles are selected
      if (userId && values.roleIds && values.roleIds.length > 0) {
        const addPromises = values.roleIds.map((roleId) =>
          addUserRole({
            variables: {
              input: {
                userId,
                roleId,
              },
            },
          }).catch((error) => {
            console.error('Error adding user role:', error);
            // Continue with other role assignments even if one fails
          })
        );
        await Promise.all(addPromises);
      }

      toast.success(t('notifications.createSuccess'));
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(t('notifications.createError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('createDialog.title')}</DialogTitle>
          <DialogDescription>{t('createDialog.description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.name')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.name')}
                      {...field}
                      className={form.formState.errors.name ? 'border-red-500' : ''}
                    />
                  </FormControl>
                  {form.formState.errors.name && (
                    <FormMessage className="text-red-500 text-sm mt-1">
                      {form.formState.errors.name.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('form.email')}
                      {...field}
                      className={form.formState.errors.email ? 'border-red-500' : ''}
                    />
                  </FormControl>
                  {form.formState.errors.email && (
                    <FormMessage className="text-red-500 text-sm mt-1">
                      {form.formState.errors.email.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
            <CheckboxList
              control={form.control}
              name="roleIds"
              label={t('form.roles')}
              items={roles.map((role) => ({
                id: role.id,
                name: role.name,
                description: role.description,
              }))}
              loading={rolesLoading}
              loadingText={t('form.rolesLoading')}
              emptyText={t('form.noRolesAvailable')}
              error={form.formState.errors.roleIds?.message}
            />
            <DialogFooter>
              <Button type="submit">{t('createDialog.confirm')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
