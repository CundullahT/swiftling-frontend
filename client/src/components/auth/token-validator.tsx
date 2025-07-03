import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/auth-context';
import { getConfig } from '../../../../shared/config';

interface TokenValidatorProps {
  children: React.ReactNode;
}

export function TokenValidator({ children }: TokenValidatorProps) {
  const { tokens, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  // Keycloak client credentials
  const KEYCLOAK_CLIENT_ID = 'swiftling-client';
  const KEYCLOAK_CLIENT_SECRET = 'nImkIhxLdG0NKrvAkxBFBk88t7r08ltD';
  const KEYCLOAK_REALM = 'swiftling-realm';

  const validateToken = async () => {
    if (!tokens?.access_token) {
      console.log('No access token found, redirecting to login');
      setIsValidating(false);
      setLocation('/login');
      return;
    }

    try {
      setIsValidating(true);
      const config = await getConfig();
      
      // Build the introspect URL
      const introspectUrl = `${config.keycloakUrl}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token/introspect`;
      
      console.log('Validating token with Keycloak:', introspectUrl);
      
      // Prepare the request body
      const body = new URLSearchParams({
        token: tokens.access_token,
      });

      // Create Basic Auth header
      const credentials = btoa(`${KEYCLOAK_CLIENT_ID}:${KEYCLOAK_CLIENT_SECRET}`);
      
      const response = await fetch(introspectUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
        body: body.toString(),
      });

      if (!response.ok) {
        console.error(`Token validation failed: ${response.status}`);
        // If validation call fails, assume token is invalid
        logout();
        setLocation('/login');
        return;
      }

      const result = await response.json();
      console.log('Token validation result:', result);
      
      // Check if token is active
      if (result.active === true) {
        setIsValid(true);
      } else {
        console.log('Token is not active, logging out');
        logout();
        setLocation('/login');
      }
    } catch (error) {
      console.error('Error validating token:', error);
      // On validation error, log out for security
      logout();
      setLocation('/login');
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    validateToken();
  }, [tokens?.access_token]);

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-secondary">Validating session...</span>
        </div>
      </div>
    );
  }

  // Only render children if token is valid
  if (isValid) {
    return <>{children}</>;
  }

  // If not valid, don't render anything (user will be redirected)
  return null;
}
