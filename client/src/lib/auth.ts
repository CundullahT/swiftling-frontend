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
  clientSecret: 'nImkIhxLdG0NKrvAkxBFBk88t7r08ltD',
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
    localStorage.removeItem('auth_tokens');
    this.tokens = null;
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

  public async logout(): Promise<void> {
    try {
      // Call backend logout endpoint to clear server-side session and cookies
      const backendUrl = await getAPIURL('/auth/logout');
      await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });
    } catch (error) {
      console.warn('Backend logout failed:', error);
      // Continue with client-side cleanup even if backend logout fails
    }

    // Clear all client-side authentication data
    this.clearTokens();
    this.clearAllAuthData();
  }

  private clearAllAuthData(): void {
    // Clear localStorage items related to authentication
    const authKeys = [
      'auth_tokens',
      'access_token', 
      'refresh_token',
      'id_token',
      'user_data',
      'session_id',
      'auth_state'
    ];

    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear sessionStorage items related to authentication
    authKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });

    // Clear any other potential storage keys
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('token') || key.includes('session'))) {
        localStorage.removeItem(key);
      }
    }

    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('auth') || key.includes('token') || key.includes('session'))) {
        sessionStorage.removeItem(key);
      }
    }
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

  // Validate token with Keycloak introspection endpoint
  public async validateToken(): Promise<boolean> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return false;
    }

    try {
      const config = await getConfig();
      const introspectionUrl = `${config.keycloakUrl}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token/introspect`;
      
      // Create form data for the introspection request
      const formData = new URLSearchParams();
      formData.append('token', accessToken);
      
      // Create basic auth header for client credentials
      const credentials = btoa(`${KEYCLOAK_CONFIG.clientId}:${KEYCLOAK_CONFIG.clientSecret}`);
      
      const response = await fetch(introspectionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        },
        body: formData
      });

      if (!response.ok) {
        console.error('Token validation failed:', response.status);
        return false;
      }

      const result = await response.json();
      
      // Check if token is active
      if (result.active === true) {
        return true;
      } else {
        // Token is not active, clear it
        this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error('Error validating token:', error);
      // Clear tokens on validation error
      this.clearTokens();
      return false;
    }
  }
}

export const authService = AuthService.getInstance();