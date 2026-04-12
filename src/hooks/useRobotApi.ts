import { useCallback, useEffect, useMemo, useState } from 'react';
import { robotApi } from '@kingsimba/axbot-sdk/robotApi';

export type ConnectionConfig = {
  restBaseUrl: string;
  wsUrl: string;
  cookie: string;
};

export type ProxyInfo = {
  restBaseUrl: string;
  wsUrl: string;
  hasCookie: boolean;
};

export type ExecuteRobotCall = (
  label: string,
  operation: () => Promise<unknown>,
) => Promise<unknown | undefined>;

const STORAGE_KEY = 'axbot-sdk-demo.connection';

const defaultConnection: ConnectionConfig = {
  restBaseUrl: '',
  wsUrl: '',
  cookie: '',
};

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function useRobotApi() {
  const [connection, setConnection] = useState<ConnectionConfig>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return defaultConnection;
    }

    try {
      return { ...defaultConnection, ...JSON.parse(saved) };
    } catch {
      return defaultConnection;
    }
  });
  const [configured, setConfigured] = useState(false);
  const [proxyInfo, setProxyInfo] = useState<ProxyInfo | null>(null);

  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [apiLoadingLabel, setApiLoadingLabel] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastApiCall, setLastApiCall] = useState<{ method: string, url: string, payload?: any, status?: number } | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(connection));
  }, [connection]);

  const initSdk = useCallback(() => {
    console.log('[useRobotApi] initSdk called');
    robotApi.init({
      getApiBase: () => '/robot-api',
      notification: {
        showNotification(notification: any) {
          console.log('[SDK Notification]', notification);
        },
      },
      onApiCalled: (info) => {
        console.log('[useRobotApi] onApiCalled triggered', info);
        setLastApiCall(info);
      }
    });
  }, []);

  const applyConnectionConfig = useCallback(async () => {
    setConnectionLoading(true);
    setConnectionError(null);

    try {
      const response = await fetch('/__robot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connection),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as ProxyInfo & { ok: boolean };
      initSdk();
      setConfigured(true);
      setProxyInfo({
        restBaseUrl: data.restBaseUrl,
        wsUrl: data.wsUrl,
        hasCookie: data.hasCookie,
      });
      console.log('Proxy configuration applied.');
    } catch (error) {
      const message = formatError(error);
      setConfigured(false);
      setConnectionError(message);
      console.error(message);
    } finally {
      setConnectionLoading(false);
    }
  }, [connection, initSdk]);

  useEffect(() => {
    if (connection.restBaseUrl) {
      void applyConnectionConfig();
    }
  }, []);

  const execute = useCallback<ExecuteRobotCall>(async (label, operation) => {
    setApiLoadingLabel(label);
    setApiError(null);

    try {
      const value = await operation();
      const parsed =
        value instanceof Response ? await parseResponse(value) : value;
      console.log(`${label} succeeded.`);
      return parsed;
    } catch (error) {
      const message = formatError(error);
      setApiError(`${label} failed: ${message}`);
      console.error(`${label} failed: ${message}`);
      return undefined;
    } finally {
      setApiLoadingLabel(null);
    }
  }, []);

  return useMemo(
    () => ({
      connection,
      setConnection,
      configured,
      proxyInfo,
      connectionLoading,
      connectionError,
      apiLoadingLabel,
      apiError,
      lastApiCall,
      applyConnectionConfig,
      execute,
    }),
    [
      connection,
      configured,
      proxyInfo,
      connectionLoading,
      connectionError,
      apiLoadingLabel,
      apiError,
      lastApiCall,
      applyConnectionConfig,
      execute,
    ],
  );
}
