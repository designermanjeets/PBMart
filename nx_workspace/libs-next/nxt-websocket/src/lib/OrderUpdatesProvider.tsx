'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from './useWebSocket';

interface OrderUpdate {
  orderId: string;
  status: string;
  timestamp: string;
}

interface OrderUpdatesContextType {
  updates: OrderUpdate[];
}

const OrderUpdatesContext = createContext<OrderUpdatesContextType>({
  updates: [],
});

export function OrderUpdatesProvider({ children }: { children: React.ReactNode }) {
  const [updates, setUpdates] = useState<OrderUpdate[]>([]);
  const { lastMessage } = useWebSocket('wss://your-websocket-server.com');

  useEffect(() => {
    if (lastMessage) {
      try {
        const update = JSON.parse(lastMessage.data);
        setUpdates((prev) => [...prev, update]);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  return (
    <OrderUpdatesContext.Provider value={{ updates }}>
      {children}
    </OrderUpdatesContext.Provider>
  );
}

export const useOrderUpdates = () => useContext(OrderUpdatesContext); 