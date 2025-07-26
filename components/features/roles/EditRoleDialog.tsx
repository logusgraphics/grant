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
import { EditRoleFormValues, editRoleSchema, EditRoleDialogProps } from './types';
import { evictRolesCache } from './cache';
import { UPDATE_ROLE, ADD_ROLE_GROUP, REMOVE_ROLE_GROUP } from './mutations';
import { useGroups } from '@/hooks/useGroups';
import { CheckboxList } from '@/components/ui/checkbox-list';

export function EditRoleDialog({ role, open, onOpenChange, currentPage }: EditRoleDialogProps) {
  const t = useTranslations('roles');
  const { groups, loading: groupsLoading } = useGroups();

  const form = useForm<EditRoleFormValues>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      name: '',
      description: '',
      groupIds: [],
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (role) {
      form.reset({
        name: role.name,
        description: role.description || '',
        groupIds: role.groups.map((group) => group.id),
      });
    }
  }, [role, form]);

  const [updateRole] = useMutation(UPDATE_ROLE, {
    update(cache) {
      evictRolesCache(cache);
    },
    refetchQueries: ['GetRoles'],
  });

  const [addRoleGroup] = useMutation(ADD_ROLE_GROUP, {
    refetchQueries: ['GetRoles'],
  });

  const [removeRoleGroup] = useMutation(REMOVE_ROLE_GROUP, {
    refetchQueries: ['GetRoles'],
  });

  const onSubmit = async (values: EditRoleFormValues) => {
    if (!role) return;

    try {
      // Update role data first
      await updateRole({
        variables: {
          id: role.id,
          input: {
            name: values.name,
            description: values.description,
          },
        },
      });

      // Handle group assignments
      const currentGroupIds = role.groups.map((group) => group.id);
      const newGroupIds = values.groupIds || [];

      // Find groups to add (in newGroupIds but not in currentGroupIds)
      const groupsToAdd = newGroupIds.filter((groupId) => !currentGroupIds.includes(groupId));

      // Find groups to remove (in currentGroupIds but not in newGroupIds)
      const groupsToRemove = currentGroupIds.filter((groupId) => !newGroupIds.includes(groupId));

      // Add new groups
      if (groupsToAdd.length > 0) {
        const addPromises = groupsToAdd.map((groupId) =>
          addRoleGroup({
            variables: {
              input: {
                roleId: role.id,
                groupId,
              },
            },
          }).catch((error) => {
            console.error('Error adding role group:', error);
            // Continue with other group assignments even if one fails
          })
        );
        await Promise.all(addPromises);
      }

      // Remove groups
      if (groupsToRemove.length > 0) {
        const removePromises = groupsToRemove.map((groupId) =>
          removeRoleGroup({
            variables: {
              input: {
                roleId: role.id,
                groupId,
              },
            },
          }).catch((error) => {
            // Handle "RoleGroup not found" error gracefully
            if (error.message?.includes('RoleGroup not found')) {
              console.warn('RoleGroup not found, skipping removal:', { roleId: role.id, groupId });
              return;
            }
            console.error('Error removing role group:', error);
            throw error;
          })
        );
        await Promise.all(removePromises);
      }

      toast.success(t('notifications.updateSuccess'));
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating role:', error);
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.description')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.description')}
                      {...field}
                      className={form.formState.errors.description ? 'border-red-500' : ''}
                    />
                  </FormControl>
                  {form.formState.errors.description && (
                    <FormMessage className="text-red-500 text-sm mt-1">
                      {form.formState.errors.description.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
            <CheckboxList
              control={form.control}
              name="groupIds"
              label={t('form.groups')}
              items={groups.map((group) => ({
                id: group.id,
                name: group.name,
                description: group.description ?? undefined,
              }))}
              loading={groupsLoading}
              loadingText={t('form.groupsLoading')}
              emptyText={t('form.noGroupsAvailable')}
              error={form.formState.errors.groupIds?.message}
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
