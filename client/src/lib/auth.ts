// Authentication service for Keycloak integration
import { getConfig, getAPIURL } from "@shared/config";

export interface AuthTokens {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  id_token?: string;
  refresh_token?: string;
  scope: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Keycloak configuration
const KEYCLOAK_CONFIG = {
  realm: 'swiftling-realm',
  clientId: 'swiftling-client',
  clientSecret: '3h3kzuPsEIhlVqkwOM86bELukqWk7UL9',
  grantType: 'password',
  scope: 'openid'
};

class AuthService {
  private static instance: AuthService;
  private tokens: AuthTokens | null = null;

  private constructor() {
    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadTokensFromStorage(): void {
    try {
      const storedTokens = localStorage.getItem('auth_tokens');
      if (storedTokens) {
        this.tokens = JSON.parse(storedTokens);
      }
    } catch (error) {
      console.error('Error loading tokens from storage:', error);
      this.clearTokens();
    }
  }

  private saveTokensToStorage(tokens: AuthTokens): void {
    try {
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
      this.tokens = tokens;
    } catch (error) {
      console.error('Error saving tokens to storage:', error);
    }
  }

  private clearTokens(): void {
    console.log('Clearing tokens from auth service');
    localStorage.removeItem('auth_tokens');
    this.tokens = null;
    console.log('Tokens cleared, this.tokens is now:', this.tokens);
  }

  public async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const config = await getConfig();
    const backendUrl = await getAPIURL('/auth/login');

    console.log('Environment:', config.environment);
    console.log('Backend URL:', backendUrl);

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error_description || `Authentication failed: ${response.status}`);
      }

      const tokens: AuthTokens = await response.json();
      this.saveTokensToStorage(tokens);
      return tokens;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  public logout(): void {
    this.clearTokens();
    
    // Clear all possible authentication-related storage
    this.clearAllAuthData();
  }

  private clearAllAuthData(): void {
    // Clear localStorage items
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_session');
    localStorage.removeItem('session_id');
    
    // Clear sessionStorage items
    sessionStorage.removeItem('auth_tokens');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_session');
    sessionStorage.removeItem('session_id');
    
    // Clear cookies by setting them to expire
    this.clearAuthCookies();
  }

  private clearAuthCookies(): void {
    const cookiesToClear = [
      'access_token',
      'refresh_token',
      'session_id',
      'auth_session',
      'user_session',
      'JSESSIONID',
      'connect.sid',
      'session'
    ];
    
    cookiesToClear.forEach(cookieName => {
      // Clear cookie for current domain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      // Clear cookie for parent domain (if any)
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      // Clear cookie without domain specification
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }

  public getAccessToken(): string | null {
    return this.tokens?.access_token || null;
  }

  public isAuthenticated(): boolean {
    return !!this.tokens?.access_token;
  }

  public getTokens(): AuthTokens | null {
    return this.tokens;
  }

  // Get authorization header for API requests
  public getAuthHeader(): { Authorization: string } | {} {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = AuthService.getInstance();