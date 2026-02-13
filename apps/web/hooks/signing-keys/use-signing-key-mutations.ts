import { useMutation } from '@apollo/client/react';
import { RotateSigningKeyDocument, RotateSigningKeyMutation, Scope } from '@grantjs/schema';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { evictSigningKeysCache } from './cache';

export function useSigningKeyMutations() {
  const t = useTranslations('signingKeys');

  const [rotateSigningKeyMutation] = useMutation<RotateSigningKeyMutation>(
    RotateSigningKeyDocument,
    {
      update(cache) {
        evictSigningKeysCache(cache);
      },
    }
  );

  const rotateSigningKey = async (scope: Scope) => {
    try {
      const result = await rotateSigningKeyMutation({
        variables: { scope },
      });
      toast.success(t('notifications.rotateSuccess'));
      return result.data?.rotateSigningKey;
    } catch (error) {
      console.error('Error rotating signing key:', error);
      toast.error(t('notifications.rotateError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      throw error;
    }
  };

  return {
    rotateSigningKey,
  };
}
