import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EnvironmentInfo {
  environment: string;
  currentHostname: string;
  targetHostname: string;
  protocol: string;
  port?: number;
}

function getEnvironmentInfo(): EnvironmentInfo {
  const currentHostname = window.location.hostname;
  
  // Detect environment based on current hostname
  let environment = 'other';
  let targetHostname = currentHostname;
  
  if (currentHostname === 'localhost' || currentHostname === '127.0.0.1') {
    environment = 'local';
    targetHostname = 'localhost';
  } else if (currentHostname.includes('cundi.onthewifi.com')) {
    environment = 'dev';
    targetHostname = 'cundi.onthewifi.com';
  } else if (currentHostname.includes('swiftlingapp.com')) {
    environment = 'prod';
    targetHostname = 'swiftlingapp.com';
  }
  
  // Use HTTPS for prod and dev, HTTP for local and other
  const protocol = (environment === 'prod' || environment === 'dev') ? 'https' : 'http';
  
  // Default port for local development
  const port = environment === 'local' ? 5000 : undefined;
  
  return {
    environment,
    currentHostname,
    targetHostname,
    protocol,
    port,
  };
}

export function EnvironmentInfo() {
  const [envInfo, setEnvInfo] = useState<EnvironmentInfo | null>(null);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      setEnvInfo(getEnvironmentInfo());
    }
  }, []);

  if (!envInfo) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Environment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'local':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'dev':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'prod':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const baseURL = `${envInfo.protocol}://${envInfo.targetHostname}${envInfo.port ? `:${envInfo.port}` : ''}`;
  const apiURL = `${baseURL}/api`;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Environment
          <Badge className={getEnvironmentColor(envInfo.environment)}>
            {envInfo.environment.toUpperCase()}
          </Badge>
        </CardTitle>
        <CardDescription>Backend connection information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm">
          <span className="font-medium">Current Hostname:</span> {envInfo.currentHostname}
        </div>
        <div className="text-sm">
          <span className="font-medium">Target Hostname:</span> {envInfo.targetHostname}
        </div>
        <div className="text-sm">
          <span className="font-medium">Protocol:</span> {envInfo.protocol}
        </div>
        {envInfo.port && (
          <div className="text-sm">
            <span className="font-medium">Port:</span> {envInfo.port}
          </div>
        )}
        <div className="text-sm">
          <span className="font-medium">Base URL:</span> 
          <code className="ml-1 text-xs bg-muted px-1 py-0.5 rounded">
            {baseURL}
          </code>
        </div>
        <div className="text-sm">
          <span className="font-medium">API URL:</span> 
          <code className="ml-1 text-xs bg-muted px-1 py-0.5 rounded">
            {apiURL}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}