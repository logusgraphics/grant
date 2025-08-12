import { ApolloCache, useMutation } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  AddProjectPermissionInput,
  RemoveProjectPermissionInput,
  ProjectPermission,
} from '@/graphql/generated/types';

import { evictProjectPermissionsCache } from './cache';
import { ADD_PROJECT_PERMISSION, REMOVE_PROJECT_PERMISSION } from './mutations';

export function useProjectPermissionMutations() {
  const t = useTranslations('projectPermissions');

  const update = (cache: ApolloCache<any>) => {
    evictProjectPermissionsCache(cache);
  };

  const [addProjectPermission] = useMutation<{ addProjectPermission: ProjectPermission }>(
    ADD_PROJECT_PERMISSION,
    {
      update,
    }
  );

  const [removeProjectPermission] = useMutation<{ removeProjectPermission: ProjectPermission }>(
    REMOVE_PROJECT_PERMISSION,
    {
      update,
    }
  );

  const handleAddProjectPermission = async (input: AddProjectPermissionInput) => {
    try {
      const result = await addProjectPermission({
        variables: { input },
      });

      toast.success(t('notifications.addSuccess'));
      return result.data?.addProjectPermission;
    } catch (error) {
      console.error('Error adding project permission:', error);
      toast.error(t('notifications.addError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const handleRemoveProjectPermission = async (input: RemoveProjectPermissionInput) => {
    try {
      const result = await removeProjectPermission({
        variables: { input },
      });

      toast.success(t('notifications.removeSuccess'));
      return result.data?.removeProjectPermission;
    } catch (error) {
      console.error('Error removing project permission:', error);
      toast.error(t('notifications.removeError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  return {
    addProjectPermission: handleAddProjectPermission,
    removeProjectPermission: handleRemoveProjectPermission,
  };
}
