import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from './use-toast';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: number;
  userId?: number;
}

export interface UseWebSocketOptions {
  url?: string;
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

export interface WebSocketConnection {
  socket: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  lastMessage: WebSocketMessage | null;
  connectionAttempt: number;
  send: (message: WebSocketMessage) => boolean;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): WebSocketConnection {
  const {
    url = `ws://${window.location.host}/api/ws`,
    protocols,
    onOpen,
    onClose,
    onError,
    onMessage,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000
  } = options;

  const { toast } = useToast();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionAttempt, setConnectionAttempt] = useState(0);

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
  }, []);

  const startHeartbeat = useCallback((ws: WebSocket) => {
    if (heartbeatInterval <= 0) return;

    heartbeatIntervalRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, heartbeatInterval);
  }, [heartbeatInterval]);

  const connect = useCallback(() => {
    if (isConnecting || (socket && socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setIsConnecting(true);
    cleanup();

    try {
      const ws = new WebSocket(url, protocols);

      ws.onopen = (event) => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionAttempt(0);
        setSocket(ws);
        startHeartbeat(ws);
        
        onOpen?.(event);
        
        toast({
          title: "Connected",
          description: "Real-time connection established",
          duration: 2000,
        });
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);
        setSocket(null);
        cleanup();

        onClose?.(event);

        // Attempt reconnection if not a clean close and we haven't exceeded attempts
        if (!event.wasClean && connectionAttempt < reconnectAttempts) {
          setConnectionAttempt(prev => prev + 1);
          
          toast({
            title: "Connection Lost",
            description: `Reconnecting... (${connectionAttempt + 1}/${reconnectAttempts})`,
            variant: "destructive",
            duration: 3000,
          });

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (connectionAttempt >= reconnectAttempts) {
          toast({
            title: "Connection Failed",
            description: "Unable to establish real-time connection. Some features may be limited.",
            variant: "destructive",
            duration: 5000,
          });
        }
      };

      ws.onerror = (event) => {
        setIsConnecting(false);
        onError?.(event);
        
        toast({
          title: "Connection Error",
          description: "WebSocket connection encountered an error",
          variant: "destructive",
          duration: 3000,
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Handle heartbeat responses
          if (message.type === 'pong') {
            return;
          }
          
          setLastMessage(message);
          onMessage?.(message);
          
          // Handle specific message types for UI updates
          switch (message.type) {
            case 'attempt_updated':
              toast({
                title: "Challenge Update",
                description: "A team member updated their challenge progress",
                duration: 2000,
              });
              break;
            
            case 'team_member_joined':
              toast({
                title: "Team Update",
                description: `${message.data.memberName} joined the team`,
                duration: 3000,
              });
              break;
            
            case 'challenge_completed':
              toast({
                title: "Challenge Completed!",
                description: `${message.data.teamName} completed "${message.data.challengeName}"`,
                duration: 4000,
              });
              break;
            
            case 'leaderboard_update':
              // Silent update for leaderboard changes
              break;
            
            default:
              // Handle other message types silently
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

    } catch (error) {
      setIsConnecting(false);
      console.error('Failed to create WebSocket connection:', error);
      
      toast({
        title: "Connection Failed",
        description: "Unable to establish WebSocket connection",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [
    url, 
    protocols, 
    isConnecting, 
    socket, 
    connectionAttempt, 
    reconnectAttempts, 
    reconnectInterval,
    onOpen, 
    onClose, 
    onError, 
    onMessage,
    cleanup,
    startHeartbeat,
    toast
  ]);

  const disconnect = useCallback(() => {
    cleanup();
    
    if (socket) {
      socket.close(1000, 'User disconnected');
      setSocket(null);
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionAttempt(0);
  }, [socket, cleanup]);

  const send = useCallback((message: WebSocketMessage): boolean => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected. Message not sent:', message);
      return false;
    }

    try {
      const messageWithTimestamp = {
        ...message,
        timestamp: Date.now()
      };
      
      socket.send(JSON.stringify(messageWithTimestamp));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }, [socket]);

  // Auto-connect on mount (disabled in development to avoid conflicts)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []); // Empty dependency array for mount/unmount only

  // Handle browser visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && !isConnecting) {
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, isConnecting, connect]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (!isConnected && !isConnecting) {
        toast({
          title: "Back Online",
          description: "Reconnecting to real-time services...",
          duration: 2000,
        });
        connect();
      }
    };

    const handleOffline = () => {
      toast({
        title: "Connection Lost",
        description: "You're offline. Real-time features will resume when connection is restored.",
        variant: "destructive",
        duration: 4000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected, isConnecting, connect, toast]);

  return {
    socket,
    isConnected,
    isConnecting,
    lastMessage,
    connectionAttempt,
    send,
    connect,
    disconnect
  };
}

// Hook for specific real-time game features
export function useGameWebSocket(userId?: number, teamId?: number) {
  const [teamUpdates, setTeamUpdates] = useState<any[]>([]);
  const [challengeUpdates, setChallengeUpdates] = useState<any[]>([]);
  const [leaderboardUpdates, setLeaderboardUpdates] = useState<any[]>([]);

  const handleGameMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'team_update':
        setTeamUpdates(prev => [message.data, ...prev.slice(0, 9)]);
        break;
      
      case 'attempt_updated':
      case 'challenge_completed':
        setChallengeUpdates(prev => [message.data, ...prev.slice(0, 9)]);
        break;
      
      case 'leaderboard_update':
        setLeaderboardUpdates(prev => [message.data, ...prev.slice(0, 4)]);
        break;
    }
  }, []);

  const websocket = useWebSocket({
    onMessage: handleGameMessage,
    heartbeatInterval: 30000,
    reconnectAttempts: 10,
    reconnectInterval: 2000
  });

  // Send user identification when connected
  useEffect(() => {
    if (websocket.isConnected && userId) {
      websocket.send({
        type: 'user_identify',
        data: { userId, teamId }
      });
    }
  }, [websocket.isConnected, userId, teamId, websocket]);

  const broadcastChallengeStart = useCallback((challengeId: number) => {
    websocket.send({
      type: 'challenge_started',
      data: { challengeId, userId, teamId }
    });
  }, [websocket, userId, teamId]);

  const broadcastChallengeProgress = useCallback((challengeId: number, progress: any) => {
    websocket.send({
      type: 'challenge_progress',
      data: { challengeId, progress, userId, teamId }
    });
  }, [websocket, userId, teamId]);

  const broadcastChallengeComplete = useCallback((challengeId: number, score: number) => {
    websocket.send({
      type: 'challenge_completed',
      data: { challengeId, score, userId, teamId }
    });
  }, [websocket, userId, teamId]);

  return {
    ...websocket,
    teamUpdates,
    challengeUpdates,
    leaderboardUpdates,
    broadcastChallengeStart,
    broadcastChallengeProgress,
    broadcastChallengeComplete
  };
}
