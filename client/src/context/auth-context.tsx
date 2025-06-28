import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { authService, AuthTokens, LoginCredentials } from '@/lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: AuthTokens | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      const userTokens = authService.getTokens();
      
      setIsAuthenticated(isAuth);
      setTokens(userTokens);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Helper function to refresh auth state
  const refreshAuthState = () => {
    const isAuth = authService.isAuthenticated();
    const userTokens = authService.getTokens();
    
    console.log('Refreshing auth state - isAuth:', isAuth, 'tokens:', userTokens);
    setIsAuthenticated(isAuth);
    setTokens(userTokens);
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const tokenResponse = await authService.login(credentials);
      
      setTokens(tokenResponse);
      setIsAuthenticated(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logout called - before cleanup');
    
    // Step 1: Clear all localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Step 2: Clear all cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
    });
    
    // Step 3: Clear auth service
    authService.logout();
    
    // Step 4: Force immediate state update
    setIsAuthenticated(false);
    setTokens(null);
    setError(null);
    
    console.log('Logout complete - forcing redirect to login');
    
    // Step 5: Force hard reload to login page
    window.location.replace('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        tokens,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}