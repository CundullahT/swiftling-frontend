import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Keycloak authentication proxy to handle mixed content issues
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Keycloak configuration
      const KEYCLOAK_CONFIG = {
        realm: 'swiftling-realm',
        clientId: 'swiftling-client',
        clientSecret: 'nImkIhxLdG0NKrvAkxBFBk88t7r08ltD',
        grantType: 'password',
        scope: 'openid profile email'
      };

      // Make request to Keycloak from backend (HTTP is allowed here)
      const tokenUrl = 'http://cundi.onthewifi.com:8080/realms/swiftling-realm/protocol/openid-connect/token';
      
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      formData.append('grant_type', KEYCLOAK_CONFIG.grantType);
      formData.append('scope', KEYCLOAK_CONFIG.scope);
      formData.append('client_id', KEYCLOAK_CONFIG.clientId);
      formData.append('client_secret', KEYCLOAK_CONFIG.clientSecret);

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error: responseData.error || 'Authentication failed',
          error_description: responseData.error_description || `HTTP ${response.status}`
        });
      }

      // Return the tokens to the frontend
      res.json(responseData);
      
    } catch (error) {
      console.error('Keycloak proxy error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        error_description: 'Failed to connect to authentication server' 
      });
    }
  });

  // Account verification endpoint
  app.get('/api/auth/verify', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ 
          error: 'Verification token is required',
          error_description: 'Token parameter must be provided in the query string'
        });
      }

      // Get environment-specific configuration
      const { getConfig } = await import('../shared/config');
      const config = await getConfig();
      
      // Build user service URL for verification
      const verificationUrl = config.environment === 'local' 
        ? `http://localhost:8762/swiftling-user-service/api/v1/account/verify?token=${encodeURIComponent(token)}`
        : config.environment === 'prod'
        ? `https://swiftlingapp.com/swiftling-user-service/api/v1/account/verify?token=${encodeURIComponent(token)}`
        : `http://cundi.onthewifi.com:8762/swiftling-user-service/api/v1/account/verify?token=${encodeURIComponent(token)}`;

      console.log('Verifying account with URL:', verificationUrl);

      const response = await fetch(verificationUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error: responseData.message || 'Account verification failed',
          error_description: responseData.error || `HTTP ${response.status}`,
          success: false
        });
      }

      // Return success response
      res.json({
        success: true,
        message: responseData.message || 'Account verified successfully',
        data: responseData.data || null
      });
      
    } catch (error) {
      console.error('Account verification error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        error_description: 'Failed to verify account',
        success: false
      });
    }
  });

  // Logout endpoint to clear server-side session and cookies
  app.post('/api/auth/logout', (req, res) => {
    try {
      // Clear session data if using express-session
      if ((req as any).session) {
        (req as any).session.destroy((err: any) => {
          if (err) {
            console.error('Session destruction error:', err);
          }
        });
      }

      // Clear authentication cookies
      res.clearCookie('connect.sid'); // Default express-session cookie name
      res.clearCookie('auth_token');
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      
      // Clear any other potential auth cookies
      res.clearCookie('sessionId');
      res.clearCookie('JSESSIONID');

      res.json({ success: true, message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        message: 'Failed to logout' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
