import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/auth-context';
import { getAPIURL } from '../../../../shared/config';

interface RouteTokenValidatorProps {
  children: React.ReactNode;
}

export function RouteTokenValidator({ children }: RouteTokenValidatorProps) {
  const { tokens, logout } = useAuth();
  const [currentLocation, setLocation] = useLocation();

  // Validate token on every route change
  useEffect(() => {
    const validateTokenOnRouteChange = async () => {
      if (!tokens?.access_token) {
        console.log('No access token found, redirecting to login');
        setLocation('/login');
        return;
      }

      try {
        console.log('Validating token due to route change:', currentLocation);
        
        // Call backend API to validate token
        const validateUrl = await getAPIURL('/auth/validate-token');
        
        const response = await fetch(validateUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: tokens.access_token,
          }),
        });

        if (!response.ok) {
          console.error(`Token validation request failed: ${response.status}`);
          logout();
          setLocation('/login');
          return;
        }

        const result = await response.json();
        console.log('Token validation result:', result);
        
        // Check if token is active
        if (result.active !== true) {
          console.log('Token is not active, logging out');
          logout();
          setLocation('/login');
        }
        // If token is valid, do nothing - user continues normally
        
      } catch (error) {
        console.error('Error validating token:', error);
        logout();
        setLocation('/login');
      }
    };

    validateTokenOnRouteChange();
  }, [currentLocation]); // Only trigger on route changes

  // Always render children - validation happens in background
  return <>{children}</>;
}