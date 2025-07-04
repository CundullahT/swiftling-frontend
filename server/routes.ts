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

  // Token validation endpoint
  app.post('/api/auth/validate-token', async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ 
          error: 'Token is required',
          active: false
        });
      }

      // Keycloak configuration (use the corrected values)
      const KEYCLOAK_CONFIG = {
        realm: 'swiftling-realm',
        clientId: 'swiftling-client',
        clientSecret: 'nImkIhxLdG0NKrvAkxBFBk88t7r08ltD'
      };

      // Build the introspect URL
      const introspectUrl = `http://cundi.onthewifi.com:8080/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token/introspect`;
      
      // Prepare the request body
      const body = new URLSearchParams({
        token: token,
      });

      // Create Basic Auth header
      const credentials = Buffer.from(`${KEYCLOAK_CONFIG.clientId}:${KEYCLOAK_CONFIG.clientSecret}`).toString('base64');
      
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
        return res.status(200).json({ 
          active: false,
          error: `Token validation failed: ${response.status}`
        });
      }

      const result = await response.json();
      
      // Return the validation result
      res.json({
        active: result.active || false,
        exp: result.exp,
        iat: result.iat,
        sub: result.sub,
        username: result.username
      });
      
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(200).json({ 
        active: false,
        error: 'Token validation failed'
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
