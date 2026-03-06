import { ApolloCache } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import {
  CreateProjectAppDocument,
  UpdateProjectAppDocument,
  type CreateProjectAppInput,
  type CreateProjectAppResult,
  type ProjectApp,
  type UpdateProjectAppInput,
  DeleteProjectAppDocument,
  Scope,
} from '@grantjs/schema';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { evictProjectAppsCache } from './cache';

export function useProjectAppMutations() {
  const t = useTranslations('projectApps');

  const update = (cache: ApolloCache) => {
    evictProjectAppsCache(cache);
  };

  const [createProjectApp] = useMutation<{
    createProjectApp: CreateProjectAppResult;
  }>(CreateProjectAppDocument, {
    update,
  });

  const [updateProjectApp] = useMutation<{ updateProjectApp: ProjectApp }>(
    UpdateProjectAppDocument,
    {
      update,
    }
  );

  const [deleteProjectApp] = useMutation<{ deleteProjectApp: boolean }>(DeleteProjectAppDocument, {
    update,
  });

  const handleCreateProjectApp = async (input: CreateProjectAppInput) => {
    try {
      const result = await createProjectApp({
        variables: { input },
      });

      toast.success(t('notifications.createSuccess'));
      return result.data?.createProjectApp;
    } catch (error) {
      toast.error(t('notifications.createError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const handleUpdateProjectApp = async (id: string, input: UpdateProjectAppInput) => {
    try {
      const result = await updateProjectApp({
        variables: { id, input },
      });

      toast.success(t('notifications.updateSuccess'));
      return result.data?.updateProjectApp;
    } catch (error) {
      toast.error(t('notifications.updateError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const handleDeleteProjectApp = async (id: string, scope: Scope) => {
    try {
      await deleteProjectApp({
        variables: { id, scope },
      });

      toast.success(t('notifications.deleteSuccess'));
    } catch (error) {
      toast.error(t('notifications.deleteError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  return {
    createProjectApp: handleCreateProjectApp,
    updateProjectApp: handleUpdateProjectApp,
    deleteProjectApp: handleDeleteProjectApp,
  };
}
