import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MfaStepUpState {
  isOpen: boolean;
  hasActiveEnrollment: boolean;
  resolve: ((success: boolean) => void) | null;

  requestStepUp: (hasActiveEnrollment: boolean) => Promise<boolean>;
  complete: () => void;
  cancel: () => void;
}

let activePromise: Promise<boolean> | null = null;

export const useMfaStepUpStore = create<MfaStepUpState>()(
  devtools(
    (set, get) => ({
      isOpen: false,
      hasActiveEnrollment: true,
      resolve: null,

      requestStepUp: (hasActiveEnrollment: boolean) => {
        if (activePromise) return activePromise;

        activePromise = new Promise<boolean>((resolve) => {
          set({ isOpen: true, hasActiveEnrollment, resolve });
        }).finally(() => {
          activePromise = null;
        });

        return activePromise;
      },

      complete: () => {
        const { resolve } = get();
        resolve?.(true);
        set({ isOpen: false, resolve: null });
      },

      cancel: () => {
        const { resolve } = get();
        resolve?.(false);
        set({ isOpen: false, resolve: null });
      },
    }),
    { name: 'mfa-step-up-store' }
  )
);
