'use client';

import { toast, Toaster } from 'sonner';

// Re-export toast function with our default configuration
export { toast };

// Export a configured Toaster component
export function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
        className: 'font-sans',
      }}
    />
  );
}
