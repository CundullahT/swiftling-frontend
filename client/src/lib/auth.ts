// Authentication service for Keycloak integration
import { getConfig } from "@shared/config";

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
    localStorage.removeItem('auth_tokens');
    this.tokens = null;
  }

  public async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const config = await getConfig();
    const tokenUrl = `${config.keycloakUrl}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`;

    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    formData.append('grant_type', KEYCLOAK_CONFIG.grantType);
    formData.append('scope', KEYCLOAK_CONFIG.scope);
    formData.append('client_id', KEYCLOAK_CONFIG.clientId);
    formData.append('client_secret', KEYCLOAK_CONFIG.clientSecret);

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
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