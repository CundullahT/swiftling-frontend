import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
    authService.logout();
    setIsAuthenticated(false);
    setTokens(null);
    setError(null);
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