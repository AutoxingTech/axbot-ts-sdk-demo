import { useCallback, useEffect, useMemo, useState } from 'react';
import { wsClient } from '@kingsimba/axbot-sdk/ws';

export function useWebSocket({ enabled }: { enabled: boolean }) {
  const [connected, setConnected] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(false);

  useEffect(() => {
    if (!enabled || !shouldConnect) {
      wsClient.disconnect();
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/robot-ws`;
    
    // Set up connection event listener
    wsClient.onStateChange = (state) => {
      setConnected(state === 'connected');
    };

    wsClient.connect(url);

    return () => {
      wsClient.disconnect();
    };
  }, [enabled, shouldConnect]);

  return useMemo(
    () => ({
      connected,
      shouldConnect,
      setShouldConnect,
    }),
    [connected, shouldConnect]
  );
}
