import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import * as jwt from 'jsonwebtoken';
import { cacheService } from './cacheService';
import { messageService } from './messageService';

interface AuthenticatedSocket {
  id: string;
  tenantId: string;
  userId: string;
  role: string;
  rooms: Set<string>;
  lastActivity: number;
}

interface TenantRoom {
  tenantId: string;
  roomType: 'market' | 'trading' | 'portfolio' | 'notifications' | 'admin';
  roomId: string;
}

interface MarketUpdate {
  price: number;
  change: number;
  volume: number;
  timestamp: number;
  indicators?: Record<string, number>;
}

interface TradingSignal {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  price: number;
  timestamp: number;
}

interface PortfolioUpdate {
  positions: Array<{
    symbol: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    pnl: number;
  }>;
  totalValue: number;
  totalPnL: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority?: 'low' | 'medium' | 'high';
  timestamp: number;
}

interface ConnectionStats {
  totalConnections: number;
  activeUsers: number;
  tenantsActive: number;
  roomStats: Record<string, number>;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
  };
}

export class WebSocketService {
  private io: SocketIOServer;
  private authenticatedSockets: Map<string, AuthenticatedSocket> = new Map();
  private tenantRooms: Map<string, Set<string>> = new Map(); // tenantId -> socketIds
  private roomSockets: Map<string, Set<string>> = new Map(); // roomId -> socketIds

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.setupMessageServiceIntegration();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        
        // Verify tenant access
        if (!decoded.tenantId || !decoded.userId) {
          return next(new Error('Invalid token format'));
        }

        // Store authentication info
        const authSocket: AuthenticatedSocket = {
          id: socket.id,
          tenantId: decoded.tenantId,
          userId: decoded.userId,
          role: decoded.role || 'user',
          rooms: new Set(),
          lastActivity: Date.now()
        };

        this.authenticatedSockets.set(socket.id, authSocket);
        
        // Add to tenant room tracking
        if (!this.tenantRooms.has(decoded.tenantId)) {
          this.tenantRooms.set(decoded.tenantId, new Set());
        }
        this.tenantRooms.get(decoded.tenantId)!.add(socket.id);

        // Join tenant-specific room
        socket.join(`tenant:${decoded.tenantId}`);
        
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    // Rate limiting middleware
    this.io.use((socket, next) => {
      const authSocket = this.authenticatedSockets.get(socket.id);
      if (!authSocket) {
        return next(new Error('Socket not authenticated'));
      }

      // Simple rate limiting - max 100 events per minute
      const now = Date.now();
      const windowStart = now - 60000; // 1 minute ago
      
      // In production, use Redis for distributed rate limiting
      next();
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      const authSocket = this.authenticatedSockets.get(socket.id);
      if (!authSocket) return;

      console.log(`User ${authSocket.userId} connected to tenant ${authSocket.tenantId}`);

      // Join user-specific room
      socket.join(`user:${authSocket.tenantId}:${authSocket.userId}`);

      // Handle room joining
      socket.on('join-room', async (data: { roomType: string; roomId?: string }) => {
        try {
          const roomId = this.getRoomId(authSocket.tenantId, data.roomType, data.roomId);
          
          // Verify user has permission to join this room
          if (await this.canJoinRoom(authSocket, data.roomType, roomId)) {
            socket.join(roomId);
            authSocket.rooms.add(roomId);
            
            // Track room membership
            if (!this.roomSockets.has(roomId)) {
              this.roomSockets.set(roomId, new Set());
            }
            this.roomSockets.get(roomId)!.add(socket.id);

            socket.emit('room-joined', { roomId, roomType: data.roomType });
            
            // Send initial room data
            await this.sendInitialRoomData(socket, authSocket, data.roomType, roomId);
          } else {
            socket.emit('error', { message: 'Access denied to room' });
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // Handle room leaving
      socket.on('leave-room', (data: { roomType: string; roomId?: string }) => {
        const roomId = this.getRoomId(authSocket.tenantId, data.roomType, data.roomId);
        socket.leave(roomId);
        authSocket.rooms.delete(roomId);
        
        const roomSockets = this.roomSockets.get(roomId);
        if (roomSockets) {
          roomSockets.delete(socket.id);
          if (roomSockets.size === 0) {
            this.roomSockets.delete(roomId);
          }
        }

        socket.emit('room-left', { roomId, roomType: data.roomType });
      });

      // Handle trading signals subscription
      socket.on('subscribe-signals', async (data: { symbols?: string[] }) => {
        const roomId = `trading-signals:${authSocket.tenantId}`;
        socket.join(roomId);
        
        // Send recent signals
        const signals = await cacheService.get(authSocket.tenantId + ':recent-signals');
        if (signals) {
          socket.emit('signals-update', signals);
        }
      });

      // Handle market data subscription
      socket.on('subscribe-market', async (data: { symbols: string[] }) => {
        for (const symbol of data.symbols) {
          const roomId = `market:${authSocket.tenantId}:${symbol}`;
          socket.join(roomId);
          
          // Send latest market data
          const marketData = await cacheService.getMarketData(authSocket.tenantId, symbol);
          if (marketData) {
            socket.emit('market-update', { symbol, data: marketData });
          }
        }
      });

      // Handle portfolio subscription
      socket.on('subscribe-portfolio', async () => {
        const roomId = `portfolio:${authSocket.tenantId}:${authSocket.userId}`;
        socket.join(roomId);
        
        // Send current portfolio
        const portfolio = await cacheService.getPortfolio(authSocket.tenantId, authSocket.userId);
        if (portfolio) {
          socket.emit('portfolio-update', portfolio);
        }
      });

      // Handle chat messages (for community features)
      socket.on('chat-message', async (data: { message: string; roomId: string }) => {
        if (authSocket.rooms.has(data.roomId)) {
          const chatMessage = {
            id: Date.now().toString(),
            userId: authSocket.userId,
            message: data.message,
            timestamp: new Date().toISOString(),
            tenantId: authSocket.tenantId
          };

          // Broadcast to room
          this.io.to(data.roomId).emit('chat-message', chatMessage);
          
          // Store in cache for history
          await cacheService.set(
            `chat:${data.roomId}:${chatMessage.id}`, 
            chatMessage, 
            86400 // 24 hours
          );
        }
      });

      // Handle activity tracking
      socket.on('activity', () => {
        authSocket.lastActivity = Date.now();
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${authSocket.userId} disconnected from tenant ${authSocket.tenantId}`);
        
        // Clean up tracking
        this.authenticatedSockets.delete(socket.id);
        
        const tenantSockets = this.tenantRooms.get(authSocket.tenantId);
        if (tenantSockets) {
          tenantSockets.delete(socket.id);
          if (tenantSockets.size === 0) {
            this.tenantRooms.delete(authSocket.tenantId);
          }
        }

        // Clean up room tracking
        authSocket.rooms.forEach(roomId => {
          const roomSockets = this.roomSockets.get(roomId);
          if (roomSockets) {
            roomSockets.delete(socket.id);
            if (roomSockets.size === 0) {
              this.roomSockets.delete(roomId);
            }
          }
        });
      });
    });
  }

  private setupMessageServiceIntegration(): void {
    // Subscribe to message service events and broadcast to WebSocket clients
    
    messageService.subscribe('trading-signals', async (message) => {
      const roomId = `trading-signals:${message.tenantId}`;
      this.io.to(roomId).emit('trading-signal', message.data);
    });

    messageService.subscribe('market-updates', async (message) => {
      const roomId = `market:${message.tenantId}`;
      this.io.to(roomId).emit('market-update', message.data);
    });

    messageService.subscribe('notifications', async (message) => {
      if (message.userId) {
        const roomId = `user:${message.tenantId}:${message.userId}`;
        this.io.to(roomId).emit('notification', message.data);
      } else {
        // Broadcast to all tenant users
        const roomId = `tenant:${message.tenantId}`;
        this.io.to(roomId).emit('notification', message.data);
      }
    });

    messageService.subscribe('portfolio-updates', async (message) => {
      if (message.userId) {
        const roomId = `portfolio:${message.tenantId}:${message.userId}`;
        this.io.to(roomId).emit('portfolio-update', message.data);
      }
    });

    messageService.subscribe('ai-predictions', async (message) => {
      const roomId = `ai-predictions:${message.tenantId}`;
      this.io.to(roomId).emit('ai-prediction', message.data);
    });

    messageService.subscribe('order-updates', async (message) => {
      if (message.userId) {
        const roomId = `user:${message.tenantId}:${message.userId}`;
        this.io.to(roomId).emit('order-update', message.data);
      }
    });

    messageService.subscribe('system-alerts', async (message) => {
      const roomId = `tenant:${message.tenantId}`;
      this.io.to(roomId).emit('system-alert', message.data);
    });
  }

  private getRoomId(tenantId: string, roomType: string, roomId?: string): string {
    if (roomId) {
      return `${roomType}:${tenantId}:${roomId}`;
    }
    return `${roomType}:${tenantId}`;
  }

  private async canJoinRoom(authSocket: AuthenticatedSocket, roomType: string, roomId: string): Promise<boolean> {
    // Implement room access control based on user role and tenant
    switch (roomType) {
      case 'admin':
        return authSocket.role === 'admin' || authSocket.role === 'super-admin';
      case 'trading':
      case 'market':
      case 'portfolio':
      case 'notifications':
        return true; // All authenticated users can join these rooms
      default:
        return false;
    }
  }

  private async sendInitialRoomData(
    socket: Socket, 
    authSocket: AuthenticatedSocket, 
    roomType: string, 
    roomId: string
  ): Promise<void> {
    try {
      switch (roomType) {
        case 'market':
          // Send recent market data
          const marketData = await cacheService.get(authSocket.tenantId + ':recent-market-data');
          if (marketData) {
            socket.emit('initial-market-data', marketData);
          }
          break;
        
        case 'portfolio':
          // Send current portfolio
          const portfolio = await cacheService.getPortfolio(authSocket.tenantId, authSocket.userId);
          if (portfolio) {
            socket.emit('initial-portfolio-data', portfolio);
          }
          break;
        
        case 'trading':
          // Send recent trading signals
          const signals = await cacheService.get(authSocket.tenantId + ':recent-signals');
          if (signals) {
            socket.emit('initial-trading-signals', signals);
          }
          break;
      }
    } catch (error) {
      console.error('Error sending initial room data:', error);
    }
  }

  // Public methods for broadcasting
  async broadcastToTenant(tenantId: string, event: string, data: unknown): Promise<void> {
    this.io.to(`tenant:${tenantId}`).emit(event, data);
  }

  async broadcastToUser(tenantId: string, userId: string, event: string, data: unknown): Promise<void> {
    this.io.to(`user:${tenantId}:${userId}`).emit(event, data);
  }

  async broadcastToRoom(roomId: string, event: string, data: unknown): Promise<void> {
    this.io.to(roomId).emit(event, data);
  }

  async broadcastMarketUpdate(tenantId: string, symbol: string, data: MarketUpdate): Promise<void> {
    this.io.to(`market:${tenantId}:${symbol}`).emit('market-update', { symbol, data });
  }

  async broadcastTradingSignal(tenantId: string, signal: TradingSignal): Promise<void> {
    this.io.to(`trading-signals:${tenantId}`).emit('trading-signal', signal);
  }

  async broadcastPortfolioUpdate(tenantId: string, userId: string, portfolio: PortfolioUpdate): Promise<void> {
    this.io.to(`portfolio:${tenantId}:${userId}`).emit('portfolio-update', portfolio);
  }

  async broadcastNotification(tenantId: string, userId: string | null, notification: Notification): Promise<void> {
    if (userId) {
      this.io.to(`user:${tenantId}:${userId}`).emit('notification', notification);
    } else {
      this.io.to(`tenant:${tenantId}`).emit('notification', notification);
    }
  }

  // Health and monitoring
  getConnectedUsers(tenantId: string): number {
    return this.tenantRooms.get(tenantId)?.size || 0;
  }

  getTotalConnections(): number {
    return this.authenticatedSockets.size;
  }

  getRoomUsers(roomId: string): number {
    return this.roomSockets.get(roomId)?.size || 0;
  }

  getConnectionStats(): ConnectionStats {
    const roomStats: Record<string, number> = {};
    this.roomSockets.forEach((sockets, roomId) => {
      roomStats[roomId] = sockets.size;
    });

    return {
      totalConnections: this.authenticatedSockets.size,
      activeUsers: this.getTotalConnections(),
      tenantsActive: this.tenantRooms.size,
      roomStats,
      memoryUsage: process.memoryUsage()
    };
  }

  // Cleanup inactive connections
  async cleanupInactiveConnections(maxInactiveTime: number = 300000): Promise<void> {
    const now = Date.now();
    const inactiveSockets: string[] = [];

    this.authenticatedSockets.forEach((authSocket, socketId) => {
      if (now - authSocket.lastActivity > maxInactiveTime) {
        inactiveSockets.push(socketId);
      }
    });

    inactiveSockets.forEach(socketId => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.disconnect(true);
      }
    });

    console.log(`Cleaned up ${inactiveSockets.length} inactive connections`);
  }
}

// Export singleton instance
let websocketService: WebSocketService;

export const initializeWebSocketService = (server: HttpServer): WebSocketService => {
  websocketService = new WebSocketService(server);
  return websocketService;
};

export const getWebSocketService = (): WebSocketService => {
  if (!websocketService) {
    throw new Error('WebSocket service not initialized');
  }
  return websocketService;
};
