'use client';

import * as React from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '@ryla/shared';
import { useAuth } from './auth-context';

// Typed socket
type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextValue {
  socket: TypedSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

const SocketContext = React.createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  isConnecting: false,
  error: null,
});

// Get the API URL for socket connection
function getSocketUrl(): string {
  // Use the API URL from environment or derive from current host
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    // Remove trailing /api if present, socket.io connects to root
    return apiUrl.replace(/\/api\/?$/, '');
  }
  
  // Fallback: same origin for development
  if (typeof window !== 'undefined') {
    // In development, API is typically on port 3001
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:3001';
    }
    // In production, use the API subdomain
    return `https://end.ryla.ai`;
  }
  
  return 'http://localhost:3001';
}

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [socket, setSocket] = React.useState<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Track reconnection attempts
  const reconnectAttempts = React.useRef(0);
  const maxReconnectAttempts = 5;

  React.useEffect(() => {
    // Don't connect while auth is loading or if no user
    if (isAuthLoading) return;
    if (!user?.id) {
      // Clean up existing socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Already connected or connecting
    if (socket?.connected || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    const socketUrl = getSocketUrl();
    console.log(`[Socket] Connecting to ${socketUrl} for user ${user.id}`);

    const newSocket: TypedSocket = io(socketUrl, {
      query: { userId: user.id },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected');
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      reconnectAttempts.current = 0;
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
      setIsConnecting(false);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setError('Unable to connect to real-time updates. Using polling fallback.');
      }
    });

    newSocket.io.on('reconnect', (attempt) => {
      console.log('[Socket] Reconnected after', attempt, 'attempts');
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
    });

    newSocket.io.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed');
      setError('Real-time connection lost. Refresh the page to reconnect.');
    });

    setSocket(newSocket);

    return () => {
      console.log('[Socket] Cleaning up connection');
      newSocket.disconnect();
    };
  }, [user?.id, isAuthLoading]);

  const value = React.useMemo(
    () => ({
      socket,
      isConnected,
      isConnecting,
      error,
    }),
    [socket, isConnected, isConnecting, error]
  );

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Hook to access socket connection
 */
export function useSocket() {
  const context = React.useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
