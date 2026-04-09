import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type UseWebSocketOptions = {
  enabled: boolean;
};

type SocketMessage = {
  receivedAt: string;
  payload: unknown;
};

function getSocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/robot-ws`;
}

function parsePayload(message: MessageEvent<string>): unknown {
  try {
    return JSON.parse(message.data);
  } catch {
    return message.data;
  }
}

export function useWebSocket({ enabled }: UseWebSocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const [shouldConnect, setShouldConnect] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const [subscribedTopics, setSubscribedTopics] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled || !shouldConnect) {
      socketRef.current?.close();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const socket = new WebSocket(getSocketUrl());
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      setError(null);
    };

    socket.onclose = () => {
      setConnected(false);
    };

    socket.onerror = () => {
      setError(
        'WebSocket connection failed. Check the proxy config and WS URL.',
      );
      setConnected(false);
    };

    socket.onmessage = (message) => {
      setMessages((current) =>
        [
          {
            receivedAt: new Date().toISOString(),
            payload: parsePayload(message),
          },
          ...current,
        ].slice(0, 40),
      );
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [enabled, shouldConnect]);

  const subscribe = useCallback((topic: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN || !topic) {
      return;
    }

    socket.send(JSON.stringify({ enable_topic: topic }));
    setSubscribedTopics((current) =>
      current.includes(topic) ? current : [...current, topic],
    );
  }, []);

  const unsubscribe = useCallback((topic: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN || !topic) {
      return;
    }

    socket.send(JSON.stringify({ disable_topic: topic }));
    setSubscribedTopics((current) => current.filter((item) => item !== topic));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return useMemo(
    () => ({
      connected,
      error,
      messages,
      subscribedTopics,
      shouldConnect,
      setShouldConnect,
      subscribe,
      unsubscribe,
      clearMessages,
    }),
    [
      connected,
      error,
      messages,
      subscribedTopics,
      shouldConnect,
      subscribe,
      unsubscribe,
      clearMessages,
    ],
  );
}
