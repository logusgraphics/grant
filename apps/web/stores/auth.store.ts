import { Account, AccountType } from '@grantjs/schema';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const AUTH_STORE_STORAGE_KEY = 'grant-auth-store';

const PERSIST_VERSION = 1;

interface AuthState {
  // Authentication state
  loading: boolean;

  // Account state
  accounts: Account[];
  currentAccountId: string | null;
  accessToken: string | null;
  refreshToken: string | null;

  // Email verification state
  email: string | null;
  requiresEmailVerification: boolean;
  verificationExpiry: Date | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setAccounts: (accounts: Account[]) => void;
  setCurrentAccount: (accountId: string | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  switchAccount: (accountId: string) => void;
  updateAccounts: (accounts: Account[], accountId?: string) => void;
  syncFromMe: (data: {
    accounts: Account[];
    email: string | null;
    requiresEmailVerification: boolean;
    verificationExpiry: Date | null;
  }) => void;
  setAuthData: (data: {
    accounts: Account[];
    accessToken: string;
    refreshToken: string;
    email?: string | null;
    requiresEmailVerification?: boolean;
    verificationExpiry?: Date | null;
  }) => void;

  // Computed
  isAuthenticated: () => boolean;
  getCurrentAccount: () => Account | null;
  getCurrentPersonalAccount: () => Account | null;
  getCurrentOrganizationAccount: () => Account | null;
  hasMultipleAccounts: () => boolean;
  setEmail: (email: string | null) => void;
  setRequiresEmailVerification: (requiresEmailVerification: boolean) => void;
  setVerificationExpiry: (verificationExpiry: Date | null) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        loading: true,

        // Account state
        accounts: [],
        currentAccountId: null,
        accessToken: null,
        refreshToken: null,

        // Email verification state
        email: null,
        requiresEmailVerification: false,
        verificationExpiry: null,

        // Actions
        setLoading: (loading) => set({ loading }),
        setAccounts: (accounts) => set({ accounts }),
        setCurrentAccount: (accountId) => set({ currentAccountId: accountId }),
        setTokens: (accessToken, refreshToken) => {
          set({ accessToken, refreshToken });
        },

        clearAuth: () => {
          set({
            accounts: [],
            // Keep currentAccountId persisted after logout so user can resume with last account
            // currentAccountId: null, // Don't clear this
            accessToken: null,
            refreshToken: null,
            email: null,
            requiresEmailVerification: false,
            verificationExpiry: null,
          });
        },
        switchAccount: (accountId) => {
          const currentAccounts = get().accounts;
          const targetAccount = currentAccounts.find((account) => account.id === accountId);
          if (targetAccount) {
            set({ currentAccountId: accountId });
          }
        },

        updateAccounts: (accounts: Account[]) => {
          set({ accounts });
        },

        syncFromMe: (data) => {
          const { accounts, email, requiresEmailVerification, verificationExpiry } = data;
          const currentAccountId = get().currentAccountId;

          const targetAccountId =
            currentAccountId && accounts.some((account) => account.id === currentAccountId)
              ? currentAccountId
              : accounts.find((account) => account.type === AccountType.Organization)?.id ||
                accounts[0]?.id ||
                null;

          set({
            accounts,
            currentAccountId: targetAccountId,
            email,
            requiresEmailVerification,
            verificationExpiry,
          });
        },

        setAuthData: (data) => {
          const {
            accounts,
            accessToken,
            refreshToken,
            email,
            requiresEmailVerification,
            verificationExpiry,
          } = data;

          // Try to use persisted currentAccountId if it exists in the new accounts
          const persistedAccountId = get().currentAccountId;
          const targetAccountId =
            persistedAccountId && accounts.some((account) => account.id === persistedAccountId)
              ? persistedAccountId
              : accounts.find((account) => account.type === AccountType.Organization)?.id ||
                accounts[0]?.id ||
                null;

          set({
            accounts,
            currentAccountId: targetAccountId,
            accessToken,
            refreshToken,
            email: email ?? null,
            requiresEmailVerification: requiresEmailVerification ?? false,
            verificationExpiry: verificationExpiry ?? null,
          });
        },

        getCurrentAccount: () => {
          const { accounts, currentAccountId } = get();
          if (!currentAccountId) {
            return null;
          }
          return accounts.find((account) => account.id === currentAccountId) || null;
        },

        getCurrentPersonalAccount: () => {
          const { accounts } = get();
          return accounts.find((account) => account.type === AccountType.Personal) || null;
        },

        getCurrentOrganizationAccount: () => {
          const { accounts } = get();
          return accounts.find((account) => account.type === AccountType.Organization) || null;
        },

        hasMultipleAccounts: () => {
          const { accounts } = get();
          return accounts.length > 1;
        },

        setEmail: (email: string | null) => {
          set({ email });
        },
        setRequiresEmailVerification: (requiresEmailVerification: boolean) => {
          set({ requiresEmailVerification });
        },
        setVerificationExpiry: (verificationExpiry: Date | null) => {
          set({ verificationExpiry });
        },

        isAuthenticated: () => {
          const { accessToken, refreshToken } = get();
          return !!(accessToken && refreshToken);
        },
      }),
      {
        name: AUTH_STORE_STORAGE_KEY,
        version: PERSIST_VERSION,
        // Only persist auth-related data, not loading states
        partialize: (state) => ({
          accounts: state.accounts,
          currentAccountId: state.currentAccountId,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          email: state.email,
          requiresEmailVerification: state.requiresEmailVerification,
          verificationExpiry: state.verificationExpiry,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setLoading(false);
          }
        },
      }
    ),
    {
      name: AUTH_STORE_STORAGE_KEY,
    }
  )
);
