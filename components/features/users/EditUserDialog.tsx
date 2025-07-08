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
import { useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { EditUserFormValues, editUserSchema, EditUserDialogProps } from './types';
import { evictUsersCache } from './cache';
import { UPDATE_USER, ADD_USER_ROLE, REMOVE_USER_ROLE } from './mutations';
import { useRoles } from '@/hooks/useRoles';

export function EditUserDialog({ user, open, onOpenChange, currentPage }: EditUserDialogProps) {
  const t = useTranslations('users');
  const { roles, loading: rolesLoading } = useRoles();

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
      roleIds: [],
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        roleIds: user.roles.map((role) => role.id),
      });
    }
  }, [user, form]);

  const [updateUser] = useMutation(UPDATE_USER, {
    update(cache) {
      // Evict all users-related queries from cache
      evictUsersCache(cache);

      // Also evict any specific user queries
      cache.evict({ id: `User:${user?.id}` });
      cache.gc();
    },
  });

  const [addUserRole] = useMutation(ADD_USER_ROLE, {
    update(cache) {
      evictUsersCache(cache);
    },
  });

  const [removeUserRole] = useMutation(REMOVE_USER_ROLE, {
    update(cache) {
      evictUsersCache(cache);
    },
  });

  const onSubmit = async (values: EditUserFormValues) => {
    if (!user) return;

    try {
      // Update user data first
      await updateUser({
        variables: {
          id: user.id,
          input: {
            name: values.name,
            email: values.email,
          },
        },
      });

      // Handle role assignments
      const currentRoleIds = user.roles.map((role) => role.id);
      const newRoleIds = values.roleIds || [];

      // Find roles to add (in newRoleIds but not in currentRoleIds)
      const rolesToAdd = newRoleIds.filter((roleId) => !currentRoleIds.includes(roleId));

      // Find roles to remove (in currentRoleIds but not in newRoleIds)
      const rolesToRemove = currentRoleIds.filter((roleId) => !newRoleIds.includes(roleId));

      // Add new roles
      if (rolesToAdd.length > 0) {
        const addPromises = rolesToAdd.map((roleId) =>
          addUserRole({
            variables: {
              input: {
                userId: user.id,
                roleId,
              },
            },
          })
        );
        await Promise.all(addPromises);
      }

      // Remove roles
      if (rolesToRemove.length > 0) {
        const removePromises = rolesToRemove.map((roleId) =>
          removeUserRole({
            variables: {
              input: {
                userId: user.id,
                roleId,
              },
            },
          })
        );
        await Promise.all(removePromises);
      }

      toast.success(t('notifications.updateSuccess'));
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(t('notifications.updateError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('editDialog.title')}</DialogTitle>
          <DialogDescription>{t('editDialog.description')}</DialogDescription>
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
            <FormField
              control={form.control}
              name="roleIds"
              render={() => (
                <FormItem>
                  <FormLabel>{t('form.roles')}</FormLabel>
                  <div className="space-y-2">
                    {rolesLoading ? (
                      <div className="text-sm text-muted-foreground">{t('form.rolesLoading')}</div>
                    ) : roles.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        {t('form.noRolesAvailable')}
                      </div>
                    ) : (
                      roles.map((role) => (
                        <FormField
                          key={role.id}
                          control={form.control}
                          name="roleIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={role.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(role.id)}
                                    onCheckedChange={(checked: boolean) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), role.id])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== role.id)
                                          );
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>{role.name}</FormLabel>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))
                    )}
                  </div>
                  {form.formState.errors.roleIds && (
                    <FormMessage className="text-red-500 text-sm mt-1">
                      {t('form.validation.rolesRequired')}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{t('editDialog.confirm')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
