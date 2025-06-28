import { useEffect, useState } from "react";
import { getBackendInfo } from "@/lib/env-config";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BackendInfo {
  environment: string;
  hostname: string;
  protocol: string;
  port?: number;
  baseURL: string;
  apiURL: string;
}

export function EnvironmentInfo() {
  const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBackendInfo()
      .then(setBackendInfo)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
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

  if (!backendInfo) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Environment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Failed to load environment info</div>
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Environment
          <Badge className={getEnvironmentColor(backendInfo.environment)}>
            {backendInfo.environment.toUpperCase()}
          </Badge>
        </CardTitle>
        <CardDescription>Backend connection information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm">
          <span className="font-medium">Hostname:</span> {backendInfo.hostname}
        </div>
        <div className="text-sm">
          <span className="font-medium">Protocol:</span> {backendInfo.protocol}
        </div>
        {backendInfo.port && (
          <div className="text-sm">
            <span className="font-medium">Port:</span> {backendInfo.port}
          </div>
        )}
        <div className="text-sm">
          <span className="font-medium">Base URL:</span> 
          <code className="ml-1 text-xs bg-muted px-1 py-0.5 rounded">
            {backendInfo.baseURL}
          </code>
        </div>
        <div className="text-sm">
          <span className="font-medium">API URL:</span> 
          <code className="ml-1 text-xs bg-muted px-1 py-0.5 rounded">
            {backendInfo.apiURL}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}