import { notificationManager } from '@kingsimba/nc-ui';
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
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(connection));
  }, [connection]);

  const initSdk = useCallback(() => {
    robotApi.init({
      getApiBase: () => '/robot-api',
      notification: {
        showNotification(notification: any) {
          const type = notification.type === 'danger' ? 'danger' : notification.type || null;
          notificationManager.show({
            message: notification.title
              ? `${notification.title}: ${notification.message}`
              : notification.message,
            type,
          });
        },
      },
    });
  }, []);

  const applyConnectionConfig = useCallback(async () => {
    setLoadingLabel('Apply connection');
    setLastError(null);

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
      notificationManager.show({
        message: 'Proxy configuration applied.',
        type: 'success',
      });
    } catch (error) {
      const message = formatError(error);
      setConfigured(false);
      setLastError(message);
      notificationManager.show({ message, type: 'danger' });
    } finally {
      setLoadingLabel(null);
    }
  }, [connection, initSdk]);

  useEffect(() => {
    if (connection.restBaseUrl) {
      void applyConnectionConfig();
    }
  }, []);

  const execute = useCallback<ExecuteRobotCall>(async (label, operation) => {
    setLoadingLabel(label);
    setLastError(null);

    try {
      const value = await operation();
      const parsed =
        value instanceof Response ? await parseResponse(value) : value;
      notificationManager.show({ message: `${label} succeeded.`, type: 'success' });
      return parsed;
    } catch (error) {
      const message = formatError(error);
      setLastError(message);
      notificationManager.show({
        message: `${label} failed: ${message}`,
        type: 'danger',
      });
      return undefined;
    } finally {
      setLoadingLabel(null);
    }
  }, []);

  return useMemo(
    () => ({
      connection,
      setConnection,
      configured,
      proxyInfo,
      loadingLabel,
      lastError,
      applyConnectionConfig,
      execute,
    }),
    [
      connection,
      configured,
      proxyInfo,
      loadingLabel,
      lastError,
      applyConnectionConfig,
      execute,
    ],
  );
}
