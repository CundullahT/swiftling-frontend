import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook to redirect if an auth check fails
 * Note: This is a placeholder for future auth functionality
 */
export function useAuthRedirect(isAuthenticated: boolean, redirectTo: string) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation(redirectTo);
    }
  }, [isAuthenticated, redirectTo, setLocation]);
}

export default useAuthRedirect;
