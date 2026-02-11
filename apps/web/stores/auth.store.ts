import { Account, AccountType } from '@grantjs/schema';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

/** Used for devtools display name. */
export const AUTH_STORE_STORAGE_KEY = 'grant-auth-store';

/** Storage key for persisted currentAccountId only (last workspace). */
const AUTH_PREFERENCES_STORAGE_KEY = 'grant-auth-preferences';

interface AuthState {
  // Authentication state
  loading: boolean;

  // Account state
  accounts: Account[];
  currentAccountId: string | null;
  isSwitchingAccounts: boolean;
  accessToken: string | null;

  // Email verification state
  email: string | null;
  requiresEmailVerification: boolean;
  verificationExpiry: Date | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setAccounts: (accounts: Account[]) => void;
  setCurrentAccount: (accountId: string | null) => void;
  setSwitchingAccounts: (value: boolean) => void;
  setAccessToken: (accessToken: string) => void;
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
        // In-memory state (tokens, accounts, etc.); only currentAccountId is persisted via partialize
        loading: false,

        // Account state
        accounts: [],
        currentAccountId: null,
        isSwitchingAccounts: false,
        accessToken: null,

        // Email verification state
        email: null,
        requiresEmailVerification: false,
        verificationExpiry: null,

        // Actions
        setLoading: (loading) => set({ loading }),
        setAccounts: (accounts) => set({ accounts }),
        setCurrentAccount: (accountId) => set({ currentAccountId: accountId }),
        setSwitchingAccounts: (value) => set({ isSwitchingAccounts: value }),
        setAccessToken: (accessToken) => {
          set({ accessToken });
        },

        clearAuth: () => {
          set({
            accounts: [],
            currentAccountId: null,
            isSwitchingAccounts: false,
            accessToken: null,
            email: null,
            requiresEmailVerification: false,
            verificationExpiry: null,
          });
        },
        switchAccount: (accountId) => {
          const state = get();
          const currentAccounts = state.accounts;
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
          set({
            accounts,
            email,
            requiresEmailVerification,
            verificationExpiry,
          });
          // currentAccountId is persisted; useAccountsSync only ensures a valid one when accounts load.
        },

        setAuthData: (data) => {
          const { accounts, accessToken, email, requiresEmailVerification, verificationExpiry } =
            data;

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
            accessToken,
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
          const { accessToken } = get();
          return !!accessToken;
        },
      }),
      {
        name: AUTH_PREFERENCES_STORAGE_KEY,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ currentAccountId: state.currentAccountId }),
      }
    ),
    { name: AUTH_STORE_STORAGE_KEY }
  )
);
