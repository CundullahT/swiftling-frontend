import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook to redirect if an auth check fails
 * Note: This is a placeholder for future auth functionality
 * Currently disabled - all users considered authenticated
 */
export function useAuthRedirect(isAuthenticated: boolean, redirectTo: string) {
  // Authentication check is disabled for now
  // Will be implemented properly later
}

export default useAuthRedirect;
