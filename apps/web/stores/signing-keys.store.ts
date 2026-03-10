import { GetSigningKeysQuery } from '@grantjs/schema';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type SigningKeyView = 'card' | 'table';

type SigningKeyRow = GetSigningKeysQuery['signingKeys'][number];

interface SigningKeysState {
  view: SigningKeyView;
  signingKeys: SigningKeyRow[];
  loading: boolean;
  refetch: (() => void) | null;
  hasKeys: boolean;
  rotateDialogOpen: boolean;

  setView: (view: SigningKeyView) => void;
  setSigningKeys: (signingKeys: SigningKeyRow[]) => void;
  setLoading: (loading: boolean) => void;
  setRefetch: (refetch: (() => void) | null) => void;
  setHasKeys: (hasKeys: boolean) => void;
  setRotateDialogOpen: (open: boolean) => void;

  reset: () => void;
}

const initialState = {
  view: 'card' as SigningKeyView,
  signingKeys: [] as SigningKeyRow[],
  loading: false,
  refetch: null as (() => void) | null,
  hasKeys: false,
  rotateDialogOpen: false,
};

export const useSigningKeysStore = create<SigningKeysState>()(
  devtools(
    (set) => ({
      ...initialState,

      setView: (view) => set({ view }),
      setSigningKeys: (signingKeys) => set({ signingKeys }),
      setLoading: (loading) => set({ loading }),
      setRefetch: (refetch) => set({ refetch }),
      setHasKeys: (hasKeys) => set({ hasKeys }),
      setRotateDialogOpen: (open) => set({ rotateDialogOpen: open }),

      reset: () => set(initialState),
    }),
    { name: 'grant-signing-keys-store' }
  )
);
