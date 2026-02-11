import { RefreshSessionDocument } from '@grantjs/schema';

import { getTempClient } from '@/lib/apollo-temp-client';
import { useAuthStore } from '@/stores/auth.store';

let refreshPromise: Promise<boolean> | null = null;

export function refreshSessionViaCookie(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async (): Promise<boolean> => {
    try {
      const result = await getTempClient().mutate({ mutation: RefreshSessionDocument });
      const accessToken = result.data?.refreshSession?.accessToken;
      if (accessToken) {
        useAuthStore.getState().setAccessToken(accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
