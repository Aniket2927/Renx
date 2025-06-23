import { useState, useEffect, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
  signal?: any;
}

export function useWebSocket() {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const subscribe = useCallback(() => {
    // Mock WebSocket for now
    console.log('WebSocket subscription started');
  }, []);

  useEffect(() => {
    // Mock WebSocket connection
    const mockMessage = {
      type: 'signal',
      data: {},
      signal: {
        action: 'buy',
        symbol: 'AAPL'
      }
    };
    
    // Simulate periodic updates
    const interval = setInterval(() => {
      setLastMessage(mockMessage);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    lastMessage,
    subscribe,
    socket
  };
}