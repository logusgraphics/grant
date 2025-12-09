import { ApolloCache } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import {
  CreateProjectUserApiKeyDocument,
  CreateProjectUserApiKeyInput,
  CreateProjectUserApiKeyResult,
  DeleteProjectUserApiKeyDocument,
  DeleteProjectUserApiKeyInput,
  ExchangeProjectUserApiKeyDocument,
  ExchangeProjectUserApiKeyInput,
  ExchangeProjectUserApiKeyResult,
  ProjectUserApiKey,
  RevokeProjectUserApiKeyDocument,
  RevokeProjectUserApiKeyInput,
} from '@logusgraphics/grant-schema';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { evictProjectUserApiKeysCache } from './cache';

export function useProjectUserApiKeyMutations() {
  const t = useTranslations('projectUserApiKeys');

  const update = (cache: ApolloCache) => {
    evictProjectUserApiKeysCache(cache);
  };

  const [createProjectUserApiKey] = useMutation<{
    createProjectUserApiKey: CreateProjectUserApiKeyResult;
  }>(CreateProjectUserApiKeyDocument, {
    update,
  });

  const [deleteProjectUserApiKey] = useMutation<{ deleteProjectUserApiKey: ProjectUserApiKey }>(
    DeleteProjectUserApiKeyDocument,
    {
      update,
    }
  );

  const [revokeProjectUserApiKey] = useMutation<{ revokeProjectUserApiKey: ProjectUserApiKey }>(
    RevokeProjectUserApiKeyDocument,
    {
      update,
    }
  );

  const [exchangeProjectUserApiKey] = useMutation<{
    exchangeProjectUserApiKey: ExchangeProjectUserApiKeyResult;
  }>(ExchangeProjectUserApiKeyDocument);

  const handleCreateProjectUserApiKey = async (input: CreateProjectUserApiKeyInput) => {
    try {
      const result = await createProjectUserApiKey({
        variables: { input },
      });

      toast.success(t('notifications.createSuccess'));
      return result.data?.createProjectUserApiKey;
    } catch (error) {
      console.error('Error creating project user API key:', error);
      toast.error(t('notifications.createError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const handleDeleteProjectUserApiKey = async (input: DeleteProjectUserApiKeyInput) => {
    try {
      const result = await deleteProjectUserApiKey({
        variables: { input },
      });

      toast.success(t('notifications.deleteSuccess'));
      return result.data?.deleteProjectUserApiKey;
    } catch (error) {
      console.error('Error deleting project user API key:', error);
      toast.error(t('notifications.deleteError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const handleRevokeProjectUserApiKey = async (input: RevokeProjectUserApiKeyInput) => {
    try {
      const result = await revokeProjectUserApiKey({
        variables: { input },
      });

      toast.success(t('notifications.revokeSuccess'));
      return result.data?.revokeProjectUserApiKey;
    } catch (error) {
      console.error('Error revoking project user API key:', error);
      toast.error(t('notifications.revokeError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  const handleExchangeProjectUserApiKey = async (input: ExchangeProjectUserApiKeyInput) => {
    try {
      const result = await exchangeProjectUserApiKey({
        variables: { input },
      });

      return result.data?.exchangeProjectUserApiKey;
    } catch (error) {
      console.error('Error exchanging project user API key:', error);
      toast.error(t('notifications.exchangeError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  return {
    createProjectUserApiKey: handleCreateProjectUserApiKey,
    deleteProjectUserApiKey: handleDeleteProjectUserApiKey,
    revokeProjectUserApiKey: handleRevokeProjectUserApiKey,
    exchangeProjectUserApiKey: handleExchangeProjectUserApiKey,
  };
}
