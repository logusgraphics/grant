import { useMutation } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Organization } from '@/graphql/generated/types';

import { evictOrganizationsCache } from './cache';
import {
  CREATE_ORGANIZATION,
  UPDATE_ORGANIZATION,
  DELETE_ORGANIZATION,
  ADD_ORGANIZATION_ROLE,
  REMOVE_ORGANIZATION_ROLE,
  ADD_ORGANIZATION_TAG,
  REMOVE_ORGANIZATION_TAG,
} from './mutations';

interface CreateOrganizationInput {
  name: string;
}

interface UpdateOrganizationInput {
  name?: string;
}

interface AddOrganizationRoleInput {
  organizationId: string;
  roleId: string;
}

interface RemoveOrganizationRoleInput {
  organizationId: string;
  roleId: string;
}

interface AddOrganizationTagInput {
  organizationId: string;
  tagId: string;
}

interface RemoveOrganizationTagInput {
  organizationId: string;
  tagId: string;
}

export function useOrganizationMutations() {
  const t = useTranslations('organizations');

  const [createOrganization] = useMutation<{ createOrganization: Organization }>(
    CREATE_ORGANIZATION,
    {
      update(cache) {
        evictOrganizationsCache(cache);
      },
    }
  );

  const [updateOrganization] = useMutation<{ updateOrganization: Organization }>(
    UPDATE_ORGANIZATION,
    {
      update(cache) {
        evictOrganizationsCache(cache);
      },
    }
  );

  const [deleteOrganization] = useMutation<{ deleteOrganization: boolean }>(DELETE_ORGANIZATION, {
    update(cache) {
      evictOrganizationsCache(cache);
      cache.gc();
    },
  });

  const [addOrganizationRole] = useMutation<{ addOrganizationRole: any }>(ADD_ORGANIZATION_ROLE, {
    update(cache) {
      evictOrganizationsCache(cache);
    },
  });

  const [removeOrganizationRole] = useMutation<{ removeOrganizationRole: any }>(
    REMOVE_ORGANIZATION_ROLE,
    {
      update(cache) {
        evictOrganizationsCache(cache);
      },
    }
  );

  const [addOrganizationTag] = useMutation<{ addOrganizationTag: any }>(ADD_ORGANIZATION_TAG, {
    update(cache) {
      evictOrganizationsCache(cache);
    },
  });

  const [removeOrganizationTag] = useMutation<{ removeOrganizationTag: boolean }>(
    REMOVE_ORGANIZATION_TAG,
    {
      update(cache) {
        evictOrganizationsCache(cache);
      },
    }
  );

  const handleCreateOrganization = async (input: CreateOrganizationInput) => {
    try {
      const result = await createOrganization({
        variables: { input },
        refetchQueries: ['GetOrganizations'],
      });

      toast.success(t('notifications.createSuccess'));
      return result.data?.createOrganization;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error(t('notifications.createError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const handleUpdateOrganization = async (id: string, input: UpdateOrganizationInput) => {
    try {
      const result = await updateOrganization({
        variables: { id, input },
        refetchQueries: ['GetOrganizations'],
      });

      toast.success(t('notifications.updateSuccess'));
      return result.data?.updateOrganization;
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error(t('notifications.updateError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const handleDeleteOrganization = async (id: string, _name: string) => {
    try {
      await deleteOrganization({
        variables: { id },
        refetchQueries: ['GetOrganizations'],
      });

      toast.success(t('notifications.deleteSuccess'));
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error(t('notifications.deleteError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const handleAddOrganizationRole = async (input: AddOrganizationRoleInput) => {
    try {
      const result = await addOrganizationRole({
        variables: { input },
        refetchQueries: ['GetOrganizations'],
      });

      toast.success(t('notifications.roleAddedSuccess'));
      return result.data?.addOrganizationRole;
    } catch (error) {
      console.error('Error adding organization role:', error);
      toast.error(t('notifications.roleAddedError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const handleRemoveOrganizationRole = async (input: RemoveOrganizationRoleInput) => {
    try {
      const result = await removeOrganizationRole({
        variables: { input },
        refetchQueries: ['GetOrganizations'],
      });

      toast.success(t('notifications.roleRemovedSuccess'));
      return result.data?.removeOrganizationRole;
    } catch (error) {
      console.error('Error removing organization role:', error);
      toast.error(t('notifications.roleRemovedError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const handleAddOrganizationTag = async (input: AddOrganizationTagInput) => {
    try {
      const result = await addOrganizationTag({
        variables: { input },
        refetchQueries: ['GetOrganizations'],
      });

      toast.success(t('notifications.tagAddedSuccess'));
      return result.data?.addOrganizationTag;
    } catch (error) {
      console.error('Error adding organization tag:', error);
      toast.error(t('notifications.tagAddedError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const handleRemoveOrganizationTag = async (input: RemoveOrganizationTagInput) => {
    try {
      const result = await removeOrganizationTag({
        variables: { input },
        refetchQueries: ['GetOrganizations'],
      });

      toast.success(t('notifications.tagRemovedSuccess'));
      return result.data?.removeOrganizationTag;
    } catch (error) {
      console.error('Error removing organization tag:', error);
      toast.error(t('notifications.tagRemovedError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  return {
    createOrganization: handleCreateOrganization,
    updateOrganization: handleUpdateOrganization,
    deleteOrganization: handleDeleteOrganization,
    addOrganizationRole: handleAddOrganizationRole,
    removeOrganizationRole: handleRemoveOrganizationRole,
    addOrganizationTag: handleAddOrganizationTag,
    removeOrganizationTag: handleRemoveOrganizationTag,
  };
}
