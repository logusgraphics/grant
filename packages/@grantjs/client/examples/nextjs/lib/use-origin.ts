'use client';

import { useEffect, useState } from 'react';

/** Current origin (for same-origin OAuth redirects). Empty until mounted. */
export function useOrigin(): string {
  const [origin, setOrigin] = useState('');
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  return origin;
}
