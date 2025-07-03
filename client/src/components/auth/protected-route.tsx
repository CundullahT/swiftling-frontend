import { useAuth } from '@/context/auth-context';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { TokenValidator } from './token-validator';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, tokens } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect to login)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated and has token, validate it with Keycloak
  if (tokens?.access_token) {
    return (
      <TokenValidator>
        {children}
      </TokenValidator>
    );
  }

  // If authenticated but no token, redirect to login
  setLocation('/login');
  return null;
}