// Environment configuration for backend connections
export type Environment = 'local' | 'dev' | 'prod' | 'other';

export interface AppConfig {
  environment: Environment;
  hostname: string;
  port?: number;
  protocol: 'http' | 'https';
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

// Get hostname based on environment
async function getHostname(environment: Environment): Promise<string> {
  switch (environment) {
    case 'local':
      return 'localhost';
    case 'dev':
      return 'cundi.onthewifi.com';
    case 'prod':
      return 'swiftlingapp.com';
    case 'other':
      return await getPublicIP();
    default:
      return 'localhost';
  }
}

// Initialize configuration
export async function initializeConfig(): Promise<AppConfig> {
  const environment = getEnvironment();
  const hostname = await getHostname(environment);
  
  // Use HTTPS for prod and dev, HTTP for local and other
  const protocol = (environment === 'prod' || environment === 'dev') ? 'https' : 'http';
  
  // Default port for local development
  const port = environment === 'local' ? 5000 : undefined;
  
  const config: AppConfig = {
    environment,
    hostname,
    port,
    protocol,
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

// Reset configuration (useful for testing or environment changes)
export function resetConfig(): void {
  _config = null;
}