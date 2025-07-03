import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthTokens, LoginCredentials } from '@/lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: AuthTokens | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
  validateToken: () => Promise<boolean>;
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

  // Check authentication status on mount and validate token
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = authService.isAuthenticated();
      const userTokens = authService.getTokens();
      
      if (isAuth && userTokens) {
        // Validate token with Keycloak
        const isValid = await authService.validateToken();
        setIsAuthenticated(isValid);
        setTokens(isValid ? userTokens : null);
      } else {
        setIsAuthenticated(false);
        setTokens(null);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

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

  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setTokens(null);
      setError(null);
    } catch (error) {
      console.warn('Logout process completed with warnings:', error);
      // Still update state even if logout had issues
      setIsAuthenticated(false);
      setTokens(null);
      setError(null);
    }
  };

  const validateToken = async (): Promise<boolean> => {
    try {
      const isValid = await authService.validateToken();
      if (!isValid) {
        setIsAuthenticated(false);
        setTokens(null);
        setError('Session expired');
      }
      return isValid;
    } catch (error) {
      console.error('Token validation error:', error);
      setIsAuthenticated(false);
      setTokens(null);
      setError('Authentication error');
      return false;
    }
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
        validateToken,
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