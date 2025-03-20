import { useEffect, useState } from 'react';
import { isAuthenticated as checkAuth } from '@/lib/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on mount and when window is focused
    const checkAuthentication = () => {
      setIsAuthenticated(checkAuth());
    };

    checkAuthentication();

    // Re-check auth status when window is focused (in case token expires)
    window.addEventListener('focus', checkAuthentication);
    return () => window.removeEventListener('focus', checkAuthentication);
  }, []);

  return { isAuthenticated };
}
