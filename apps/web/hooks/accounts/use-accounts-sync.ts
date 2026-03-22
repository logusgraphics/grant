import { useLayoutEffect } from 'react';

import { useMe } from '@/hooks/auth';
import { useAuthStore } from '@/stores/auth.store';

export function useAccountsSync() {
  const {
    syncFromMe,
    setCurrentAccount,
    loading: storeLoading,
    currentAccountId,
    accessToken,
  } = useAuthStore();
  const {
    accounts,
    email,
    mfaVerified,
    requiresEmailVerification,
    verificationExpiry,
    loading: meLoading,
  } = useMe();

  const loading = storeLoading || meLoading;
  const auth = !!accessToken;

  useLayoutEffect(() => {
    if (!auth) return;
    if (loading) return;

    syncFromMe({
      accounts,
      email,
      mfaVerified,
      requiresEmailVerification,
      verificationExpiry,
    });

    if (!accounts.length) return;

    const hasValidCurrent = currentAccountId && accounts.some((a) => a.id === currentAccountId);
    if (!hasValidCurrent) {
      setCurrentAccount(accounts[0].id);
    }
  }, [
    auth,
    loading,
    accounts,
    email,
    mfaVerified,
    requiresEmailVerification,
    verificationExpiry,
    currentAccountId,
    accessToken,
    syncFromMe,
    setCurrentAccount,
  ]);
}
