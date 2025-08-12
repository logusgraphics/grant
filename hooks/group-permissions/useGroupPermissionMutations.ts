import { ApolloCache, useMutation } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  AddGroupPermissionInput,
  GroupPermission,
  RemoveGroupPermissionInput,
} from '@/graphql/generated/types';

import { evictGroupPermissionsCache } from './cache';
import { ADD_GROUP_PERMISSION, REMOVE_GROUP_PERMISSION } from './mutations';

export function useGroupPermissionMutations() {
  const t = useTranslations('groups');

  const update = (cache: ApolloCache<any>) => {
    evictGroupPermissionsCache(cache);
  };

  const [addGroupPermission] = useMutation<{ addGroupPermission: GroupPermission }>(
    ADD_GROUP_PERMISSION,
    {
      update,
    }
  );

  const [removeGroupPermission] = useMutation<{ removeGroupPermission: GroupPermission }>(
    REMOVE_GROUP_PERMISSION,
    {
      update,
    }
  );

  const handleAddGroupPermission = async (input: AddGroupPermissionInput) => {
    try {
      const result = await addGroupPermission({
        variables: { input },
      });

      toast.success(t('notifications.permissionAddedSuccess'));
      return result.data?.addGroupPermission;
    } catch (error) {
      console.error('Error adding group permission:', error);
      toast.error(t('notifications.permissionAddedError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const handleRemoveGroupPermission = async (input: RemoveGroupPermissionInput) => {
    try {
      const result = await removeGroupPermission({
        variables: { input },
      });

      toast.success(t('notifications.permissionRemovedSuccess'));
      return result.data?.removeGroupPermission;
    } catch (error) {
      console.error('Error removing group permission:', error);
      toast.error(t('notifications.permissionRemovedError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  return {
    addGroupPermission: handleAddGroupPermission,
    removeGroupPermission: handleRemoveGroupPermission,
  };
}
