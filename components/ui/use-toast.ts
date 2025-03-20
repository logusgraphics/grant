import * as React from 'react';

type ToastProps = {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type Toast = ToastProps & {
  id: string;
};

type State = {
  toasts: Toast[];
};

type Action =
  | {
      type: 'add_toast';
      toast: Toast;
    }
  | {
      type: 'update_toast';
      toast: Partial<Toast>;
    }
  | {
      type: 'dismiss_toast';
      toastId?: Toast['id'];
    }
  | {
      type: 'remove_toast';
      toastId?: Toast['id'];
    };

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000;

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'remove_toast',
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'add_toast':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'update_toast':
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case 'dismiss_toast': {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }

    case 'remove_toast':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function toast({ ...props }: Omit<ToastProps, 'id'>) {
  const id = Math.random().toString(36).substring(2, 9);

  const update = (props: Partial<Toast>) =>
    dispatch({
      type: 'update_toast',
      toast: { ...props, id },
    });

  const dismiss = () =>
    dispatch({
      type: 'dismiss_toast',
      toastId: id,
    });

  dispatch({
    type: 'add_toast',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'dismiss_toast', toastId }),
  };
}

export { useToast, toast };
