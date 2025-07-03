import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLocation } from 'wouter';

interface TokenValidatorProps {
  children: React.ReactNode;
}

export function TokenValidator({ children }: TokenValidatorProps) {
  const { isAuthenticated, tokens, validateToken, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [isValidating, setIsValidating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const validateUserToken = async () => {
      // Skip validation for public routes
      const isPublicRoute = location.startsWith('/auth/') || 
                          location === '/signup' || 
                          location === '/login' || 
                          location.startsWith('/legal/');
      
      if (isPublicRoute) {
        setIsInitialized(true);
        return;
      }

      // Skip validation if no tokens (user not authenticated)
      if (!isAuthenticated || !tokens) {
        setIsInitialized(true);
        return;
      }

      setIsValidating(true);
      
      try {
        const isValid = await validateToken();
        
        if (!isValid) {
          // Token is invalid, logout and redirect to login
          console.log('Token validation failed, redirecting to login');
          await logout();
          setLocation('/login');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        // On validation error, logout and redirect to login
        await logout();
        setLocation('/login');
      } finally {
        setIsValidating(false);
        setIsInitialized(true);
      }
    };

    validateUserToken();
  }, [location, isAuthenticated, tokens, validateToken, logout, setLocation]);

  // Show loading state while validating (only for protected routes)
  const isPublicRoute = location.startsWith('/auth/') || 
                        location === '/signup' || 
                        location === '/login' || 
                        location.startsWith('/legal/');
  
  if (!isPublicRoute && (!isInitialized || isValidating)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600">Validating session...</span>
        </div>
      </div>
    );
  }

  // Render children if validation passes or user is not authenticated
  return <>{children}</>;
}