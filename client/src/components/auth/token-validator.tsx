import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/auth-context';
import { getAPIURL } from '../../../../shared/config';

interface TokenValidatorProps {
  children: React.ReactNode;
}

export function TokenValidator({ children }: TokenValidatorProps) {
  const { tokens, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const isLoggingOutRef = useRef(false);

  const validateToken = async () => {
    if (!tokens?.access_token || isLoggingOutRef.current) {
      console.log('No access token found or already logging out, redirecting to login');
      setIsValidating(false);
      setLocation('/login');
      return;
    }

    try {
      setIsValidating(true);
      
      // Use backend API endpoint for token validation
      const validateUrl = await getAPIURL('/auth/validate-token');
      
      console.log('Validating token with backend:', validateUrl);
      
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
        // If validation call fails, assume token is invalid
        handleLogout();
        return;
      }

      const result = await response.json();
      console.log('Token validation result:', result);
      
      // Check if token is active
      if (result.active === true) {
        console.log('Token is valid, setting isValid to true');
        setIsValid(true);
      } else {
        console.log('Token is not active, redirecting to login');
        handleLogout();
      }
    } catch (error) {
      console.error('Error validating token:', error);
      // On validation error, redirect for security
      handleLogout();
    } finally {
      setIsValidating(false);
    }
  };

  const handleLogout = () => {
    if (isLoggingOutRef.current) return; // Prevent multiple logout calls
    
    isLoggingOutRef.current = true;
    setIsValid(false);
    logout();
    setLocation('/login');
  };

  // Get current location to detect route changes
  const [currentLocation] = useLocation();

  // Main validation effect - triggers on token change OR route change
  useEffect(() => {
    // Skip validation if we're already validating or logging out
    if (isValidating || isLoggingOutRef.current) return;
    
    // Check localStorage first - if token is missing, redirect immediately
    const storedTokens = localStorage.getItem('auth_tokens');
    if (!storedTokens) {
      console.log('No token in localStorage, redirecting to login');
      setIsValidating(false);
      setLocation('/login');
      return;
    }

    // If we have tokens, validate them
    if (tokens?.access_token) {
      validateToken();
    }
  }, [tokens?.access_token, currentLocation]);

  // Periodic validation (every 5 minutes) - only when user is active
  useEffect(() => {
    if (!tokens?.access_token) return;

    const interval = setInterval(() => {
      const storedTokens = localStorage.getItem('auth_tokens');
      if (storedTokens) {
        console.log('Performing periodic token validation...');
        validateToken();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [tokens?.access_token]);

  // Monitor localStorage changes (cross-tab detection)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_tokens' && e.newValue === null) {
        console.log('Token removed from localStorage (cross-tab), redirecting to login');
        setIsValid(false);
        setIsValidating(false);
        setLocation('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check if we have tokens first
  if (!tokens?.access_token) {
    // No token, will be redirected by useEffect
    return null;
  }

  // If we're validating, show content (seamless experience)
  if (isValidating) {
    return <>{children}</>;
  }

  // Only render children if token is valid
  if (isValid) {
    return <>{children}</>;
  }

  // If not valid, don't render anything (user will be redirected)
  return null;
}
