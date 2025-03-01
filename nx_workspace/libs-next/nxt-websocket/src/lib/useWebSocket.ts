import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketHook {
  lastMessage: MessageEvent | null;
  sendMessage: (message: string) => void;
  readyState: number;
}

export function useWebSocket(url: string): WebSocketHook {
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setReadyState(WebSocket.OPEN);
    };

    ws.current.onclose = () => {
      setReadyState(WebSocket.CLOSED);
    };

    ws.current.onmessage = (event: MessageEvent) => {
      setLastMessage(event);
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  const sendMessage = useCallback((message: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    }
  }, []);

  return { lastMessage, sendMessage, readyState };
} 