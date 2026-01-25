'use client';

import { useAuthStore } from '@/stores/auth.store';

/**
 * Hook to check if the current user's email is verified
 *
 * @returns `true` if email is verified, `false` otherwise
 *
 * @example
 * ```tsx
 * const isEmailVerified = useEmailVerified();
 *
 * if (!isEmailVerified) {
 *   return <div>Please verify your email to use this feature</div>;
 * }
 * ```
 */
export function useEmailVerified(): boolean {
  const requiresEmailVerification = useAuthStore(
    (state) => state.requiresEmailVerification
  );

  // Email is verified if requiresEmailVerification is false
  return !requiresEmailVerification;
}
