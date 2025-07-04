// Environment configuration for backend connections
export type Environment = 'local' | 'dev' | 'prod' | 'other';

export interface AppConfig {
  environment: Environment;
  hostname: string;
  port?: number;
  protocol: 'http' | 'https';
  keycloakUrl: string;
  quizServiceUrl: string;
}

// Get public IP address from AWS checkip service
async function getPublicIP(): Promise<string> {
  try {
    const response = await fetch('http://checkip.amazonaws.com/', {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const ip = await response.text();
    return ip.trim();
  } catch (error) {
    console.error('Failed to get public IP:', error);
    return '127.0.0.1'; // fallback to localhost
  }
}

// Determine environment from NODE_ENV or other environment variables
function getEnvironment(): Environment {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Check for VITE_APP_ENV override first
    const viteEnv = import.meta.env.VITE_APP_ENV;
    if (viteEnv === 'dev') {
      return 'dev';
    }
    
    // Browser environment - detect from current hostname
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'local';
    } else if (hostname.includes('cundi.onthewifi.com')) {
      return 'dev';
    } else if (hostname.includes('swiftlingapp.com')) {
      return 'prod';
    } else {
      return 'other';
    }
  } else {
    // Server environment - use process.env
    const nodeEnv = process.env.NODE_ENV || '';
    const appEnv = process.env.APP_ENV || '';
    
    // Check both NODE_ENV and APP_ENV
    const env = appEnv || nodeEnv;
    
    switch (env.toLowerCase()) {
      case 'development':
      case 'local':
        return 'local';
      case 'dev':
      case 'development-remote':
        return 'dev';
      case 'production':
      case 'prod':
        return 'prod';
      default:
        return 'other';
    }
  }
}

// Get hostname based on environment
async function getHostname(environment: Environment): Promise<string> {
  switch (environment) {
    case 'dev':
      // In browser (frontend), use current hostname if on Replit, otherwise use cundi.onthewifi.com
      if (typeof window !== 'undefined') {
        const currentHostname = window.location.hostname;
        if (currentHostname.includes('replit.dev') || currentHostname.includes('.replit.')) {
          return currentHostname; // Use current Replit URL for frontend
        }
        return 'cundi.onthewifi.com';
      }
      // On server, use cundi.onthewifi.com for external API calls
      return 'cundi.onthewifi.com';
    case 'local':
      return 'localhost';
    case 'prod':
      return 'swiftlingapp.com';
    case 'other':
      // In browser environment, use current hostname for 'other'
      if (typeof window !== 'undefined') {
        return window.location.hostname;
      }
      // On server, get public IP
      return await getPublicIP();
    default:
      return 'localhost';
  }
}

// Initialize configuration
export async function initializeConfig(): Promise<AppConfig> {
  const environment = getEnvironment();
  const hostname = await getHostname(environment);
  
  // Use protocol and port based on environment
  let protocol: 'http' | 'https';
  let port: number | undefined;
  
  if (environment === 'dev') {
    // For dev environment, detect protocol and port based on context
    if (typeof window !== 'undefined') {
      // In browser, match current protocol and use no port for Replit
      const currentHostname = window.location.hostname;
      if (currentHostname.includes('replit.dev') || currentHostname.includes('.replit.')) {
        protocol = window.location.protocol === 'https:' ? 'https' : 'http';
        port = undefined; // Replit handles ports automatically
      } else {
        protocol = 'http';
        port = 5000;
      }
    } else {
      // On server, use HTTP with port for external calls
      protocol = 'http';
      port = 5000;
    }
  } else if (environment === 'local') {
    protocol = 'http';
    port = 5000;
  } else if (environment === 'prod') {
    protocol = 'https';
    port = undefined; // No port for prod
  } else {
    // For 'other' environment, detect from current context
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      protocol = 'https';
      port = undefined;
    } else {
      protocol = 'http';
      port = 5000;
    }
  }
  
  // Build Keycloak URL based on environment
  let keycloakUrl: string;
  if (environment === 'dev') {
    keycloakUrl = 'http://cundi.onthewifi.com:8080';
  } else if (environment === 'local') {
    keycloakUrl = 'http://localhost:8080';
  } else if (environment === 'prod') {
    keycloakUrl = 'https://swiftlingapp.com';
  } else {
    // For 'other' environment, use the same hostname as the app with port 8080
    keycloakUrl = `http://${hostname}:8080`;
  }
  
  // Build Quiz Service URL based on environment
  let quizServiceUrl: string;
  if (environment === 'dev') {
    quizServiceUrl = 'http://cundi.onthewifi.com:8762/swiftling-phrase-service';
  } else if (environment === 'local') {
    quizServiceUrl = 'http://localhost:8762/swiftling-phrase-service';
  } else if (environment === 'prod') {
    quizServiceUrl = 'https://swiftlingapp.com/swiftling-phrase-service';
  } else {
    // For 'other' environment, use the same hostname as the app with port 8762
    quizServiceUrl = `http://${hostname}:8762/swiftling-phrase-service`;
  }
  
  const config: AppConfig = {
    environment,
    hostname,
    port,
    protocol,
    keycloakUrl,
    quizServiceUrl,
  };
  
  console.log(`Environment: ${environment}, Backend URL: ${protocol}://${hostname}${port ? `:${port}` : ''}`);
  
  return config;
}

// Cached configuration
let _config: AppConfig | null = null;

// Get current configuration (initialize if needed)
export async function getConfig(): Promise<AppConfig> {
  if (!_config) {
    _config = await initializeConfig();
  }
  return _config;
}

// Get base URL for API requests
export async function getBaseURL(): Promise<string> {
  const config = await getConfig();
  return `${config.protocol}://${config.hostname}${config.port ? `:${config.port}` : ''}`;
}

// Get API URL with path
export async function getAPIURL(path: string = ''): Promise<string> {
  const baseURL = await getBaseURL();
  return `${baseURL}/api${path}`;
}

// Get Quiz Service URL with path
export async function getQuizServiceURL(path: string = ''): Promise<string> {
  const config = await getConfig();
  return `${config.quizServiceUrl}${path}`;
}

// Reset configuration (useful for testing or environment changes)
export function resetConfig(): void {
  _config = null;
}