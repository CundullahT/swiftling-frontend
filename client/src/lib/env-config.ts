// Frontend environment configuration utility
import { useEffect, useState } from "react";
import { getConfig, getBaseURL, getAPIURL, type AppConfig } from "@shared/config";

// Environment configuration hook for React components
export function useEnvironmentConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getConfig()
      .then((cfg) => {
        setConfig(cfg);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        console.error('Failed to load environment configuration:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { config, loading, error };
}

// Helper functions for easy access
export { getConfig, getBaseURL, getAPIURL };

// Environment detection helpers
export async function getCurrentEnvironment() {
  const config = await getConfig();
  return config.environment;
}

export async function isLocalEnvironment() {
  const env = await getCurrentEnvironment();
  return env === 'local';
}

export async function isDevEnvironment() {
  const env = await getCurrentEnvironment();
  return env === 'dev';
}

export async function isProdEnvironment() {
  const env = await getCurrentEnvironment();
  return env === 'prod';
}

// Helper to get the full backend URL for debugging
export async function getBackendInfo() {
  const config = await getConfig();
  const baseURL = await getBaseURL();
  
  return {
    environment: config.environment,
    hostname: config.hostname,
    protocol: config.protocol,
    port: config.port,
    baseURL,
    apiURL: await getAPIURL(),
  };
}