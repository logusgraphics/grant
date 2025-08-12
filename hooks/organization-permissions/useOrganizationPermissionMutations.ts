import { ApolloCache, useMutation } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  AddOrganizationPermissionInput,
  RemoveOrganizationPermissionInput,
  OrganizationPermission,
} from '@/graphql/generated/types';

import { evictOrganizationPermissionsCache } from './cache';
import { ADD_ORGANIZATION_PERMISSION, REMOVE_ORGANIZATION_PERMISSION } from './mutations';

export function useOrganizationPermissionMutations() {
  const t = useTranslations('organizationPermissions');

  const update = (cache: ApolloCache<any>) => {
    evictOrganizationPermissionsCache(cache);
  };

  const [addOrganizationPermission] = useMutation<{
    addOrganizationPermission: OrganizationPermission;
  }>(ADD_ORGANIZATION_PERMISSION, {
    update,
  });

  const [removeOrganizationPermission] = useMutation<{
    removeOrganizationPermission: OrganizationPermission;
  }>(REMOVE_ORGANIZATION_PERMISSION, {
    update,
  });

  const handleAddOrganizationPermission = async (input: AddOrganizationPermissionInput) => {
    try {
      const result = await addOrganizationPermission({
        variables: { input },
      });

      toast.success(t('notifications.addSuccess'));
      return result.data?.addOrganizationPermission;
    } catch (error) {
      console.error('Error adding organization permission:', error);
      toast.error(t('notifications.addError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const handleRemoveOrganizationPermission = async (input: RemoveOrganizationPermissionInput) => {
    try {
      const result = await removeOrganizationPermission({
        variables: { input },
      });

      toast.success(t('notifications.removeSuccess'));
      return result.data?.removeOrganizationPermission;
    } catch (error) {
      console.error('Error removing organization permission:', error);
      toast.error(t('notifications.removeError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  return {
    addOrganizationPermission: handleAddOrganizationPermission,
    removeOrganizationPermission: handleRemoveOrganizationPermission,
  };
}
